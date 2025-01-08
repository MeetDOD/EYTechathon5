const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const connectToDB = require('./Config/db')
const cookieParser = require('cookie-parser');
const userRoute = require('./Routes/user.route');
const courseRoutes = require('./Routes/courses.route');
const resumeRoutes = require('./Routes/userresume.route');
const preassessmentRoutes = require('./Routes/preassessment.route');
const learningpathRoutes = require('./Routes/learningpath.route');
const assessmentRoutes = require('./Routes/assessment.route');
const fileUpload = require('express-fileupload');
// const googlemeetroute = require('./Routes/googlemeetauth.route');
const { cloudnairyconnect } = require("./Config/cloudinary");
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
// app.use(fileUpload());
app.use(fileUpload({ useTempFiles: true }))


app.use("/api/user", userRoute);
app.use("/api/courses", courseRoutes);
app.use("/api/userresume", resumeRoutes);
app.use("/api/preassessment", preassessmentRoutes);
app.use("/api/learningpath", learningpathRoutes);
app.use("/api/assessment", assessmentRoutes);

const startServer = async () => {
    await connectToDB();
    cloudnairyconnect();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
}

startServer();


