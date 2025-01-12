import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FaClock, FaHome } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { IoMdArrowRoundBack, IoMdArrowRoundForward } from 'react-icons/io';
import { Button } from '@/components/ui/button';
import Loader from '@/services/Loader';
import { GiPartyPopper } from "react-icons/gi";
import Confetti from 'react-confetti';
import ReactMarkdown from 'react-markdown';

const StartCourse = () => {
    const { id } = useParams();
    const [contents, setContents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [courseName, setCourseName] = useState("");
    const [assessmentId, setAssessmentId] = useState("");
    const [activeChapterIndex, setActiveChapterIndex] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const navigate = useNavigate();

    const poperSizeDetect = () => {
        const width = document.documentElement.clientWidth;
        const height = window.innerHeight;
        setWindowSize({ width, height });
    };

    useEffect(() => {
        window.addEventListener('resize', poperSizeDetect);
        poperSizeDetect();
        return () => {
            window.removeEventListener('resize', poperSizeDetect);
        }
    }, []);

    // Window resize handler
    useEffect(() => {
        const handleResize = () => {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initialize

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Fetch course data
    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/courses/course-contents/${id}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    }
                });

                const { data, activeChapterIndex: fetchedActiveIndex, forCourseName, for_skill } = response.data;

                setContents(data);
                setCourseName(forCourseName);
                setAssessmentId(for_skill);

                // Retrieve saved index from localStorage
                const savedIndex = parseInt(localStorage.getItem(`progress_${id}`), 10);

                // Validate savedIndex
                if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < data.length) {
                    setActiveChapterIndex(savedIndex);
                } else if (typeof fetchedActiveIndex === 'number' && fetchedActiveIndex >= 0 && fetchedActiveIndex < data.length) {
                    setActiveChapterIndex(fetchedActiveIndex);
                } else {
                    setActiveChapterIndex(0); // Default to first chapter
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [id]);

    // Handle navigation between chapters
    const handleNavigation = (newIndex) => {
        if (newIndex >= 0 && newIndex < contents.length) {
            setActiveChapterIndex(newIndex);
            localStorage.setItem(`progress_${id}`, newIndex);
            window.scrollTo(0, 0);
        }
    };

    // Handle course completion
    const handleFinish = async () => {
        try {
            const totalChapters = contents.length;
            await axios.put(
                `${import.meta.env.VITE_BASE_URL}/api/usercourse/updateprogress`,
                {
                    courseId: id,
                    progress: 100,
                    activeChapterIndex: totalChapters - 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            localStorage.setItem(`progress_${id}`, totalChapters - 1);
            setShowConfetti(true);
            window.scrollTo(0, 0);
            setTimeout(() => {
                setShowConfetti(false);
                navigate(`/assessment/${assessmentId}`);
            }, 5000);
        } catch (error) {
            console.error('Error updating progress to 100%:', error);
        }
    };

    // Update user progress
    const updateUserProgress = async () => {
        try {
            const progress = Math.round(((activeChapterIndex + 1) / contents.length) * 100);
            await axios.put(
                `${import.meta.env.VITE_BASE_URL}/api/usercourse/updateprogress`,
                {
                    courseId: id,
                    progress: progress,
                    activeChapterIndex: activeChapterIndex
                },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            toast.success("Your course progress has been updated");
        } catch (error) {
            console.error('Error updating progress:', error);
        }
    };

    // Handle button click for Next/Finish
    const handleNextOrFinish = () => {
        if (activeChapterIndex === contents.length - 1) {
            toast.success("Congratulations! You've completed the course");
            handleFinish();
        } else {
            handleNavigation(activeChapterIndex + 1);
            updateUserProgress();
        }
    };

    const convertMinutesToHoursCompact = (minutes) => {
        if (typeof minutes !== 'number' || minutes < 0) {
            throw new Error('Invalid input: minutes must be a non-negative number');
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        const hoursPart = hours > 0 ? `${hours} hours` : '';
        const minutesPart = remainingMinutes > 0 ? `${remainingMinutes} minutes` : '';

        return `${hoursPart} ${minutesPart}`.trim();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader />
            </div>
        );
    }

    if (!contents) {
        return <p className="text-center text-xl mt-10">Course not found.</p>;
    }

    const activeChapter = contents[activeChapterIndex];

    return (
        <div>
            {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}
            <div className='flex flex-row gap-2 justify-between mb-5'>
                <Button size="sm" onClick={() => navigate("/mycourses")} className="flex gap-2">
                    <IoMdArrowRoundBack size={20} />My Courses
                </Button>
                <Button onClick={() => navigate("/dashboard")} size="sm" className="flex gap-2"><FaHome size={20} /></Button>
            </div>
            <div className="flex flex-col lg:flex-row min-h-screen" style={{ borderColor: `var(--borderColor)` }}>
                <div className="shadow-md border rounded-xl border-gray-300 lg:w-1/4 p-4 h-screen lg:sticky top-0 overflow-y-auto" style={{ borderColor: `var(--borderColor)` }}>
                    <h2 className="text-lg font-bold mb-4 border-b pb-4" style={{ borderColor: `var(--borderColor)` }}>{courseName}</h2>
                    <ul className="space-y-2">
                        {contents.map((content, idx) => (
                            <li
                                key={idx}
                                className={`px-3 py-2 rounded-lg ${activeChapterIndex === idx
                                    ? 'bg-purple-100 text-black font-semibold'
                                    : ''
                                    }`}>
                                <div className='grid grid-cols-5 items-center'>
                                    <div>
                                        <h2 className='p-1 bg-primary text-white rounded-full w-8 h-8 text-center'>{idx + 1}</h2>
                                    </div>
                                    <div className='col-span-4'>
                                        <h2 className='font-medium'>{`${content?.title}`}</h2>
                                        <h2 className="text-sm font-semibold flex gap-2 items-center text-primary py-1"><FaClock />{convertMinutesToHoursCompact(parseInt(content?.duration)) || 'N/A'}</h2>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex-1 overflow-y-auto lg:mt-0 mt-4">
                    <Card className="shadow-md border rounded-xl border-gray-300" style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)`, borderColor: `var(--borderColor)` }}>
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold mb-2">{activeChapter?.title}</CardTitle>
                            <div className="text-lg text-justify font-medium courseSection p-4 rounded-xl">{activeChapter?.description}</div>
                        </CardHeader>
                        <CardContent>
                            {activeChapter?.videoId && (
                                <div className="mb-6">
                                    <h2 className="text-2xl mb-3 font-bold">Video <span className='text-primary'>Explanation</span></h2>
                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                        <iframe
                                            className="absolute top-0 left-0 w-full h-full rounded-xl"
                                            src={`https://www.youtube.com/embed/${activeChapter?.videoId}`}
                                            title={`Video for ${activeChapter?.title}`}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                </div>
                            )}
                            <div className='mb-8'>
                                <h2 className="text-2xl mb-3 font-bold">Detailed <span className='text-primary'>Explanation</span></h2>
                                <ReactMarkdown className="text-lg text-justify font-medium courseSection p-4 rounded-xl">{activeChapter?.detailed_content}</ReactMarkdown>
                            </div>
                            <div className='mb-8'>
                                <ReactMarkdown>{activeChapter?.detailed_content}</ReactMarkdown>
                                </div>

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-3">Chapter <span className='text-primary'>Objectives</span></h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    {activeChapter?.objectives.map((objective, idx) => (
                                        <li key={idx} className="text-lg font-medium">{objective}</li>
                                    ))}
                                </ul>
                            </div>

                            <hr className='border-primary border my-7' />

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-3">Real World <span className='text-primary'>Examples</span></h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    {activeChapter?.real_world_examples.map((example, idx) => (
                                        <li key={idx} className="text-lg font-medium">{example}</li>
                                    ))}
                                </ul>
                            </div>

                            <hr className='border-primary border my-7' />

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-3">Learning <span className='text-primary'>Outcomes</span></h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    {activeChapter?.learning_outcomes.map((outcome, idx) => (
                                        <li key={idx} className="text-lg font-medium">{outcome}</li>
                                    ))}
                                </ul>
                            </div>

                            <hr className='border-primary border my-7' />

                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-3">Key <span className='text-primary'>Points</span></h3>
                                <ul className="list-disc pl-6 space-y-2">
                                    {activeChapter?.key_points.map((point, idx) => (
                                        <li key={idx} className="text-lg font-medium">{point}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className='flex flex-row gap-2 justify-between mt-10'>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleNavigation(activeChapterIndex - 1)}
                                    className="flex gap-2 border"
                                    disabled={activeChapterIndex === 0}
                                >
                                    <IoMdArrowRoundBack size={20} /> Previous
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleNextOrFinish}
                                    className="flex gap-2 px-5"
                                >
                                    {activeChapterIndex === contents.length - 1
                                        ? <span className='flex gap-2'
                                            onClick={() => handleFinish()}
                                        >Finish <GiPartyPopper size={20} /></span>
                                        : <span className='flex gap-2 items-center'>Next<IoMdArrowRoundForward size={20} /></span>
                                    }
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default StartCourse;
