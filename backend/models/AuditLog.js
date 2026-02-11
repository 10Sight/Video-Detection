const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    actionType: {
        type: String,
        enum: ['UPLOAD', 'VERIFY'],
        required: true,
    },
    userRole: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    verificationResult: {
        type: String, // e.g., "VERIFIED", "NOT_FOUND", "MODIFIED" (for verify action)
        required: false,
    },
    verificationSource: {
        type: String, // "FILE" or "URL"
        required: false
    },
    referenceId: {
        type: String, // Verification ID or Hash
        required: false,
    },
    details: {
        type: String, // Extra info
        required: false
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
