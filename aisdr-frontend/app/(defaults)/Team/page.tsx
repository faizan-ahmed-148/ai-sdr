import TeamPage from '@/components/TeamPage/TeamPage';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Team',
};

const Page = () => {
    return (
    <TeamPage />

    );
};

export default Page;
