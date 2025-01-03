const LearningPath = require("../Models/learningpath.model");
const { User } = require("../Models/user.model");

const getLearningPath = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const learningP = await LearningPath.findOne({ user: req.user._id });
        const assessment_skills = await Assessment.findOne({ user: req.user._id });
        if (!assessment_skills) return res.status(404).json({ message: "Assessment not found" });

        

        if (!learningP) return res.status(404).json({ message: "Learning Path not found" });
        if (!LearningPath) return res.status(404).json({ message: "Learning Path not found" });

        res.status(200).json({
            message: "Learning Path found",
            data: learningP
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getRespectiveLearningPath = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });


        const learningPathId = req.params.learningPathId;
        if (!learningPathId) return res.status(400).json({ message: "Learning Path Id is required" });

        const learningP = await LearningPath.findOne({ user: req.user._id});
        if (!learningP) return res.status(404).json({ message: "Learning Path not found" });

        let data = {};
        for(const x of learningP.skills){
            if(x.preassesment_skill_id=== learningPathId){
                data = x;
            }
        }

        if (!data) return res.status(404).json({ message: "Learning Path not found" });

        res.status(200).json({
            message: "Learning Path found",
            data: data
        });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getLearningPath, getRespectiveLearningPath };