const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../Middlewares/auth.middleware');
const { getCourseContent, getCourseForSpecificSkill, getAllCoursesForRespectiveUser, getCourseContents } = require('../Controller/course.controller');

router.get("/get-course-content", authenticateToken, getCourseContent);
router.get("/all-courses", authenticateToken, getAllCoursesForRespectiveUser);
router.get("/course-contents/:courseId", authenticateToken, getCourseContents);
router.get("/get-course-for-specific-skill/:skillname", authenticateToken, getCourseForSpecificSkill);

module.exports = router;