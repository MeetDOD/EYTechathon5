const mongoose = require('mongoose');


const learningPathSchema = new mongoose.Schema({
    career_goal: {
        type: String,
        required: true
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    skills:[{
        name:{
            type: String,
            required: true
        },
        preassesment_skill_id:{
            type: String,
        },
        chapters:[{
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }],
        exercises: [{
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }],
        projects: [{
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }],
        resources: [{
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            }
        }],
        assessment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Assessment'
        }
    }]

});

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

module.exports = LearningPath;