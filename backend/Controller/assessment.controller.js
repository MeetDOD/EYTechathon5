const Assessment = require('../Models/assessment.model');
const { User } = require('../Models/user.model');
const { Preassessment } = require('../Models/preassessment.model');
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
            skill_id: skill._id,
            exercises: skill.exercises,
        }));

        // Generate quizzes for all skills concurrently
        const quizzes = await Promise.all(
            skills.map(async skill => {
                const quiz = await generateRespectiveSkillAssessmentFromAI(skill.skill_name, skill.exercises);
                console.log(`Quiz for ${skill.skill_name} created successfully`);
                return { skill: skill.skill_name, questions: quiz.questions };
            })
        );

        // Create the assessment document
        const newAssessment = await Assessment.create({
            user: req.user._id,
            skillsToDevelop: quizzes,
        });

        const learnignPath = await LearningPath.findOne({user: req.user._id});
        if(!learnignPath) return res.status(404).json({message: 'Learning Path not found'});
        learnignPath.skills.forEach((skill) => {
            if(skill.name === skillName){
                skill.assessment = newAssessment._id;
            }
        });
        await learnignPath.save();

        return res.status(200).json({ message: 'Quizzes created successfully', data: newAssessment });
    } catch (error) {
        console.error('Error creating quizzes:', error);
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};


const getAssessmentDetailsForAParticularSkill = async (req, res) => {
    try{

        const {skill_id} = req.params;
        const user = await User.findById(req.user._id);
        if(!user) return res.status(404).json({message: 'User not found'});
        const assessment = await Assessment.findOne({user: req.user._id});
        if(!assessment) return res.status(404).json({message: 'Assessment not found'});
        const skill = assessment.skillsToDevelop.find(skill => skill.skill_id === skill_id);
        if(!skill) return res.status(404).json({message: 'Skill not found'});
      
        return res.status(200).json({message: 'Skill found', data: skill});

    }catch(error){
        console.error('Error getting assessment for a particular skill:', error);
        return res.status(500).json({message: 'Internal server error', error: error.message});
    }
};



module.exports = {
    createAllQuizzes,
};
