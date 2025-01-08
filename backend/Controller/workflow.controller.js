const LearningPath = require("../Models/learningpath.model");
const { Preassessment } = require("../Models/preassessment.model");
const { User } = require("../Models/user.model");
const { Course, Content } = require("../Models/usercourse.model");
const { fetchRelevantImage } = require("../utils/thumbnailGenerator");
const { generateRespectiveSkillAssessmentFromAI, getRespectiveSkillLearningPathFromAI, generateCourseContentFromAI } = require("./ai.controller");
const { generateLearningPathContent } = require("./learningpath.controller");


const workFlowLearningPath = async (user_id) => {
    try{
        const preassessment = await Preassessment.findOne({ user: user_id });
        if (!preassessment) {
            return res.status(404).json({ message: "Pre-assessment data not found." });
        }

        // Extract skills to focus on
        const skillsToFocus = preassessment.feedback.for_career_goal.skills_to_focus.map((skill) => {
            return {
                skill: skill.skill,
                _id: skill._id
            }
        });

        // Initialize the learning path array
        const skillBasedLearningPath = [];

        // Loop through each skill and fetch its respective learning path
        for (const skill of skillsToFocus) {
            try {
                const skillLearningPath = await getRespectiveSkillLearningPathFromAI(
                    skill.skill,
                    preassessment.user_profile.career_goal,
                    preassessment
                );

                skillBasedLearningPath.push({
                    name: skill.skill,
                    chapters: skillLearningPath.chapters,
                    exercises: skillLearningPath.exercises,
                    projects: skillLearningPath.projects,
                    resources: skillLearningPath.resources,
                    preassesment_skill_id: skill._id.toString()
                });

                console.log(`Learning path generated for skill: ${skill.skill}`);
            } catch (aiError) {
                console.error(`Error fetching learning path for skill: ${skill.skill}`, aiError.message);
                // Optionally handle individual skill fetch errors
            }
        }

        console.log("First item in skillBasedLearningPath:", skillBasedLearningPath[0]);

        // Save the generated learning path in the database
        const learningPath = await LearningPath.create({
            career_goal: preassessment.user_profile.career_goal,
            user: req.user._id,
            skills: skillBasedLearningPath,

        });

        console.log("Learning path saved successfully:", learningPath._id);
    }catch(e){
        console.log(e)
    }
}

const workflowCreateAllQuizzes = async (user_id) => {
    try{
        const user = await User.findById(user_id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Validate learning path existence
        const learningPath = await LearningPath.findOne({ user: req.user._id });
        if (!learningPath) return res.status(404).json({ message: 'Learning Path not found' });

        // Prepare data for quiz generation
        const skills = learningPath.skills.map(skill => ({
            skill_name: skill.name,
            skill_id: skill.preassesment_skill_id, // Correct property reference
            exercises: skill.exercises,
        }));

        // Generate quizzes for all skills concurrently
        const quizzes = await Promise.all(
            skills.map(async skill => {
                const quiz = await generateRespectiveSkillAssessmentFromAI(skill.skill_name, skill.exercises);
                console.log(`Quiz for ${skill.skill_name} created successfully`);
                return {
                    skill: skill.skill_name,
                    questions: quiz.questions,
                    preassessment_skill_id: skill.skill_id,
                };
            })
        );

        // Create the assessment document
        const newAssessment = await Assessment.create({
            user: req.user._id,
            skillsToDevelop: quizzes,
        });

        // Update learning path with assessment references
        learningPath.skills.forEach(skill => {
            const quiz = quizzes.find(q => q.skill === skill.name);
            if (quiz) {
                skill.assessment = newAssessment._id;
            }
        });

        await learningPath.save();

    }catch(e){
        console.log(e)
    }
}

const workFlowGenerateLearningPathContent = async (user_id) => {
    try{
        const user = user_id;
        const doesUserExists = await User.findById(user);
        if(!doesUserExists) return res.status(404).json({message: "User not found"});
        const learningPath = await LearningPath.findOne({user: user});
        const extractSpecificSkillsLearningContent = learningPath.skills.map((skill) => {
            console.log(skill.chapters);
            return {
                name: skill.name,
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
                for_skill: x.name,
                thumbnail: thumbnailPic,
                description: response.description,
            });
            const content = response.content.map((content) => {
                return {
                    title: content.title,
                    content: content.content,
                    duration: content.duration,
                    courseId: newCourse._id,
                    description: content.description
                }
            });

            const newContent = await Content.insertMany(content);

            newCourse.content = newContent.map((content) => content._id);
            await newCourse.save();
            console.log(`Course Content Generated for ${x.name}`);
        }

    }catch(e){
        console.log(e);
    }
}

const workFlowContentGenFn = async (req, res) => {
    try {
        const userId = req.user._id; // Access req.user._id directly
        const doesUserExist = await User.findById(userId);
        if (!doesUserExist) {
            return res.status(404).send({ message: 'User not found' });
        }

        // Sequential execution of the steps
        await workFlowLearningPath(userId);
        await workflowCreateAllQuizzes(userId);
        await workFlowGenerateLearningPathContent(userId);

        // Update user status and save
        doesUserExist.contentGenerated = true;
        await doesUserExist.save();

        res.status(200).send({ message: 'WorkFlow content generated successfully' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send({ message: 'Error while generating workFlow content' });
    }
};

module.exports = { workFlowContentGenFn };
