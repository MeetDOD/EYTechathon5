const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const connectToDB = require('./Config/db');
const cookieParser = require('cookie-parser');
const userRoute = require('./Routes/user.route');
const courseRoutes = require('./Routes/courses.route');
const resumeRoutes = require('./Routes/userresume.route');
const preassessmentRoutes = require('./Routes/preassessment.route');
const learningpathRoutes = require('./Routes/learningpath.route');
const assessmentRoutes = require('./Routes/assessment.route');
const usercourseRoutes = require('./Routes/usercourse.route');
const workflowRoutes = require('./Routes/workflow.route');
const { Server } = require("socket.io");
const fileUpload = require('express-fileupload');
const { cloudnairyconnect } = require("./Config/cloudinary");
const { addChaptersInDepthExplanation } = require('./Controller/learningpath.controller');
const { Content, Course } = require('./Models/usercourse.model');
require('dotenv').config();

const port = process.env.PORT || 4000;

const ZOOM_CLIENT_ID = process.env.ZOOM_CLIENT_ID;
const ZOOM_CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET;
const ZOOM_REDIRECT_URI = 'http://localhost:4000/api/zoom/callback';

app.use(cors({ origin: "*" }));
app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(fileUpload({ useTempFiles: true }));

app.use("/api/user", userRoute);
app.use("/api/courses", courseRoutes);
app.use("/api/userresume", resumeRoutes);
app.use("/api/usercourse", usercourseRoutes);
app.use("/api/preassessment", preassessmentRoutes);
app.use("/api/learningpath", learningpathRoutes);
app.use("/api/assessment", assessmentRoutes);
app.use("/api/workflow", workflowRoutes);

const startServer = async () => {
    await connectToDB();
    cloudnairyconnect();
    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });

    const io = new Server(server, {
        cors: {
            origin: "*",
        }
    });

    io.on('connection', (socket) => {
        console.log('a user connected', socket.id);

        // Join room based on user ID
        socket.on('joinRoom', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room`);
        });

        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });

    

    // Attach `io` to app for global access
    app.set('socketio', io);
}



startServer();

module.exports = app;