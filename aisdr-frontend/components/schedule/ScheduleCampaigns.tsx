'use client';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconClipboardText from '@/components/icon/icon-clipboard-text';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconMenu from '@/components/icon/icon-menu';
import IconPencilPaper from '@/components/icon/icon-pencil-paper';
import IconPlus from '@/components/icon/icon-plus';
import IconSearch from '@/components/icon/icon-search';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconX from '@/components/icon/icon-x';
import { IRootState } from '@/store';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import PerfectScrollbar from 'react-perfect-scrollbar';
import axios from 'axios';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TextField from '@mui/material/TextField';
import Pagination from '@/components/Pagination';

const ScheduleCampaigns = () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { token } = useSelector((state: any) => state.auth);
    const defaultParams = {
        id: null,
        campaignId: null,
        knowledgebaseId: null,
        prompt: '',
        fromName: '',
        fromEmail: '',
        fromDesignation: '',
        sentAt: new Date(),
        status: 'PENDING'
    };

    const [isShowMenu, setIsShowMenu] = useState(false);
    const [addScheduleModal, setAddScheduleModal] = useState(false);
    const [viewScheduleModal, setViewScheduleModal] = useState(false);
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));
    const [currentStep, setCurrentStep] = useState(1);

    // Data states
    const [schedules, setSchedules] = useState<any[]>([]);
    const [pagedSchedules, setPagedSchedules] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [knowledgeBases, setKnowledgeBases] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSchedule, setSelectedSchedule] = useState<any>(defaultParams);
    const [isLoading, setIsLoading] = useState(true);

    // Pagination states
    const [campaignPager, setCampaignPager] = useState({
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        totalItems: 0,
    });

    const [knowledgeBasePager, setKnowledgeBasePager] = useState({
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        totalItems: 0,
    });

    const [pager, setPager] = useState({
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        totalItems: 0,
    });

    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
    const [campaignSearch, setCampaignSearch] = useState('');
    const [knowledgeBaseSearch, setKnowledgeBaseSearch] = useState('');

    // Fetch schedules
    const fetchSchedules = async (search = '', page = pager.currentPage) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/schedules`, {
                params: {
                    page,
                    limit: pager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setPagedSchedules(response.data.data);
            setPager(prev => ({
                ...prev,
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
                totalItems: response.data.pagination.totalSchedules
            }));
        } catch (error) {
            showMessage('Failed to fetch schedules', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch campaigns with pagination and search
    const fetchCampaigns = async (search = '', page = campaignPager.currentPage) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/campaigns`, {
                params: {
                    page,
                    limit: campaignPager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setCampaigns(response.data.data);
            setCampaignPager(prev => ({
                ...prev,
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
                totalItems: response.data.pagination.totalCampaigns
            }));
        } catch (error) {
            showMessage('Failed to fetch campaigns', 'error');
        }
    };

    // Fetch knowledge bases with pagination and search
    const fetchKnowledgeBases = async (search = '', page = knowledgeBasePager.currentPage) => {
        try {
            const response = await axios.get(`${BASE_URL}/api/knowledgebase/`, {
                params: {
                    page,
                    limit: knowledgeBasePager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setKnowledgeBases(response.data.data?.data);
            setKnowledgeBasePager(prev => ({
                ...prev,
                currentPage: response.data.data.pagination.page,
                totalPages: response.data.data.pagination.totalPages,
                totalItems: response.data.data.pagination.total
            }));
        } catch (error) {
            showMessage('Failed to fetch knowledge bases', 'error');
        }
    };

    useEffect(() => {
        fetchSchedules();
        fetchCampaigns();
        fetchKnowledgeBases();
    }, [pager.currentPage]);

    // Debounced search handler for schedules
    const handleSearch = (value: string) => {
        setSearchTerm(value);

        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(() => {
            setPager(prev => ({ ...prev, currentPage: 1 }));
            fetchSchedules(value, 1);
        }, 400);

        setDebounceTimer(timer);
    };

    // Debounced search handler for campaigns
    const handleCampaignSearch = (value: string) => {
        setCampaignSearch(value);

        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(() => {
            setCampaignPager(prev => ({ ...prev, currentPage: 1 }));
            fetchCampaigns(value, 1);
        }, 400);

        setDebounceTimer(timer);
    };

    // Debounced search handler for knowledge bases
    const handleKnowledgeBaseSearch = (value: string) => {
        setKnowledgeBaseSearch(value);

        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(() => {
            setKnowledgeBasePager(prev => ({ ...prev, currentPage: 1 }));
            fetchKnowledgeBases(value, 1);
        }, 400);

        setDebounceTimer(timer);
    };

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, [debounceTimer]);

    const viewSchedule = (item: any = null) => {
        setSelectedSchedule(item);
        setTimeout(() => {
            setViewScheduleModal(true);
        });
    };

    const addSchedule = () => {
        setParams(JSON.parse(JSON.stringify(defaultParams)));
        setCurrentStep(1);
        setAddScheduleModal(true);
    };

    const editSchedule = (schedule: any = null) => {
        setParams({
            id: schedule.id,
            campaignId: schedule.campaignId,
            knowledgebaseId: schedule.knowledgebaseId,
            prompt: schedule.prompt,
            fromName: schedule.fromName,
            fromEmail: schedule.fromEmail,
            fromDesignation: schedule.fromDesignation,
            sentAt: new Date(schedule.sentAt),
            status: schedule.status
        });
        setCurrentStep(1);
        setAddScheduleModal(true);
    };

    const deleteSchedule = async (schedule: any) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-danger',
                cancelButton: 'btn btn-outline-primary ltr:mr-3 rtl:ml-3',
                popup: 'sweet-alerts',
            },
            buttonsStyling: false,
        });
        swalWithBootstrapButtons
            .fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, cancel!',
                reverseButtons: true,
                padding: '2em',
            })
            .then(async (result) => {
                if (result.value) {
                    try {
                        const { data } = await axios.delete(`${BASE_URL}/api/schedules/${schedule.id}`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            }
                        });
                        if (data?.status === 'success') {
                            fetchSchedules();
                            showMessage('Schedule has been deleted successfully.');
                        } else {
                            showMessage(data?.message || 'Failed to delete schedule.', 'error');
                        }
                    } catch (error: any) {
                        showMessage(error?.response?.data?.message || 'Failed to delete schedule', 'error');
                    }
                }
            });
    };

    const saveSchedule = async () => {
        if (!params.campaignId) {
            showMessage('Please select a campaign', 'error');
            return false;
        }
        if (!params.knowledgebaseId) {
            showMessage('Please select a knowledge base', 'error');
            return false;
        }
        if (!params.sentAt) {
            showMessage('Please select a date and time', 'error');
            return false;
        }
        if (!params.prompt) {
            showMessage('Please enter a prompt', 'error');
            return false;
        }
        if (!params.fromName) {
            showMessage('Please enter sender name', 'error');
            return false;
        }
        if (!params.fromEmail) {
            showMessage('Please enter sender email', 'error');
            return false;
        }

        try {
            const payload = {
                campaignId: params.campaignId,
                knowledgebaseId: params.knowledgebaseId,
                prompt: params.prompt,
                fromName: params.fromName,
                fromEmail: params.fromEmail,
                fromDesignation: params.fromDesignation,
                sentAt: params.sentAt.toISOString()
            };

            if (params?.id) {
                // Update schedule
                const response = await axios.put(`${BASE_URL}/api/schedules/${params.id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.status === 'success') {
                    fetchSchedules();
                    showMessage('Schedule has been updated successfully.');
                    setAddScheduleModal(false);
                } else {
                    showMessage(response?.data?.message || 'Failed to save schedule.', 'error');
                }
            } else {
                // Create schedule
                const response = await axios.post(`${BASE_URL}/api/schedules`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.status === 'success') {
                    fetchSchedules();
                    showMessage('Schedule has been saved successfully.');
                    setAddScheduleModal(false);
                } else {
                    showMessage(response.data.message || 'Failed to save schedule.', 'error');
                }
            }
        } catch (error: any) {
            showMessage(error?.response?.data?.message || 'Failed to save schedule', 'error');
        }
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const handleNextStep = () => {
        if (currentStep === 1 && !params.campaignId) {
            showMessage('Please select a campaign', 'error');
            return;
        }
        if (currentStep === 2 && !params.knowledgebaseId) {
            showMessage('Please select a knowledge base', 'error');
            return;
        }
        setCurrentStep(currentStep + 1);
    };

    const handlePrevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const handleCampaignSelect = (campaignId: number) => {
        setParams({ ...params, campaignId });
    };

    const handleKnowledgeBaseSelect = (knowledgebaseId: number) => {
        setParams({ ...params, knowledgebaseId });
    };

    const handleDateTimeChange = (newValue: Date | null) => {
        if (newValue) {
            setParams({ ...params, sentAt: newValue });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setParams({ ...params, [name]: value });
    };

    const getCampaignName = (id: number) => {
        const campaign = campaigns.find(c => c.id === id);
        return campaign ? campaign.name : 'Unknown Campaign';
    };

    const getKnowledgeBaseName = (id: number) => {
        const kb = knowledgeBases.find(k => k.id === id);
        return kb ? kb.title : 'Unknown Knowledge Base';
    };

    return (
        <div>
            <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
                <div
                    className={`panel absolute z-10 hidden h-full w-[240px] max-w-full flex-none space-y-4 p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md ${isShowMenu && '!block'
                        }`}
                >
                    <div className="flex h-full flex-col pb-16">
                        <div className="pb-5">
                            <div className="flex items-center text-center">
                                <div className="shrink-0">
                                    <IconClipboardText />
                                </div>
                                <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Schedules</h3>
                            </div>
                        </div>
                        <div className="mb-5 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                        <PerfectScrollbar className="relative h-full grow ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5">
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary`}
                                >
                                    <div className="flex items-center">
                                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                                        <div className="ltr:ml-3 rtl:mr-3">All Schedules</div>
                                    </div>
                                    <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                                        {pager.totalItems}
                                    </div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                        <div className="absolute bottom-0 w-full p-4 ltr:left-0 rtl:right-0">
                            <button className="btn btn-primary w-full" type="button" onClick={() => addSchedule()}>
                                <IconPlus className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Add New Schedule
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowMenu && '!block xl:!hidden'}`} onClick={() => setIsShowMenu(!isShowMenu)}></div>
                <div className="panel h-full flex-1 overflow-auto p-0">
                    <div className="flex h-full flex-col">
                        <div className="flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="flex items-center ltr:mr-3 rtl:ml-3">
                                <button type="button" className="block hover:text-primary ltr:mr-3 rtl:ml-3 xl:hidden" onClick={() => setIsShowMenu(!isShowMenu)}>
                                    <IconMenu />
                                </button>
                                <div className="group relative flex-1">
                                    <input
                                        type="text"
                                        className="peer form-input ltr:!pr-10 rtl:!pl-10"
                                        placeholder="Search Schedules..."
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                                        <IconSearch />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:flex-auto sm:justify-end">
                                <p className="ltr:mr-3 rtl:ml-3">
                                    {Math.min((pager.currentPage - 1) * pager.pageSize + 1, pager.totalItems)}-
                                    {Math.min(pager.currentPage * pager.pageSize, pager.totalItems)} of {pager.totalItems}
                                </p>
                                <button
                                    type="button"
                                    disabled={pager.currentPage === 1}
                                    className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 ltr:mr-3 rtl:ml-3 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                                    onClick={() => setPager(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                >
                                    <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                                </button>
                                <button
                                    type="button"
                                    disabled={pager.currentPage === pager.totalPages}
                                    className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                                    onClick={() => setPager(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                                >
                                    <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
                                </button>
                            </div>
                        </div>
                        <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

                        {isLoading ? (
                            <div className="flex h-full min-h-[400px] items-center justify-center text-lg font-semibold sm:min-h-[300px]">
                                <span className="animate-spin border-2 border-primary border-l-transparent rounded-full w-10 h-10 inline-block align-middle m-auto"></span>
                            </div>
                        ) : pagedSchedules.length ? (
                            <div className="table-responsive min-h-[400px] grow overflow-y-auto sm:min-h-[300px]">
                                <table className="table-hover">
                                    <thead>
                                        <tr>
                                            <th>Campaign</th>
                                            <th>Knowledge Base</th>
                                            <th>Prompt</th>
                                            <th>Scheduled At</th>
                                            <th>Status</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedSchedules.map((schedule: any) => {
                                            return (
                                                <tr className="group" key={schedule.id}>
                                                    <td>
                                                        <div className="whitespace-nowrap font-semibold group-hover:text-primary">
                                                            {getCampaignName(schedule.campaignId)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="whitespace-nowrap font-semibold group-hover:text-primary">
                                                            {getKnowledgeBaseName(schedule.knowledgebaseId)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="max-w-xs truncate">
                                                            {schedule.prompt}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {new Date(schedule.sentAt).toLocaleString()}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${schedule.status === 'PENDING' ? 'bg-primary' : schedule.status === 'SENT' ? 'bg-success' : 'bg-danger'}`}>
                                                            {schedule.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="mx-auto flex w-max items-center justify-center">
                                                            <div className="dropdown">
                                                                <Dropdown
                                                                    offset={[0, 5]}
                                                                    placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                                    btnClassName="align-middle"
                                                                    button={<IconHorizontalDots className="rotate-90 opacity-70" />}
                                                                >
                                                                    <ul className="whitespace-nowrap">
                                                                        <li>
                                                                            <button type="button" onClick={() => editSchedule(schedule)}>
                                                                                <IconPencilPaper className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                Edit
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => viewSchedule(schedule)}>
                                                                                <IconClipboardText className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                View Details
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => deleteSchedule(schedule)}>
                                                                                <IconTrashLines className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                Delete
                                                                            </button>
                                                                        </li>
                                                                    </ul>
                                                                </Dropdown>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex h-full min-h-[400px] items-center justify-center text-lg font-semibold sm:min-h-[300px]">
                                No schedules found
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Schedule Modal */}
                <Transition appear show={addScheduleModal} as={Fragment}>
                    <Dialog as="div" open={addScheduleModal} onClose={() => setAddScheduleModal(false)} className="relative z-50">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-[black]/60" />
                        </TransitionChild>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center px-4 py-8">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <DialogPanel className="panel w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                        <button
                                            type="button"
                                            onClick={() => setAddScheduleModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            {params.id ? 'Edit Schedule' : 'Add New Schedule'}
                                        </div>
                                        <div className="p-5">
                                            {/* Step Indicator */}
                                            <div className="mb-5 flex items-center justify-center">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary ${currentStep >= 1 ? 'bg-primary text-white' : ''}`}>
                                                    1
                                                </div>
                                                <div className={`h-[2px] w-16 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary ${currentStep >= 2 ? 'bg-primary text-white' : ''}`}>
                                                    2
                                                </div>
                                                <div className={`h-[2px] w-16 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-300'}`}></div>
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary ${currentStep >= 3 ? 'bg-primary text-white' : ''}`}>
                                                    3
                                                </div>
                                            </div>

                                            {/* Step 1: Select Campaign */}
                                            {currentStep === 1 && (
                                                <div>
                                                    <h3 className="mb-4 text-lg font-semibold">Select Campaign</h3>
                                                    <div className="mb-4">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                className="form-input h-10 w-full rounded-lg border-gray-300 pl-10 pr-4"
                                                                placeholder="Search campaigns..."
                                                                value={campaignSearch}
                                                                onChange={(e) => handleCampaignSearch(e.target.value)}
                                                            />
                                                            <span className="absolute left-3 top-2.5">
                                                                <IconSearch className="h-5 w-5 text-gray-400" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {campaigns.length > 0 ? (
                                                            <>
                                                                {campaigns.map(campaign => (
                                                                    <div
                                                                        key={campaign.id}
                                                                        className={`flex cursor-pointer items-center rounded border p-3 ${params.campaignId === campaign.id ? 'border-primary bg-primary-light dark:bg-primary-dark' : 'border-gray-200'}`}
                                                                        onClick={() => handleCampaignSelect(campaign.id)}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            checked={params.campaignId === campaign.id}
                                                                            onChange={() => handleCampaignSelect(campaign.id)}
                                                                            className="h-4 w-4 text-primary"
                                                                        />
                                                                        <label className="ml-2 flex-1 cursor-pointer">
                                                                            <div className="font-medium">{campaign.name}</div>
                                                                            {campaign.description && (
                                                                                <div className="text-xs text-gray-500">{campaign.description}</div>
                                                                            )}
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                                <Pagination
                                                                    currentPage={campaignPager.currentPage}
                                                                    totalPages={campaignPager.totalPages}
                                                                    onPageChange={(page) => {
                                                                        setCampaignPager(prev => ({ ...prev, currentPage: page }));
                                                                        fetchCampaigns(campaignSearch, page);
                                                                    }}
                                                                    className="mt-4"
                                                                />
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-4 text-gray-500">
                                                                No campaigns found
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 2: Select Knowledge Base */}
                                            {currentStep === 2 && (
                                                <div>
                                                    <h3 className="mb-4 text-lg font-semibold">Select Knowledge Base</h3>
                                                    <div className="mb-4">
                                                        <div className="relative">
                                                            <input
                                                                type="text"
                                                                className="form-input h-10 w-full rounded-lg border-gray-300 pl-10 pr-4"
                                                                placeholder="Search knowledge bases..."
                                                                value={knowledgeBaseSearch}
                                                                onChange={(e) => handleKnowledgeBaseSearch(e.target.value)}
                                                            />
                                                            <span className="absolute left-3 top-2.5">
                                                                <IconSearch className="h-5 w-5 text-gray-400" />
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {knowledgeBases.length > 0 ? (
                                                            <>
                                                                {knowledgeBases.map(kb => (
                                                                    <div
                                                                        key={kb.id}
                                                                        className={`flex cursor-pointer items-center rounded border p-3 ${params.knowledgebaseId === kb.id ? 'border-primary bg-primary-light dark:bg-primary-dark' : 'border-gray-200'}`}
                                                                        onClick={() => handleKnowledgeBaseSelect(kb.id)}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            checked={params.knowledgebaseId === kb.id}
                                                                            onChange={() => handleKnowledgeBaseSelect(kb.id)}
                                                                            className="h-4 w-4 text-primary"
                                                                        />
                                                                        <label className="ml-2 flex-1 cursor-pointer">
                                                                            <div className="font-medium">{kb.title}</div>
                                                                            <div className="text-xs text-gray-500">{kb.description}</div>
                                                                        </label>
                                                                    </div>
                                                                ))}
                                                                <Pagination
                                                                    currentPage={knowledgeBasePager.currentPage}
                                                                    totalPages={knowledgeBasePager.totalPages}
                                                                    onPageChange={(page) => {
                                                                        setKnowledgeBasePager(prev => ({ ...prev, currentPage: page }));
                                                                        fetchKnowledgeBases(knowledgeBaseSearch, page);
                                                                    }}
                                                                    className="mt-4"
                                                                />
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-4 text-gray-500">
                                                                No knowledge bases found
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: Schedule Details */}
                                            {currentStep === 3 && (
                                                <div>
                                                    <h3 className="mb-4 text-lg font-semibold">Schedule Details</h3>
                                                    <div className="mb-5">
                                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                            <DateTimePicker
                                                                label="Select Date & Time"
                                                                value={params.sentAt}
                                                                onChange={handleDateTimeChange}
                                                                slotProps={{ textField: { fullWidth: true } }}
                                                                minDateTime={new Date()}
                                                            />
                                                        </LocalizationProvider>
                                                    </div>
                                                    
                                                    <div className="mb-4">
                                                        <label htmlFor="prompt" className="mb-1 block">Prompt</label>
                                                        <textarea
                                                            id="prompt"
                                                            name="prompt"
                                                            rows={3}
                                                            className="form-textarea min-h-[100px]"
                                                            placeholder="Enter your prompt..."
                                                            value={params.prompt}
                                                            onChange={handleInputChange}
                                                        />
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                        <div>
                                                            <label htmlFor="fromName" className="mb-1 block">From Name</label>
                                                            <input
                                                                id="fromName"
                                                                type="text"
                                                                name="fromName"
                                                                className="form-input"
                                                                placeholder="Sender name"
                                                                value={params.fromName}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="fromEmail" className="mb-1 block">From Email</label>
                                                            <input
                                                                id="fromEmail"
                                                                type="email"
                                                                name="fromEmail"
                                                                className="form-input"
                                                                placeholder="Sender email"
                                                                value={params.fromEmail}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label htmlFor="fromDesignation" className="mb-1 block">From Designation</label>
                                                            <input
                                                                id="fromDesignation"
                                                                type="text"
                                                                name="fromDesignation"
                                                                className="form-input"
                                                                placeholder="Sender designation"
                                                                value={params.fromDesignation}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-4 rounded border p-3">
                                                        <h4 className="mb-2 font-medium">Summary</h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex">
                                                                <span className="w-24 text-gray-500">Campaign:</span>
                                                                <span>{getCampaignName(params.campaignId)}</span>
                                                            </div>
                                                            <div className="flex">
                                                                <span className="w-24 text-gray-500">Knowledge Base:</span>
                                                                <span>{getKnowledgeBaseName(params.knowledgebaseId)}</span>
                                                            </div>
                                                            <div className="flex">
                                                                <span className="w-24 text-gray-500">Prompt:</span>
                                                                <span className="truncate max-w-xs">{params.prompt}</span>
                                                            </div>
                                                            <div className="flex">
                                                                <span className="w-24 text-gray-500">From:</span>
                                                                <span>{params.fromName} ({params.fromEmail})</span>
                                                            </div>
                                                            <div className="flex">
                                                                <span className="w-24 text-gray-500">Scheduled:</span>
                                                                <span>{params.sentAt.toLocaleString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-8 flex items-center justify-between">
                                                <div>
                                                    {currentStep > 1 && (
                                                        <button type="button" className="btn btn-outline-primary" onClick={handlePrevStep}>
                                                            Previous
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center">
                                                    {currentStep < 3 ? (
                                                        <button type="button" className="btn btn-primary" onClick={handleNextStep}>
                                                            Next
                                                        </button>
                                                    ) : (
                                                        <button type="button" className="btn btn-primary" onClick={saveSchedule}>
                                                            {params.id ? 'Update' : 'Save'} Schedule
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* View Schedule Modal */}
                <Transition appear show={viewScheduleModal} as={Fragment}>
                    <Dialog as="div" open={viewScheduleModal} onClose={() => setViewScheduleModal(false)} className="relative z-50">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-[black]/60" />
                        </TransitionChild>

                        <div className="fixed inset-0 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center px-4 py-8">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <DialogPanel className="panel w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                        <button
                                            type="button"
                                            onClick={() => setViewScheduleModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            <div>Schedule Details</div>
                                        </div>
                                        <div className="p-5">
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Campaign</div>
                                                    <div className="w-3/4 font-semibold">{getCampaignName(selectedSchedule.campaignId)}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Knowledge Base</div>
                                                    <div className="w-3/4">{getKnowledgeBaseName(selectedSchedule.knowledgebaseId)}</div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Prompt</div>
                                                    <div className="w-3/4">{selectedSchedule.prompt}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">From Name</div>
                                                    <div className="w-3/4">{selectedSchedule.fromName}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">From Email</div>
                                                    <div className="w-3/4">{selectedSchedule.fromEmail}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">From Designation</div>
                                                    <div className="w-3/4">{selectedSchedule.fromDesignation}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Scheduled At</div>
                                                    <div className="w-3/4">{new Date(selectedSchedule.sentAt).toLocaleString()}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Status</div>
                                                    <div className="w-3/4">
                                                        <span className={`badge ${selectedSchedule.status === 'PENDING' ? 'bg-primary' : selectedSchedule.status === 'SENT' ? 'bg-success' : 'bg-danger'}`}>
                                                            {selectedSchedule.status}
                                                        </span>
                                                    </div>
                                                </div>
                                                {selectedSchedule.error && (
                                                    <div className="flex items-start">
                                                        <div className="w-1/4 text-gray-500 dark:text-gray-400">Error</div>
                                                        <div className="w-3/4 text-danger">{selectedSchedule.error}</div>
                                                    </div>
                                                )}
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Created At</div>
                                                    <div className="w-3/4">
                                                        {new Date(selectedSchedule.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Updated At</div>
                                                    <div className="w-3/4">
                                                        {new Date(selectedSchedule.updatedAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex items-center justify-end gap-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => {
                                                        setViewScheduleModal(false);
                                                        setTimeout(() => editSchedule(selectedSchedule), 300);
                                                    }}
                                                >
                                                    <IconPencilPaper className="ltr:mr-2 rtl:ml-2" />
                                                    Edit Schedule
                                                </button>
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setViewScheduleModal(false)}>
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    );
};

export default ScheduleCampaigns;