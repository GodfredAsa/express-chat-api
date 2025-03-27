const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, upload } = require('../controllers/chat-controllers');

router.post('/send', upload.single('file'), sendMessage);
router.get('/messages', getMessages);

module.exports = router;
