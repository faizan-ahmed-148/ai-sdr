'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import IconUser from '@/components/icon/icon-user';
import IconBuilding from '@/components/icon/icon-building';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ComponentsAuthRegisterForm = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'individual' | 'company'>('individual');
    
    // Form data for individual
    const [individualForm, setIndividualForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    
    // Form data for company
    const [companyForm, setCompanyForm] = useState({
        firstName: '',
        lastName: '',
        companyName: '',
        email: '',
        password: ''
    });

    const handleIndividualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setIndividualForm(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setCompanyForm(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (activeTab === 'individual') {
            // Validate individual form
            if (!individualForm.firstName || !individualForm.lastName || !individualForm.email || !individualForm.password) {
                toast.error('All fields are required');
                return;
            }
            
            setLoading(true);
            const toastId = toast.loading('Creating individual account...');
            
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/signup`, {
                    ...individualForm,
                    accountType: 'individual'
                });
                
                if (response?.data?.status === 'success') {
                    toast.success('Account created successfully!', { id: toastId });
                    router.push('/auth/signin');
                } else {
                    toast.error(response?.data?.message, { id: toastId });
                }
            } catch (error: any) {
                let errorMessage = 'Registration failed';
                if (axios.isAxiosError(error)) {
                    errorMessage = error.response?.data?.message || error.message;
                }
                toast.error(errorMessage, { id: toastId });
            } finally {
                setLoading(false);
            }
        } else {
            // Validate company form
            if (!companyForm.firstName || !companyForm.lastName || !companyForm.companyName || !companyForm.email || !companyForm.password) {
                toast.error('All fields are required');
                return;
            }
            
            setLoading(true);
            const toastId = toast.loading('Creating company account...');
            
            try {
                const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/signup`, {
                    ...companyForm,
                    accountType: 'company'
                });
                
                if (response?.data?.status === 'success') {
                    toast.success('Company account created successfully!', { id: toastId });
                    router.push('/auth/signin');
                } else {
                    toast.error(response?.data?.message, { id: toastId });
                }
            } catch (error: any) {
                let errorMessage = 'Registration failed';
                if (axios.isAxiosError(error)) {
                    errorMessage = error.response?.data?.message || error.message;
                }
                toast.error(errorMessage, { id: toastId });
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            {/* Tabs */}
            <div className="flex border-b border-white-light dark:border-[#191e3a]">
                <button
                    type="button"
                    className={`flex-1 py-2 font-semibold uppercase ${activeTab === 'individual' ? 'text-primary border-b-2 border-primary' : ''}`}
                    onClick={() => setActiveTab('individual')}
                >
                    Individual
                </button>
                <button
                    type="button"
                    className={`flex-1 py-2 font-semibold uppercase ${activeTab === 'company' ? 'text-primary border-b-2 border-primary' : ''}`}
                    onClick={() => setActiveTab('company')}
                >
                    Company
                </button>
            </div>
            
            {/* Individual Form */}
            {activeTab === 'individual' && (
                <>
                    <div>
                        <label htmlFor="firstName">First Name</label>
                        <div className="relative text-white-dark">
                            <input 
                                id="firstName" 
                                type="text" 
                                placeholder="Enter First Name" 
                                className="form-input ps-10 placeholder:text-white-dark" 
                                value={individualForm.firstName}
                                onChange={handleIndividualChange}
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconUser fill={true} />
                            </span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="lastName">Last Name</label>
                        <div className="relative text-white-dark">
                            <input 
                                id="lastName" 
                                type="text" 
                                placeholder="Enter Last Name" 
                                className="form-input ps-10 placeholder:text-white-dark" 
                                value={individualForm.lastName}
                                onChange={handleIndividualChange}
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconUser fill={true} />
                            </span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email">Email Address</label>
                        <div className="relative text-white-dark">
                            <input 
                                id="email" 
                                type="email" 
                                placeholder="Enter Email" 
                                className="form-input ps-10 placeholder:text-white-dark" 
                                value={individualForm.email}
                                onChange={handleIndividualChange}
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconMail fill={true} />
                            </span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <div className="relative text-white-dark">
                            <input 
                                id="password" 
                                type="password" 
                                placeholder="Enter Password" 
                                className="form-input ps-10 placeholder:text-white-dark" 
                                value={individualForm.password}
                                onChange={handleIndividualChange}
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconLockDots fill={true} />
                            </span>
                        </div>
                    </div>
                </>
            )}
            
            {/* Company Form */}
            {activeTab === 'company' && (
                <>
                    <div>
                        <label htmlFor="firstName">First Name</label>
                        <div className="relative text-white-dark">
                            <input 
                                id="firstName" 
                                type="text" 
                                placeholder="Enter First Name" 
                                className="form-input ps-10 placeholder:text-white-dark" 
                                value={companyForm.firstName}
                                onChange={handleCompanyChange}
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconUser fill={true} />
                            </span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="lastName">Last Name</label>
                        <div className="relative text-white-dark">
                            <input 
                                id="lastName" 
                                type="text" 
                                placeholder="Enter Last Name" 
                                className="form-input ps-10 placeholder:text-white-dark" 
                                value={companyForm.lastName}
                                onChange={handleCompanyChange}
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconUser fill={true} />
                            </span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="companyName">Company Name</label>
                        <div className="relative text-white-dark">
                            <input 
                                id="companyName" 
                                type="text" 
                                placeholder="Enter Company Name" 
                                className="form-input ps-10 placeholder:text-white-dark" 
                                value={companyForm.companyName}
                                onChange={handleCompanyChange}
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconBuilding fill={true} />
                            </span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email">Business Email Address</label>
                        <div className="relative text-white-dark">
                            <input 
                                id="email" 
                                type="email" 
                                placeholder="Enter Business Email" 
                                className="form-input ps-10 placeholder:text-white-dark" 
                                value={companyForm.email}
                                onChange={handleCompanyChange}
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconMail fill={true} />
                            </span>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <div className="relative text-white-dark">
                            <input 
                                id="password" 
                                type="password" 
                                placeholder="Enter Password" 
                                className="form-input ps-10 placeholder:text-white-dark" 
                                value={companyForm.password}
                                onChange={handleCompanyChange}
                            />
                            <span className="absolute start-4 top-1/2 -translate-y-1/2">
                                <IconLockDots fill={true} />
                            </span>
                        </div>
                    </div>
                </>
            )}
            
            <button 
                type="submit" 
                disabled={loading}
                className="btn bg-[#6200EE] text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
            >
                {loading ? 'Processing...' : 'Sign Up'}
            </button>
        </form>
    );
};

export default ComponentsAuthRegisterForm;