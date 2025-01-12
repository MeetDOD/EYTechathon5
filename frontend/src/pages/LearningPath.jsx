import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Importing ShadCN Skeleton component
import { userState } from '@/store/auth';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaHome } from 'react-icons/fa';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import icon from "../assets/timeline.png"

const LearningPath = () => {
    const user = useRecoilValue(userState);
    const [feedback, setFeedback] = useState([]);
    const [skillsCourses, setSkillsCourses] = useState([]);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleNavigate = (id) => {
        navigate(`/startcourse/${id}`);
    }

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
                console.log(response.data);
                setSkillsCourses(response.data.skills_courses || []);
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
                    <header className="mb-8 bg-gradient-to-r from-violet-500 via-purple-700 to-indigo-900 text-white py-14 rounded-t-xl h-52 bg-cover bg-center"
                        style={{
                            backgroundImage: `url('https://static.canva.com/web/images/e733916c4616f5baa19098cc2844369b.jpg')`,
                        }}>
                        <div className="container mx-auto px-4 text-center">
                            <h1 className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold flex items-center justify-center gap-2">
                                {user?.fullName}'s Learning Path
                            </h1>
                            <p className="mt-2 text-base font-medium sm:text-lg md:text-xl lg:text-xl xl:text-2xl tracking-tight">
                                {name || 'Loading your context please wait...'}
                            </p>
                        </div>
                    </header>
                    <div className="">
                        {loading ? (
                            <VerticalTimeline>
                                {Array(6)
                                    .fill(0)
                                    .map((_, index) => (
                                        <VerticalTimelineElement
                                            key={index}
                                            iconStyle={{ background: '#7c3aed' }}
                                        >
                                            <Skeleton className="h-6 w-3/4 mb-4 skle" />
                                            <Skeleton className="h-4 w-full mb-2 skle" />
                                            <Skeleton className="h-4 w-5/6 skle" />
                                        </VerticalTimelineElement>
                                    ))}
                            </VerticalTimeline>
                        ) : (
                            <div>
                                <div className="flex items-center justify-center mb-6">
                                    <div className="text-xl bg-green-500 text-white font-bold py-2 px-6 rounded-full border-4 border-green-700 animate-pulse">
                                        Start from here
                                    </div>
                                </div>
                                <VerticalTimeline>
                                    {feedback.map((skill, index) => (
                                        <VerticalTimelineElement
                                            key={index}
                                            onTimelineElementClick={() => handleNavigate(
                                                skillsCourses.find((course) => course.skill_id === skill._id).course_id
                                            )}
                                            contentStyle={{
                                                background: '#7c3aed',
                                            }}
                                            contentArrowStyle={{
                                                borderRight: '10px solid #7c3aed',
                                            }}
                                            iconStyle={{ background: '#fff' }}
                                            icon={
                                                <div className="flex items-center justify-center h-full w-full">
                                                    <img src={icon} alt="Timeline Icon" className="h-7 w-7 md:h-8 md:w-8 lg:h-10 lg:w-10" />
                                                </div>
                                            }
                                            date={
                                                <span className="text-lg font-extrabold tracking-tight">
                                                    Course {index + 1}
                                                </span>
                                            }                                                                            >
                                            <div className="font-bold text-xl mb-2 text-white">
                                                {skill.skill}
                                            </div>
                                            <div className='font-medium text-justify text-white tracking-tight'>
                                                {skill.why}
                                            </div>
                                        </VerticalTimelineElement>
                                    ))}
                                </VerticalTimeline>
                                <div className="flex items-center justify-center mt-6">
                                    <div className="text-xl bg-red-500 text-white font-bold py-2 px-6 rounded-full border-4 border-red-700">
                                        Ends here
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
