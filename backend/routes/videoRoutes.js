const express = require('express');
const router = express.Router();
const multer = require('multer');
const videoController = require('../controllers/videoController');

// Multer setup for memory storage (for hash calculation)
const storage = multer.memoryStorage();
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ];

        // Allow all video types
        if (file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only Videos, Images, and PDFs are allowed. HTML is strictly prohibited.'));
        }
    }
});

router.post('/upload', upload.single('videoFile'), videoController.uploadVideo);
router.post('/verify', upload.single('videoFile'), videoController.verifyVideo);

module.exports = router;
