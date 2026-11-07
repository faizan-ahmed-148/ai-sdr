import ComponentsUsersupdatePasswordTabs from '@/components/users/update-password/ComponentsUsersupdatePasswordTabs';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Update Password',
};

const Profile = () => {
    
    return (
        <>
           <ComponentsUsersupdatePasswordTabs />
        </>
    );
};

export default Profile;
