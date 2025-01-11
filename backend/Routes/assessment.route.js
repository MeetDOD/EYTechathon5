const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middlewares/auth.middleware');
const { createAllQuizzes, getAssessmentDetailsForAParticularSkill, scoreAssessment } = require('../Controller/assessment.controller');

router.post("/create-all-quizzes",authenticateToken, createAllQuizzes);
router.get("/:skill_id", authenticateToken, getAssessmentDetailsForAParticularSkill);
router.post("/submit/:assessmentId", authenticateToken, scoreAssessment);


module.exports = router;