const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middlewares/auth.middleware');
const { createAllQuizzes, getAssessmentDetailsForAParticularSkill } = require('../Controller/assessment.controller');

router.post("/create-all-quizzes",authenticateToken, createAllQuizzes);
router.get("/:skill_id", authenticateToken, getAssessmentDetailsForAParticularSkill);


module.exports = router;