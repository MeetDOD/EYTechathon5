const LearningPath = require("../Models/learningpath.model");
const { User } = require("../Models/user.model");
const {Preassessment}  = require("../Models/preassessment.model");
const Assessment = require("../Models/assessment.model");
const {Course, Content} = require("../Models/usercourse.model.js");

const getAllCoursesForRespectiveUser = async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if(!user) return res.status(404).json({ message: "User not found" });
        const courses = await Course.find({ belongs_to: req.user._id });
        if(!courses) return res.status(404).json({ message: "Courses not found" });

        res.status(200).json({
            message: "Courses found",
            data: courses
        });
        
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

const getCourseForSpecificSkill = async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if(!user) return res.status(404).json({ message: "User not found" });
        const skill_name = req.params.skillname;
        console.log(skill_name);
        if(!skill_name) return res.status(400).json({ message: "Skill Id is required" });
        const course = await Course.findOne({ belongs_to: req.user._id, for_skill: skill_name });
        if(!course) return res.status(404).json({ message: "Course not found" });
        const courseContents = await course.populate("content");
        if(!courseContents) return res.status(404).json({ message: "Course content not found" });

        res.status(200).json({
            message: "Course content found",
            data: courseContents
        });
        
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

const getCourseContents = async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if(!user) return res.status(404).json({ message: "User not found" });
        const course_id = req.params.courseId;
        if(!course_id) return res.status(400).json({ message: "Course Id is required" });
        const course = await Course.findOne({ belongs_to: req.user._id, _id: req.params.courseId });
        if(!course) return res.status(404).json({ message: "Course not found" });
        const courseContents = await course.populate("content");
        if(!courseContents) return res.status(404).json({ message: "Course content not found" });

        res.status(200).json({
            message: "Course content found",
            forCourseName: course.courseName,
            data: courseContents.content,
            progress: course.progress,
            activeChapterIndex: course.activeChapterIndex,
            for_skill: course.for_skill

        });
        
    }catch(error){
        res.status(500).json({ message: error.message });
    }
}

const getCourseContent = async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        if(!user) return res.status(404).json({ message: "User not found" });
        const courseContentId = req.params.courseContentId;
        if(!courseContentId) return res.status(400).json({ message: "Course Content Id is required" });
        const courseContent = await Content.findOne({ _id: courseContentId });
        if(!courseContent) return res.status(404).json({ message: "Course content not found" });

        res.status(200).json({
            message: "Course content found",
            data: courseContent
        });
        
    }catch(error){
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getCourseForSpecificSkill,
    getCourseContent,
    getAllCoursesForRespectiveUser,
    getCourseContents
};