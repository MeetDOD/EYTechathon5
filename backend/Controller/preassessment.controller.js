const LearningPath = require('../Models/learningpath.model');
const { Preassessment } = require('../Models/preassessment.model');
const { User } = require('../Models/user.model');
const { getCareerPathRecommendationFromAI, generateAIInsights, getCareerChoiceRecommendationFromAI, getSkillsWhichUserShouldFocusOn, getRespectiveSkillLearningPathFromAI } = require('./ai.controller');
require("dotenv").config();


const sampleBodyForSavePreAssessment = `
{
    "userProfile": {
        "education_level": "Bachelor's in Computer Science",
        "occupation": "Software Developer",
        "interested_field": "Artificial Intelligence",
        "career_goal": "Become a Machine Learning Engineer",
        "skills_experience": [
            { "skill": "Python", "experience": 3 },
            { "skill": "JavaScript", "experience": 2 },
            { "skill": "Data Analysis", "experience": 4 }
        ]
    },
    "communicationSkills": {
        "verbal": "Intermediate",
        "written": "Advanced"
    },
    "openEndedQuestions": {
        "technical_skills": 4,
        "teamwork_skills": 3,
        "analytical_thinking": 5
    },
    "miscellanous": {
        "prefer_collaborative_learning": true,
        "prefer_reading": false,
        "time_commitment": 10
    }
}
`

const getUserPreAssessmentData = async (req, res) => {
    try {
        const preassessment = await Preassessment.findOne({ user: req.user._id });
        if (!preassessment) {
            return res.status(404).json
                ({ message: "Pre-assessment data not found." });
        }
        let flag = false;
        if (preassessment.feedback.for_career_goal.skills_to_focus.length === 0) {
            const skillsRecommendation = await getSkillsWhichUserShouldFocusOn(preassessment);
            const allSkills = skillsRecommendation.crucialSkillsAndKnowledgeGaps.map(skill => {
                return {
                    skill: skill.name,
                    why: skill.description
                }
            });

            if (preassessment?.feedback?.for_career_goal.name !== preassessment.user_profile.career_goal) {
                preassessment.feedback.for_career_goal.name = preassessment.user_profile.career_goal;
                preassessment.feedback.for_career_goal.skills_to_focus = allSkills;
                await preassessment.save();
            }
        }
        if (flag) {
            return res.status(200).json({
                message: "Generated pre-assessment data successfully.",
                preassessment: preassessment
            });
        } else {
            return res.status(200).json({
                message: "Fetched pre-assessment data successfully.",
                preassessment: preassessment
            });
        }
    } catch (error) {
        console.error("Error getting user pre-assessment data:", error);
        return res.status(500).json({
            error: "An error occurred while getting the pre-assessment data.",
            details: error.message
        });
    }
}

const getAIHelpForCareerChoice = async (req, res) => {
    try {
        const preassessment = await Preassessment.findOne({ user: req.user._id });
        if (!preassessment) {
            return res.status(404).json({ message: "Pre-assessment data not found." });
        }
        const careerChoices = await getCareerChoiceRecommendationFromAI(preassessment);
        return res.status(200).json({
            message: "AI career choices generated successfully.",
            careerChoices: careerChoices
        });
    } catch (error) {
        console.error("Error generating career path recommendation:", error);
        return res.status(500).json({
            error: "An error occurred while generating the career path recommendation.",
            details: error.message,
        });
    }
}

const savePreAssessment = async (req, res) => {
    try {
        const { userProfile, communicationSkills, openEndedQuestions, miscellanous } = req.body;
        console.log(userProfile, communicationSkills, openEndedQuestions, miscellanous);

        const doesUserExist = await User.findById(req.user._id);

        if (!doesUserExist) {
            return res.status(404).json({ message: "User not found." });
        }

        console.log("User exists:", doesUserExist._id);
        const existingAssessment = await Preassessment.findOne({ user: req.user._id });
        if (existingAssessment) {
            return res.status(400).json({
                message: "Pre-assessment already exists for this user.",
                preassessment: existingAssessment
            });
        }

        console.log("Creating new pre-assessment for user:", req.user._id);
        const newPreassessment = await Preassessment.create({
            user: req.user._id,
            user_profile: userProfile,
            communication_skills: communicationSkills,
            open_ended_questions: openEndedQuestions,
            miscellanous
        });

        doesUserExist.hasGivenPreAssessment = true;
        await doesUserExist.save();

        console.log("Pre-assessment saved successfully:", newPreassessment._id);
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        const triggerWorkflowToGenAIContent = await fetch(`${process.env.N8N_WEBHOOK_URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await triggerWorkflowToGenAIContent.json();
        console.log("Result from N8N workflow trigger:", result);




        return res.status(201).json({
            message: "Pre-assessment saved successfully.",
            preassessment: newPreassessment
        });

    } catch (error) {
        console.error("Error saving pre-assessment:", error);

        return res.status(500).json({
            error: "An error occurred while saving the pre-assessment.",
            details: error.message
        });
    }
};





const generatePreAssessmentReport = async (req, res) => {
    try {

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const preassessment = await Preassessment.findOne({ user: req.user._id });
        if (!preassessment) {
            return res.status(404).json({ message: "Pre-assessment data not found." });
        }

        const aiInsights = await generateAIInsights(preassessment);

        return res.status(200).json({
            message: "Pre-assessment report retrieved successfully.",
            user: {
                name: user.name,
                email: user.email,
            },
            preAssessmentDetails: {
                educationLevel: preassessment.user_profile.education_level,
                occupation: preassessment.user_profile.occupation,
                interestedField: preassessment.user_profile.interested_field,
                careerGoal: preassessment.user_profile.career_goal,
                skillsExperience: preassessment.user_profile.skills_experience,
                communicationSkills: preassessment.communication_skills,
                preferences: preassessment.miscellanous,
            },
            insights: aiInsights,
            nextSteps: "Proceed to the in-depth assessment to unlock your personalized learning path."
        });
    } catch (error) {
        console.error("Error generating pre-assessment report:", error);
        return res.status(500).json({
            error: "An error occurred while generating the report.",
            details: error.message,
        });
    }
};

const getAIHelpForCareer = async (req, res) => {
    try {
        const preassessment = await Preassessment.findOne({ user: req.user._id });
        if (!preassessment) {
            return res.status(404).json({ message: "Pre-assessment data not found." });
        }

        const careerPathRecommendation = await getCareerPathRecommendationFromAI(preassessment);
        return res.status(200).json({
            message: "AI career path recommendation generated successfully.",
            careerPathRecommendation: careerPathRecommendation
        });
    } catch (error) {
        console.error("Error generating career path recommendation:", error);
        return res.status(500).json({
            error: "An error occurred while generating the career path recommendation.",
            details: error.message,
        });
    }

}

const skillsRecommendation = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const preassessment = await Preassessment.findOne({ user: req.user._id });
        if (!preassessment) {
            return res.status(404).json({ message: "Pre-assessment data not found." });
        }
        const skillsRecommendation = await getSkillsWhichUserShouldFocusOn(preassessment);
        const allSkills = skillsRecommendation.crucialSkillsAndKnowledgeGaps.map(skill => {
            return {
                skill: skill.name,
                why: skill.description
            }
        });

        if (preassessment?.feedback?.for_career_goal.name !== preassessment.user_profile.career_goal) {
            preassessment.feedback.for_career_goal.name = preassessment.user_profile.career_goal;
            preassessment.feedback.for_career_goal.skills_to_focus = allSkills;
            await preassessment.save();
        }



        return res.status(200).json({
            message: "Skills recommendation generated successfully.",
            ultimateCareerGoal: `For your ultimate career goal of becoming a ${preassessment.user_profile.career_goal},`,
            skillsRecommendation: skillsRecommendation
        });
    } catch (error) {
        console.error("Error generating skills recommendation:", error);
        return res.status(500).json({
            error: "An error occurred while generating the skills recommendation.",
            details: error.message,
        });
    }
}

const getRespectiveSkillLearningPath = async (req, res) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch the pre-assessment data for the user
        const preassessment = await Preassessment.findOne({ user: req.user._id });
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
        // Respond with the generated learning path
        return res.status(200).json({
            message: "Skill based learning path generated and saved successfully.",
            skillBasedLearningPath,
        });

    } catch (error) {
        console.error("Error generating skills recommendation:", error);
        return res.status(500).json({
            error: "An error occurred while generating the skills recommendation.",
            details: error.message,
        });
    }
};


module.exports = { savePreAssessment, skillsRecommendation, generatePreAssessmentReport, getAIHelpForCareer, getAIHelpForCareerChoice, getUserPreAssessmentData, getRespectiveSkillLearningPath };
