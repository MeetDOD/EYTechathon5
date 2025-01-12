import React, { useEffect, useState } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import AppSidebar from './AppSidebar';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/auth';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const DetailAssessment = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const user = useRecoilValue(userState);
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const { assessmentid } = useParams();

    const nextQuestion = () => {
        // Check if the current question has been answered
        if (userAnswers[currentQuestionIndex] === undefined) {
            toast.error("Please select an answer before proceeding.");
            return;
        }
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };



    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (Object.keys(userAnswers).length !== questions.length) {
            toast.error("Please answer all questions before submitting.");
            return;
        }

        const submission = {
            userId: user?.id,
            assessmentId: assessmentid,
            answers: userAnswers,
        };

        try {
            console.log(submission);
            const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/assessment/submit/${assessmentid}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    answers: submission,
                }),
            });
            const data = await res.json();
            console.log(data);
            toast.success("Assessment submitted successfully 🥳");
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit assessment. Please try again.");
        }
    };

    const handleAnswerSelect = (answer) => {
        setUserAnswers((prevAnswers) => ({
            ...prevAnswers,
            [currentQuestionIndex]: answer,
        }));
    };


    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `CAREERINSIGHT | ${user?.fullName?.toUpperCase()}'s ASSESSMENT`;
    }, []);

    useEffect(() => {
        if (!assessmentid) return;
        const fetchAssessmentQuestions = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/assessment/${assessmentid}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setQuestions(res.data.data.questions);
            } catch (error) {
                console.error(error);
            }
        };

        fetchAssessmentQuestions();
    }, [assessmentid]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset style={{ backgroundColor: `var(--background-color)` }}>
                <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block font-semibold">Dashboard</BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold" style={{ color: `var(--text-color)` }}>
                                    Detail Assessment
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="p-4 min-h-screen">
                    <div className="flex justify-between mb-4">
                        <Button
                            onClick={prevQuestion}
                            className={`${currentQuestionIndex === 0 ? "cursor-not-allowed" : ""}`}
                            disabled={currentQuestionIndex === 0}
                        >
                            Previous
                        </Button>
                        <Button
                            onClick={
                                currentQuestionIndex === questions.length - 1
                                    ? handleSubmit
                                    : nextQuestion
                            }
                        >
                            {currentQuestionIndex === questions.length - 1 ? "Submit" : "Next"}
                        </Button>
                    </div>

                    <div className="mb-4">
                        <div className="text-primary font-extrabold text-lg mb-2">
                            Question {currentQuestionIndex + 1}/{questions.length}
                        </div>
                        <div className="bg-gray-200 h-2 w-full rounded">
                            <div className="bg-primary h-2 rounded" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h2 className="text-2xl font-bold mb-4">
                            {questions[currentQuestionIndex]?.question}
                        </h2>
                        <div className="space-y-2">
                            {questions[currentQuestionIndex]?.options.map((answer, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleAnswerSelect(answer)} // Pass the actual answer value
                                    className={`w-full py-4 px-8 text-left text-[15px] font-medium border border-l-8 border-r-8 rounded-full shadow-sm cursor-pointer ${userAnswers[currentQuestionIndex] === answer
                                            ? "bg-primary text-white border-primary"
                                            : "border-primary"
                                        }`}
                                >
                                    <span className="rounded-full px-2.5 py-1.5 items-center mr-1 border-primary border-2">
                                        {String.fromCharCode(65 + index)}
                                    </span>{" "}
                                    {answer}
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default DetailAssessment;
