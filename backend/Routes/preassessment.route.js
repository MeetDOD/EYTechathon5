const express = require('express');
const router = express.Router();
const { savePreAssessment, generatePreAssessmentReport } = require("../Controller/preassessment.controller");
const { authenticateToken } = require("../Middlewares/auth.middleware")

router.post("/save-pre-assessment", authenticateToken, savePreAssessment);
router.get("/generate-report", authenticateToken, generatePreAssessmentReport);



module.exports = router;