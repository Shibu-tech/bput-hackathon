const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/analyze', aiController.analyzeComplaint);
router.get('/insights', aiController.getInsights);

module.exports = router;
