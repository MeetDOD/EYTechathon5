import { Button } from '@/components/ui/button';
import { userState } from '@/store/auth';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

const SkeletonLoader = () => (
    <div className="animate-pulse bg-violet-100 border-l-4 border-primary p-4 rounded-xl shadow-md">
        <div className="h-6 bg-primary/20 rounded w-3/4 mb-4"></div>
        <div className="h-44 bg-primary/10 rounded w-full"></div>
    </div>
);

const LearningPath = () => {
    const user = useRecoilValue(userState);
    const [feedback, setFeedback] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getPreassessment = async () => {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_BASE_URL}/api/preassessment`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );
                setFeedback(response.data.preassessment.feedback.for_career_goal.skills_to_focus || []);
                setName(response.data.preassessment.feedback.for_career_goal.name);
            } catch (error) {
                console.log(error);
                setLoading(true);
            } finally {
                setLoading(false);
            }
        };

        getPreassessment();
    }, []);

    useEffect(() => {
        if (user) {
            window.scrollTo(0, 0);
            document.title = `CAREERINSIGHT | ${user?.fullName?.toUpperCase()}'s LEARNING PATH`;
        }
    }, [user]);

    return (
        <div>
            <div className="flex justify-between mb-5">
                <div className="flex flex-row gap-2">
                    <Button
                        onClick={() => navigate("/dashboard")}
                        size="sm"
                        className="flex gap-1"
                    >
                        <IoMdArrowRoundBack size={20} />
                        Back
                    </Button>
                </div>
                <Button onClick={() => navigate("/dashboard")} size="sm" className="flex gap-2">
                    <FaHome size={20} />
                </Button>
            </div>
            <div className="border shadow-lg rounded-xl min-h-screen pb-8" style={{ borderColor: `var(--borderColor)` }}>
                <div>
                    <header className="mb-8 bg-gradient-to-r from-violet-500 via-purple-700 to-indigo-900 text-white py-14 rounded-t-xl">
                        <div className="container mx-auto px-4 text-center">
                            <h1 className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold flex items-center justify-center gap-2">
                                {user?.fullName}'s Learning Path
                            </h1>
                            <p className="mt-2 text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl tracking-tight">
                                {name || 'Loading your context please wait...'}
                            </p>
                        </div>
                    </header>
                    <div className="p-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {loading
                                ? Array(6)
                                    .fill(0)
                                    .map((_, index) => <SkeletonLoader key={index} />)
                                : feedback.map((skill, index) => (
                                    <div
                                        key={index}
                                        className="bg-violet-100 border-l-4 border-primary p-4 rounded-xl shadow-md hover:shadow-xl transition duration-300 hover:-translate-y-2"
                                    >
                                        <h3 className="text-[19px] font-extrabold text-primary">{skill.skill}</h3>
                                        <p className="text-[15px] text-primary font-medium mt-2">{skill.why}</p>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
