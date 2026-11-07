'use client'
import {  useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { MdEmail } from 'react-icons/md';

const CHeckEmail = () => {
  const [timer, setTimer] = useState(60);
  const router = useRouter();
const params = useSearchParams();

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(countdown);
  }, []);

  return (
    <div className="w-full border border-gray-200 rounded-md p-8 text-center shadow-md">
      {/* Mail Icon */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-4 rounded-full">
          <MdEmail size={40} color="#000000" />
        </div>
      </div>

      {/* Heading */}
      <h2 className="text-2xl font-bold mb-4">Check your email</h2>

      {/* Message */}
      <p className="text-gray-700 mb-2">
        We sent a Reset Password link to <span className="font-semibold">{params.get('email')}</span>
      </p>

      {/* Timer */}
      <p className="text-gray-600">
        You can request a new link in{' '}
        <span className="text-purple-600 font-bold">
          {timer < 10 ? `00:0${timer}` : `00:${timer}`}
        </span>
      </p>

      {/* Go Back Button */}
      <button
        className="mt-6 text-sm text-blue-600 hover:underline"
        onClick={() => router.push('/auth/password-reset')}
      >
        Go Back
      </button>
    </div>
  );
};

export default CHeckEmail;
