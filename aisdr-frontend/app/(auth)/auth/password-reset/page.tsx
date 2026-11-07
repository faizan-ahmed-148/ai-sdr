import ComponentsAuthRegisterForm from '@/components/auth/components-auth-register-form';
import ComponentsAuthResetPasswordForm from '@/components/auth/components-auth-reset-password-form';
import IconGoogle from '@/components/icon/icon-google';
import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import { FaBrain } from 'react-icons/fa';
import { FaPhone } from "react-icons/fa6";
export const metadata: Metadata = {
    title: 'Forget Password Page',
};

const page = () => {
  
    return (
        <div className='min-h-[100vh]'>
            <div className="relative flex min-h-screen items-center justify-center bg-cover bg-center bg-no-repeat px-4 py-8 ">
                <div className="relative  flex w-full max-w-[100%] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50 md:min-h-[600px] lg:flex-row lg:gap-10 xl:gap-0">
                    {/* Left Panel - Hidden on mobile, shown on medium screens and up */}
                    <div className="hidden lg:flex flex-col relative h-full w-full items-center justify-center bg-[url(/assets/images/auth/authbg.jpg)] bg-cover bg-center bg-no-repeat p-5 dark:bg-[#060818] w-[70%] xl:-ms-28">
                        <div className="w-full max-w-[450px] px-4">

                            {/* Sales Call Box */}
                            <div className="relative flex flex-row items-center gap-2 rounded-lg bg-white w-[250px] h-[80px] p-4 translate-x-[276px] translate-y-[41px] shadow-2xl z-20">
                                <div><FaPhone size={30} color='#6200EE' /></div>
                                <div className='text-black mx-1 font-bold'>Sales Calls with Custom ICP Prospects</div>
                            </div>

                            {/* Caller Image - visible on large screens */}
                            <div className="relative mb-8  lg:block w-full max-w-[400px] translate-x-[-78px] shadow-2xl  z-5">
                                <img
                                    src="/assets/images/auth/caller.png"
                                    alt="Cover Image"
                                    className="w-full object-contain"
                                />
                            </div>

                            {/* Report Image - visible on large screens */}
                            <div className="relative rounded-lg  lg:block w-full max-w-[400px] translate-x-[200px] translate-y-[-67px] shadow-2xl z-10">
                                <img
                                    src="/assets/images/auth/authreport.png"
                                    alt="Cover Image"
                                    className="w-full object-contain"
                                />
                            </div>

                            {/* AI Generated Report Box */}
                            <div className="relative flex flex-row items-center gap-2 rounded-lg bg-white w-[210px] h-[75px] p-4 translate-x-[53px] translate-y-[-106px] shadow-2xl z-20">
                                <div><FaBrain size={30} color='#6200EE' /></div>
                                <div className='text-black mx-1 font-bold'>AI Generated Call Reports</div>
                            </div>
                        </div>

                        {/* Text Section */}
                        <div className='relative max-w-[80%] px-8 mt-6 md:mt-10 lg:mt-0'>
                            <div className='font-bold text-sm md:text-base lg:text-lg text-white mb-2 md:mb-3'>
                                Trusted by top sales teams around the world.
                            </div>
                            <div className='font-bold text-lg md:text-xl lg:text-2xl text-white'>
                                AI-driven sales coaching, performance insights, and real-time feedback — all in one secure platform.
                            </div>
                        </div>

                    </div>


                    {/* Right Panel - Login Form */}
                    <div className="w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 lg:w-1/2">
                        <div className=" w-full max-w-2xl translate-x-[-80px]">
                        <img src="/assets/logo/logo.png" alt="Logo" className="block dark:hidden h-[190px] object-contain" />
                        <img src="/assets/logo/logo2.png" alt="Logo" className="hidden dark:block h-[190px] object-contain" />
                        </div>
                        <div className="w-full max-w-2xl">
                            {/* Logo */}

                            {/* Welcome Text */}
                            <div className="text-start mb-6 md:mb-8 -mt-14">
                                <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Forgot password?
                                </h1>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
                                    No worries, we’ll send you reset instructions.
                                </p>
                            </div>

                            {/* Login Form */}
                            <div className="space-y-4 md:space-y-6">
                                <ComponentsAuthResetPasswordForm />


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default page;