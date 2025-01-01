import React, { useState } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger, } from "@/components/ui/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import AppSidebar from './AppSidebar';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const questions = [
    {
        question: "What is the capital of France?",
        answers: ["Paris", "London", "Berlin", "Madrid"],
    },
    {
        question: "Which planet is known as the Red Planet?",
        answers: ["Earth", "Venus", "Mars", "Jupiter"],
    },
    {
        question: "What is the largest mammal in the world?",
        answers: ["Elephant", "Blue Whale", "Giraffe", "Rhino"],
    },
    {
        question: "Who wrote 'Hamlet'?",
        answers: ["Shakespeare", "Homer", "Dante", "Tolstoy"],
    },
    {
        question: "What is the chemical symbol for water?",
        answers: ["H2O", "O2", "CO2", "N2"],
    },
];

const DetailAssessment = () => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    const nextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1);
        }
    };

    const handleSubmit = () => {
        toast.success("Assessment submitted successfully 🥳")
    };

    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset style={{ backgroundColor: `var(--background-color)` }}>
                <div className="flex items-center gap-2 mb-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block font-semibold">
                                Dashboard
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage
                                    className="font-semibold"
                                    style={{ color: `var(--text-color)` }}
                                >
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
                            onClick={currentQuestionIndex === questions.length - 1 ? handleSubmit : nextQuestion}
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
                            {questions[currentQuestionIndex].question}
                        </h2>
                        <div className="space-y-2">
                            {questions[currentQuestionIndex].answers.map((answer, index) => (
                                <div
                                    key={index}
                                    className="w-full py-4 px-8 text-left text-lg font-medium border border-l-8 border-r-8 border-primary rounded-full shadow-sm"
                                >
                                    <span className='rounded-full px-3 py-1.5 items-center mr-1 border-primary border-2'>{String.fromCharCode(65 + index)}</span> {answer}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider >
    )
}

export default DetailAssessment
