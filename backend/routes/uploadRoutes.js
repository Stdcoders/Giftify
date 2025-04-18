const express = require("express");
require("dotenv").config();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const steamifier = require("streamifier");

// cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// @route POST /api/upload
// @desc upload image to cloudinary
// @access Private

router.post("/", upload.single("image"), async (req, res) => {
    try {
       if(!req.file) {
           return res.status(400).send("No file uploaded");
        }
        const streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });
                steamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        const result = await streamUpload(req);
        res.status(201).json({imageUrl: result.secure_url});
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
}
);

module.exports = router;