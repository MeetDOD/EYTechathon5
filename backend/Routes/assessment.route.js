const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middlewares/auth.middleware');
const { createAllQuizzes } = require('../Controller/assessment.controller');

router.post("/create-all-quizzes",authenticateToken, createAllQuizzes);


module.exports = router;