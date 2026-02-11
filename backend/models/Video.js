const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    authority: {
        type: String,
        required: true,
    },
    verificationId: {
        type: String, // UUID
        required: true,
        unique: true,
    },
    hash: {
        type: String, // Mock cryptographic hash
        required: true,
        unique: true,
    },
    uploadDate: {
        type: Date,
        default: Date.now,
    },
    fileName: {
        type: String,
        required: false, // In a real app this would be the path/url
    },
    meta: {
        type: Map,
        of: String,
        default: {}
    }
});

module.exports = mongoose.model('Video', videoSchema);
