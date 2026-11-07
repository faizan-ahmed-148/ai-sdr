'use client';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '@/Context/Auth';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { deleteCookie } from '@/utils/cookies';

interface IProps {
    // children?: ReactNode;
    session?: string;
    page?: string;
}
const StoreToken = ({ session, page }: IProps) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { token } = useSelector((state: any) => state.auth);
 

    if (session) {
        dispatch(setToken(session));
    }
    const fetchProfile = async () => {
        try {

            const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response?.data?.data, 'profile');

            if (response?.data?.status === 'success' && response?.data?.data) {
                dispatch(setUser(response?.data?.data));
            } else {
                dispatch(setUser(null));
                dispatch(setToken(null));
                deleteCookie('session');
                router.push('/auth/signin');

            }

        } catch (error) {
            console.error(error);
            dispatch(setUser(null));
            dispatch(setToken(null));
            deleteCookie('session');
            router.push('/auth/signin');

        }
    }

    useEffect(() => {
        if (token) {
            fetchProfile();
        }

    }, [token])
    return (
        <>
            {/* { children} */}
        </>
    );
};

export default StoreToken;
// todo
// export default appWithI18Next(ProviderComponent, ni18nConfig);
