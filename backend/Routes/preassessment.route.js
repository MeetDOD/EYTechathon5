const express = require('express');
const router = express.Router();
const { savePreAssessment, generatePreAssessmentReport, getAIHelpForCareer, getAIHelpForCareerChoice, getUserPreAssessmentData, skillsRecommendation, getRespectiveSkillLearningPath } = require("../Controller/preassessment.controller");
const { authenticateToken } = require("../Middlewares/auth.middleware");

router.get("/", authenticateToken, getUserPreAssessmentData);
router.post("/save-pre-assessment", authenticateToken, savePreAssessment);
router.get("/generate-report", authenticateToken, generatePreAssessmentReport);
router.get("/get-career-path", authenticateToken, getAIHelpForCareer);
router.get("/get-career-choice", authenticateToken, getAIHelpForCareerChoice);
router.get("/skills-to-focus", authenticateToken, skillsRecommendation);
router.get("/skill-learning-path", authenticateToken, getRespectiveSkillLearningPath);


module.exports = router;