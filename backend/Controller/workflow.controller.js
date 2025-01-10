const Assessment = require("../Models/assessment.model");
const LearningPath = require("../Models/learningpath.model");
const { Preassessment } = require("../Models/preassessment.model");
const { User } = require("../Models/user.model");
const { Course, Content } = require("../Models/usercourse.model");
const { fetchRelevantImage } = require("../utils/thumbnailGenerator");
const { generateRespectiveSkillAssessmentFromAI, getRespectiveSkillLearningPathFromAI, generateCourseContentFromAI, getSkillsWhichUserShouldFocusOn } = require("./ai.controller");
require("dotenv").config();

const workFlowSkillsRecommended = async (user_id) => {
    try {
        const user = await User.findById(user_id);
        if (!user) {
            return console.log("User not found");
        }
        const preassessment = await Preassessment.findOne({ user: user_id });
        if (!preassessment) {
            return console.log("Preassessment not found");
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



        console.log("Skills recommendation generated successfully:", allSkills);
    } catch (error) {
        console.error("Error generating skills recommendation:", error);
    }
}

const workFlowLearningPath = async (user_id) => {
    try {
        const preassessment = await Preassessment.findOne({ user: user_id });
        if (!preassessment) {
            console.log("Preassessment not found");
            return;
        }
        console.log("Generating learning path for user:", preassessment.user_profile.career_goal);

        // Extract skills to focus on
        const skillsToFocus = preassessment.feedback.for_career_goal.skills_to_focus.map((skill) => {
            return {
                skill: skill.skill,
                _id: skill._id
            }
        });

        console.log("Skills to focus on:", skillsToFocus);

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
            user: user_id,
            skills: skillBasedLearningPath,

        });

        console.log("Learning path saved successfully:", learningPath._id);
    } catch (e) {
        console.log(e)
    }
}

const workflowCreateAllQuizzes = async (user_id) => {
    try {
        const user = await User.findById(user_id);
        if (!user) {
            console.log("User not found");
            return
        }

        // Validate learning path existence
        const learningPath = await LearningPath.findOne({ user: user_id });
        if (!learningPath) {
            console.log("Learning path not found");
            return
        }
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
            user: user_id,
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

    } catch (e) {
        console.log(e)
    }
}

const workFlowGenerateLearningPathContent = async (user_id) => {
    try {
        const user = user_id;
        const doesUserExists = await User.findById(user);
        if (!doesUserExists) return res.status(404).json({ message: "User not found" });
        const learningPath = await LearningPath.findOne({ user: user });
        const extractSpecificSkillsLearningContent = learningPath.skills.map((skill) => {
            console.log(skill.chapters);
            return {
                name: skill.name,
                chapters: skill.chapters,
            }
        });
        console.log(extractSpecificSkillsLearningContent);
        const preassessmentData = await Preassessment.findOne({ user: user });
        if (!preassessmentData) {
            console.log("Preassessment not found");
            return;
        }

        console.log("Generating CouseContent from GenAI");
        for (const x of extractSpecificSkillsLearningContent) {
            console.log(`Generating Course Content for ${x.name}`);
            const response = await generateCourseContentFromAI(x.chapters, preassessmentData, x.name);
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

    } catch (e) {
        console.log(e);
    }
}

const fetchRelevantVideoId = async (query, description) => {
    const apiKey = process.env.YT_API_KEY;

    const params = {
        part: 'snippet',
        q: query + " " + description,
        maxResults: 1,
        type: 'video',
        key: apiKey
    };

    const searchApiUrl = `https://www.googleapis.com/youtube/v3/search?${new URLSearchParams(params).toString()}`;
    try {
        const searchResponse = await fetch(searchApiUrl);
        const searchData = await searchResponse.json();

        if (!searchData.items || searchData.items.length === 0) {
            console.log(`No video found for query: ${query}`);
            return null;
        }

        console.log(`Searching for relevant video for query: "${query}"`);

        let bestMatch = null;

        for (const item of searchData.items) {
            const videoTitle = item.snippet.title.toLowerCase();
            const videoDescription = item.snippet.description.toLowerCase();

            // Split the query and description into words
            const queryWords = query.toLowerCase().split(/\s+/);
            const descriptionWords = description.toLowerCase().split(/\s+/);

            // Check if any word from the query or description is present in the video title or description
            const isMatch = queryWords.some(word => videoTitle.includes(word) || videoDescription.includes(word)) ||
                descriptionWords.some(word => videoTitle.includes(word) || videoDescription.includes(word));

            if (isMatch) {
                console.log(`Found a relevant video: ${item.id.videoId} for query: "${query}"`);
                bestMatch = item.id.videoId;
                break; // Stop the loop once we find the first match
            }
        }

        if (bestMatch) {
            console.log(`Best match video ID: ${bestMatch}`);
        } else {
            console.log('No relevant videos found.');
        }

        return bestMatch;
    } catch (error) {
        console.error("Error fetching video data:", error);
        return null;
    }
};


const getARelevantYtVideoForCourseContent = async (user_id) => {
    try {
        console.log(`Fetching user with ID: ${user_id}`);
        const user = await User.findById(user_id);
        if (!user) {
            console.log(`User not found for ID: ${user_id}`);
            return;
        }

        console.log(`Fetching course content for user ID: ${user_id}`);
        const courseContents = await Course.find({ belongs_to: user_id }).populate('content');
        if (!courseContents || courseContents.length === 0) {
            console.log(`No course content found for user ID: ${user_id}`);
            return;
        }

        console.log(`Processing course topics for user ID: ${user_id}`);
        for (const course of courseContents) {
            for (const content of course.content) {
                const topic = content.title;
                const description = content.description;
                console.log(`Processing content: "${topic}"`);

                const videoId = await fetchRelevantVideoId(topic, description);

                if (!videoId) {
                    console.log(`No relevant video found for content: "${topic}"`);
                    continue;
                }

                content.videoId = videoId;
                await content.save();
                console.log(`Updated content "${topic}" with video ID: ${videoId}`);
            }
        }

        console.log(`Completed updating YouTube videos for user ID: ${user_id}`);
    } catch (e) {
        console.error(`Error processing YouTube videos for user ID: ${user_id}`, e);
    }
};



const workFlowContentGenFn = async (req, res) => {
    try {
        const userId = req.user._id; // Access req.user._id directly
        const doesUserExist = await User.findById(userId);
        if (!doesUserExist) {
            return res.status(404).send({ message: 'User not found' });
        }

        console.log(`Generating workFlow content for user: ${userId}`);

        // Sequential execution of the steps
        // await workFlowSkillsRecommended(userId);
        // await workFlowLearningPath(userId);
        // await workflowCreateAllQuizzes(userId);
        await workFlowGenerateLearningPathContent(userId);
        await getARelevantYtVideoForCourseContent(userId);

        // Update user status and save
        doesUserExist.contentGenerated = true;
        await doesUserExist.save();

        res.status(200).send({ message: 'WorkFlow content generated successfully' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).send({ message: 'Error while generating workFlow content' });
    }
};



module.exports = { workFlowContentGenFn, getARelevantYtVideoForCourseContent };
