const express = require('express');
const router = express.Router();
const { getLearningPath, getRespectiveLearningPath } = require("../Controller/learningpath.controller");
const { authenticateToken } = require('../Middlewares/auth.middleware');

router.get("/",authenticateToken, getLearningPath);
router.get("/:learningPathId",authenticateToken, getRespectiveLearningPath);


module.exports = router;