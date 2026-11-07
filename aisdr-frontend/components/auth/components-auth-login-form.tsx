'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { setCookie } from '@/utils/cookies';
import { useDispatch } from 'react-redux';
import { setToken } from '@/Context/Auth';

const ComponentsAuthLoginForm = () => {
    const dispatch = useDispatch()
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id.toLowerCase()]: value // Convert to lowercase to match API schema
        }));
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!formData.email || !formData.password) {
            toast.error('Both email and password are required');
            return;
        }

        setLoading(true);
        const toastId = toast.loading('Signing in...');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/api/signin`, formData);
            
            if (response?.data?.status === 'success') {
                toast.success('Login successful!', { id: toastId });
                if(response?.data?.data?.token){
                    
                    setCookie('session', response?.data?.data?.token, 30); // Expires in 30 day
                    dispatch(setToken(response?.data?.data?.token));
                    window.location.href = '/';
                }else{
                    toast.error('Failed to get token');
                }
            }else{
                toast.error(response?.data?.message, { id: toastId });
            }
        } catch (error: any) {
            let errorMessage = 'Login failed';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || error.message;
            }
            toast.error(errorMessage, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            <div>
                <label htmlFor="Email">Email</label>
                <div className="relative text-white-dark">
                    <input 
                        id="Email" 
                        type="email" 
                        placeholder="Enter Email" 
                        className="form-input ps-10 placeholder:text-white-dark" 
                        value={formData.email}
                        onChange={handleChange}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="Password">Password</label>
                <div className="relative text-white-dark">
                    <input 
                        id="Password" 
                        type="password" 
                        placeholder="Enter Password" 
                        className="form-input ps-10 placeholder:text-white-dark" 
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="btn bg-[#6200EE] text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
            >
                {loading ? 'Signing in...' : 'Sign in'}
            </button>
        </form>
    );
};

export default ComponentsAuthLoginForm;