const express = require('express');
const router = express.Router();
const { getLearningPath, getRespectiveLearningPath, generateLearningPathContent } = require("../Controller/learningpath.controller");
const { authenticateToken } = require('../Middlewares/auth.middleware');

router.get("/",authenticateToken, getLearningPath);
router.get("/generate-content", authenticateToken, generateLearningPathContent);
router.get("/:learningPathId",authenticateToken, getRespectiveLearningPath);


module.exports = router;