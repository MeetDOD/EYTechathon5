import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImSpinner2 } from 'react-icons/im';
import { userState } from '@/store/auth';
import { useRecoilValue } from 'recoil';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MdCancel } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const AddDetailForm = () => {

    const [isFormValid, setIsFormValid] = useState(false);
    const [isSecondFormValid, setIsSecondFormValid] = useState(false);
    const user = useRecoilValue(userState);
    const [showAddDetailsDialog, setShowAddDetailsDialog] = useState(false);
    const [showNextDetailsDialog, setShowNextDetailsDialog] = useState(false);
    const [newSkill, setNewSkill] = useState('');
    const [newExperience, setNewExperience] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phoneno: '',
        gender: '',
        dateofbirth: '',
        collegename: '',
        university: '',
        education_level: '',
        interested_field: '',
        career_goal: '',
        occupation: '',
        address: '',
        skills_experience: [],
        verbal: '',
        written: '',
        technical_skills: '',
        teamwork_skills: '',
        analytical_thinking: '',
        prefer_collaborative_learning: '',
        prefer_reading: '',
        time_commitment: ''
    });

    useEffect(() => {
        if (user && isDetailsIncomplete(user)) {
            setShowAddDetailsDialog(true);
        }
    }, [user]);

    useEffect(() => {
        setIsFormValid(
            formData.phoneno.length === 10 &&
            formData.gender &&
            formData.dateofbirth &&
            formData.collegename &&
            formData.career_goal
        );
    }, [formData]);

    useEffect(() => {
        setIsSecondFormValid(
            formData.address &&
            formData.skills_experience.length > 0 &&
            formData.verbal &&
            formData.written &&
            formData.prefer_reading &&
            formData.time_commitment
        );
    }, [formData]);

    const isDetailsIncomplete = (user) => {
        return Object.values({
            phoneno: user.phoneno,
            gender: user.gender,
            dateofbirth: user.dateofbirth,
            collegename: user.collegename,
            university: user.university,
            education_level: user.education_level,
            interested_field: user.interested_field,
            career_goal: user.career_goal,
            occupation: user.occupation,
            address: user.address,
            skills_experience: user.skills_experience,
            verbal: user.verbal,
            written: user.written,
            technical_skills: user.technical_skills,
            teamwork_skills: user.teamwork_skills,
            analytical_thinking: user.analytical_thinking,
            prefer_collaborative_learning: user.prefer_collaborative_learning,
            prefer_reading: user.prefer_reading,
            time_commitment: user.time_commitment
        }).some((value) => !value);
    };

    const handleAddSkill = () => {
        const newTech = {
            skill: newSkill.trim(),
            experience: parseInt(newExperience.trim(), 10),
        };

        if (
            newTech.skill &&
            newTech.experience > 0 &&
            !formData.skills_experience.some((item) => item.skill === newTech.skill)
        ) {
            setFormData({
                ...formData,
                skills_experience: [...formData.skills_experience, newTech],
            });
            setNewSkill('');
            setNewExperience('');
        }
    };

    const handleRemoveSkill = (index) => {
        setFormData({
            ...formData,
            skills_experience: formData.skills_experience.filter((_, i) => i !== index),
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSaveDetails = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (!isFormValid) return;

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/api/user/adduserdetail`, formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            toast.success('Details added successfully!');
            setShowAddDetailsDialog(false);
            navigate('/');
        } catch (err) {
            console.log(err);
            toast.error('Failed to add details. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    return (
        <div>
            <Dialog open={showAddDetailsDialog} onOpenChange={() => { }} closeOnEsc={false} closeOnOutsideClick={false}>
                <DialogContent
                    className='max-w-[90vw] md:max-w-[600px] lg:max-w-[800px] p-6 rounded-lg shadow-lg border overflow-y-auto max-h-[90vh]'
                    style={{ borderColor: `var(--borderColor)`, backgroundColor: `var(--background-color)`, scrollY: "auto" }}>

                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-center">Complete Your Profile</DialogTitle>
                        <DialogDescription className="text-center text-sm">
                            Please fill out all required fields to continue with careerinsight
                        </DialogDescription>
                    </DialogHeader>

                    <form className='grid gap-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='phoneno' className='font-medium'>
                                    Phone Number
                                </Label>
                                <div className='flex items-center space-x-2'>
                                    <div className='flex items-center space-x-2 px-3 py-2 border rounded-md' style={{ borderColor: `var(--borderColor)` }}>
                                        <img
                                            src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg"
                                            alt="India Flag"
                                            className="w-6 h-4 rounded-sm"
                                        />
                                        <span className="font-medium">+91</span>
                                    </div>
                                    <Input
                                        id='phoneno'
                                        name='phoneno'
                                        placeholder='Enter your phone number'
                                        value={formData.phoneno || ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '');
                                            if (value.length <= 10) {
                                                handleChange({ target: { name: 'phoneno', value } });
                                            }
                                        }}
                                        className='inputField flex-1'
                                        type="number"
                                        maxLength="10"
                                    />
                                </div>
                                {formData.phoneno && formData.phoneno.length < 10 && (
                                    <p className="text-red-500 text-sm font-semibold">Phone number must be 10 digits</p>
                                )}
                            </div>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='gender' className='font-medium'>
                                    Gender
                                </Label>

                                <Select
                                    onValueChange={(value) => handleChange({ target: { name: 'gender', value } })}
                                    id='gender'
                                    name='gender'
                                    value={formData.gender}
                                >
                                    <SelectTrigger className="inputField">
                                        <SelectValue placeholder='Select your gender' />
                                    </SelectTrigger>

                                    <SelectContent
                                        style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}
                                    >
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Not to say">Not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='dateofbirth' className='font-medium'>
                                    Date of Birth
                                </Label>
                                <Input
                                    value={formData.dateofbirth}
                                    id='dateofbirth'
                                    name='dateofbirth'
                                    onChange={handleChange}
                                    className='inputField'
                                    type="date"
                                />
                            </div>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='collegename' className='font-medium'>
                                    College Name
                                </Label>
                                <Input
                                    id='collegename'
                                    name='collegename'
                                    value={formData.collegename}
                                    placeholder='Enter your college name'
                                    onChange={handleChange}
                                    className='inputField'
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='university' className='font-medium'>
                                    University
                                </Label>
                                <Input
                                    id='university'
                                    name='university'
                                    value={formData.university}
                                    placeholder='Enter your university'
                                    onChange={handleChange}
                                    className='inputField'
                                />
                            </div>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='gender' className='font-medium'>
                                    Current Education
                                </Label>

                                <Select
                                    onValueChange={(value) => handleChange({ target: { name: 'education_level', value } })}
                                    id='education_level'
                                    name='education_level'
                                    value={formData.education_level}
                                >
                                    <SelectTrigger className="inputField">
                                        <SelectValue placeholder='Enter your current education level' />
                                    </SelectTrigger>

                                    <SelectContent
                                        style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}
                                    >
                                        <SelectItem value="High school">High school</SelectItem>
                                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                        <SelectItem value="Graduate">Graduate</SelectItem>
                                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='occupation' className='font-medium'>
                                    Current Occupation
                                </Label>

                                <Select
                                    onValueChange={(value) => handleChange({ target: { name: 'occupation', value } })}
                                    id='occupation'
                                    name='occupation'
                                    value={formData.occupation}
                                >
                                    <SelectTrigger className="inputField">
                                        <SelectValue placeholder='Enter your current occupation' />
                                    </SelectTrigger>

                                    <SelectContent
                                        style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}
                                    >
                                        <SelectItem value="Student">Student</SelectItem>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Freelancer">Freelancer</SelectItem>
                                        <SelectItem value="Unemployed">Unemployed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='interested_field' className='font-medium'>
                                    Field/Industry of Interest
                                </Label>
                                <Input
                                    id='interested_field'
                                    name='interested_field'
                                    value={formData.interested_field}
                                    placeholder='Enter your field/industry of interest'
                                    onChange={handleChange}
                                    className='inputField'
                                    type="text"
                                />
                            </div>
                        </div>

                        <div>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='career_goal' className='font-medium'>
                                    Ultimate Career Goal
                                </Label>
                                <Input
                                    id='career_goal'
                                    name='career_goal'
                                    value={formData.career_goal}
                                    placeholder='Enter your ultimate career goal'
                                    onChange={handleChange}
                                    className='inputField'
                                />
                            </div>
                        </div>

                        <DialogFooter className='flex justify-center'>
                            <Button
                                type='button'
                                onClick={() => {
                                    setShowAddDetailsDialog(false);
                                    setShowNextDetailsDialog(true);
                                }}
                                disabled={!isFormValid}
                                className='px-6 py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
                                Next
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={showNextDetailsDialog} onOpenChange={() => { }} closeOnEsc={false} closeOnOutsideClick={false}>
                <DialogContent
                    className='max-w-[90vw] md:max-w-[600px] lg:max-w-[800px] p-6 rounded-lg shadow-lg border overflow-y-auto max-h-[90vh]'
                    style={{ borderColor: `var(--borderColor)`, backgroundColor: `var(--background-color)`, scrollY: "auto" }}>

                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-center">Complete Your Profile</DialogTitle>
                        <DialogDescription className="text-center text-sm">
                            Please fill out all required fields to continue with careerinsight
                        </DialogDescription>
                    </DialogHeader>

                    <form className='grid gap-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 '>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='address' className='font-medium'>
                                    Address
                                </Label>
                                <Input
                                    id='address'
                                    name='address'
                                    value={formData.address}
                                    placeholder='Enter your address'
                                    onChange={handleChange}
                                    className='inputField'
                                />
                            </div>
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="skill" className="font-medium">
                                    Current Skills and Experience
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="newSkill"
                                        name="newSkill"
                                        value={formData.newSkill}
                                        placeholder="Add your skill"
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        className="inputField"
                                    />
                                    <Input
                                        id="experience"
                                        name="experience"
                                        value={formData.experience}
                                        type="number"
                                        placeholder="Years of experience"
                                        onChange={(e) => setNewExperience(e.target.value)}
                                        className="inputField"
                                    />
                                    <Button
                                        type="button"
                                        onClick={handleAddSkill}
                                        disabled={!newSkill.trim() || !newExperience.trim()}
                                    >
                                        Add
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.skills_experience.map((tech, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center bg-primary text-white px-3 py-1 rounded-full text-sm font-medium"
                                        >
                                            {tech.skill} ({tech.experience} years)
                                            <button
                                                type="button"
                                                className="ml-1"
                                                onClick={() => handleRemoveSkill(index)}
                                            >
                                                <MdCancel />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='verbal' className='font-medium'>
                                    Verbal Communication Level
                                </Label>

                                <Select
                                    onValueChange={(value) => handleChange({ target: { name: 'verbal', value } })}
                                    id='verbal'
                                    name='verbal'
                                    value={formData.verbal}
                                >
                                    <SelectTrigger className="inputField">
                                        <SelectValue placeholder='Select your verbal communcation level' />
                                    </SelectTrigger>

                                    <SelectContent
                                        style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}
                                    >
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='written' className='font-medium'>
                                    Verbal Communication Level
                                </Label>

                                <Select
                                    onValueChange={(value) => handleChange({ target: { name: 'written', value } })}
                                    id='written'
                                    name='written'
                                    value={formData.written}
                                >
                                    <SelectTrigger className="inputField">
                                        <SelectValue placeholder='Select your written communcation level' />
                                    </SelectTrigger>

                                    <SelectContent
                                        style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}
                                    >
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='technical_skills' className='font-medium'>
                                    Rate your Technical Skills
                                </Label>
                                <Input
                                    id='technical_skills'
                                    name='technical_skills'
                                    value={formData.technical_skills}
                                    placeholder='Rate your Technical Skills out of 5'
                                    onChange={handleChange}
                                    className='inputField'
                                    type="number"
                                />
                            </div>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='teamwork_skills' className='font-medium'>
                                    Rate your Teamwork Skills
                                </Label>
                                <Input
                                    id='teamwork_skills'
                                    name='teamwork_skills'
                                    value={formData.teamwork_skills}
                                    placeholder='Rate your Teamwork Skills out of 5'
                                    onChange={handleChange}
                                    className='inputField'
                                    type="number"
                                />
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='analytical_thinking' className='font-medium'>
                                    Rate your Analytical Thinking
                                </Label>
                                <Input
                                    id='analytical_thinking'
                                    name='analytical_thinking'
                                    value={formData.analytical_thinking}
                                    placeholder='Rate your Analytical Thinking out of 5'
                                    onChange={handleChange}
                                    className='inputField'
                                    type="number"
                                />
                            </div>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='prefer_collaborative_learning' className='font-medium'>
                                    Do you Prefer Collaborative Learning
                                </Label>

                                <Select
                                    onValueChange={(value) => handleChange({ target: { name: 'prefer_collaborative_learning', value } })}
                                    id='prefer_collaborative_learning'
                                    name='prefer_collaborative_learning'
                                    value={formData.prefer_collaborative_learning}
                                >
                                    <SelectTrigger className="inputField">
                                        <SelectValue placeholder='Select do you prefer collaborative learning' />
                                    </SelectTrigger>

                                    <SelectContent
                                        style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}
                                    >
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='prefer_reading' className='font-medium'>
                                    Do you Prefer Reading
                                </Label>

                                <Select
                                    onValueChange={(value) => handleChange({ target: { name: 'prefer_reading', value } })}
                                    id='prefer_reading'
                                    name='prefer_reading'
                                    value={formData.prefer_reading}
                                >
                                    <SelectTrigger className="inputField">
                                        <SelectValue placeholder='Select do you prefer collaborative learning' />
                                    </SelectTrigger>

                                    <SelectContent
                                        style={{ backgroundColor: `var(--background-color)`, color: `var(--text-color)` }}
                                    >
                                        <SelectItem value="Yes">Yes</SelectItem>
                                        <SelectItem value="No">No</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className='flex flex-col space-y-2'>
                                <Label htmlFor='time_commitment' className='font-medium'>
                                    Enter your Time Commitment
                                </Label>
                                <Input
                                    id='time_commitment'
                                    name='time_commitment'
                                    value={formData.time_commitment}
                                    placeholder='Enter your time commitment in a day'
                                    onChange={handleChange}
                                    className='inputField'
                                    type="number"
                                />
                            </div>
                        </div>

                        <DialogFooter className='flex'>
                            <Button
                                type='button'
                                variant="secondary"
                                onClick={() => {
                                    setShowNextDetailsDialog(false);
                                    setShowAddDetailsDialog(true);
                                }}
                                className='px-6 py-3 font-semibold rounded-lg border'>
                                Previous
                            </Button>

                            <Button
                                type='button'
                                onClick={handleSaveDetails}
                                disabled={!isSecondFormValid || loading}
                                className='px-6 py-3 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
                                {loading ? (
                                    <div className="flex flex-row gap-2 items-center">
                                        <ImSpinner2 size={20} className="animate-spin" /> Saving your details
                                    </div>
                                ) : 'Save Details'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default AddDetailForm
