const mongoose = require('mongoose');

const preassessmentSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    user_profile:{
        education_level:{
            type: String,
            required: true
        },
        occupation:{
            type: String,
            required: true
        },
        interested_field:{
            type: String,
            required: true
        },
        career_goal:{
            type: String,
            required: true
        },
        skills_experience:[
            {
                skill:{
                    type: String,
                    required: true
                },
                experience:{
                    type: Number,
                    required: true
                }
            }
        ]
    },

    communication_skills:{
        verbal:{
            type: String,
            required: true
        },
        written:{
            type: String,
            required: true
        },
    },

    open_ended_questions: {
        technical_skills:{
            type: Number
        },
        teamwork_skills:{
            type: Number
        },
        analytical_thinking:{
            type: Number
        },
    },

    miscellanous:{
        prefer_collaborative_learning:{
            type: Boolean,
            required: true
        },
        prefer_reading:{
            type: Boolean,
            required: true
        },
        time_commitment:{
            type: Number,
            required: true
        },
    }
}, {timestamps: true});

preassessmentSchema.pre('save', function(next){
    //Will Do some AI stuff here
    next();
});

const Preassessment = mongoose.model('Preassessment', preassessmentSchema);

module.exports = { Preassessment };