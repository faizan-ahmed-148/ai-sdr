'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import { IRootState } from '@/store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconMenuTodo from '@/components/icon/menu/icon-menu-todo';
import IconMenuContacts from '@/components/icon/menu/icon-menu-contacts';
import IconMenuDocumentation from '@/components/icon/menu/icon-menu-documentation';
import { usePathname, useRouter } from 'next/navigation';
import { getTranslation } from '@/i18n';
import IconSettings from '../icon/icon-settings';
import IconTemplate from '../icon/IconTemplate';
import IconCampaign from '../icon/IconCampaign';
import IconMenuUsers from '../icon/menu/icon-menu-users';

const Sidebar = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { t } = getTranslation();
    const pathname = usePathname();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);

    const { user } = useSelector((state: any) => state.auth);
    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);
    const menuItems = [
        {
            title: t('Dashboard'),
            icon: <IconMenuDashboard />,
            path: '/'
        },
        {
            title: t('Leads'),
            icon: <IconMenuContacts />,
            path: '/Leads'
        },
        {
            title: t('Tasks'),
            icon: <IconMenuTodo />,
            path: '/Tasks'
        },
        {
            title: t('Team'),
            icon: <IconMenuUsers />,
            path: '/Team'
        },
        {
            title: t('Campaigns'),
            icon: <IconCampaign fill={true} />,
            children: [
                { title: t('Campaign Builder'), path: '/Campaigns/builder' },
                { title: t('Campaigns List'), path: '/Campaigns' },
                { title: t('Schedule Campaigns'), path: '/schedule/campaigns' }

            ]
        },
        {
            title: t('Templates'),
            icon: <IconTemplate fill={true} />,
            children: [
                { title: t('Email Templates'), path: '/email/templates' },
                { title: t('Personas'), path: '/Personalization' }
            ]
        },
        {
            title: t('Resources'),
            icon: <IconMenuDocumentation />,
            children: [
                { title: t('Knowledge Base'), path: '/knowledge-base' },
            ]
        },
        {
            title: t('Settings'),
            icon: <IconSettings />,
            children: [
                { title: t('Profile'), path: '/users/profile' },
                { title: t('Account Settings'), path: '/users/user-account-settings' },
            ]
        }
    ];

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };
    const handleNavigation = () => {
        if (window.innerWidth < 1024) {
            dispatch(toggleSidebar());
        }
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <Link href="/" className="main-logo  w-full  flex shrink-0 items-center mt-2">
                            <img
                                className="object-contain block dark:hidden  transform scale-[400%] max-h-[40px] w-[70%] "
                                src="/assets/logo/logo.png"
                                alt="logo"
                            />
                            <img
                                className="object-contain hidden dark:block transform scale-[400%] max-h-[40px] w-[70%]"
                                src="/assets/logo/logo2.png"
                                alt="logo"
                            />
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon bg-gray-100 dark:bg-black transform translate-x-[-12px] flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[80vh] pt-2">
                        <ul className="flex flex-col space-y-1 px-4">
                            {menuItems.map((item, index) => (
                                <li key={index}>
                                    {item.children ? (
                                        <AccordionMenu
                                            item={item}
                                            pathname={pathname}
                                            handleNavigation={handleNavigation}
                                        />
                                    ) : (
                                        <Link
                                            href={item.path}
                                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${pathname === item.path
                                                ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                                                }`}
                                            onClick={handleNavigation}
                                        >
                                            <span className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:shrink-0">
                                                {item.icon}
                                            </span>
                                            <span className="font-medium text-md">{item.title}</span>
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>

                    </PerfectScrollbar>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center space-x-3">
                            <div className="shrink-0">
                                <div className="flex h-10 w-10 p-5 items-center justify-center rounded-full border-white bg-primary text-2xl font-bold uppercase text-white shadow-lg dark:border-gray-800">
                                    {user?.firstName?.[0] || 'U'}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate dark:text-white">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-gray-500 truncate dark:text-gray-400">Admin</p>
                            </div>
                            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" onClick={() => router.push('/users/profile')}>
                                <IconSettings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
};

const AccordionMenu = ({ item, pathname, handleNavigation }: {
    item: any,
    pathname: string,
    handleNavigation: () => void
}) => {
    const [open, setOpen] = useState(false);

    // Auto-expand menu if current path is in children
    useEffect(() => {
        if (item.children.some((child: any) => child.path === pathname)) {
            setOpen(true);
        }
    }, [item.children, pathname]);

    return (
        <div className="rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
            <button
                className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all ${open ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                    }`}
                onClick={() => setOpen(!open)}
            >
                <div className="flex items-center space-x-3">
                    <span className="[&>svg]:w-5 [&>svg]:h-5 [&>svg]:shrink-0">
                        {item.icon}
                    </span>
                    <span className="font-medium text-md">{item.title}</span>
                </div>
                <IconCaretDown
                    className={`w-4 h-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <ul className="mt-1 ml-4 pl-6 space-y-1 border-l border-gray-200 dark:border-gray-700">
                    {item.children.map((child: any, idx: number) => (
                        <li key={idx}>
                            <Link
                                href={child.path}
                                className={`block px-3 py-2 rounded transition-all ${pathname === child.path
                                    ? 'text-primary font-medium'
                                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 '
                                    }`}
                                onClick={handleNavigation}
                            >
                                {child.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Sidebar;
