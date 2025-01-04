import React, { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { FaDownload, FaHome, FaFileAlt, FaQuestionCircle, FaLightbulb, FaComments, FaTasks, FaPlusCircle, FaClock } from 'react-icons/fa';
import { userState } from '@/store/auth';
import { reportState } from '@/store/userReportState';
import { Button } from '@/components/ui/button';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

const UserReport = () => {
    const user = useRecoilValue(userState);
    const report = useRecoilValue(reportState);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            window.scrollTo(0, 0);
            document.title = `CAREERINSIGHT | ${user?.fullName?.toUpperCase()}'s AI REPORT`;
        }
    }, [user]);

    const handleDownload = () => {
        const resume = document.getElementById('my-report');

        html2pdf().from(resume).set({
            margin: 1,
            filename: 'My_Report.pdf',
            html2canvas: { scale: 2 },
            jsPDF: { format: 'a4', orientation: 'portrait' }
        }).save();

        toast.success("Resume downloaded successfully")
    };

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <FaFileAlt className="text-gray-400 text-6xl mb-4" />
                <h2 className="text-3xl font-bold text-gray-700">No Report Data Available</h2>
                <p className="mt-2 text-xl text-gray-500">Please generate the report first.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between mb-5">
                <div className='flex flex-row gap-2'>
                    <Button
                        onClick={() => navigate("/dashboard")}
                        size="sm"
                        className="flex gap-1"

                    >
                        <IoMdArrowRoundBack size={20} />
                        Back
                    </Button>
                    <Button onClick={() => navigate("/dashboard")} size="sm" className="flex gap-2">
                        <FaHome size={20} />
                    </Button>
                </div>
                <div className='flex flex-row gap-2'>
                    <Button onClick={handleDownload} size="sm" className="flex gap-2">
                        <FaDownload size={20} />
                        Download
                    </Button>
                </div>
            </div>
            <div id="my-report" className="min-h-screen shadow-lg border rounded-xl" style={{ borderColor: `var(--borderColor)` }}>
                <header className="bg-gradient-to-r from-violet-500 via-purple-700 to-indigo-900 text-white py-14 rounded-t-xl">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold flex items-center justify-center gap-2">
                            {user?.fullName}'s AI Report
                        </h1>
                        <p className="mt-2 font-medium text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl tracking-tight">
                            Tailored insights and recommendations for your career growth
                        </p>
                    </div>
                </header>
                <main className="container mx-auto px-4 py-8">
                    <section className="mb-10">
                        <h2 className="text-3xl font-semibold flex items-center gap-2">
                            <FaLightbulb className="text-primary" /> Overall Summary
                        </h2>
                        <div className="p-6">
                            <div className="bg-purple-100 border-l-4 border-primary p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-primary flex gap-1 items-center">
                                    Overall Profile
                                </h2>
                                <p className="text-primary">{report.user_summary.overall_profile}</p>
                            </div>
                            <div className="mt-6 bg-green-100 border-l-4 border-green-500 p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-green-700 flex gap-1 items-center">
                                    Strengths
                                </h2>
                                <p className="text-green-800">{report.user_summary.strengths}</p>
                            </div>
                            <div className="mt-6 bg-red-100 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-red-700 flex gap-1 items-center">
                                    Areas for Improvement
                                </h2>
                                <p className="text-red-800">{report.user_summary.areas_for_improvement}</p>
                            </div>
                            <div className="mt-6 bg-blue-100 border-l-4 border-blue-500 p-6 rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold text-blue-700 flex gap-1 items-center">
                                    Message for you
                                </h2>
                                <p className="text-blue-800">{report.user_summary.motivational_message}</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-3xl font-semibold flex items-center gap-2">
                            <FaTasks className="text-primary" /> Skill Summary
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {report.skill_summary.skills.map((details, index) => (
                                <div
                                    key={index}
                                    style={{ borderColor: `var(--borderColor)` }}
                                    className="border rounded-lg shadow-md p-6"
                                >
                                    <h3 className="text-xl font-semibold text-primary">{details.skill}</h3>
                                    <p className="mt-2">
                                        <strong>Expertise:</strong> {details.expertise}
                                    </p>
                                    <p className="mt-2">
                                        <strong>Recommendations:</strong> {details.recommendations}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </section>

                    <section className="mb-10">
                        <h2 className="text-3xl font-semibold flex items-center gap-2">
                            <FaQuestionCircle className="text-primary" />Open Ended Questions Summary
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {report.open_ended_questions.questions.map((details, index) => (
                                <div
                                    key={index}
                                    style={{ borderColor: `var(--borderColor)` }}
                                    className="border rounded-lg shadow-md p-6"
                                >
                                    <h3 className="text-xl font-semibold text-primary">{details.question}</h3>
                                    <p className="mt-2">
                                        <strong>Expertise:</strong> {details.summary}
                                    </p>
                                    <p className="mt-2">
                                        <strong>Recommendations:</strong> {details.recommendations}
                                    </p>
                                </div>
                            ))}
                        </div>

                    </section>

                    <section className="mb-10">
                        <h2 className="text-3xl font-semibold flex items-center gap-2">
                            <FaComments className="text-primary" /> Communication Skills
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6">
                            <div className="border rounded-lg shadow-md p-6" style={{ borderColor: `var(--borderColor)` }}>
                                <h3 className="text-xl font-semibold text-primary">Verbal</h3>
                                <p className="mt-2">{report.communication_skills.verbal.strategies}</p>
                            </div>
                            <div className="border rounded-lg shadow-md p-6" style={{ borderColor: `var(--borderColor)` }}>
                                <h3 className="text-xl font-semibold text-primary">Written</h3>
                                <p className="mt-2">{report.communication_skills.written.strategies}</p>
                            </div>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-3xl font-semibold flex items-center gap-2 mb-4">
                            <FaPlusCircle className="text-primary" /> Additional Parameters
                        </h2>
                        <div className="border rounded-lg shadow-md p-6 mx-6 mt-7" style={{ borderColor: `var(--borderColor)` }}>
                            <h3 className="text-xl font-semibold text-primary">Teamwork Skills</h3>
                            <p className="">{report.other_parameters.teamwork_skills}</p>
                            <h3 className="text-xl font-semibold text-primary mt-4">Analytical Thinking</h3>
                            <p className="">{report.other_parameters.analytical_thinking}</p>
                            <h3 className="text-xl font-semibold text-primary mt-4">Learning Preferences</h3>
                            <p className="">{report.other_parameters.preferences.collaborative_learning} <br />{report.other_parameters.preferences.reading}.</p>
                        </div>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-3xl font-semibold flex items-center gap-2 mb-4">
                            <FaClock className="text-primary" /> Time Commitment
                        </h2>
                        <div className="border rounded-lg shadow-md p-6 mx-6 mt-7" style={{ borderColor: `var(--borderColor)` }}>
                            <h3 className="text-xl font-semibold text-primary">Hours Per Week</h3>
                            <p className="">{report.time_commitment.available_time}</p>
                            <h3 className="text-xl font-semibold text-primary mt-4">Maximizing the Outcome</h3>
                            <p className="">{report.time_commitment.strategies}</p>
                            <h3 className="text-xl font-semibold text-primary mt-4">Optimized Schedule</h3>
                            <p className="">{report.time_commitment.study_schedule}</p>
                        </div>
                    </section>

                    <section className="bg-green-100 border-l-4 border-green-500 p-6 rounded-lg shadow-md mx-6 mt-7">
                        <h2 className="text-xl font-semibold text-green-700 flex gap-1 items-center">
                            Final Suggestion
                        </h2>
                        <p className="text-green-800">{report.suggestions_to_user}</p>
                    </section>
                </main>
            </div>
        </div>
    );
};

export default UserReport;
