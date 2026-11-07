'use client';

import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import IconMail from '@/components/icon/icon-mail';
import { useState } from 'react';

const ComponentsAuthResetPasswordForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/forgot`,
                { email },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log(response, 'Password reset');
            
            if (response?.data?.status) {
                toast.success(response?.data?.message || 'Password reset link sent to your email!');
                setEmail('')
                router.push(`/auth/check-email?email=${email}`);
            } else {
                toast.error(response?.data?.message || 'Failed to send reset link');
            }
        } catch (error: any) {
            console.error('Forgot password error:', error);
            if (error?.response) {
                toast.error(error?.response?.data?.message || 'Failed to send reset link');
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
                <label htmlFor="Email" className="dark:text-white">
                    Email
                </label>
                <div className="relative text-white-dark">
                    <input 
                        id="Email" 
                        type="email" 
                        placeholder="Enter Email" 
                        required
                        className="form-input ps-10 placeholder:text-white-dark" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            <button 
                type="submit" 
                className="btn bg-[#6200EE] text-white !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                disabled={loading}
            >
                {loading ? 'Sending...' : 'RECOVER'}
            </button>
        </form>
    );
};

export default ComponentsAuthResetPasswordForm;