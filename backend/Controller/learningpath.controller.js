const LearningPath = require("../Models/learningpath.model");
const { User } = require("../Models/user.model");
const {Preassessment}  = require("../Models/preassessment.model");
const Assessment = require("../Models/assessment.model");
const {Course, Content} = require("../Models/usercourse.model.js")
const { generateCourseContentFromAI } = require("./ai.controller");
const {fetchRelevantImage } = require("../utils/thumbnailGenerator.js");

const getLearningPath = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const learningP = await LearningPath.findOne({ user: req.user._id });
        const assessment_skills = await Assessment.findOne({ user: req.user._id });
        if (!assessment_skills) return res.status(404).json({ message: "Assessment not found" });

        

        if (!learningP) return res.status(404).json({ message: "Learning Path not found" });
        if (!LearningPath) return res.status(404).json({ message: "Learning Path not found" });

        res.status(200).json({
            message: "Learning Path found",
            data: learningP
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getRespectiveLearningPath = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });


        const learningPathId = req.params.learningPathId;
        if (!learningPathId) return res.status(400).json({ message: "Learning Path Id is required" });

        const learningP = await LearningPath.findOne({ user: req.user._id});
        if (!learningP) return res.status(404).json({ message: "Learning Path not found" });

        let data = {};
        for(const x of learningP.skills){
            if(x.preassesment_skill_id=== learningPathId){
                data = x;
            }
        }

        if (!data) return res.status(404).json({ message: "Learning Path not found" });

        res.status(200).json({
            message: "Learning Path found",
            data: data
        });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

const generateLearningPathContent = async (req,res) => {
    try{
        const user = req.user._id;
        const doesUserExists = await User.findById(user);
        if(!doesUserExists) return res.status(404).json({message: "User not found"});
        const learningPath = await LearningPath.findOne({user: user});
        const extractSpecificSkillsLearningContent = learningPath.skills.map((skill) => {
            console.log(skill.chapters);
            return {
                name: skill.name,
                skillId: skill.preassesment_skill_id,
                chapters: skill.chapters,
            }
        });
        console.log(extractSpecificSkillsLearningContent);
        const preassessmentData = await Preassessment.findOne({user: user});
        if(!preassessmentData) return res.status(404).json({message: "Preassessment not found"});

        console.log("Generating CouseContent from GenAI");
        for(const x of extractSpecificSkillsLearningContent){
            console.log(`Generating Course Content for ${x.name}`);
            const response = await generateCourseContentFromAI(x.chapters,preassessmentData, x.name);
            const thumbnailPic = await fetchRelevantImage(response.topic);
            const newCourse = await Course.create({
                belongs_to: user,
                courseName: response.courseName,
                category: response.category,
                courseLevel: response.courseLevel,
                language: response.language,
                topic: response.topic,
                for_skill: x.skillId,
                thumbnail: thumbnailPic,
                description: response.description,
            });
            const content = response.content.map((content) => {
                return {
                    title: content.title,
                    content: content.content,
                    duration: content.duration,
                    courseId: newCourse._id,
                    description: content.description,
                    objectives: content.objectives,
                    real_world_examples: content.real_world_examples,
                    learning_outcomes: content.learning_outcomes,
                    key_points: content.key_points,
                }
            });

            const newContent = await Content.insertMany(content);

            newCourse.content = newContent.map((content) => content._id);
            await newCourse.save();
            console.log(`Course Content Generated for ${x.name}`);
        }

        return res.status(200).json({message: "Learning Path Content Generated Successfully"});
    }catch(e){
        console.log(e);
    }
}

module.exports = { getLearningPath, getRespectiveLearningPath, generateLearningPathContent };