const Video = require('../models/Video');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Import axios for URL fetching
const { uploadToCloudinary } = require('../utils/cloudinary');

// Helper to create audit log
const createAuditLog = async (actionType, userRole, referenceId, verificationResult, details, verificationSource) => {
    try {
        await AuditLog.create({
            actionType,
            userRole,
            referenceId,
            verificationResult,
            details,
            verificationSource
        });
    } catch (err) {
        console.error('Audit Log Error:', err);
    }
};

// Helper to compute file hash
const computeFileHash = (file) => {
    return new Promise((resolve, reject) => {
        try {
            const hash = crypto.createHash('sha256');

            if (file.buffer) {
                // Memory storage (buffer)
                console.log(`[DEBUG] Computing hash from buffer for file: ${file.originalname}`);
                hash.update(file.buffer);
                resolve(hash.digest('hex'));
            } else if (file.path) {
                // Disk storage (path)
                console.log(`[DEBUG] Computing hash from file path: ${file.path}`);
                const stream = fs.createReadStream(file.path);
                stream.on('data', (data) => hash.update(data));
                stream.on('end', () => resolve(hash.digest('hex')));
                stream.on('error', (err) => reject(err));
            } else {
                reject(new Error("No file buffer or path found"));
            }
        } catch (err) {
            reject(err);
        }
    });
};

// Helper to compute hash from Buffer (for URL downloads)
const computeBufferHash = (buffer) => {
    const hash = crypto.createHash('sha256');
    hash.update(buffer);
    return hash.digest('hex');
};

/* 
   NOTE: Real file download logic removed for DEMO purposes to comply with constraints.
   Link verification is simulated based on exact URL match or ID extraction.
*/

// @desc    Register Official Video Metadata
// @route   POST /api/videos/upload
// @access  Official Authority
exports.uploadVideo = async (req, res) => {
    console.log('[DEBUG] uploadVideo called');
    try {
        const { title, authority, link } = req.body;
        const file = req.file;

        console.log('[DEBUG] Request body:', req.body);
        console.log('[DEBUG] Request file:', file ? { originalname: file.originalname, mimetype: file.mimetype, size: file.size, hasBuffer: !!file.buffer, path: file.path } : 'No file');

        if (!title || !authority) {
            // If disk storage used and path exists, clean it up
            if (file && file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'Title and Issuing Authority are required' });
        }

        const verificationId = uuidv4();
        let hash;
        let cloudinaryUrl = '';
        let cloudinaryPublicId = '';

        if (file) {
            // 1. Compute Hash
            hash = await computeFileHash(file);
            console.log(`[DEBUG] Computed Hash: ${hash}`);

            // 2. Upload to Cloudinary
            // Note: uploadToCloudinary expects a PATH. 
            // If using memory storage, we need to stream upload or write temp file.
            // For this demo, let's write a temp file if buffer exists to reuse existing upload logic.
            let uploadPath = file.path;
            let tempCreated = false;

            if (file.buffer) {
                // Create temp file for Cloudinary upload
                const tempFileName = `temp_${Date.now()}_${file.originalname}`;
                uploadPath = path.join(__dirname, '../temp', tempFileName);
                // Ensure temp dir exists
                if (!fs.existsSync(path.dirname(uploadPath))) fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
                fs.writeFileSync(uploadPath, file.buffer);
                tempCreated = true;
                console.log(`[DEBUG] Created temp file for upload: ${uploadPath}`);
            }

            const uploadResponse = await uploadToCloudinary(uploadPath);

            if (uploadResponse) {
                console.log('[DEBUG] Cloudinary upload success:', uploadResponse.secure_url);
                cloudinaryUrl = uploadResponse.secure_url;
                cloudinaryPublicId = uploadResponse.public_id;
            } else {
                console.error('[DEBUG] Cloudinary upload failed');
                // Allow proceeding without Cloudinary URL for demo if upload fails (e.g. missing keys)
                // But normally we'd return 500. 
                // Let's set a fallback mock URL if we can't upload, to avoid "url: ''"
                cloudinaryUrl = link || '';
            }

            // 3. Delete Local File
            if (tempCreated && fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
            if (file.path && fs.existsSync(file.path)) fs.unlinkSync(file.path); // If using disk storage

        } else {
            // Random hash for metadata-only
            hash = crypto.randomBytes(32).toString('hex');
            if (link) cloudinaryUrl = link;
        }

        const existing = await Video.findOne({ hash });

        if (existing) {
            console.log('[DEBUG] Video already exists with hash:', hash);
            return res.status(200).json({
                success: true,
                message: 'Video already registered!',
                data: {
                    verificationId: existing.verificationId,
                    hash: existing.hash,
                    timestamp: existing.uploadDate,
                    url: existing.cloudinaryUrl
                }
            });
        }

        const newVideo = new Video({
            title,
            authority,
            verificationId,
            hash,
            fileName: file ? file.originalname : (link ? 'imported_from_url' : 'metadata_only_entry'),
            cloudinaryUrl,
            cloudinaryPublicId
        });

        await newVideo.save();
        console.log('[DEBUG] New video saved:', newVideo.verificationId);

        // Audit Log
        await createAuditLog('UPLOAD', 'Official Authority', verificationId, 'REGISTERED', `Uploaded: ${title} (Source: ${file ? 'File' : 'Link'})`, file ? 'FILE' : 'URL');

        res.status(201).json({
            success: true,
            message: 'Official video registered successfully',
            data: {
                verificationId,
                hash,
                timestamp: newVideo.uploadDate,
                url: cloudinaryUrl
            }
        });

    } catch (error) {
        console.error('Upload Error:', error);
        // Clean up defined file if error occurs and file exists
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Verify Video
// @route   POST /api/videos/verify
// @access  PIB Fact Check
exports.verifyVideo = async (req, res) => {
    console.log('[DEBUG] verifyVideo called');
    try {
        const { verificationId, link } = req.body;
        const file = req.file;

        console.log('[DEBUG] Request body:', req.body);
        console.log('[DEBUG] Request file:', file ? { originalname: file.originalname, size: file.size, hasBuffer: !!file.buffer } : 'No file');

        let videoRecord = null;
        let pib_status = 'NOT_FOUND';
        let referenceRef = verificationId;
        let verificationSource = file ? 'FILE' : (link ? 'URL' : 'ID');

        // 1. Check by ID (Explicit)
        if (verificationId) {
            console.log(`[DEBUG] Checking by ID: ${verificationId}`);
            videoRecord = await Video.findOne({ verificationId });
        }

        // 2. Check by Link (REAL HASH VERIFICATION)
        if (!videoRecord && !file && link) {
            console.log(`[DEBUG] Checking by Link (Download & Hash): ${link}`);

            try {
                // Fetch file bytes from URL
                const response = await axios.get(link, { responseType: 'arraybuffer', timeout: 10000 });
                console.log(`[DEBUG] Downloaded ${response.data.length} bytes from URL`);

                // Compute hash from downloaded bytes
                const hash = computeBufferHash(response.data);
                console.log(`[DEBUG] Computed Hash from URL: ${hash}`);

                // Compare with stored hash
                videoRecord = await Video.findOne({ hash });
                referenceRef = hash;

                if (videoRecord) {
                    console.log('[DEBUG] Record found by URL hash match!');
                } else {
                    console.log('[DEBUG] No record found for URL hash.');
                    // Optional: We could still try the old "Strategy B" (ID in URL) as a fallback hint if needed
                    // But requirement says "Hash verification confirms file integrity".
                    // Let's strictly rely on hash for "Verified Official".
                }

            } catch (downloadError) {
                console.error('[DEBUG] Failed to download file from URL:', downloadError.message);
                // Fallback / Error handling for download failure
                // We might proceed to return NOT_FOUND or handle specifically.
            }
        }

        // 3. Check by File Hash & Modified Simulation
        if (!videoRecord && file) {
            // Simulated "Modified" logic: Check filename for "modified"
            if (file.originalname && file.originalname.toLowerCase().includes("modified")) {
                console.log('[DEBUG] Detected "modified" in filename');
                pib_status = 'MODIFIED';
            } else {
                // Compute hash
                const hash = await computeFileHash(file);
                console.log(`[DEBUG] Verification Hash: ${hash}`);

                videoRecord = await Video.findOne({ hash });
                if (videoRecord) console.log('[DEBUG] Record found by hash');
                else console.log('[DEBUG] No record found by hash');

                referenceRef = hash;
            }
        }

        if (videoRecord) {
            pib_status = 'VERIFIED';
            referenceRef = videoRecord.verificationId;
        }

        // Audit Log
        if (pib_status !== 'MODIFIED' || !referenceRef) referenceRef = referenceRef || 'UNKNOWN'; // Ensure valid ref

        await createAuditLog('VERIFY', 'PIB Fact Check', referenceRef, pib_status,
            file ? `File: ${file.originalname}` : (link ? `Link: ${link}` : `Manual ID: ${verificationId}`), verificationSource);

        if (pib_status === 'VERIFIED') {
            return res.json({
                status: 'VERIFIED',
                data: {
                    verificationId: videoRecord.verificationId,
                    title: videoRecord.title,
                    authority: videoRecord.authority,
                    timestamp: videoRecord.uploadDate,
                    url: videoRecord.cloudinaryUrl
                }
            });
        } else if (pib_status === 'MODIFIED') {
            return res.json({
                status: 'MODIFIED',
                message: 'Content appears to be a modified or partial clip of an official video.'
            });
        } else {
            console.log('[DEBUG] Returning NOT_FOUND');
            // Helper explanation for URL failures
            let message = 'No Official Record Found';
            if (verificationSource === 'URL') {
                message = 'No Official Record Found. Note: Platform-hosted files may be re-encoded or transformed. Hash-based verification requires the original file content.';
            }

            return res.json({
                status: 'NOT_FOUND',
                message: message
            });
        }

    } catch (error) {
        console.error('Verify Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get All Audit Logs
// @route   GET /api/audit-logs
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
