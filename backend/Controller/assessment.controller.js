const Assessment = require('../Models/assessment.model');
const { User } = require('../Models/user.model');
const LearningPath = require('../Models/learningpath.model');
const { generateRespectiveSkillAssessmentFromAI } = require('./ai.controller');

const createAllQuizzes = async (req, res) => {
    try {
        // Validate user existence
        const user = await User.findById(req.user._id);
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

        return res.status(200).json({ message: 'Quizzes created successfully', data: newAssessment });
    } catch (error) {
        console.error('Error creating quizzes:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const getAssessmentDetailsForAParticularSkill = async (req, res) => {
    try {
        const { skill_id } = req.params;


        // Validate user existence
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const assessment = await Assessment.findOne({ user: req.user._id });
        if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

        const skill = assessment.skillsToDevelop.find(skill => skill.preassessment_skill_id === skill_id);
        if (!skill) return res.status(404).json({ message: 'Skill not found' });

        return res.status(200).json({ message: 'Skill assessment details retrieved successfully', data: skill });
    } catch (error) {
        console.error('Error getting assessment for a particular skill:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const scoreAssessment = async (req, res) => {
    try {
        const { assessmentId } = req.params;
        const { answers } = req.body;
        const userAnswers = Object.values(answers.answers); 
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const assessment = await Assessment.findOne({ user: userId });
        if (!assessment) {
            return res.status(404).json({ message: 'Assessment not found' });
        }

        const skill = assessment.skillsToDevelop.find(
            (skill) => skill.preassessment_skill_id.toString() === assessmentId
        );
        if (!skill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        const COIN_REWARD = 5; 
        let score = 0;
        let wrongAnswers = []; 

        skill.questions = skill.questions.map((question, index) => {
            const userAnswer = userAnswers[index];
            const wasAnsweredCorrectly = userAnswer && question.correctAnswer === userAnswer;

            if (wasAnsweredCorrectly) {
                score++; 
            } else {
                // Record wrong answers
                wrongAnswers.push({
                    questionId: question._id,
                    questionText: question.question,
                    userAnswer: userAnswer || null, 
                    correctAnswer: question.correctAnswer,
                });
            }

            return {
                ...question.toObject(),
                wasAnsweredCorrectly,
            };
        });

        const previousStatus = skill.status;
        skill.status = score < 5 ? 'Failed' : 'Completed';
        skill.score = score;

        const totalCoinsEarned = score * COIN_REWARD;

        if (previousStatus !== 'Completed' && skill.status === 'Completed') {
            user.coins += totalCoinsEarned;
        }

        await assessment.save();
        await user.save();

        return res.status(200).json({
            message: 'Assessment scored successfully',
            data: {
                score,
                coinsEarned: skill.status === 'Completed' && previousStatus !== 'Completed' ? totalCoinsEarned : 0,
                wrongAnswers, 
            },
        });
    } catch (error) {
        console.error('Error scoring assessment:', {
            userId: req.user._id,
            assessmentId: req.params.assessmentId,
            error: error.message,
        });
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message,
        });
    }
};



module.exports = {
    createAllQuizzes,
    getAssessmentDetailsForAParticularSkill,
    scoreAssessment,
};
