import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useRecoilValue } from 'recoil';
import { userState } from '@/store/auth';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import coin from "../assets/coin.json";
import Lottie from 'lottie-react';

const ReportCardDialog = ({ reportData, isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleClose = () => {
        onClose();
        navigate('/mycourses');
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]" style={{ borderColor: `var(--borderColor)`, backgroundColor: `var(--background-color)`, scrollY: "auto" }}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Assessment Report Card</DialogTitle>
                    <DialogDescription>Review your answers and results below.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 font-medium text-white bg-primary p-4 rounded-lg">
                        <span>Question</span>
                        <span>Your Answer</span>
                        <span>Correct Answer</span>
                    </div>
                    {reportData.wrongAnswers.map((item, index) => (
                        <div key={index} className="grid grid-cols-3 gap-4 p-2 border-b-2 border-primary">
                            <span>{item.questionText}</span>
                            <span
                                className={`font-semibold ${item.userAnswer === item.correctAnswer
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                    }`}
                            >
                                {item.userAnswer || 'Not Answered'}
                            </span>
                            <span className="font-semibold text-green-600">{item.correctAnswer}</span>
                        </div>
                    ))}
                    <div className="mt-6 text-center">
                        <h2 className="text-xl font-bold">Your Score: {reportData.score}</h2>
                        <div className='flex flex-col'>
                            <div className="text-lg font-medium text-gray-500">
                                Coins Earned: 🪙 {reportData.coinsEarned}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end">
                    <Button onClick={handleClose}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const DetailAssessment = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const user = useRecoilValue(userState);
    const [questions, setQuestions] = useState([]);
    const [userAnswers, setUserAnswers] = useState({});
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [reportData, setReportData] = useState(null);
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
            const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/api/assessment/submit/${assessmentid}`, {
                answers: { answers: userAnswers },
            }, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setReportData(res.data.data);
            setIsDialogOpen(true);
            console.log(res.data.data)
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

            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-6">
                    {currentQuestionIndex + 1}. {questions[currentQuestionIndex]?.question}
                </h2>
                <div className="space-y-4">
                    {questions[currentQuestionIndex]?.options.map((answer, index) => (
                        <div
                            key={index}
                            onClick={() => handleAnswerSelect(answer)}
                            className={`w-full py-4 px-6 text-left text-[15px] font-medium rounded-full border border-l-8 border-r-8 border-primary shadow-md cursor-pointer transition-all duration-300 ${userAnswers[currentQuestionIndex] === answer
                                ? "bg-primary text-white border-primary"
                                : "bg-gray-100 hover:bg-primary hover:text-white border-gray-300"
                                }`}
                        >
                            <span
                                className={`inline-flex items-center justify-center w-8 h-8 mr-3 text-sm font-bold rounded-full ${userAnswers[currentQuestionIndex] === answer
                                    ? "bg-white text-primary"
                                    : "bg-primary text-white"
                                    }`}
                            >
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className={`${userAnswers[currentQuestionIndex] === answer ? "text-white" : "text-black"}`}>
                                {answer}
                            </span>
                        </div>
                    ))}
                </div>
                {reportData && (
                    <ReportCardDialog
                        reportData={reportData}
                        isOpen={isDialogOpen}
                        onClose={() => setIsDialogOpen(false)}
                    />
                )}
            </div>

        </div>
    );
};

export default DetailAssessment;