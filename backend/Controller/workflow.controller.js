const Assessment = require("../Models/assessment.model");
const LearningPath = require("../Models/learningpath.model");
const { Preassessment } = require("../Models/preassessment.model");
const { User } = require("../Models/user.model");
const { Course, Content } = require("../Models/usercourse.model");
const { fetchRelevantImage } = require("../utils/thumbnailGenerator");
const { generateRespectiveSkillAssessmentFromAI, getRespectiveSkillLearningPathFromAI, generateCourseContentFromAI, getSkillsWhichUserShouldFocusOn, generateDetailContentForCourseFromAI } = require("./ai.controller");
require("dotenv").config();


const addRandomDurationToCourseContent = async () => {
    try{
        const contents = await Content.find();
        for(const content of contents){
            content.duration = Math.floor(Math.random() * 41) + 10;
            await content.save();
        }
    }catch(error){
        console.log(error);
    }
};

const courseDuration = async () => {
    try{
        const course = await Course.find().populate("content");
        console.log(course.length);
        for(const x of course){
            let duration = 0;
            for(const y of x.content){
                duration += parseInt(y.duration);
            }
            x.duration = duration.toString();
            await x.save();
        }
    }catch(error){
        console.log(error);
    }
}

const workFlowSkillsRecommended = async (user_id, io) => {
    try {
        const user = await User.findById(user_id);
        if (!user) {
            return io.to(user_id).emit('log', "User not found");
        }
        const preassessment = await Preassessment.findOne({ user: user_id });
        if (!preassessment) {
            return io.to(user_id).emit('log', "Preassessment not found");
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

        io.to(user_id).emit('log', "Skills recommendation generated successfully:" + JSON.stringify(allSkills));
    } catch (error) {
        io.to(user_id).emit('log', "Error generating skills recommendation: " + error.message);
    }
}

const workFlowLearningPath = async (user_id, io) => {
    try {
        const preassessment = await Preassessment.findOne({ user: user_id });
        if (!preassessment) {
            io.to(user_id).emit('log', "Preassessment not found");
            return;
        }
        io.to(user_id).emit('log', "Generating learning path for user: " + preassessment.user_profile.career_goal);

        const skillsToFocus = preassessment.feedback.for_career_goal.skills_to_focus.map((skill) => {
            return {
                skill: skill.skill,
                _id: skill._id
            }
        });

        io.to(user_id).emit('log', "Skills to focus on:" + JSON.stringify(skillsToFocus));

        const skillBasedLearningPath = [];

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

                io.to(user_id).emit('log', `Learning path generated for skill: ${skill.skill}`);
            } catch (aiError) {
                io.to(user_id).emit('log', `Error fetching learning path for skill: ${skill.skill} - ${aiError.message}`);
            }
        }

        io.to(user_id).emit('log', "First item in skillBasedLearningPath: " + JSON.stringify(skillBasedLearningPath[0]));

        const learningPath = await LearningPath.create({
            career_goal: preassessment.user_profile.career_goal,
            user: user_id,
            skills: skillBasedLearningPath,
        });

        io.to(user_id).emit('log', "Learning path saved successfully: " + learningPath._id);
    } catch (error) {
        io.to(user_id).emit('log', "Error generating learning path: " + error.message);
    }
}

const workflowCreateAllQuizzes = async (user_id, io) => {
    try {
        const user = await User.findById(user_id);
        if (!user) {
            io.to(user_id).emit('log', "User not found");
            return;
        }

        const learningPath = await LearningPath.findOne({ user: user_id });
        if (!learningPath) {
            io.to(user_id).emit('log', "Learning path not found");
            return;
        }

        const skills = learningPath.skills.map(skill => ({
            skill_name: skill.name,
            skill_id: skill.preassesment_skill_id,
            exercises: skill.exercises,
        }));

        const quizzes = await Promise.all(
            skills.map(async skill => {
                const quiz = await generateRespectiveSkillAssessmentFromAI(skill.skill_name, skill.exercises);
                io.to(user_id).emit('log', `Quiz for ${skill.skill_name} created successfully`);
                return {
                    skill: skill.skill_name,
                    questions: quiz.questions,
                    preassessment_skill_id: skill.skill_id,
                };
            })
        );

        const newAssessment = await Assessment.create({
            user: user_id,
            skillsToDevelop: quizzes,
        });

        learningPath.skills.forEach(skill => {
            const quiz = quizzes.find(q => q.skill === skill.name);
            if (quiz) {
                skill.assessment = newAssessment._id;
            }
        });

        await learningPath.save();
        io.to(user_id).emit('log', "Quizzes created and saved successfully");
    } catch (error) {
        io.to(user_id).emit('log', "Error creating quizzes: " + error.message);
    }
}

const workFlowGenerateLearningPathContent = async (user_id, io) => {
    try {
        const user = user_id;
        const doesUserExists = await User.findById(user);
        if (!doesUserExists) {
            io.to(user_id).emit('log', "User not found");
            return;
        }
        const learningPath = await LearningPath.findOne({ user: user });
        const extractSpecificSkillsLearningContent = learningPath.skills.map((skill) => {
            io.to(user_id).emit('log', `Processing chapters for skill: ${skill.name}`);
            return {
                name: skill.name,
                skillId: skill.preassesment_skill_id,
                chapters: skill.chapters,
            }
        });

        const preassessmentData = await Preassessment.findOne({ user: user });
        if (!preassessmentData) {
            io.to(user_id).emit('log', "Preassessment not found");
            return;
        }

        io.to(user_id).emit('log', "Generating CouseContent from GenAI");
        for (const x of extractSpecificSkillsLearningContent) {
            io.to(user_id).emit('log', `Generating Course Content for ${x.name}`);
            const response = await generateCourseContentFromAI(x.chapters, preassessmentData, x.name);
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
            io.to(user_id).emit('log', `Course Content Generated for ${x.name}`);
        }
    } catch (error) {
        io.to(user_id).emit('log', "Error generating learning path content: " + error.message);
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

            const queryWords = query.toLowerCase().split(/\s+/);
            const descriptionWords = description.toLowerCase().split(/\s+/);

            const isMatch = queryWords.some(word => videoTitle.includes(word) || videoDescription.includes(word)) ||
                descriptionWords.some(word => videoTitle.includes(word) || videoDescription.includes(word));

            if (isMatch) {
                console.log(`Found a relevant video: ${item.id.videoId} for query: "${query}"`);
                bestMatch = item.id.videoId;
                break;
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

const getARelevantYtVideoForCourseContent = async (user_id, io) => {
    try {
        io.to(user_id).emit('log', `Fetching user with ID: ${user_id}`);
        const user = await User.findById(user_id);
        if (!user) {
            io.to(user_id).emit('log', `User not found for ID: ${user_id}`);
            return;
        }

        io.to(user_id).emit('log', `Fetching course content for user ID: ${user_id}`);
        const courseContents = await Course.find({ belongs_to: user_id }).populate('content');
        if (!courseContents || courseContents.length === 0) {
            io.to(user_id).emit('log', `No course content found for user ID: ${user_id}`);
            return;
        }

        io.to(user_id).emit('log', `Processing course topics for user ID: ${user_id}`);
        for (const course of courseContents) {
            for (const content of course.content) {
                const topic = content.title;
                const description = content.description;
                io.to(user_id).emit('log', `Processing content: "${topic}"`);

                const videoId = await fetchRelevantVideoId(topic, description);

                if (!videoId) {
                    io.to(user_id).emit('log', `No relevant video found for content: "${topic}"`);
                    continue;
                }

                content.videoId = videoId;
                await content.save();
                io.to(user_id).emit('log', `Updated content "${topic}" with video ID: ${videoId}`);
            }
        }

        io.to(user_id).emit('log', `Completed updating YouTube videos for user ID: ${user_id}`);
    } catch (error) {
        io.to(user_id).emit('log', `Error processing YouTube videos for user ID: ${user_id} - ${error.message}`);
    }
};

const alertGenFn = async (req, res) => {
    try{
        const io = req.app.get('socketio');
       io.to(req.user._id).emit('generationComplete', 'Content generation completed successfully');
    }catch(error){
        console.error('Error handling request:', error);
    }
};

const workFlowContentGenFn = async (req, res) => {
    try {
        const io = req.app.get('socketio');
        const userId = req.user._id;
        const doesUserExist = await User.findById(userId);
        if (!doesUserExist) {
            io.to(userId).emit('log', 'User not found');
            return res.status(404).send({ message: 'User not found' });
        }

        io.to(userId).emit('log', `Generating workFlow content for user: ${userId}`);

        await workFlowSkillsRecommended(userId, io);
        await workFlowLearningPath(userId, io);
        await workflowCreateAllQuizzes(userId, io);
        await workFlowGenerateLearningPathContent(userId, io);
        await getARelevantYtVideoForCourseContent(userId, io);
        await generateDetailContentForCourseFromAI(userId);
        await addRandomDurationToCourseContent();
        await courseDuration();
        doesUserExist.contentGenerated = true;
        await doesUserExist.save();

        io.to(userId).emit('log', 'WorkFlow content generated successfully');
        res.status(200).send({ message: 'WorkFlow content generated successfully' });
    } catch (error) {
        const io = req.app.get('socketio');
        io.to(req.user._id).emit('log', 'Error while generating workFlow content: ' + error.message);
        res.status(500).send({ message: 'Error while generating workFlow content' });
    }
};

module.exports = { workFlowContentGenFn, alertGenFn,getARelevantYtVideoForCourseContent };