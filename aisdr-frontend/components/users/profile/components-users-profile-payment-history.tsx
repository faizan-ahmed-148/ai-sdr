'use client'
import IconMail from '@/components/icon/icon-mail';
import IconPencilPaper from '@/components/icon/icon-pencil-paper';
import IconPhone from '@/components/icon/icon-phone';
import Link from 'next/link';
import React from 'react';
import { useSelector } from 'react-redux';


const ProfileComponent = () => {
    const {user} = useSelector((state:any) => state.auth)
    return (
        <>
              <div className="mb-5 flex items-center justify-between">
                <ul className="flex space-x-2 rtl:space-x-reverse">
                    <li>
                        <Link href="#" className="text-primary hover:underline">
                            User
                        </Link>
                    </li>
                    <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                        <span>Profile</span>
                    </li>
                </ul>
            </div>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 space-y-6 px-4 py-6">
           
            {/* Main Content - Centered */}
            <div className="mx-auto max-w-4xl">
                {/* Profile Card */}
                <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="mb-8 flex flex-col items-center justify-between sm:flex-row px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">User Profile</h2>
                        <Link
                            href="/users/user-account-settings"
                            className="btn btn-primary mt-4 flex items-center gap-2 rounded-full px-4 py-2 transition-all hover:scale-105 sm:mt-0"
                        >
                            <IconPencilPaper className="h-5 w-5" />
                            Edit Profile
                        </Link>
                    </div>

                    {/* Profile Content - Centered */}
                    <div className="flex flex-col items-center px-6 py-6">
                        {/* Profile Image */}
                        <div className="group relative mb-6">
                            <div className="relative h-32 w-32">
                                {/* Fallback with user initial */}
                                <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-white bg-primary text-4xl font-bold uppercase text-white shadow-lg dark:border-gray-800">
                                    {user?.firstName?.[0] || 'U'}
                                </div>
                            </div>
                        </div>

                        {/* Profile Info - Centered */}
                        <div className="w-full max-w-md space-y-4">
                            {/* Name */}
                            <div className="flex items-center rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4 transition-all hover:shadow-md dark:from-gray-800 dark:to-gray-700">
                                <IconPhone className="h-5 w-5 shrink-0 text-primary" />
                                <div className="ml-4">
                                    <h4 className="font-medium text-gray-600 dark:text-gray-300">Name</h4>
                                    <span className="block text-gray-800 dark:text-white">{user?.firstName} {user?.lastName}</span>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 p-4 transition-all hover:shadow-md dark:from-gray-800 dark:to-gray-700">
                                <IconMail className="h-5 w-5 shrink-0 text-primary" />
                                <div className="ml-4">
                                    <h4 className="font-medium text-gray-600 dark:text-gray-300">Email</h4>
                                    <a href={`mailto:${user?.email}`} className="block text-primary hover:underline">
                                        {user?.email || "Not Available"}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Update Password Button */}
                        <div className="mt-6 w-full max-w-md">
                            <Link
                                href="/users/update-password"
                                className="tracking-wide btn btn-secondary w-full rounded-lg px-4 py-2 text-center text-white bg-gradient-to-r from-blue-500  hover:from-indigo-600 hover:to-blue-500 transition-all"
                            >
                                Update Password
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ProfileComponent;
