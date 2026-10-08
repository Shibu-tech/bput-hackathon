const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');

router.post('/', messageController.sendMessage);
router.get('/', messageController.getMessages);
router.get('/conversations', messageController.getConversations);

module.exports = router;
