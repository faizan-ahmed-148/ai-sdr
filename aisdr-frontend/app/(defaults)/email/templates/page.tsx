import TemplatePage from '@/components/TemplatePage/TemplatePage';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
    title: 'Templates',
};

const Page = () => {
    return(
        <TemplatePage />

    );
};

export default Page;
