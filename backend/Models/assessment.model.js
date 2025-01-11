const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    skillsToDevelop: [
        {
            skill: {
                type: String,
            },
            preassessment_skill_id:{
                type: String,
            },
            status: {
                type: String,
                enum: ['Failed', 'Not Started', 'In Progress', 'Completed'],
                default: 'Not Started'
            },
            completionPercentage: {
                type: Number,
                default: 0
            },
            score: {
                type: Number,
                default: 0
            },
            questions: [
                {
                    question: {
                        type: String,
                        required: true
                    },
                    options: [{
                        type: String,
                        required: true
                    }],
                    correctAnswer: {
                        type: String,
                        required: true
                    },
                    wasAnswerdPreviousCorrectly: {
                        type: Boolean,
                        default: false
                    },

                }
            ]
        }
    ],
    
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;