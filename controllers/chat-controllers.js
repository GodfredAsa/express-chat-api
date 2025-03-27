const Message = require('../models/messageModel');
// const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');

require('dotenv').config();  // Load environment variables at the top

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Configuration
const storage = multer.diskStorage({});
const upload = multer({ storage });

const sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;
        let fileUrl = '';
        let fileType = '';

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                resource_type: "auto"
            });
            fileUrl = result.secure_url;
            fileType = path.extname(req.file.originalname);
        }

        const newMessage = new Message({ sender, receiver, message, fileUrl, fileType });
        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
};

const getMessages = async (req, res) => {    
    try {
        const { sender, receiver } = req.query;
        const messages = await Message.find({
            $or: [
                { sender, receiver },
                { sender: receiver, receiver: sender }
            ]
        });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { sendMessage, getMessages, upload };
