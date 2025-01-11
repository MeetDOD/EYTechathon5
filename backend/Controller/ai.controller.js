const { chatSession } = require('../utils/gemini');



const getSkillsWhichUserShouldFocusOn = async (preassessmentData) => {
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

                        Please provide the most crucial skills or knowledge gaps the user should focus on to achieve their goal of becoming a ${preassessmentData.user_profile.career_goal}.

                        ### JSON Response Structure:
                        Ensure the response strictly follows this structure:

                        \`\`\`json
                        {
                            "crucialSkillsAndKnowledgeGaps": [
                                {
                                "name": "Skill or Knowledge Gap 1",
                                "description": "Description of the skill or knowledge gap."
                                },
                            ]
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

const getRespectiveSkillLearningPathFromAI = async (skill, career_goal, preassessment) => {
    try {
        const prompt = `Based on the user's preassessment data
                            - **Education Level**: ${preassessment.user_profile.education_level}
                            - **Occupation**: ${preassessment.user_profile.occupation}
                            - **Interested Field**: ${preassessment.user_profile.interested_field}
                            - **Career Goal**: ${preassessment.user_profile.career_goal}
                            - **Skills and Experience**: ${JSON.stringify(preassessment.user_profile.skills_experience)}
                            - **Communication Skills**: Verbal (${preassessment.communication_skills.verbal}), Written ${preassessment.communication_skills.written})
                            - **Preferences**: Collaborative Learning (${preassessment.miscellanous.prefer_collaborative_learning}), Reading (${preassessment.miscellanous.prefer_reading}), Weekly Time Commitment (${preassessment.miscellanous.time_commitment} hours)
                            - **Ratings**: Technical Skills (${preassessment.open_ended_questions.technical_skills}), Teamwork Skills (${preassessment.open_ended_questions.teamwork_skills}), Analytical Thinking (${preassessment.open_ended_questions.analytical_thinking})

                            Please provide a learning path for the user to acquire the skill "${skill}" to achieve their goal of becoming a ${career_goal}.

                            ### JSON Response Structure:
                            Ensure the response strictly follows this structure:

                            \`\`\`json
                            {
                                "overview": "Summary of the learning path.",
                                "chapters": [{
                                    "title": "Chapters Title",
                                    "description": "Chapters Content"
                                }],
                                "exercises": [
                                    {
                                        "title": "Exercise Title",
                                        "description": "Exercise Description"
                                    }
                                ],
                                "projects": [
                                    {
                                        "title": "Project Title",
                                        "description": "Project Description"
                                    }
                                ],
                                "resources": [
                                    {
                                        "title": "Resource Title",
                                        "description": "Resource Description"
                                    }
                                ]

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

const generateRespectiveSkillAssessmentFromAI = async (skill_name, exercises) => {
    try {
        const prompt = `
            You are an AI assistant tasked with generating skill assessments. Create an assessment for the skill "${skill_name}" using the following exercises as a guide. Each exercise contains a title and description that highlight key topics and activities.

            ### Exercises:
            ${exercises.map((ex, index) => `
                ${index + 1}. Title: ${ex.title}
                Description: ${ex.description}
            `).join('')}

            ### Instructions:
            1. Create at least 5 questions for the assessment.
            2. Each question should align with the themes and topics described in the exercises.
            3. Include 4 answer options for each question.
            4. Identify the correct answer clearly.

            ### JSON Response Format:
            Ensure the response strictly follows this JSON structure:
            \`\`\`json
            {
                "skill": "${skill_name}",
                "questions": [
                    {
                        "question": "Write your question here.",
                        "options": [
                            "Option 1",
                            "Option 2",
                            "Option 3",
                            "Option 4"
                        ],
                        "correctAnswer": "Correct Option"
                    }
                ]
            }
            \`\`\`

            Important: Do not include any extra text outside the JSON response.
                    `;

        const result = await chatSession.sendMessage(prompt);
        const data = result.response.text();
        const cleanedData = data.replace(/```json|```/g, '');
        return JSON.parse(cleanedData);
    } catch (error) {
        console.error("Error generating skill assessment:", error);
        throw new Error("Failed to generate skill assessment.");
    }
};


const generateCourseContentFromAI = async (chapters, preassessmentData, skill_name) => {
    try {
        const prompt = `
                Based on the user's career goal and preassessment data, generate a course for the skill: **${skill_name}**  with the following details:

            ### User Profile:
            - **Education Level**: ${preassessmentData.user_profile.education_level}
            - **Occupation**: ${preassessmentData.user_profile.occupation}
            - **Interested Field**: ${preassessmentData.user_profile.interested_field}
            - **Career Goal**: ${preassessmentData.user_profile.career_goal}
            - **Skills and Experience**: ${JSON.stringify(preassessmentData.user_profile.skills_experience)}
            - **Communication Skills**: Verbal (${preassessmentData.communication_skills.verbal}), Written (${preassessmentData.communication_skills.written})
            - **Preferences**: 
            - Collaborative Learning: ${preassessmentData.miscellanous.prefer_collaborative_learning}
            - Reading: ${preassessmentData.miscellanous.prefer_reading}
            - Weekly Time Commitment: ${preassessmentData.miscellanous.time_commitment} hours

            ### Chapters:
            The course should contain the following chapters:
            ${chapters.map((chapter, index) => `- Chapter ${index + 1}: **${chapter.title}** - ${chapter.description}`).join('\n')}

            ### JSON Response Structure:
            The response must follow this structure:
            \`\`\`json
            {
                        "courseName": "Course Title Here",
                        "description": "Detailed course description here.",
                        "category": "Category name here.",
                        "courseLevel": "Difficulty level here.",
                        "language": "Language here.",
                        "topic": "Specific topic here.",
                        "for_skill": "Skill name here.",
                        "content": [
        {
            "title": "Chapter 1 Title",
            "description": "Chapter 1 Content",
            "content": "InDepth summary of the chapter 1",
            "objectives": ["Objective 1", "Objective 2"],
            "real_world_examples": ["Example 1", "Example 2"],
            "learning_outcomes": ["Outcome 1", "Outcome 2"],
            "key_points": ["Key Point 1", "Key Point 2"],
            
        }
    ]
            }
            \`\`\`
        `;

        const result = await chatSession.sendMessage(prompt);
        const data = result.response.text();
        const cleanedData = data.replace(/```json|```/g, '');
        console.log('cleanedData:', cleanedData);
        return JSON.parse(cleanedData);

    } catch (error) {
        console.error("Error generating course and course content:", error);
        throw new Error("Failed to generate course and course content.");
    }
}


const generateDetailContentForCourseFromAI = async (chapter_about) => {
    try {
        const sanitize = (str) =>
            str.replace(/[\n\r\t]/g, ' ').replace(/"/g, '\\"');

        const prompt = `
            Provide a detailed explanation of the chapter titled "${sanitize(chapter_about.title)}" based on the following details:

            - **Description**: ${sanitize(chapter_about.description)}

            - **Objectives**:
            ${chapter_about.objectives.map((objective, index) => `${index + 1}. ${sanitize(objective)}`).join('\n')}

            - **Real-World Examples**:
            ${chapter_about.real_world_examples.map((example, index) => `${index + 1}. ${sanitize(example)}`).join('\n')}

            - **Learning Outcomes**:
            ${chapter_about.learning_outcomes.map((outcome, index) => `${index + 1}. ${sanitize(outcome)}`).join('\n')}

            - **Key Points**:
            ${chapter_about.key_points.map((key_point, index) => `${index + 1}. ${sanitize(key_point)}`).join('\n')}

        `;

        const result = await chatSession.sendMessage(prompt);
        const data = result.response.text();
        return data;
    } catch (error) {
        console.error("Error generating course content:", error.message);
        console.error("Stack Trace:", error.stack);
        throw new Error("Failed to generate course content. Please check the input or AI response format.");
    }
};



module.exports = {generateDetailContentForCourseFromAI, generateCourseContentFromAI, generateRespectiveSkillAssessmentFromAI, getRespectiveSkillLearningPathFromAI, getCareerPathRecommendationFromAI, generateAIInsights, getCareerChoiceRecommendationFromAI, getSkillsWhichUserShouldFocusOn }