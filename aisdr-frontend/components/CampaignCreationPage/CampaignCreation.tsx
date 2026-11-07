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

const CampaignsPage = () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { token } = useSelector((state: any) => state.auth);
    const defaultParams = {
        id: null,
        name: '',
        description: '',
        templateId: null
    };

    const [isShowCampaignMenu, setIsShowCampaignMenu] = useState(false);
    const [addCampaignModal, setAddCampaignModal] = useState(false);
    const [viewCampaignModal, setViewCampaignModal] = useState(false);
    const [assignLeadsModal, setAssignLeadsModal] = useState(false);
    const [unassignLeadsModal, setUnassignLeadsModal] = useState(false);
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    // Campaign data
    const [pagedCampaigns, setPagedCampaigns] = useState<any[]>([]);
    const [searchCampaign, setSearchCampaign] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState<any>(defaultParams);
    const [isLoading, setIsLoading] = useState(true);
    const [assignedLeads, setAssignedLeads] = useState<any[]>([]);
    const [unassignedLeads, setUnassignedLeads] = useState<any[]>([]);
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [isAllSelected, setIsAllSelected] = useState(false);

    // Pagination for campaigns
    const [campaignPager, setCampaignPager] = useState({
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        totalCampaigns: 0,
    });

    // Pagination for leads in modals
    const [assignedLeadsPager, setAssignedLeadsPager] = useState({
        currentPage: 1,
        totalPages: 0,
        totalLeads: 0,
        pageSize: 10,
    });

    const [unassignedLeadsPager, setUnassignedLeadsPager] = useState({
        currentPage: 1,
        totalPages: 0,
        totalLeads: 0,
        pageSize: 10,
    });

    const [unassignModalPager, setUnassignModalPager] = useState({
        currentPage: 1,
        totalPages: 0,
        totalLeads: 0,
        pageSize: 10,
    });

    // Search states for leads in modals
    const [assignedLeadsSearch, setAssignedLeadsSearch] = useState('');
    const [unassignedLeadsSearch, setUnassignedLeadsSearch] = useState('');
    const [unassignModalSearch, setUnassignModalSearch] = useState('');

    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    // Fetch campaigns
    const fetchCampaigns = async (search = '', page = campaignPager.currentPage) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/campaigns`, {
                params: {
                    page,
                    limit: campaignPager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setPagedCampaigns(response.data.data);
            setCampaignPager(prev => ({
                ...prev,
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
                totalCampaigns: response.data.pagination.totalCampaigns
            }));
        } catch (error) {
            showMessage('Failed to fetch campaigns', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch assigned leads for a campaign (View modal)
    const fetchAssignedLeads = async (campaignId: number, page = 1, search = '') => {
        try {
            const response = await axios.get(`${BASE_URL}/api/campaigns/${campaignId}/leads?type=assigned`, {
                params: {
                    page,
                    limit: assignedLeadsPager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignedLeads(response.data.data);
            setAssignedLeadsPager({
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
                totalLeads: response.data.pagination.totalLeads,
                pageSize: response.data.pagination.limit,
            });
        } catch (error) {
            showMessage('Failed to fetch assigned leads', 'error');
        }
    };

    // Fetch unassigned leads for a campaign (Assign modal)
    const fetchUnassignedLeads = async (campaignId: number, page = 1, search = '') => {
        try {
            const response = await axios.get(`${BASE_URL}/api/campaigns/${campaignId}/leads?type=unassigned`, {
                params: {
                    page,
                    limit: unassignedLeadsPager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setUnassignedLeads(response.data.data);
            setUnassignedLeadsPager({
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
                totalLeads: response.data.pagination.totalLeads,
                pageSize: response.data.pagination.limit,
            });
        } catch (error) {
            showMessage('Failed to fetch unassigned leads', 'error');
        }
    };

    // Fetch assigned leads for Unassign modal
    const fetchAssignedLeadsForUnassign = async (campaignId: number, page = 1, search = '') => {
        try {
            const response = await axios.get(`${BASE_URL}/api/campaigns/${campaignId}/leads?type=assigned`, {
                params: {
                    page,
                    limit: unassignModalPager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignedLeads(response.data.data);
            setUnassignModalPager({
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
                totalLeads: response.data.pagination.totalLeads,
                pageSize: response.data.pagination.limit,
            });
        } catch (error) {
            showMessage('Failed to fetch assigned leads', 'error');
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, [campaignPager.currentPage]);

    // Debounced search handler
    const handleSearch = (value: string) => {
        setSearchCampaign(value);

        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(() => {
            setCampaignPager(prev => ({ ...prev, currentPage: 1 }));
            fetchCampaigns(value, 1);
        }, 400);

        setDebounceTimer(timer);
    };

    // Cleanup debounce timer
    useEffect(() => {
        return () => {
            if (debounceTimer) clearTimeout(debounceTimer);
        };
    }, [debounceTimer]);

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const viewCampaign = (item: any = null) => {
        setSelectedCampaign(item);
        setAssignedLeadsPager(prev => ({ ...prev, currentPage: 1 }));
        setAssignedLeadsSearch('');
        setTimeout(() => {
            setViewCampaignModal(true);
            fetchAssignedLeads(item.id, 1, '');
        });
    };

    const addEditCampaign = (campaign: any = null) => {
        setIsShowCampaignMenu(false);
        let json = JSON.parse(JSON.stringify(defaultParams));

        if (campaign) {
            const { id, name, description, templateId } = campaign;
            json = { id, name, description, templateId };
        }

        setParams(json);
        setAddCampaignModal(true);
    };

    const deleteCampaign = async (campaign: any) => {
        try {
            const { data } = await axios.delete(`${BASE_URL}/api/campaigns/${campaign.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (data?.status === 'success') {
                fetchCampaigns();
                showMessage('Campaign has been deleted successfully.');
            } else {
                showMessage(data?.message || 'Failed to delete campaign.', 'error');
            }
        } catch (error: any) {
            showMessage(error?.response?.data?.message || 'Failed to delete campaign', 'error');
        }
    };

    const saveCampaign = async () => {
        if (!params.name) {
            showMessage('Name is required.', 'error');
            return false;
        }

        try {
            if (params?.id) {
                // Update campaign
                const response = await axios.put(`${BASE_URL}/api/campaigns/${params.id}`, {
                    name: params.name,
                    description: params.description,
                    templateId: params.templateId
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.status === 'success') {
                    fetchCampaigns();
                    showMessage('Campaign has been updated successfully.');
                    setAddCampaignModal(false);
                } else {
                    showMessage(response?.data?.message || 'Failed to save campaign.', 'error');
                }

            } else {
                // Create campaign
                const response = await axios.post(`${BASE_URL}/api/campaigns`, {
                    name: params.name,
                    description: params.description,
                    templateId: params.templateId
                }, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.status === 'success') {
                    fetchCampaigns();
                    showMessage('Campaign has been saved successfully.');
                    setAddCampaignModal(false);
                } else {
                    showMessage(response.data.message || 'Failed to save campaign.', 'error');
                }
            }

        } catch (error: any) {
            showMessage(error?.response?.data?.message || 'Failed to save campaign', 'error');
        }
    };

    // Open assign leads modal
    const openAssignLeadsModal = (campaign: any) => {
        setSelectedCampaign(campaign);
        setUnassignedLeadsPager(prev => ({ ...prev, currentPage: 1 }));
        setUnassignedLeadsSearch('');
        setSelectedLeads([]);
        setIsAllSelected(false);
        fetchUnassignedLeads(campaign.id, 1, '');
        setAssignLeadsModal(true);
    };

    // Open unassign leads modal
    const openUnassignLeadsModal = (campaign: any) => {
        setSelectedCampaign(campaign);
        setUnassignModalPager(prev => ({ ...prev, currentPage: 1 }));
        setUnassignModalSearch('');
        setSelectedLeads([]);
        setIsAllSelected(false);
        fetchAssignedLeadsForUnassign(campaign.id, 1, '');
        setUnassignLeadsModal(true);
    };

    // Handle lead selection
    const handleLeadSelect = (leadId: number) => {
        if (selectedLeads.includes(leadId)) {
            setSelectedLeads(selectedLeads.filter(id => id !== leadId));
        } else {
            setSelectedLeads([...selectedLeads, leadId]);
        }
    };

    // Select all leads
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedLeads([]);
        } else {
            const leads = assignLeadsModal ? unassignedLeads : assignedLeads;
            setSelectedLeads(leads.map((lead: any) => lead.id));
        }
        setIsAllSelected(!isAllSelected);
    };

    // Assign leads to campaign
    const assignLeadsToCampaign = async () => {
        try {
            const response = await axios.post(`${BASE_URL}/api/campaigns/${selectedCampaign?.id}/leads/assign`, {
                lead_ids: selectedLeads,
                selection: "custom"
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                showMessage('Leads assigned successfully.');
                // setAssignLeadsModal(false);
                setSelectedLeads([]);
                setIsAllSelected(false);
                // Refresh assigned leads in view modal
                if (viewCampaignModal) {
                    fetchAssignedLeads(selectedCampaign.id, assignedLeadsPager.currentPage, assignedLeadsSearch);
                }
                // Refresh unassigned leads in assign modal
                fetchUnassignedLeads(selectedCampaign.id, unassignedLeadsPager.currentPage, unassignedLeadsSearch);
            } else {
                showMessage(response.data.message || 'Failed to assign leads.', 'error');
            }
        } catch (error: any) {
            showMessage(error?.response?.data?.message || 'Failed to assign leads', 'error');
        }
    };

    // Unassign leads from campaign
    const unassignLeadsFromCampaign = async () => {
        try {
            const response = await axios.delete(`${BASE_URL}/api/campaigns/${selectedCampaign?.id}/leads/unassign`, {
                data: { lead_ids: selectedLeads, selection: "custom" },  // Payload moved under 'data' key
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                showMessage('Leads unassigned successfully.');
                // setUnassignLeadsModal(false);
                setSelectedLeads([]);
                setIsAllSelected(false);
                // Refresh assigned leads in view modal
                if (viewCampaignModal) {
                    fetchAssignedLeads(selectedCampaign.id, assignedLeadsPager.currentPage, assignedLeadsSearch);
                }
                // Refresh assigned leads in unassign modal
                fetchAssignedLeadsForUnassign(selectedCampaign.id, unassignModalPager.currentPage, unassignModalSearch);
            } else {
                showMessage(response.data.message || 'Failed to unassign leads.', 'error');
            }
        } catch (error: any) {
            showMessage(error?.response?.data?.message || 'Failed to unassign leads', 'error');
        }
    };

    // Search handler for leads in modals
    const handleLeadsSearch = (modalType: string, value: string) => {
        let timer;

        if (debounceTimer) clearTimeout(debounceTimer);

        timer = setTimeout(() => {
            switch (modalType) {
                case 'view':
                    setAssignedLeadsSearch(value);
                    fetchAssignedLeads(selectedCampaign.id, 1, value);
                    break;
                case 'assign':
                    setUnassignedLeadsSearch(value);
                    fetchUnassignedLeads(selectedCampaign.id, 1, value);
                    break;
                case 'unassign':
                    setUnassignModalSearch(value);
                    fetchAssignedLeadsForUnassign(selectedCampaign.id, 1, value);
                    break;
            }
        }, 400);

        setDebounceTimer(timer);
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

    return (
        <div>
            <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
                <div
                    className={`panel absolute z-10 hidden h-full w-[240px] max-w-full flex-none space-y-4 p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md ${isShowCampaignMenu && '!block'
                        }`}
                >
                    <div className="flex h-full flex-col pb-16">
                        <div className="pb-5">
                            <div className="flex items-center text-center">
                                <div className="shrink-0">
                                    <IconClipboardText />
                                </div>
                                <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Campaigns</h3>
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
                                        <div className="ltr:ml-3 rtl:mr-3">All Campaigns</div>
                                    </div>
                                    <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                                        {campaignPager.totalCampaigns}
                                    </div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                        <div className="absolute bottom-0 w-full p-4 ltr:left-0 rtl:right-0">
                            <button className="btn btn-primary w-full" type="button" onClick={() => addEditCampaign()}>
                                <IconPlus className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Add New Campaign
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowCampaignMenu && '!block xl:!hidden'}`} onClick={() => setIsShowCampaignMenu(!isShowCampaignMenu)}></div>
                <div className="panel h-full flex-1 overflow-auto p-0">
                    <div className="flex h-full flex-col">
                        <div className="flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="flex items-center ltr:mr-3 rtl:ml-3">
                                <button type="button" className="block hover:text-primary ltr:mr-3 rtl:ml-3 xl:hidden" onClick={() => setIsShowCampaignMenu(!isShowCampaignMenu)}>
                                    <IconMenu />
                                </button>
                                <div className="group relative flex-1">
                                    <input
                                        type="text"
                                        className="peer form-input ltr:!pr-10 rtl:!pl-10"
                                        placeholder="Search Campaigns..."
                                        value={searchCampaign}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                                        <IconSearch />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:flex-auto sm:justify-end">
                                <p className="ltr:mr-3 rtl:ml-3">
                                    {Math.min((campaignPager.currentPage - 1) * campaignPager.pageSize + 1, campaignPager.totalCampaigns)}-
                                    {Math.min(campaignPager.currentPage * campaignPager.pageSize, campaignPager.totalCampaigns)} of {campaignPager.totalCampaigns}
                                </p>
                                <button
                                    type="button"
                                    disabled={campaignPager.currentPage === 1}
                                    className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 ltr:mr-3 rtl:ml-3 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                                    onClick={() => setCampaignPager(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                                >
                                    <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                                </button>
                                <button
                                    type="button"
                                    disabled={campaignPager.currentPage === campaignPager.totalPages}
                                    className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                                    onClick={() => setCampaignPager(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
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
                        ) : pagedCampaigns.length ? (
                            <div className="table-responsive min-h-[400px] grow overflow-y-auto sm:min-h-[300px]">
                                <table className="table-hover">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Description</th>
                                            <th>Created At</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedCampaigns.map((campaign: any) => {
                                            return (
                                                <tr className="group" key={campaign.id}>
                                                    <td>
                                                        <div className="flex items-center">
                                                            <div className="ltr:mr-3 rtl:ml-3">
                                                                <div className="grid h-10 w-10 place-content-center rounded-full bg-gray-300 text-sm font-semibold text-white dark:bg-gray-700">
                                                                    {campaign?.name?.charAt(0)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="whitespace-nowrap text-base font-semibold group-hover:text-primary">
                                                                    {campaign?.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center">
                                                            <div className="font-medium">{campaign?.description || '-'}</div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {new Date(campaign.createdAt).toLocaleDateString()}
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
                                                                            <button type="button" onClick={() => addEditCampaign(campaign)}>
                                                                                <IconPencilPaper className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                Edit
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => viewCampaign(campaign)}>
                                                                                <IconClipboardText className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                View Details
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => openAssignLeadsModal(campaign)}>
                                                                                <IconPlus className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                Assign Leads
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => openUnassignLeadsModal(campaign)}>
                                                                                <IconX className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                Unassign Leads
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => deleteCampaign(campaign)}>
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
                                No campaigns found
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Campaign Modal */}
                <Transition appear show={addCampaignModal} as={Fragment}>
                    <Dialog as="div" open={addCampaignModal} onClose={() => setAddCampaignModal(false)} className="relative z-50">
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
                                            onClick={() => setAddCampaignModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            {params.id ? 'Edit Campaign' : 'Add New Campaign'}
                                        </div>
                                        <div className="p-5">
                                            <form>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Name *</label>
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Enter Campaign Name"
                                                        className="form-input"
                                                        required
                                                        value={params.name}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="description">Description</label>
                                                    <textarea
                                                        id="description"
                                                        rows={3}
                                                        placeholder="Enter Description"
                                                        className="form-textarea"
                                                        value={params.description}
                                                        onChange={(e) => changeValue(e)}
                                                    ></textarea>
                                                </div>
                                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddCampaignModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => saveCampaign()}>
                                                        {params.id ? 'Update' : 'Add'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* View Campaign Modal */}
                <Transition appear show={viewCampaignModal} as={Fragment}>
                    <Dialog as="div" open={viewCampaignModal} onClose={() => setViewCampaignModal(false)} className="relative z-50">
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
                                    <DialogPanel className="panel w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                        <button
                                            type="button"
                                            onClick={() => setViewCampaignModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            <div>{selectedCampaign.name}</div>
                                        </div>
                                        <div className="p-5">
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Name</div>
                                                    <div className="w-3/4 font-semibold">{selectedCampaign.name}</div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Description</div>
                                                    <div className="w-3/4">
                                                        {selectedCampaign.description || '-'}
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Created At</div>
                                                    <div className="w-3/4">
                                                        {new Date(selectedCampaign.createdAt).toLocaleString()}
                                                    </div>
                                                </div>

                                                {/* Assigned Leads Section */}
                                                <div className="mt-8">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-lg font-semibold">Assigned Leads</h3>
                                                        <div className="flex items-center gap-2">
                                                            <div className="relative">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Search leads..."
                                                                    className="form-input w-48 pr-8"
                                                                    value={assignedLeadsSearch}
                                                                    onChange={(e) => {
                                                                        setAssignedLeadsSearch(e.target.value);
                                                                        handleLeadsSearch('view', e.target.value);
                                                                    }}
                                                                />
                                                                <div className="absolute right-2 top-2 text-gray-500">
                                                                    <IconSearch />
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="btn btn-primary btn-sm"
                                                                onClick={() => openAssignLeadsModal(selectedCampaign)}
                                                            >
                                                                <IconPlus className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                                                                Assign Leads
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 overflow-x-auto">
                                                        <table className="min-w-full">
                                                            <thead>
                                                                <tr>
                                                                    <th>Name</th>
                                                                    <th>Email</th>
                                                                    <th>Phone</th>
                                                                    <th>Role</th>
                                                                    <th>Company</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {assignedLeads.length > 0 ? (
                                                                    assignedLeads.map((lead: any) => (
                                                                        <tr key={lead.id}>
                                                                            <td>{lead.firstName} {lead.lastName}</td>
                                                                            <td>{lead.email}</td>
                                                                            <td>{lead?.phone || '-'}</td>
                                                                            <td>{lead?.role || '-'} </td>
                                                                            <td>{lead.company || '-'}</td>
                                                                        </tr>
                                                                    ))
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan={4} className="text-center py-4">
                                                                            No leads assigned to this campaign
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>

                                                        {/* Pagination for assigned leads */}
                                                        {assignedLeadsPager.totalPages > 1 && (
                                                            <div className="mt-4 flex items-center justify-between">
                                                                <div>
                                                                    Showing {Math.min((assignedLeadsPager.currentPage - 1) * assignedLeadsPager.pageSize + 1, assignedLeadsPager.totalLeads)}-
                                                                    {Math.min(assignedLeadsPager.currentPage * assignedLeadsPager.pageSize, assignedLeadsPager.totalLeads)} of {assignedLeadsPager.totalLeads}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        type="button"
                                                                        disabled={assignedLeadsPager.currentPage === 1}
                                                                        className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        onClick={() => fetchAssignedLeads(selectedCampaign.id, assignedLeadsPager.currentPage - 1, assignedLeadsSearch)}
                                                                    >
                                                                        Prev
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        disabled={assignedLeadsPager.currentPage === assignedLeadsPager.totalPages}
                                                                        className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                                        onClick={() => fetchAssignedLeads(selectedCampaign.id, assignedLeadsPager.currentPage + 1, assignedLeadsSearch)}
                                                                    >
                                                                        Next
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex items-center justify-end gap-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => {
                                                        setViewCampaignModal(false);
                                                        setTimeout(() => addEditCampaign(selectedCampaign), 300);
                                                    }}
                                                >
                                                    <IconPencilPaper className="ltr:mr-2 rtl:ml-2" />
                                                    Edit Campaign
                                                </button>
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setViewCampaignModal(false)}>
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

                {/* Assign Leads Modal */}
                <Transition appear show={assignLeadsModal} as={Fragment}>
                    <Dialog as="div" open={assignLeadsModal} onClose={() => setAssignLeadsModal(false)} className="relative z-50">
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
                                    <DialogPanel className="panel w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                        <button
                                            type="button"
                                            onClick={() => setAssignLeadsModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            Assign Leads to {selectedCampaign.name}
                                        </div>
                                        <div className="p-5">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="text-lg font-medium">
                                                    Select leads to assign
                                                </div>
                                                <div className="relative w-64">
                                                    <input
                                                        type="text"
                                                        placeholder="Search leads..."
                                                        className="form-input w-full pr-8"
                                                        value={unassignedLeadsSearch}
                                                        onChange={(e) => {
                                                            setUnassignedLeadsSearch(e.target.value);
                                                            handleLeadsSearch('assign', e.target.value);
                                                        }}
                                                    />
                                                    <div className="absolute right-2 top-2 text-gray-500">
                                                        <IconSearch />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox"
                                                                    checked={isAllSelected}
                                                                    onChange={handleSelectAll}
                                                                />
                                                            </th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Phone</th>
                                                            <th>Role</th>
                                                            <th>Company</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {unassignedLeads.length > 0 ? (
                                                            unassignedLeads.map((lead: any) => (
                                                                <tr key={lead.id}>
                                                                    <td>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-checkbox"
                                                                            checked={selectedLeads.includes(lead.id)}
                                                                            onChange={() => handleLeadSelect(lead.id)}
                                                                        />
                                                                    </td>
                                                                    <td>{lead.firstName} {lead.lastName}</td>
                                                                    <td>{lead.email}</td>
                                                                    <td>{lead.phone || '-'}</td>
                                                                    <td>{lead.role || '-'}</td>
                                                                    <td>{lead.company || '-'}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={5} className="text-center py-4">
                                                                    No unassigned leads found
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination for unassigned leads */}
                                            {unassignedLeadsPager.totalPages > 1 && (
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div>
                                                        Showing {Math.min((unassignedLeadsPager.currentPage - 1) * unassignedLeadsPager.pageSize + 1, unassignedLeadsPager.totalLeads)}-
                                                        {Math.min(unassignedLeadsPager.currentPage * unassignedLeadsPager.pageSize, unassignedLeadsPager.totalLeads)} of {unassignedLeadsPager.totalLeads}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={unassignedLeadsPager.currentPage === 1}
                                                            className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => fetchUnassignedLeads(selectedCampaign.id, unassignedLeadsPager.currentPage - 1, unassignedLeadsSearch)}
                                                        >
                                                            Prev
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={unassignedLeadsPager.currentPage === unassignedLeadsPager.totalPages}
                                                            className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => fetchUnassignedLeads(selectedCampaign.id, unassignedLeadsPager.currentPage + 1, unassignedLeadsSearch)}
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-6 flex items-center justify-end gap-4">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setAssignLeadsModal(false)}>
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={assignLeadsToCampaign}
                                                    disabled={selectedLeads.length === 0}
                                                >
                                                    Assign Selected Leads
                                                </button>
                                            </div>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>

                {/* Unassign Leads Modal */}
                <Transition appear show={unassignLeadsModal} as={Fragment}>
                    <Dialog as="div" open={unassignLeadsModal} onClose={() => setUnassignLeadsModal(false)} className="relative z-50">
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
                                    <DialogPanel className="panel w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                        <button
                                            type="button"
                                            onClick={() => setUnassignLeadsModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            Unassign Leads from {selectedCampaign.name}
                                        </div>
                                        <div className="p-5">
                                            <div className="mb-4 flex items-center justify-between">
                                                <div className="text-lg font-medium">
                                                    Select leads to unassign
                                                </div>
                                                <div className="relative w-64">
                                                    <input
                                                        type="text"
                                                        placeholder="Search leads..."
                                                        className="form-input w-full pr-8"
                                                        value={unassignModalSearch}
                                                        onChange={(e) => {
                                                            setUnassignModalSearch(e.target.value);
                                                            handleLeadsSearch('unassign', e.target.value);
                                                        }}
                                                    />
                                                    <div className="absolute right-2 top-2 text-gray-500">
                                                        <IconSearch />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full">
                                                    <thead>
                                                        <tr>
                                                            <th>
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-checkbox"
                                                                    checked={isAllSelected}
                                                                    onChange={handleSelectAll}
                                                                />
                                                            </th>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Phone</th>
                                                            <th>Role</th>
                                                            <th>Company</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {assignedLeads.length > 0 ? (
                                                            assignedLeads.map((lead: any) => (
                                                                <tr key={lead.id}>
                                                                    <td>
                                                                        <input
                                                                            type="checkbox"
                                                                            className="form-checkbox"
                                                                            checked={selectedLeads.includes(lead.id)}
                                                                            onChange={() => handleLeadSelect(lead.id)}
                                                                        />
                                                                    </td>
                                                                    <td>{lead.firstName} {lead.lastName}</td>
                                                                    <td>{lead.email}</td>
                                                                    <td>{lead.phone || '-'}</td>
                                                                    <td>{lead.role || '-'}</td>
                                                                    <td>{lead.company || '-'}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={5} className="text-center py-4">
                                                                    No assigned leads found
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Pagination for unassign modal */}
                                            {unassignModalPager.totalPages > 1 && (
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div>
                                                        Showing {Math.min((unassignModalPager.currentPage - 1) * unassignModalPager.pageSize + 1, unassignModalPager.totalLeads)}-
                                                        {Math.min(unassignModalPager.currentPage * unassignModalPager.pageSize, unassignModalPager.totalLeads)} of {unassignModalPager.totalLeads}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            type="button"
                                                            disabled={unassignModalPager.currentPage === 1}
                                                            className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => fetchAssignedLeadsForUnassign(selectedCampaign.id, unassignModalPager.currentPage - 1, unassignModalSearch)}
                                                        >
                                                            Prev
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={unassignModalPager.currentPage === unassignModalPager.totalPages}
                                                            className="btn btn-outline-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                            onClick={() => fetchAssignedLeadsForUnassign(selectedCampaign.id, unassignModalPager.currentPage + 1, unassignModalSearch)}
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="mt-6 flex items-center justify-end gap-4">
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setUnassignLeadsModal(false)}>
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    onClick={unassignLeadsFromCampaign}
                                                    disabled={selectedLeads.length === 0}
                                                >
                                                    Unassign Selected Leads
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

export default CampaignsPage;