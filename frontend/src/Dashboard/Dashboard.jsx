import React from 'react';
import Profile from './Profile';
import AppSidebar from './AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset style={{ backgroundColor: `var(--background-color)` }}>
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb >
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block font-semibold">
                                Dashboard
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold" style={{ color: `var(--text-color)` }}>My Profile</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 my-5">
                    <Link to="/userreport" className="flex-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-purple-600 hover:from-teal-500 hover:via-cyan-600 hover:to-purple-700 text-white rounded-xl p-4 shadow-md text-center cursor-pointer">
                        <span className="text-lg font-semibold">Generate your report</span>
                    </Link>
                    <div className="flex-1 bg-gradient-to-r from-green-400 via-blue-500 to-indigo-500 hover:from-green-500 hover:via-blue-600 hover:to-indigo-600 text-white rounded-xl p-4 shadow-md text-center cursor-pointer">
                        <span className="text-lg font-semibold">Generate your learning path</span>
                    </div>
                </div>
                <Profile />
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Dashboard;
