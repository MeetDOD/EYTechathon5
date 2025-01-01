const { Preassessment } = require('../Models/preassessment.model');
const { User } = require('../Models/user.model');
const { getCareerPathRecommendationFromAI, generateAIInsights, getCareerChoiceRecommendationFromAI} = require('./ai.controller');
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
        return res.status(200).json({
            message: "Pre-assessment data retrieved successfully.",
            preassessment: preassessment
        });
    } catch (error) {
        console.error("Error getting user pre-assessment data:", error);
        return res.status(500).json({
            error: "An error occurred while getting the pre-assessment data.",
            details: error.message
        });
    }
}

const getAIHelpForCareerChoice = async(req, res) => {
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
    }catch (error) {
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

const getAIHelpForCareer = async(req, res) => {
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
    }catch (error) {
        console.error("Error generating career path recommendation:", error);
        return res.status(500).json({
            error: "An error occurred while generating the career path recommendation.",
            details: error.message,
        });
    }

}




module.exports = { savePreAssessment, generatePreAssessmentReport, getAIHelpForCareer, getAIHelpForCareerChoice, getUserPreAssessmentData };
