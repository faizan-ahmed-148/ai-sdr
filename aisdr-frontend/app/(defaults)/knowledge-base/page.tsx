import KnowledgeBasePage from '@/components/KnowledgeBasePage/KnowledgeBasePage';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CRM Knowledge Base',
};

const KnowledgeBase = () => {
   

    return (
       <KnowledgeBasePage   />
    );
};

export default KnowledgeBase;