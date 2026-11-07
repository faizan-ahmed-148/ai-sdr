'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import IconLockDots from '@/components/icon/icon-lock-dots';
import { useState } from 'react';

const ComponentsAuthUnlockForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    
    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate token
        if (!token) {
            toast.error('Invalid reset link. Please request a new one.');
            return;
        }

        // Validate passwords
        if (!formData.password || !formData.confirmPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (formData?.password?.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/reset-password`,
                {
                    token,
                    password: formData?.password
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            if (response?.data?.status === 'success') {
                toast.success(response?.data?.message || 'Password reset successfully!');
                setFormData({ password: '', confirmPassword: '' });
                router.push('/auth/signin');
            } else {
                toast.error(response?.data?.message || 'Failed to reset password');
            }
        } catch (error: any) {
            console.error('Reset password error:', error);
            if (error?.response) {
                toast.error(error?.response?.data?.message || 'Failed to reset password');
            } else if (error?.request) {
                toast.error('Network error. Please try again.');
            } else {
                toast.error('An error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={submitForm}>
            <div>
                <label htmlFor="password" className="dark:text-white">
                    New Password
                </label>
                <div className="relative text-white-dark">
                    <input 
                        id="password" 
                        type="password" 
                        required
                        placeholder="Enter New Password" 
                        className="form-input ps-10 placeholder:text-white-dark" 
                        value={formData.password}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            <div>
                <label htmlFor="confirmPassword" className="dark:text-white">
                    Confirm Password
                </label>
                <div className="relative text-white-dark">
                    <input 
                        id="confirmPassword" 
                        type="password" 
                        required
                        placeholder="Confirm New Password" 
                        className="form-input ps-10 placeholder:text-white-dark" 
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={loading}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                </div>
            </div>
            <button 
                type="submit" 
                className="btn bg-[#6200EE] text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                disabled={loading}
            >
                {loading ? 'Resetting...' : 'RESET PASSWORD'}
            </button>
        </form>
    );
};

export default ComponentsAuthUnlockForm;