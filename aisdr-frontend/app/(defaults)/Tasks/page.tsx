import ComponentsAppstasks from '@/components/TasksPage/components-apps-tasks';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Tasks',
};

const Page = () => {
    return (
    <ComponentsAppstasks />
);
};

export default Page;
