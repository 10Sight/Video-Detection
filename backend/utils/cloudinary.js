const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        // File uploaded successfully, now unlink from local filesystem
        // (Or handle deletion in controller after success)
        return response;
    } catch (error) {
        // If upload fails, cleanup local file
        fs.unlinkSync(localFilePath);
        console.error("Cloudinary upload failed", error);
        return null;
    }
};

module.exports = { uploadToCloudinary, cloudinary };
