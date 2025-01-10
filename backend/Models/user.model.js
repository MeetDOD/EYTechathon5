const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    password: {
        type: String,
        min: 8,
        required: true
    },
    otp: {
        type: Number
    },
    dateofbirth: {
        type: Date,
    },
    gender: {
        type: String,
    },
    photo: {
        type: String
    },
    phoneno: {
        type: Number
    },
    address: {
        type: String
    },
    techstack: {
        type: [String]
    },
    collegename: {
        type: String
    },
    university: {
        type: String
    },
    academicyear: {
        type: Number
    },

    userType: {
        type: String,
        default: "student"
    },
    contentGenerated: {
        type: Boolean,
        default: false
    },
    enrolledCourses: [
        {
            course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            enrolledAt: { type: Date, default: Date.now },
            progress: { type: Number, default: 0 }    ,
            activeChapterIndex: { type: Number, default: 0 }    
        }
    ],
    coursesProgress: [
        {
            course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
            progress: { type: Number, default: 0 },
            activeChapterIndex: { type: Number, default: 0 }
        }
    ],
    hasGivenPreAssessment: {
        type: Boolean,
        default: false
    },
},
    { timestamps: true });

const User = mongoose.model("user", userSchema);

module.exports = { User };
