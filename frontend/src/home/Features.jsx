import React, { useState } from 'react';
import assessmentGif from '../assets/Features/assessment.gif';
import resumeGif from '../assets/Features/resume.gif';
import interviewGif from '../assets/Features/interview.gif';
import pathGif from '../assets/Features/path.gif';

import assessmentStatic from '../assets/Features/assessment.png';
import resumeStatic from '../assets/Features/resume.png';
import interviewStatic from '../assets/Features/interview.png';
import pathStatic from '../assets/Features/path.png';

const Features = () => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const features = [
        {
            gif: assessmentGif,
            static: assessmentStatic,
            title: "AI Assessment",
            description: "Evaluate your skills with AI-powered assessments tailored for students",
        },
        {
            gif: resumeGif,
            static: resumeStatic,
            title: "AI Resume Builder",
            description: "Create professional resumes effortlessly with intelligent suggestions",
        },
        {
            gif: interviewGif,
            static: interviewStatic,
            title: "AI Mock Interview",
            description: "Prepare for your dream job with AI-driven mock interviews and feedback",
        },
        {
            gif: pathGif,
            static: pathStatic,
            title: "AI Learning Path",
            description: "Personalized learning paths to guide you toward your career goals",
        },
    ];

    return (
        <div className="py-12">
            <div>
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-extrabold sm:text-4xl">
                        Elevate with <span className='text-primary'>Career Insight</span>
                    </h2>
                    <p className="mt-4 text-lg font-medium text-gray-500">
                        Leverage the power of AI to achieve your goals and enhance your learning journey
                    </p>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center px-3 border py-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                            style={{ borderColor: `var(--borderColor)` }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <img
                                className="mb-4 rounded-lg w-20 shadow-md"
                                src={hoveredIndex === index ? feature.gif : feature.static}
                                alt={feature.title}
                            />
                            <h3 className="text-xl font-bold">{feature.title}</h3>
                            <p className="mt-2 text-gray-500 font-medium">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Features;
