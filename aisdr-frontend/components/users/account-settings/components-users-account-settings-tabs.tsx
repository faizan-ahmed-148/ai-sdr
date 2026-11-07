'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import { useSelector} from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';
import IconHome from '@/components/icon/icon-home';

const ComponentsUsersAccountSettingsTabs = () => {
  const { user, token } = useSelector((state: any) => state.auth);
  const [tabs, setTabs] = useState<string>('home');
  const [firstName, setFirstName] = useState<string>(user?.firstName || '');
  const [lastName, setLastName] = useState<string>(user?.lastName || '');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const toggleTabs = (name: string) => {
    setTabs(name);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const profileUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`;
    const payload = { firstName, lastName };
    const toastId = toast.loading('Updating profile...');
    try {
      const response = await axios.put(profileUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response?.data?.status === 'success') {
        toast.success(response?.data?.message || 'Profile updated successfully!', { id: toastId });
      } else {
        toast.error(response?.data?.message, { id: toastId });
      }

    } catch (error:any) {
      toast.error(error?.response?.data?.message || 'Failed to update profile', { id: toastId });
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };
useEffect(() => {
  if (user?.firstName) {
    setFirstName(user.firstName);
  }
  if (user?.lastName) {
    setLastName(user.lastName);
  }
}, [user?.firstName, user]);

  return (
    <div className="pt-5">
      <div className="mb-5 flex items-center justify-between">
        <h5 className="text-lg font-semibold dark:text-white-light">Settings</h5>
      </div>
      <div>
        <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
          <li className="inline-block">
            <button
              onClick={() => toggleTabs('home')}
              className={`flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                tabs === 'home' ? '!border-primary text-primary' : ''
              }`}
            >
              <IconHome />
              Profile Settings
            </button>
          </li>
        </ul>
      </div>

      {tabs === 'home' && (
        <form
          onSubmit={handleSubmit}
          className="mb-5 rounded-md border border-[#ebedf2] bg-white p-4 dark:border-[#191e3a] dark:bg-black"
        >
          <h6 className="mb-5 text-lg font-bold">General Information</h6>
          <div className="flex flex-col sm:flex-row">
            <div className="mb-5 w-full sm:w-2/12 ltr:sm:mr-4 rtl:sm:ml-4 flex justify-center">
              <div className="flex h-[200px] w-[200px] items-center justify-center rounded-full border-4 border-white bg-primary text-9xl font-bold uppercase text-white shadow-lg dark:border-gray-800">
                {user?.firstName?.[0] || 'U'}
              </div>
            </div>

            <div className="w-[100%] flex-col space-y-4 gap-4 mx-4">
              <div>
                <label htmlFor="name">First Name</label>
                <input
                  id="firstname"
                  type="text"
                  placeholder="Enter your name"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
               <div>
                <label htmlFor="name">Last Name</label>
                <input
                  id="lastname"
                  type="text"
                  placeholder="Enter your name"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-input bg-gray-100 dark:bg-gray-800"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div className="mt-3 sm:col-span-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default ComponentsUsersAccountSettingsTabs;
