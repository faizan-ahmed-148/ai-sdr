import ProfileComponent from '@/components/users/profile/components-users-profile-payment-history';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Profile',
};

const Profile = () => {
    
    return (
        <>
           <ProfileComponent />
        </>
    );
};

export default Profile;
