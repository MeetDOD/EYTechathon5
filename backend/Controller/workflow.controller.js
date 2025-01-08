const { User } = require("../Models/user.model");
const { createAllQuizzes } = require("./assessment.controller");
const { generateLearningPathContent } = require("./learningpath.controller");
const { generatePreAssessmentReport, getRespectiveSkillLearningPath } = require("./preassessment.controller");

const workFlowContentGenFn = async (req, res) => {
    try {
        const user = await req.user._id;
        const doesUserExist = await User.findById(user);
        if (!doesUserExist) {
            return res.status(404).send({ message: 'User not found' });
        }
        await generatePreAssessmentReport(req, res);
        await getRespectiveSkillLearningPath(req, res);
        await createAllQuizzes(req, res);
        await generateLearningPathContent(req, res);

        user.contentGenerated = true;
        await user.save();


        res.status(200).send({ message: 'WorkFlow content generated successfully' });
    } catch (error) {
        res.status(500).send({ message: 'Error while generating workFlow content' });
    }
};

module.exports = {  workFlowContentGenFn };