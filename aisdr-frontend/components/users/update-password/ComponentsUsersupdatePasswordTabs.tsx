'use client';

import React, { useState, FormEvent } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import IconUser from '@/components/icon/icon-user';
import Link from 'next/link';

const ComponentsUsersUpdatePasswordTabs = () => {
  const { user, token } = useSelector((state: any) => state.auth);
  const [tabs, setTabs] = useState<string>('updatePassword');

  // form state
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleTabs = (name: string) => {
    setTabs(name);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // client‐side validation
    if (newPassword !== confirmPassword) {
      return toast.error('Pasword and confirm password do not match.');
    }

    setIsLoading(true);
    const toastId = toast.loading('Updating password...');

    try {
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/update-password`,
        {
          currentPassword,
          password: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data?.status === 'success') {
        toast.success(data?.message || 'Password updated successfully!', { id: toastId });
        // clear form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data?.message || 'Failed to update password.', { id: toastId });
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || 'An error occurred while updating password.',
        { id: toastId }
      );
      console.error('Update password error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-5">
      {/* Breadcrumb */}
      <div className="mb-5 flex items-center justify-between">
        <ul className="flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="#" className="text-primary hover:underline">
              User
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>Update Password</span>
          </li>
        </ul>
      </div>

      {/* Tab Navigation */}
      <div>
        <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
          <li className="inline-block">
            <button
              onClick={() => toggleTabs('updatePassword')}
              className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                tabs === 'updatePassword' ? '!border-primary text-primary' : ''
              }`}
            >
              <IconUser />
              Update Password
            </button>
          </li>
        </ul>
      </div>

      {/* Update Password Form */}
      {tabs === 'updatePassword' && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-md border border-[#ebedf2] bg-white p-6 dark:border-[#191e3a] dark:bg-black"
        >
          <h6 className="mb-5 text-lg font-bold">Update Password</h6>

          <div className="mb-4">
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              placeholder="Enter your current password"
              className="form-input mt-2 w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
              className="form-input mt-2 w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              className="form-input mt-2 w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="mt-4">
            <button
              type="submit"
              className="w-full p-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all tracking-wide"
              disabled={isLoading}
            >
              {isLoading ? 'Updating…' : 'Update Password'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ComponentsUsersUpdatePasswordTabs;
