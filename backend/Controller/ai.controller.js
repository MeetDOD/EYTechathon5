const { chatSession } = require('../utils/gemini');

const getCareerPathRecommendationFromAI = async (preassessmentData) => {
    try {
        const prompt = `Based on the user's profile:
                        - **Education Level**: ${preassessmentData.user_profile.education_level}
                        - **Occupation**: ${preassessmentData.user_profile.occupation}
                        - **Interested Field**: ${preassessmentData.user_profile.interested_field}
                        - **Career Goal**: ${preassessmentData.user_profile.career_goal}
                        - **Skills and Experience**: ${JSON.stringify(preassessmentData.user_profile.skills_experience)}
                        - **Communication Skills**: Verbal (${preassessmentData.communication_skills.verbal}), Written ${preassessmentData.communication_skills.written})
                        - **Preferences**: Collaborative Learning (${preassessmentData.miscellanous.prefer_collaborative_learning}), Reading (${preassessmentData.miscellanous.prefer_reading}), Weekly Time Commitment (${preassessmentData.miscellanous.time_commitment} hours)
                        - **Ratings**: Technical Skills (${preassessmentData.open_ended_questions.technical_skills}), Teamwork Skills (${preassessmentData.open_ended_questions.teamwork_skills}), Analytical Thinking (${preassessmentData.open_ended_questions.analytical_thinking})

                        Please provide a career development recommendation for achieving the user's goal of becoming a ${preassessmentData.user_profile.career_goal}. Your response should include:
                        1. The most crucial skills or knowledge gaps the user should focus on.
                        2. Recommended certifications, courses, or resources to acquire these skills.
                        3. Projects or practical experiences that align with their career goal.
                        4. Advice on balancing their learning plan with their daily ${preassessmentData.miscellanous.time_commitment}-hour commitment.

                        ### JSON Response Structure:
                        Ensure the response strictly follows this structure:

                        \`\`\`json
                        {
                            "overview": "Summary of the career path recommendation.",
                            "crucialSkillsAndKnowledgeGaps": [
                                {
                                "name": "Skill or Knowledge Gap 1",
                                "description": "Description of the skill or knowledge gap."
                                },
                            ],
                            "recommendedCertificationsCoursesAndResources":[
                                {
                                    "category": "Certification, Course, or Resource Category",
                                    "examples": [ "Certification, Course, or Resource 1", "Certification, Course, or Resource 2" ]
                                }
                            ],
                            "projectsAndPracticalExperiences": ["Project or Practical Experience 1", "Project or Practical Experience 2"],
                            balanceLearningPlan: "Advice on balancing learning plan with daily time commitment."
                            summary: "Summary of the career path recommendation."


                        }
                        \`\`\`
                        `;
        const result = await chatSession.sendMessage(prompt);
        const data = result.response.text();
        const cleanedData = data.replace(/```json|```/g, '');

        return JSON.parse(cleanedData);

    } catch (error) {
        console.error("Error getting user skills:", error);
        throw new Error("Failed to get user skills.");
    }
}


const getCareerChoiceRecommendationFromAI = async (preassessmentData) => {
    try {
        const prompt = `Based on the user's profile:
                        - **Education Level**: ${preassessmentData.user_profile.education_level}
                        - **Occupation**: ${preassessmentData.user_profile.occupation}
                        - **Interested Field**: ${preassessmentData.user_profile.interested_field}
                        - **Career Goal**: ${preassessmentData.user_profile.career_goal}
                        - **Skills and Experience**: ${JSON.stringify(preassessmentData.user_profile.skills_experience)}
                        - **Communication Skills**: Verbal (${preassessmentData.communication_skills.verbal}), Written ${preassessmentData.communication_skills.written})
                        - **Preferences**: Collaborative Learning (${preassessmentData.miscellanous.prefer_collaborative_learning}), Reading (${preassessmentData.miscellanous.prefer_reading}), Weekly Time Commitment (${preassessmentData.miscellanous.time_commitment} hours)
                        - **Ratings**: Technical Skills (${preassessmentData.open_ended_questions.technical_skills}), Teamwork Skills (${preassessmentData.open_ended_questions.teamwork_skills}), Analytical Thinking (${preassessmentData.open_ended_questions.analytical_thinking})

                       
                        Please provide top 3 best career choices for the user based on their profile. Your response should include:
                        ### JSON Response Structure:
                        Ensure the response strictly follows this structure:

                        \`\`\`json
                        {
                            "careerChoices": ["Career Choice 1", "Career Choice 2", "Career Choice 3"],
                            "summary": "Summary of the career choices."
                        }
                        \`\`\`
                        `
        const result = await chatSession.sendMessage(prompt);
        const data = result.response.text();
        const cleanedData = data.replace(/```json|```/g, '');
        return JSON.parse(cleanedData);
    } catch (error) {
        console.error("Error getting user skills:", error);
        throw new Error("Failed to get user skills.");
    }
}

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



    module.exports = { getCareerPathRecommendationFromAI, generateAIInsights, getCareerChoiceRecommendationFromAI }