import React, { useEffect, useState } from 'react';
import Profile from './Profile';
import AppSidebar from './AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb"
import { Separator } from '@/components/ui/separator';
import axios from 'axios';
import { chatSession } from '@/services/GeminiModel';
import { Button } from '@/components/ui/button';
import { ImSpinner2 } from 'react-icons/im';
import { useNavigate } from 'react-router-dom';
import { reportState } from '@/store/userReportState';
import { useSetRecoilState } from 'recoil';

const Dashboard = () => {

    const [getpreassessment, setgetpreassessment] = useState();
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState();
    const setReport = useSetRecoilState(reportState);
    const navigate = useNavigate();

    useEffect(() => {
        const getPreassessment = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/preassessment`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                )
                setgetpreassessment(response.data.preassessment);
            } catch (error) {
                console.log(error);
            }
        };

        getPreassessment();
    }, []);

    const handleSubmit = async () => {
        setLoading(true);

        if (!getpreassessment) {
            console.error("Pre-assessment data is missing.");
            setLoading(false);
            return;
        }

        const prompt = `
    Using the provided pre-assessment data, generate a detailed user report that ensures every field is comprehensively filled. The report must:

    1. **Provide an Overall Summary**:
        - Summarize the user's profile, including education (${getpreassessment.user_profile.education_level}) and career goals (${getpreassessment.user_profile.career_goal}).
        - Highlight strengths and areas for improvement (${getpreassessment.user_profile.strengths}, ${getpreassessment.user_profile.areas_for_improvement}).
        - Include an inspiring motivational message to encourage user growth.

    2. **Detail Skill Summary**:
        - For each skill in "skills_experience" (${getpreassessment.user_profile.skills_experience.map(skill => skill.skill).join(', ')}), provide:
            - Expertise level and description.
            - Targeted recommendations for improvement and further development.

    3. **Summarize Open-Ended Questions**:
        - Analyze open-ended question responses (${getpreassessment.open_ended_questions.technical_skills}) by:
            - Summarizing expertise.
            - Providing actionable recommendations.
            - Including a numerical score for data visualization.

        4. **Communication Skills**:
        - Evaluate "verbal" (${getpreassessment.communication_skills.verbal}) and "written" (${getpreassessment.communication_skills.written}) communication levels.
        - Offer specific strategies to improve these skills, including practical activities or resources.

    5. **Review Additional Parameters**:
        - Analyze teamwork (${getpreassessment.open_ended_questions.teamwork_skills}) and analytical thinking (${getpreassessment.open_ended_questions.analytical_thinking}).
        - Suggest strategies for improvement.
        - Highlight learning preferences (${getpreassessment.miscellanous.prefer_collaborative_learning ? 'collaborative learning' : 'individual learning'}, ${getpreassessment.miscellanous.prefer_reading ? 'reading' : 'hands-on learning'}) and provide tailored advice.

    6. **Evaluate Time Commitment**:
        - Assess the user's available time (${getpreassessment.miscellanous.time_commitment} hours per week).

    7. **Offer Suggestions to the User**:
        - Create a motivational message emphasizing the user's potential and actionable steps to achieve growth.
        - Ensure the tone is encouraging, confidence-building, and clear.

    **Output Format**:
    The response must be in **valid JSON** format with the following structure:
    {
        "user_summary": {
            "overall_profile": "string",
            "strengths": "string",
            "areas_for_improvement": "string",
            "motivational_message": "string"
        },
        "skill_summary": {
            "skills": [
                {
                    "skill": "string",
                    "expertise": "string",
                    "recommendations": "string"
                }
            ]
        },
        "open_ended_questions": {
            "questions": [
                {
                    "question": "string",
                    "summary": "string",
                    "recommendations": "string",
                    "score": "number"
                }
            ]
        },
        "communication_skills": {
        "verbal": {
            "strategies": "string"
        },
        "written": {
            "strategies": "string"
        }   
        },
        "other_parameters": {
            "teamwork_skills": "string",
            "analytical_thinking": "string",
            "preferences": {
                "collaborative_learning": "string",
                "reading": "string"
            }
        },
        "time_commitment": {
            "available_time": "string",
            "strategies": "string",
            "study_schedule": "string"
        },
        "suggestions_to_user": "string"
    }

    Ensure no field is left blank and all placeholders are filled with data from the provided pre-assessment input. If data is missing or incomplete, infer plausible information to ensure consistency and completeness in the report.

    Pre-assessment data:
    ${JSON.stringify(getpreassessment, null, 2)}
`;
        try {
            const result = await chatSession.sendMessage(prompt);
            const data = await result.response.text();
            const cleanedData = data.replace(/```json|```/g, '');
            const parsedResponse = JSON.parse(cleanedData);

            setResponse(parsedResponse);
            setReport(parsedResponse);
            navigate("/userreport");
        } catch (error) {
            console.error("Error generating report: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset style={{ backgroundColor: `var(--background-color)` }}>
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb >
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block font-semibold">
                                Dashboard
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold" style={{ color: `var(--text-color)` }}>My Profile</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 my-5">
                    <Button disabled={loading} onClick={handleSubmit} size="xl" className="text-lg font-semibold flex-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600 hover:from-teal-500 hover:via-cyan-600 hover:to-purple-700 text-white rounded-xl p-4 shadow-md text-center cursor-pointer">
                        {loading ? (
                            <div className='flex flex-row gap-2 items-center animate-pulse'>
                                <ImSpinner2 className='animate-spin' /> Generating your report...
                            </div>
                        ) : 'Generate your report'}
                    </Button>
                    <div className="flex-1 bg-gradient-to-r from-green-400 via-blue-500 to-indigo-500 hover:from-green-500 hover:via-blue-600 hover:to-indigo-600 text-white rounded-xl p-4 shadow-md text-center cursor-pointer">
                        <span className="text-lg font-semibold">Generate your learning path</span>
                    </div>
                </div>
                <Profile />
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Dashboard;
