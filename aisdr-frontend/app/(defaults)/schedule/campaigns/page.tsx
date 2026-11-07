import ScheduleCampaigns from '@/components/schedule/ScheduleCampaigns';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Schedule Campaigns',
};

const Page = () => {
    return (
    <ScheduleCampaigns />
);
};

export default Page;
