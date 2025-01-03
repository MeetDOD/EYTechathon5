# Career Insight Backend API

This document provides a guide for all the API endpoints available in the Career Insight backend. It helps frontend developers understand which API route performs which action.

## Table of Contents

- [User Routes](#user-routes)
- [Preassessment Routes](#preassessment-routes)
- [User Course Routes](#user-course-routes)
- [Learning Path Routes](#learning-path-routes)
- [Assessment Routes](#assessment-routes)
- [User Resume Routes](#user-resume-routes)

## User Routes

1. **Register User**
   - **Endpoint:** `POST /api/user/register`
   - **Description:** Registers a new user.
   - **Request Body:**
     ```json
     {
       "name": "string",
       "email": "string",
       "password": "string"
     }
     ```

2. **Login User**
   - **Endpoint:** `POST /api/user/login`
   - **Description:** Logs in a user.
   - **Request Body:**
     ```json
     {
       "email": "string",
       "password": "string"
     }
     ```

3. **Update Profile**
   - **Endpoint:** `PUT /api/user/update-profile`
   - **Description:** Updates the user's profile.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/1)
   - **Request Body:**
     ```json
     {
       "name": "string",
       "email": "string",
       "password": "string"
     }
     ```

4. **Verify OTP**
   - **Endpoint:** `POST /api/user/verify-otp`
   - **Description:** Verifies the OTP for user registration.
   - **Request Body:**
     ```json
     {
       "email": "string",
       "otp": "string"
     }
     ```

5. **Get All Users**
   - **Endpoint:** `GET /api/user/getalluser`
   - **Description:** Retrieves all users.

6. **Get User by ID**
   - **Endpoint:** `GET /api/user/me`
   - **Description:** Retrieves the logged-in user's details.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/2)

7. **Add User Detail**
   - **Endpoint:** `POST /api/user/adduserdetail`
   - **Description:** Adds additional details to the user's profile.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/3)
   - **Request Body:**
     ```json
     {
       "dateofbirth": "string",
       "collegename": "string",
       "university": "string",
       "academicyear": "string",
       "address": "string",
       "techstack": ["string"]
     }
     ```

## Preassessment Routes

1. **Save Preassessment**
   - **Endpoint:** `POST /api/preassessment/save-pre-assessment`
   - **Description:** Saves the user's preassessment data.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/4)
   - **Request Body:**
     ```json
     {
       "userProfile": {
         "education_level": "string",
         "occupation": "string",
         "interested_field": "string",
         "career_goal": "string",
         "skills_experience": [
           { "skill": "string", "experience": "number" }
         ]
       },
       "communicationSkills": {
         "verbal": "string",
         "written": "string"
       },
       "openEndedQuestions": {
         "technical_skills": "string",
         "teamwork_skills": "string",
         "analytical_thinking": "string"
       },
       "miscellanous": {
         "prefer_collaborative_learning": "boolean",
         "prefer_reading": "boolean",
         "time_commitment": "number"
       }
     }
     ```

2. **Generate Preassessment Report**
   - **Endpoint:** `GET /api/preassessment/generate-report`
   - **Description:** Generates a detailed report based on the user's preassessment data.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/5)

3. **Get Career Path Recommendation**
   - **Endpoint:** `GET /api/preassessment/get-career-path`
   - **Description:** Provides career path recommendations based on the user's preassessment data.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/6)

4. **Get Career Choice Recommendation**
   - **Endpoint:** `GET /api/preassessment/get-career-choice`
   - **Description:** Provides career choice recommendations based on the user's preassessment data.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/7)

5. **Get User Preassessment Data**
   - **Endpoint:** `GET /api/preassessment`
   - **Description:** Retrieves the user's preassessment data.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/8)

6. **Get Skills to Focus On**
   - **Endpoint:** `GET /api/preassessment/skills-to-focus`
   - **Description:** Provides skills recommendations based on the user's preassessment data.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/9)

7. **Get Skill Learning Path**
   - **Endpoint:** `GET /api/preassessment/skill-learning-path`
   - **Description:** Provides a learning path for a specific skill based on the user's preassessment data.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/10)

## User Course Routes

1. **Publish Course**
   - **Endpoint:** `POST /api/usercourse/publishcourse`
   - **Description:** Publishes a new course.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/11)
   - **Request Body:**
     ```json
     {
       "thumbnail": "string",
       "courseName": "string",
       "category": "string",
       "courseLevel": "string",
       "duration": "string",
       "language": "string",
       "topic": "string",
       "description": "string",
       "chapters": [
         {
           "chapterName": "string",
           "aboutChapter": "string",
           "duration": "string"
         }
       ]
     }
     ```

2. **Get All Courses**
   - **Endpoint:** `GET /api/usercourse/getallcourses`
   - **Description:** Retrieves all courses.

3. **Get Course by ID**
   - **Endpoint:** `GET /api/usercourse/getcourse/:id`
   - **Description:** Retrieves a course by its ID.

4. **Enroll in Course**
   - **Endpoint:** `POST /api/usercourse/enroll`
   - **Description:** Enrolls the user in a course.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/12)
   - **Request Body:**
     ```json
     {
       "courseId": "string"
     }
     ```

5. **Get Enrolled Courses**
   - **Endpoint:** `GET /api/usercourse/mycourses`
   - **Description:** Retrieves the courses the user is enrolled in.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/13)

6. **Update Course Progress**
   - **Endpoint:** `PUT /api/usercourse/updateprogress`
   - **Description:** Updates the user's progress in a course.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/14)
   - **Request Body:**
     ```json
     {
       "courseId": "string",
       "progress": "number",
       "activeChapterIndex": "number"
     }
     ```

7. **Get Recommended Courses**
   - **Endpoint:** `GET /api/usercourse/recommendations`
   - **Description:** Retrieves recommended courses based on the user's tech stack.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/15)

## Learning Path Routes

1. **Get Learning Path**
   - **Endpoint:** `GET /api/learningpath`
   - **Description:** Retrieves the user's learning path.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/16)

2. **Get Respective Learning Path**
   - **Endpoint:** `GET /api/learningpath/:skill_id`
   - **Description:** Retrieves a specific learning path for a specific skill.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/17)

## Assessment Routes

1. **Create All Quizzes**
   - **Endpoint:** `POST /api/assessment/create-all-quizzes`
   - **Description:** Creates quizzes for all skills in the user's learning path.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/18)

2. **Get Assessment Details for a Particular Skill**
   - **Endpoint:** `GET /api/assessment/:skill_id`
   - **Description:** Retrieves assessment details for a specific skill.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/19)

## User Resume Routes

1. **Save Resume**
   - **Endpoint:** `POST /api/userresume/savemyresume`
   - **Description:** Saves the user's resume.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/20)
   - **Request Body:**
     ```json
     {
       "resumeData": "object"
     }
     ```

2. **Get All Resumes by User**
   - **Endpoint:** `GET /api/userresume/getalluserresume/:userId`
   - **Description:** Retrieves all resumes created by the user.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/21)

3. **Delete Resume**
   - **Endpoint:** `DELETE /api/userresume/deleteuserresume/:resumeId`
   - **Description:** Deletes a specific resume by its ID.
   - **Request Headers:** [Authorization: Bearer <token>](http://_vscodecontentref_/22)

4. **Get Resume by ID**
   - **Endpoint:** `GET /api/userresume/getuserresumebyid/:resumeId`
   - **Description:** Retrieves a specific resume by its ID.

## Contributing

We welcome contributions! Please read our Contributing Guidelines for more information.

## License

This project is licensed under the MIT License. See the LICENSE file for details.