const mongoose = require('mongoose');


const ContentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    videoId: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: true,
    },
    detailed_content: {
        type: String,
        required: false,
    },
    objectives: [String],
    real_world_examples: [String],
    learning_outcomes: [String],
    key_points: [String],
    duration: {
        type: String,
        required: false,
    },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
});

const CourseSchema = new mongoose.Schema({
    thumbnail:{
        type: String,
        required: false,
    },
    is_completed: {
        type: Boolean,
        default: false,
        required: false,
    },
    courseName: { type: String, required: true },
    category: {
        type: String,
        required: true,
    },
    courseLevel: {
        type: String,
        required: true,
    },
    for_skill: {
        type: String,
        required: true,
    },
    duration: {
        type: String,
        required: false,
    },
    language: {
        type: String,
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    content: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
    }],
    belongs_to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    progress: {
        type: Number,
        default: 0,
        required: false,
    },
    activeChapterIndex: {
        type: Number,
        default: 0,
        required: false,
    },
},{timestamps:true});

const Course = mongoose.model('Course', CourseSchema);
const Content = mongoose.model('Content', ContentSchema);

module.exports = { Course, Content };

