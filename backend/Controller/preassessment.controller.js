const { Preassessment } = require('../Models/preassessment.model');
const { User } = require('../Models/user.model');


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


const generateAIInsights = async (preassessment) => {
    try {
        const { user_profile, communication_skills, miscellanous } = preassessment;

        //Will Do some AI stuff here

        return {
            summary: `Based on your education (${user_profile.education_level}), occupation (${user_profile.occupation}), 
                      and interests (${user_profile.interested_field}), we see strong potential in achieving your goal of 
                      "${user_profile.career_goal}".`,
            strengths: [
                ...(user_profile.skills_experience.filter(skill => skill.experience >= 3)
                    .map(skill => `Proficient in ${skill.skill}`)),
                communication_skills.verbal === "Advanced" && "Excellent verbal communication skills",
                communication_skills.written === "Advanced" && "Excellent written communication skills"
            ].filter(Boolean),
            recommendations: [
                "Consider advanced training in your interested field to align with your career goal.",
                "Engage in team-based projects to further enhance collaboration skills.",
                miscellanous.prefer_reading
                    ? "Explore structured reading materials to maximize learning."
                    : "Consider interactive or video-based resources for better engagement."
            ]
        };
    } catch (error) {
        console.error("Error generating AI insights:", error);
        throw new Error("Failed to generate insights.");
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







module.exports = { savePreAssessment, generatePreAssessmentReport };
