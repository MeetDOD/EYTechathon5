import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { userState } from "@/store/auth";
import { useRecoilValue } from "recoil";
import { useSocket } from "@/context/SocketContext";

const MyCourses = () => {
    const [course, setCourse] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const socket = useSocket();
    const user = useRecoilValue(userState);

    const [logMessages, setLogMessages] = useState([]); // State for storing log messages

    useEffect(() => {
        if (!user || !user._id) return;

        // Initialize socket connection once

        socket.on('connect', () => {
            console.log('Connected to the server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from the server');
        });

        socket.emit('joinRoom', user._id);

        // Handle incoming log messages
        socket.on('log', (message) => {
            console.log('Log:', message);
            setLogMessages((prevLogs) => [...prevLogs, message]);
        });

        socket.on('generationComplete', () => {
            setLogMessages((prevLogs) => [...prevLogs, "Generation complete!, Refreshing courses..."]);
            fetchCourses();
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
            socket.off('log');
            socket.off('generationComplete'); // Clean up the 'generationComplete' listener
        };
    }, [user]);

    const totalPages = Math.ceil(course.length / itemsPerPage);

    const fetchCourses = async () => {
        try {
            setLoading(true); // Show loading indicator while fetching courses
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/courses/all-courses`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
            });
            console.log(response.data.data);
            setCourse(response.data.data);
        } catch (error) {
            toast.error("Failed to load courses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses(); // Fetch courses on component mount
    }, []);

    const handlePageClick = (page) => {
        window.scrollTo(0, 0);
        setCurrentPage(page);
    };

    const paginatedCourses = course?.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const convertMinutesToHoursCompact = (minutes) => {
        if (typeof minutes !== 'number' || minutes < 0) {
            throw new Error('Invalid input: minutes must be a non-negative number');
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        const hoursPart = hours > 0 ? `${hours} h` : '';
        const minutesPart = remainingMinutes > 0 ? `${remainingMinutes} m` : '';

        return `${hoursPart} ${minutesPart}`.trim();
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `CAREERINSIGHT | MY COURSES`;
    }, []);

    if (!course) {
        return (
            <>
                <div className="p-4">
                    <div id="logContainer" className="space-y-2">
                        {logMessages.map((message, index) => (
                            <p key={index} className="bg-gray-100 p-2 rounded-md shadow-sm text-gray-700">
                                {message}
                            </p>
                        ))}
                    </div>
                </div>
            </>
        );
    }

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
                                    My Courses
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                {loading && (
                    <div className="grid grid-cols-1 mt-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 8 }).map((index) => (
                            <div
                                key={index}
                                className="p-2 shadow-md rounded-lg border border-gray-300"
                                style={{ borderColor: `var(--borderColor)`, backgroundColor: `var(--background-color)` }}
                            >
                                <Skeleton className="w-full h-40 rounded-lg skle" />
                                <div className="py-4 space-y-2">
                                    <div>
                                        <Skeleton className="h-6 w-3/4 mb-2 skle" />
                                    </div>
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-1/2 skle" />
                                        <Skeleton className="h-4 w-16 skle" />
                                    </div>
                                    <Skeleton className="h-3 w-full skle" />
                                    <Skeleton className="h-3 w-24 skle" />
                                    <Skeleton className="h-3 w-60 skle" />
                                </div>
                                <Skeleton className="h-10 w-full skle" />
                            </div>
                        ))}
                    </div>
                )}

                {paginatedCourses?.length <= 0 ? (
                    <div className="flex flex-col space-y-5 min-h-[70vh] items-center justify-center">
                        <div className="text-3xl font-bold tracking-tight">
                            Check out the latest courses to enroll
                        </div>
                        <Link to="/courses">
                            <Button size="lg">View Courses</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 mt-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedCourses?.map((course) => (
                            <div
                                key={course._id}
                                className="p-2 shadow-md rounded-lg overflow-hidden border transition duration-300 hover:-translate-y-2"
                                style={{ borderColor: `var(--borderColor)`, backgroundColor: `var(--background-color)` }}
                            >
                                <img
                                    src={course.thumbnail || "https://preview.redd.it/vkg7a1nlxvl61.png?auto=webp&s=924f9cce333b1f436e056bd6ee0b73da5a907bb7"}
                                    alt={course.courseName}
                                    className="w-full rounded-lg  h-40 object-cover"
                                />
                                <div className="py-4 space-y-2">
                                    <div className="text-sm font-bold">{course.courseName}</div>
                                    <div className="flex justify-between">
                                        <div className="text-[10px] p-1 bg-blue-100 rounded-full px-2 text-primary">
                                            {course.category}
                                        </div>
                                        <div className="font-bold text-xs flex flex-row items-center gap-1 text-green-400">
                                            <div className="w-2 h-2 bg-green-400 rounded-full border border-green-600"></div>
                                            {convertMinutesToHoursCompact(parseInt(course?.duration)) || 'please wait...'}
                                        </div>
                                    </div>
                                    <div className="pt-1">
                                        <div className="w-full bg-gray-100 rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full"
                                                style={{ width: `${course?.progress}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs mt-1 font-semibold tracking-tight">
                                            My Progress {course?.progress}%
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    <Link to={`/startcourse/${course._id}`}>
                                        <Button className="w-full">View Course</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {course?.length > 6 && (
                    <div className="flex justify-center items-center mt-6 gap-2">
                        <Button
                            onClick={() => handlePageClick(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Previous
                        </Button>
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <Button
                                key={index}
                                onClick={() => handlePageClick(index + 1)}
                                className={`px-4 py-2 ${currentPage === index + 1 ? 'bg-blue-500 text-white' : ''}`}
                            >
                                {index + 1}
                            </Button>
                        ))}
                        <Button
                            onClick={() => handlePageClick(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`px-4 py-2 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            Next
                        </Button>
                    </div>
                )}
            </SidebarInset>
        </SidebarProvider>
    );
};

export default MyCourses;
