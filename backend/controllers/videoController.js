const Video = require('../models/Video');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Helper to create audit log
const createAuditLog = async (actionType, userRole, referenceId, verificationResult, details) => {
    try {
        await AuditLog.create({
            actionType,
            userRole,
            referenceId,
            verificationResult,
            details
        });
    } catch (err) {
        console.error('Audit Log Error:', err);
    }
};

// Helper to compute file hash from disk stream
const computeFileHash = (filePath) => {
    return new Promise((resolve, reject) => {
        const hash = crypto.createHash('sha256');
        const stream = fs.createReadStream(filePath);

        stream.on('data', (data) => {
            hash.update(data);
        });

        stream.on('end', () => {
            const hex = hash.digest('hex');
            resolve(hex);
        });

        stream.on('error', (err) => {
            reject(err);
        });
    });
};

/* 
   NOTE: Real file download logic removed for DEMO purposes to comply with constraints.
   Link verification is simulated based on exact URL match or ID extraction.
*/

// @desc    Register Official Video Metadata
// @route   POST /api/videos/upload
// @access  Official Authority
exports.uploadVideo = async (req, res) => {
    try {
        const { title, authority, link } = req.body;
        const file = req.file;

        if (!title || !authority) {
            if (file) fs.unlinkSync(file.path);
            return res.status(400).json({ message: 'Title and Issuing Authority are required' });
        }

        const verificationId = uuidv4();
        let hash;
        let cloudinaryUrl = '';
        let cloudinaryPublicId = '';
        let filePath = file ? file.path : null;
        let isTempFile = !!file;

        // Note: In this demo version, we only support direct file uploads for the "Official" source 
        // to generate the ground truth. Link uploads are treated as metadata-only if no file is present.

        if (filePath) {
            // 1. Compute Hash from Local File
            hash = await computeFileHash(filePath);

            // 2. Upload to Cloudinary
            const uploadResponse = await uploadToCloudinary(filePath);

            if (uploadResponse) {
                cloudinaryUrl = uploadResponse.secure_url;
                cloudinaryPublicId = uploadResponse.public_id;

                // 3. Delete Local File (Upload successful)
                if (isTempFile && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } else {
                if (isTempFile && fs.existsSync(filePath)) fs.unlinkSync(filePath);
                return res.status(500).json({ message: 'Error uploading to Cloud storage' });
            }

        } else {
            // Random hash for metadata-only or link-only official registration (mock)
            hash = crypto.randomBytes(32).toString('hex');
            // Check if link logic needs to be robust here? 
            // For now, if user provides a link in upload, we treat it as the "Official URL"
            if (link) cloudinaryUrl = link;
        }

        const existing = await Video.findOne({ hash });

        if (existing) {
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

        // Audit Log
        await createAuditLog('UPLOAD', 'Official Authority', verificationId, 'REGISTERED', `Uploaded: ${title} (Source: ${file ? 'File' : 'Link'})`);

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
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Verify Video
// @route   POST /api/videos/verify
// @access  PIB Fact Check
exports.verifyVideo = async (req, res) => {
    try {
        const { verificationId, link } = req.body;
        const file = req.file;

        let videoRecord = null;
        let pib_status = 'NOT_FOUND';
        let referenceRef = verificationId;
        let filePath = file ? file.path : null;
        let isTempFile = !!file;

        // 1. Check by ID (Explicit)
        if (verificationId) {
            videoRecord = await Video.findOne({ verificationId });
        }

        // 2. Check by Link (Mock Logic - DEMO ONLY)
        if (!videoRecord && !file && link) {

            // Strategy A: Check if the link matches a stored Cloudinary URL exactly
            videoRecord = await Video.findOne({ cloudinaryUrl: link });

            // Strategy B: Check if the link *contains* a Verification ID (Simulated Trust Signal)
            if (!videoRecord) {
                // Regex for UUID v4
                const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
                const match = link.match(uuidRegex);
                if (match) {
                    const extractedId = match[0];
                    videoRecord = await Video.findOne({ verificationId: extractedId });
                }
            }
        }

        // 3. Check by File Hash & Modified Simulation
        if (!videoRecord && file) {
            // Simulated "Modified" logic: Check filename for "modified"
            if (file.originalname && file.originalname.toLowerCase().includes("modified")) {
                pib_status = 'MODIFIED';
                if (isTempFile && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            } else if (filePath) {
                // Compute hash from disk
                const hash = await computeFileHash(filePath);

                videoRecord = await Video.findOne({ hash });
                referenceRef = hash;

                // Cleanup local file after verification
                if (isTempFile && fs.existsSync(filePath)) fs.unlinkSync(filePath);
            }
        }

        if (videoRecord) {
            pib_status = 'VERIFIED';
            referenceRef = videoRecord.verificationId;
        }

        // Audit Log
        await createAuditLog('VERIFY', 'PIB Fact Check', referenceRef || 'UNKNOWN', pib_status,
            file ? `File: ${file.originalname}` : (link ? `Link: ${link}` : `Manual ID: ${verificationId}`));

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
            // Cleanup just in case
            if (filePath && isTempFile && fs.existsSync(filePath)) fs.unlinkSync(filePath);

            return res.json({
                status: 'NOT_FOUND',
                message: 'No Official Record Found'
            });
        }

    } catch (error) {
        console.error('Verify Error:', error);
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
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
