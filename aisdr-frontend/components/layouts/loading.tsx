import React from 'react';

const Loading = () => {
    return (

        <div className='h-screen flex items-center justify-center'>
            <svg viewBox="0 0 64 64" className='w-16 h-16 text-primary'>
                <circle className="path-gradient" cx="32" cy="32" r="28" fill="none" stroke="url(#sGD)" stroke-width="8" />
                <path className="path-solid" d="M 32,4 A 28 28,0,0,0,32,60" fill="none" stroke="currentcolor" stroke-width="8" stroke-linecap="round" />

                <defs>
                    <linearGradient id="sGD" gradientUnits="userSpaceOnUse" x1="32" y1="0" x2="32" y2="64">
                        <stop stop-color="#128fed" offset="0.1" stop-opacity="0" className="stop1"></stop>
                        <stop stop-color="#128fed" offset=".9" stop-opacity="1" className="stop2"></stop>
                    </linearGradient>
                </defs>

                <animateTransform values="0,0,0;360,0,0" attributeName="transform" type="rotate" repeatCount="indefinite" dur="750ms"></animateTransform>
            </svg>
        </div>
    );
};

export default Loading;
