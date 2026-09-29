const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');

// GET /api/files/:id
router.get('/:id', fileController.getFileById);

module.exports = router;
