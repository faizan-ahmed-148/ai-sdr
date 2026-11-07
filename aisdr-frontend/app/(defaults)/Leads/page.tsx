import LeadPage from '@/components/LeadPage/LeadPage';
import ComponentsAppstasks from '@/components/TasksPage/components-apps-tasks';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Leads',
};

const Page = () => {
    return(
        <LeadPage />

    );
};

export default Page;
