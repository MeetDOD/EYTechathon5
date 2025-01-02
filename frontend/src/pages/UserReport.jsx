import { userState } from '@/store/auth';
import React, { useEffect } from 'react'
import { useRecoilValue } from 'recoil';

const UserReport = () => {
    const user = useRecoilValue(userState);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = `CAREERINSIGHT | ${user?.fullName?.toUpperCase()}'s AI REPORT`;
    }, []);
    return (
        <div>

        </div>
    )
}

export default UserReport
