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
            status: {
                type: String,
                enum: ['Not Started', 'In Progress', 'Completed'],
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
                    }
                }
            ]
        }
    ],
    
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;