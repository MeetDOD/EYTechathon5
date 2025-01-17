import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FaSearch } from "react-icons/fa";

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');

    const itemsPerPage = 8;

    const totalPages = Math.ceil(courses.length / itemsPerPage);

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
        const fetchCourses = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/api/usercourse/getallcourses`);
                const { courses: fetchedCourses } = response.data;
                setCourses(fetchedCourses);
                console.log(courses)
            } catch (err) {
                toast.error("Failed to fetch courses");
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handlePageClick = (page) => {
        window.scrollTo(0, 0);
        setCurrentPage(page);
    };

    const filteredCourses = courses.filter(course =>
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory ? course.category === selectedCategory : true) &&
        (selectedLevel ? course.courseLevel === selectedLevel : true) &&
        (selectedTopic ? course.topic === selectedTopic : true)
    );


    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "CAREERINSIGHT | COURSES";
    }, []);

    return (
        <div>
            <div className='flex flex-col items-center gap-2 my-10 px-4'>
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold sm:text-4xl">
                        Latest <span className='text-primary'>Courses</span>
                    </h2>
                    <p className="mt-2 text-lg font-medium text-gray-500">
                        Explore our newest courses designed to help you gain essential skills and advance your career
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mb-10">
                <div className="relative flex items-center max-w-3xl w-full">
                    <FaSearch className="absolute left-3 text-primary text-lg" />
                    <Input
                        type="text"
                        placeholder="Search what's in your mind..."
                        className="inputField w-full pl-10 pr-4 py-2 rounded-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <Select onValueChange={(value) => setSelectedCategory(value === "all categories" ? "" : value)}>
                    <SelectTrigger className="w-[200px] rounded-lg inputField">
                        <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}>
                        <SelectItem default value="all categories">All Categories</SelectItem>
                        {Array.from(new Set(courses.map(c => c.category))).map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={(value) => setSelectedLevel(value === "all levels" ? "" : value)}>
                    <SelectTrigger className="w-[200px] rounded-lg inputField">
                        <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}>
                        <SelectItem value="all levels">All Levels</SelectItem>
                        {Array.from(new Set(courses.map(c => c.courseLevel))).map(level => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select onValueChange={(value) => setSelectedTopic(value === "all topics" ? "" : value)}>
                    <SelectTrigger className="w-[200px] rounded-lg inputField">
                        <SelectValue placeholder="All Topics" />
                    </SelectTrigger>
                    <SelectContent style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}>
                        <SelectItem value="all topics">All Topics</SelectItem>
                        {Array.from(new Set(courses.map(c => c.topic))).map(topic => (
                            <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>


            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div
                            key={index}
                            className="p-2 shadow-md rounded-lg border border-gray-300"
                            style={{ borderColor: `var(--borderColor)`, backgroundColor: `var(--background-color)` }}
                        >
                            <Skeleton className="w-full h-40 rounded-lg skle" />
                            <div className="py-4 space-y-2">
                                <Skeleton className="h-6 w-3/4 mb-2 skle" />
                                <Skeleton className="h-4 w-1/2 skle" />
                                <Skeleton className="h-3 w-full skle" />
                                <Skeleton className="h-3 w-24 skle" />
                                <Skeleton className="h-3 w-60 skle" />
                            </div>
                            <Skeleton className="h-10 w-full skle" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredCourses.slice((currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage)?.map((course) => (
                            <div
                                key={course._id}
                                className="p-2 shadow-md rounded-lg overflow-hidden border border-gray-300 transition duration-300 hover:-translate-y-2"
                                style={{ borderColor: `var(--borderColor)`, backgroundColor: `var(--background-color)` }}
                            >
                                <img
                                    src={course.thumbnail}
                                    alt={course.courseName}
                                    className="w-full rounded-lg h-40 object-cover"
                                />
                                <div className="py-4 space-y-2">
                                    <div className="text-lg font-bold line-clamp-2">
                                        {course.courseName}
                                    </div>
                                    <div className='flex justify-between'>
                                        <span className='text-[10px] p-1 bg-blue-100 rounded-full px-2 text-primary'>
                                            {course.category}
                                        </span>
                                        <span className='font-bold text-xs flex flex-row items-center gap-1 text-green-400'>
                                            <div className="w-2 h-2 bg-green-400 rounded-full border border-green-600"></div>
                                            {convertMinutesToHoursCompact(parseInt(course?.duration)) || 'server is working...'}
                                        </span>
                                    </div>
                                    <div className="text-xs font-semibold text-gray-500">
                                        Published At: {format(new Date(course.createdAt), 'MMMM d, yyyy')}
                                    </div>
                                </div>
                                <div>
                                    <Link to={`/viewcourse/${course._id}/careerinsight/${course.courseName}`}>
                                        <Button className="w-full">More Details</Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                </div>
            )
            }

            {
                courses?.length > itemsPerPage && (
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
                )
            }
        </div>
    );
};

export default CoursesPage;
