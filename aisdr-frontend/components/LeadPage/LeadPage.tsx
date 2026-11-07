'use client';
import Dropdown from '@/components/dropdown';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconClipboardText from '@/components/icon/icon-clipboard-text';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconListCheck from '@/components/icon/icon-list-check';
import IconMenu from '@/components/icon/icon-menu';
import IconPencilPaper from '@/components/icon/icon-pencil-paper';
import IconPlus from '@/components/icon/icon-plus';
import IconRestore from '@/components/icon/icon-restore';
import IconSearch from '@/components/icon/icon-search';
import IconSquareRotated from '@/components/icon/icon-square-rotated';
import IconStar from '@/components/icon/icon-star';
import IconThumbUp from '@/components/icon/icon-thumb-up';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconUser from '@/components/icon/icon-user';
import IconX from '@/components/icon/icon-x';
import IconBuilding from '@/components/icon/icon-restore';
import IconPhone from '@/components/icon/icon-phone';
import IconMoney from '@/components/icon/icon-star';
import IconCalendar from '@/components/icon/icon-calendar';
import { IRootState } from '@/store';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import PerfectScrollbar from 'react-perfect-scrollbar';
import axios from 'axios';
import IconCloudUpload from '@/components/icon/icon-file';
const LeadsPage = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token } = useSelector((state: any) => state.auth);
  const defaultParams = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    website: '',
    phone: '',
    additionalFields: {
      value: '',
      status: 'new',
      source: 'website',
      lastContacted: '',
      notes: ''
    }
  };

  const [selectedTab, setSelectedTab] = useState('');
  const [isShowLeadMenu, setIsShowLeadMenu] = useState(false);
  const [addLeadModal, setAddLeadModal] = useState(false);
  const [viewLeadModal, setViewLeadModal] = useState(false);
  const [assignCampaignModal, setAssignCampaignModal] = useState(false);
  const [unassignCampaignModal, setUnassignCampaignModal] = useState(false);
  const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

  // Lead data
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<any[]>([]);
  const [pagedLeads, setPagedLeads] = useState<any[]>([]);
  const [searchLead, setSearchLead] = useState('');
  const [selectedLead, setSelectedLead] = useState<any>(defaultParams);
  const [isLoading, setIsLoading] = useState(true);

  const [assignableCampaigns, setAssignableCampaigns] = useState<any[]>([]);
  const [assignedCampaigns, setAssignedCampaigns] = useState<any[]>([]);
  const [selectedAssignCampaigns, setSelectedAssignCampaigns] = useState<number[]>([]);
  const [selectedUnassignCampaigns, setSelectedUnassignCampaigns] = useState<number[]>([]);
  const [assignSearch, setAssignSearch] = useState('');
  const [unassignSearch, setUnassignSearch] = useState('');
  const [assignPager, setAssignPager] = useState({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalCampaigns: 0,
  });
  const [unassignPager, setUnassignPager] = useState({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalCampaigns: 0,
  });
  const [isAssignAll, setIsAssignAll] = useState(false);
  const [isUnassignAll, setIsUnassignAll] = useState(false);

  const [pager, setPager] = useState({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalLeads: 0,
  });
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [importModal, setImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      showMessage('Please upload a CSV file only', 'error');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      showMessage('Please upload a CSV file only', 'error');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      showMessage('Please select a file', 'error');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axios.post(`${BASE_URL}/api/import/leads`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        showMessage('Leads imported successfully!');
        setImportModal(false);
        setSelectedFile(null);
        fetchLeads();
      } else {
        showMessage(response.data.message || 'Failed to import leads', 'error');
      }
    } catch (error: any) {
      showMessage(error?.response?.data?.message || 'Failed to import leads', 'error');
    } finally {
      setIsUploading(false);
    }
  };

 

  const fetchLeads = async (search = '', page = pager.currentPage) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/leads`, {
        params: {
          page,
          limit: pager.pageSize,
          status: selectedTab === '' ? undefined : selectedTab,
          search: search || undefined,
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setPagedLeads(response.data.data);
      setAllLeads(response.data.data);
      setPager(prev => ({
        ...prev,
        currentPage: response.data.pagination?.currentPage,
        totalPages: response.data.pagination?.totalPages,
        totalLeads: response.data.pagination?.totalLeads
      }));
    } catch (error) {
      showMessage('Failed to fetch leads', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch assignable campaigns (not assigned to lead)
  const fetchAssignableCampaigns = async (leadId: number, search = '', page = assignPager.currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/leads/${leadId}/campaigns?type=unassigned`, {
        params: {
          page,
          limit: assignPager.pageSize,
          search: search || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAssignableCampaigns(response.data.data);
      setAssignPager({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        pageSize: response.data.pagination.limit,
        totalCampaigns: response.data.pagination.totalLeads,
      });
      setSelectedAssignCampaigns([]);
      setIsAssignAll(false);
    } catch (error) {
      showMessage('Failed to fetch assignable campaigns', 'error');
    }
  };

  // Fetch assigned campaigns for a lead
  const fetchAssignedCampaigns = async (leadId: number, search = '', page = unassignPager.currentPage) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/leads/${leadId}/campaigns?type=assigned`, {
        params: {
          page,
          limit: unassignPager.pageSize,
          search: search || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setAssignedCampaigns(response.data.data);
      setUnassignPager({
        currentPage: response.data.pagination.currentPage,
        totalPages: response.data.pagination.totalPages,
        pageSize: response.data.pagination.limit,
        totalCampaigns: response.data.pagination.totalLeads,
      });
      setSelectedUnassignCampaigns([]);
      setIsUnassignAll(false);
    } catch (error) {
      showMessage('Failed to fetch assigned campaigns', 'error');
    }
  };


  useEffect(() => {
    fetchLeads();
  }, [pager.currentPage, selectedTab]);

  const handleSearch = (value: string) => {
    setSearchLead(value);

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      setPager(prev => ({ ...prev, currentPage: 1 }));
      fetchLeads(value, 1);
    }, 400);

    setDebounceTimer(timer);
  };

  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);


  const changeValue = (e: any) => {
    const { value, id } = e.target;
    setParams({ ...params, [id]: value });
  };

  const changeAdditionalField = (e: any) => {
    const { value, id } = e.target;
    setParams({
      ...params,
      additionalFields: {
        ...params.additionalFields,
        [id]: value
      }
    });
  };

  const tabChanged = () => {
    setIsShowLeadMenu(false);
  };

  const viewLead = (item: any = null) => {
    setSelectedLead(item);
    if (item?.id) {
      fetchAssignedCampaigns(item.id);
    }
    setTimeout(() => {
      setViewLeadModal(true);
    });
  };

  const addEditLead = (lead: any = null) => {
    setIsShowLeadMenu(false);
    let json = JSON.parse(JSON.stringify(defaultParams));

    if (lead) {
      const { id, firstName, lastName, email, company, website, phone, additionalFields, role } = lead;
      json = {
        id,
        firstName,
        lastName,
        email,
        company,
        website,
        phone,
        role,
        additionalFields: additionalFields || defaultParams.additionalFields
      };
    }

    setParams(json);
    setAddLeadModal(true);
  };

  const deleteLead = async (lead: any) => {
    try {
      const { data } = await axios.delete(`${BASE_URL}/api/leads/${lead.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (data?.status === 'success') {
        fetchLeads();
        showMessage('Lead has been deleted successfully.');
      } else {
        showMessage(data?.message || 'Failed to delete lead.');
      }
    } catch (error: any) {
      showMessage(error?.response?.data?.message || 'Failed to delete lead', 'error');
    }
  };

  const saveLead = async () => {
    if (!params.firstName) {
      showMessage('First name is required.', 'error');
      return false;
    }
    if (!params.email) {
      showMessage('Email is required.', 'error');
      return false;
    }
    if (!params.phone) {
      showMessage('Phone is required.', 'error');
      return false;
    }
    if (!params.company) {
      showMessage('Company is required.', 'error');
      return false;
    }
    if (!params.role) {
      showMessage('Role is required.', 'error');
      return false;
    }


    try {
      if (params?.id) {
        let payload = { ...params };
        delete payload.id;
        const response = await axios.put(`${BASE_URL}/api/leads/${params.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.status === 'success') {
          fetchLeads()
          showMessage('Lead has been updated successfully.');
          setAddLeadModal(false);
        } else {
          showMessage(response?.data?.message || 'Failed to save lead.', 'error');
        }

      } else {
        let payload = { ...params };
        delete payload.id;
        const response = await axios.post(`${BASE_URL}/api/leads`, payload, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        if (response.data.status === 'success') {
          fetchLeads()
          showMessage('Lead has been saved successfully.');
          setAddLeadModal(false);
        } else {
          showMessage(response.data.message || 'Failed to save lead.', 'error');
        }
      }

    } catch (error: any) {
      showMessage(error?.response?.data?.message || 'Failed to save lead', 'error');
    }
  };

  const openAssignCampaignModal = (lead: any) => {
    setSelectedLead(lead);
    fetchAssignableCampaigns(lead.id);
    setAssignCampaignModal(true);
  };

  const openUnassignCampaignModal = (lead: any) => {
    setSelectedLead(lead);
    fetchAssignedCampaigns(lead.id);
    setUnassignCampaignModal(true);
  };

  const handleAssignSearch = (value: string) => {
    setAssignSearch(value);
    if (selectedLead) {
      fetchAssignableCampaigns(selectedLead.id, value);
    }
  };

  const handleUnassignSearch = (value: string) => {
    setUnassignSearch(value);
    if (selectedLead) {
      fetchAssignedCampaigns(selectedLead.id, value);
    }
  };

  const toggleAssignCampaign = (campaignId: number) => {
    setSelectedAssignCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  const toggleUnassignCampaign = (campaignId: number) => {
    setSelectedUnassignCampaigns(prev => {
      if (prev.includes(campaignId)) {
        return prev.filter(id => id !== campaignId);
      } else {
        return [...prev, campaignId];
      }
    });
  };

  const toggleAssignAll = () => {
    if (isAssignAll) {
      setSelectedAssignCampaigns([]);
    } else {
      const allIds = assignableCampaigns.map(c => c.id);
      setSelectedAssignCampaigns(allIds);
    }
    setIsAssignAll(!isAssignAll);
  };

  const toggleUnassignAll = () => {
    if (isUnassignAll) {
      setSelectedUnassignCampaigns([]);
    } else {
      const allIds = assignedCampaigns.map(c => c.id);
      setSelectedUnassignCampaigns(allIds);
    }
    setIsUnassignAll(!isUnassignAll);
  };

 // ... existing code ...

const assignCampaigns = async () => {
  if (!selectedLead || selectedAssignCampaigns.length === 0) {
    showMessage('Please select at least one campaign', 'error');
    return;
  }

  try {
    const response = await axios.post(
      `${BASE_URL}/api/leads/${selectedLead?.id}/campaigns/assign`,
      {
        selection: 'custom',
        campaign_ids: selectedAssignCampaigns
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.status === 'success') {
      showMessage('Campaigns assigned successfully!');
      // Refresh both campaign lists
      fetchAssignableCampaigns(selectedLead.id, assignSearch, assignPager.currentPage);
      fetchAssignedCampaigns(selectedLead.id, unassignSearch, unassignPager.currentPage);
    } else {
      showMessage(response.data.message || 'Failed to assign campaigns', 'error');
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || 'Failed to assign campaigns', 'error');
  }
};

const unassignCampaigns = async () => {
  if (!selectedLead || selectedUnassignCampaigns.length === 0) {
    showMessage('Please select at least one campaign', 'error');
    return;
  }

  try {
    const response = await axios.delete(
      `${BASE_URL}/api/leads/${selectedLead?.id}/campaigns/unassign`,
      {
      data: {
        selection: 'custom',
        campaign_ids: selectedUnassignCampaigns
      },
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (response.data.status === 'success') {
      showMessage('Campaigns unassigned successfully!');
      fetchAssignableCampaigns(selectedLead.id, assignSearch, assignPager.currentPage);
      fetchAssignedCampaigns(selectedLead.id, unassignSearch, unassignPager.currentPage);
    } else {
      showMessage(response.data.message || 'Failed to unassign campaigns', 'error');
    }
  } catch (error: any) {
    showMessage(error?.response?.data?.message || 'Failed to unassign campaigns', 'error');
  }
};

// ... rest of the component ...

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="badge badge-outline-primary">New</span>;
      case 'contacted':
        return <span className="badge badge-outline-info">Contacted</span>;
      case 'qualified':
        return <span className="badge badge-outline-success">Qualified</span>;
      case 'closed':
        return <span className="badge badge-outline-success">Closed</span>;
      case 'lost':
        return <span className="badge badge-outline-danger">Lost</span>;
      default:
        return <span className="badge badge-outline-info">{status}</span>;
    }
  };

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'website':
        return <span className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Website</span>;
      case 'referral':
        return <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Referral</span>;
      case 'social':
        return <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">Social</span>;
      case 'event':
        return <span className="badge bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Event</span>;
      case 'email':
        return <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Email</span>;
      default:
        return <span className="badge badge-outline-info">{source}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };


const fieldRenderers = {
  source: (v: unknown) => getSourceBadge((v ?? '') as string),
  lastContacted: (v: unknown) => (v ? formatDate(v as any | number | Date) : 'Not contacted'),
  value: (v: unknown) => <span className="font-semibold">{(v as React.ReactNode) ?? '-'}</span>,
} as const;

type RendererKey = keyof typeof fieldRenderers;

const hasRenderer = (k: string): k is RendererKey => k in fieldRenderers;

const prettyLabel = (key: string) =>
  key
    .replace(/([A-Z])/g, ' $1') // camelCase -> "camel Case"
    .replace(/^./, (s) => s.toUpperCase());

const renderValue = (key: string, value: unknown): React.ReactNode => {
  // Use a custom renderer if we have one
  if (hasRenderer(key)) return fieldRenderers[key](value);

  // Fallbacks for other types
  if (value === null || value === undefined || value === '') return '-';
  if (Array.isArray(value)) return value.length ? value.join(', ') : '-';
  if (typeof value === 'object') {
    try {
      return <pre className="whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>;
    } catch {
      return String(value);
    }
  }
  return String(value);
};


  return (
    <div>
      <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
        <div
          className={`panel absolute z-10 hidden h-full w-[240px] max-w-full flex-none space-y-4 p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md ${isShowLeadMenu && '!block'
            }`}
        >
          <div className="flex h-full flex-col pb-16">
            <div className="pb-5">
              <div className="flex items-center text-center">
                <div className="shrink-0">
                  <IconClipboardText />
                </div>
                <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Leads Pipeline</h3>
              </div>
            </div>
            <div className="mb-5 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
            <PerfectScrollbar className="relative h-full grow ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5">
              <div className="space-y-1">
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${selectedTab === '' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                    }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('');
                  }}
                >
                  <div className="flex items-center">
                    <IconListCheck className="h-4.5 w-4.5 shrink-0" />
                    <div className="ltr:ml-3 rtl:mr-3">All Leads</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allLeads && allLeads.length}
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${selectedTab === 'new' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                    }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('new');
                  }}
                >
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-primary"></div>
                    <div className="ltr:ml-3 rtl:mr-3">New</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allLeads && allLeads.filter((d) => d.additionalFields?.status === 'new').length}
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${selectedTab === 'contacted' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                    }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('contacted');
                  }}
                >
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-info"></div>
                    <div className="ltr:ml-3 rtl:mr-3">Contacted</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allLeads && allLeads.filter((d) => d.additionalFields?.status === 'contacted').length}
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${selectedTab === 'qualified' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                    }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('qualified');
                  }}
                >
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-success"></div>
                    <div className="ltr:ml-3 rtl:mr-3">Qualified</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allLeads && allLeads.filter((d) => d.additionalFields?.status === 'qualified').length}
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${selectedTab === 'closed' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                    }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('closed');
                  }}
                >
                  <div className="flex items-center">
                    <IconThumbUp className="h-5 w-5 shrink-0" />
                    <div className="ltr:ml-3 rtl:mr-3">Closed</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allLeads && allLeads.filter((d) => d.additionalFields?.status === 'closed').length}
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${selectedTab === 'lost' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                    }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('lost');
                  }}
                >
                  <div className="flex items-center">
                    <IconSquareRotated className="h-5 w-5 shrink-0 fill-danger" />
                    <div className="ltr:ml-3 rtl:mr-3">Lost</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allLeads && allLeads.filter((d) => d.additionalFields?.status === 'lost').length}
                  </div>
                </button>
              </div>
            </PerfectScrollbar>
            <div className="absolute bottom-0 w-full p-4 ltr:left-0 rtl:right-0">
              <button className="btn btn-primary w-full" type="button" onClick={() => addEditLead()}>
                <IconPlus className="shrink-0 ltr:mr-2 rtl:ml-2" />
                Add New Lead
              </button>
              <button className="btn btn-outline-primary w-full mt-5 " type="button" onClick={() => setImportModal(true)}>
                <IconCloudUpload className="shrink-0 ltr:mr-2 rtl:ml-2" />
                Import Leads
              </button>
            </div>
          </div>
        </div>
        <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowLeadMenu && '!block xl:!hidden'}`} onClick={() => setIsShowLeadMenu(!isShowLeadMenu)}></div>
        <div className="panel h-full flex-1 overflow-auto p-0">
          <div className="flex h-full flex-col">
            <div className="flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center ltr:mr-3 rtl:ml-3">
                <button type="button" className="block hover:text-primary ltr:mr-3 rtl:ml-3 xl:hidden" onClick={() => setIsShowLeadMenu(!isShowLeadMenu)}>
                  <IconMenu />
                </button>
                <div className="group relative flex-1">
                  <input
                    type="text"
                    className="peer form-input ltr:!pr-10 rtl:!pl-10"
                    placeholder="Search Leads..."
                    value={searchLead}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                    <IconSearch />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center sm:flex-auto sm:justify-end">
                <p className="ltr:mr-3 rtl:ml-3">
                  {Math.min((pager.currentPage - 1) * pager.pageSize + 1, pager.totalLeads)}-
                  {Math.min(pager.currentPage * pager.pageSize, pager.totalLeads)} of {pager.totalLeads}
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
            ) : pagedLeads && pagedLeads?.length ? (
              <div className="table-responsive min-h-[400px] grow overflow-y-auto sm:min-h-[300px]">
                <table className="table-hover">
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Role</th>
                      <th>Company</th>
                      <th>Website</th>
                      <th>Status</th>
                      <th>Last Contact</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedLeads && pagedLeads.map((lead: any) => {
                      return (
                        <tr className="group cursor-pointer" key={lead.id} >
                          <td>
                            <div className="flex items-center">
                              <div className="ltr:mr-3 rtl:ml-3">
                                <div className="grid h-10 w-10 place-content-center rounded-full bg-gray-300 text-sm font-semibold text-white dark:bg-gray-700">
                                  {lead?.firstName?.charAt(0)}
                                </div>
                              </div>
                              <div>
                                <div className="whitespace-nowrap text-base font-semibold group-hover:text-primary">
                                  {lead?.firstName} {lead?.lastName}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <IconPhone className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                                  {lead?.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center">
                              <div className="font-medium">{lead?.role || '-'}</div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center">
                              <div className="font-medium">{lead?.company || '-'}</div>
                            </div>
                          </td>
                          <td className="font-semibold">
                            <div className="flex items-center">
                              {lead?.website || '-'}
                            </div>
                          </td>
                          <td>{getStatusBadge(lead.additionalFields?.status || 'new')}</td>
                          <td>
                            {lead.additionalFields?.lastContacted ? (
                              <div className="flex items-center">
                                <IconCalendar className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                                {formatDate(lead.additionalFields?.lastContacted)}
                              </div>
                            ) : (
                              <span className="text-gray-400">Not contacted</span>
                            )}
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
                                      <button type="button" onClick={(e) => { e.stopPropagation(); addEditLead(lead); }}>
                                        <IconPencilPaper className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Edit
                                      </button>
                                    </li>
                                    <li>
                                      <button type="button" onClick={(e) => { e.stopPropagation(); viewLead(lead); }}>
                                        <IconClipboardText className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        View Details
                                      </button>
                                    </li>
                                    <li>
                                      <button type="button" onClick={(e) => { e.stopPropagation(); openAssignCampaignModal(lead); }}>
                                        <IconRestore className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Assign Campaign
                                      </button>
                                    </li>
                                    <li>
                                      <button type="button" onClick={(e) => { e.stopPropagation(); openUnassignCampaignModal(lead); }}>
                                        <IconRestore className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Unassign Campaign
                                      </button>
                                    </li>
                                    <li>
                                      <button type="button" onClick={(e) => { e.stopPropagation(); deleteLead(lead); }}>
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
                No leads found
              </div>
            )}
          </div>
        </div>

        <Transition appear show={addLeadModal} as={Fragment}>
          <Dialog as="div" open={addLeadModal} onClose={() => setAddLeadModal(false)} className="relative z-50">
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
                  <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                    <button
                      type="button"
                      onClick={() => setAddLeadModal(false)}
                      className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                    >
                      <IconX />
                    </button>
                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                      {params.id ? 'Edit Lead' : 'Add New Lead'}
                    </div>
                    <div className="p-5">
                      <form>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="mb-5">
                            <label htmlFor="firstName">First Name *</label>
                            <input
                              id="firstName"
                              type="text"
                              placeholder="Enter First Name"
                              className="form-input"
                              value={params.firstName}
                              onChange={(e) => changeValue(e)}
                            />
                          </div>
                          <div className="mb-5">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                              id="lastName"
                              type="text"
                              placeholder="Enter Last Name"
                              className="form-input"
                              value={params.lastName}
                              onChange={(e) => changeValue(e)}
                            />
                          </div>
                        </div>
                        <div className="mb-5">
                          <label htmlFor="email">Email *</label>
                          <input
                            id="email"
                            type="email"
                            placeholder="Enter Email"
                            className="form-input"
                            value={params.email}
                            onChange={(e) => changeValue(e)}
                          />
                        </div>
                        <div className="mb-5">
                          <label htmlFor="phone">Phone *</label>
                          <input
                            id="phone"
                            type="text"
                            placeholder="Enter Phone Number"
                            className="form-input"
                            value={params.phone}
                            onChange={(e) => changeValue(e)}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="mb-5">
                            <label htmlFor="role">Role *</label>
                            <input
                              id="role"
                              type="text"
                              placeholder="Enter Role"
                              className="form-input"
                              value={params.role}
                              onChange={(e) => changeValue(e)}
                            />
                          </div>
                          <div className="mb-5">
                            <label htmlFor="company">Company *</label>
                            <input
                              id="company"
                              type="text"
                              placeholder="Enter Company"
                              className="form-input"
                              value={params.company}
                              onChange={(e) => changeValue(e)}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="mb-5">
                            <label htmlFor="website">Website</label>
                            <input
                              id="website"
                              type="text"
                              placeholder="Enter Website"
                              className="form-input"
                              value={params.website}
                              onChange={(e) => changeValue(e)}
                            />
                          </div>
                         
                          <div className="mb-5">
                            <label htmlFor="source">Source</label>
                            <select
                              id="source"
                              className="form-select"
                              value={params.additionalFields?.source || 'website'}
                              onChange={(e) => changeAdditionalField(e)}
                            >
                              <option value="website">Website</option>
                              <option value="referral">Referral</option>
                              <option value="social">Social Media</option>
                              <option value="event">Event</option>
                              <option value="email">Email</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="mb-5">
                            <label htmlFor="status">Status</label>
                            <select
                              id="status"
                              className="form-select"
                              value={params.additionalFields?.status || 'new'}
                              onChange={(e) => changeAdditionalField(e)}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="qualified">Qualified</option>
                              <option value="closed">Closed</option>
                              <option value="lost">Lost</option>
                            </select>
                          </div>
                          <div className="mb-5">
                            <label htmlFor="lastContacted">Last Contacted</label>
                            <input
                              id="lastContacted"
                              type="date"
                              className="form-input"
                              value={params.additionalFields?.lastContacted || ''}
                              onChange={(e) => changeAdditionalField(e)}
                            />
                          </div>
                        </div>
                        <div className="mb-5">
                          <label htmlFor="notes">Notes</label>
                          <textarea
                            id="notes"
                            rows={3}
                            placeholder="Enter notes"
                            className="form-textarea"
                            value={params.additionalFields?.notes || ''}
                            onChange={(e) => changeAdditionalField(e)}
                          ></textarea>
                        </div>
                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                          <button type="button" className="btn btn-outline-danger" onClick={() => setAddLeadModal(false)}>
                            Cancel
                          </button>
                          <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => saveLead()}>
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

        <Transition appear show={viewLeadModal} as={Fragment}>
          <Dialog as="div" open={viewLeadModal} onClose={() => setViewLeadModal(false)} className="relative z-50">
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
                  <DialogPanel className="panel w-full max-w-5xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                    <button
                      type="button"
                      onClick={() => setViewLeadModal(false)}
                      className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                    >
                      <IconX />
                    </button>
                    <div className="flex flex-wrap items-center gap-2 bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                      <div>{selectedLead.firstName} {selectedLead.lastName}</div>
                      {getStatusBadge(selectedLead.additionalFields?.status || 'new')}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center mb-7">
                        <div className="grid h-16 w-16 place-content-center rounded-full bg-gray-300 text-xl font-semibold text-white dark:bg-gray-700">
                          {selectedLead.firstName?.charAt(0)}
                        </div>
                        <div className="ltr:ml-4 rtl:mr-4">
                          <h2 className="text-xl font-bold">{selectedLead.firstName} {selectedLead.lastName}</h2>
                          <p className="text-primary">{selectedLead.company}</p>
                        </div>
                      </div>

  <div className="grid gap-4 md:grid-cols-2">
  {/* Email */}
  <div className="grid grid-cols-[1fr_3fr] gap-2 items-center">
    <div className="text-gray-500 dark:text-gray-400">Email</div>
    <div>
      {selectedLead.email ? (
        <a href={`mailto:${selectedLead.email}`} className="text-primary hover:underline">
          {selectedLead.email}
        </a>
      ) : (
        <span className="text-gray-400">Not provided</span>
      )}
    </div>
  </div>

  {/* Phone */}
  <div className="grid grid-cols-[1fr_3fr] gap-2 items-center">
    <div className="text-gray-500 dark:text-gray-400">Phone</div>
    <div>{selectedLead.phone || '-'}</div>
  </div>

  {/* All additional fields */}
  {selectedLead.additionalFields && Object.keys(selectedLead.additionalFields).length > 0 ? (
    Object.entries(selectedLead.additionalFields).map(([key, value]) => {
      const isWide = key === 's'; // add more keys if needed
      return (
        <div
          key={key}
          className={`grid grid-cols-[1fr_3fr] gap-2 ${isWide ? 'md:col-span-2 items-start' : 'items-center'}`}
        >
          <div className="text-gray-500 dark:text-gray-400">{prettyLabel(key)}</div>
          <div className={isWide ? 'text-gray-700 dark:text-gray-300' : ''}>
            {renderValue(key, value)}
          </div>
        </div>
      );
    })
  ) : (
    <div className="grid grid-cols-[1fr_3fr] gap-2 items-center md:col-span-2">
      <div className="text-gray-500 dark:text-gray-400">Additional</div>
      <div className="text-gray-400">No additional fields</div>
    </div>
  )}
</div>


                      <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Assigned Campaigns</h3>
                        <div className="mb-5 flex items-center">
                          <div className="group relative flex-1">
                            <input
                              type="text"
                              className="peer form-input ltr:!pr-10 rtl:!pl-10"
                              placeholder="Search Campaigns..."
                              value={unassignSearch}
                              onChange={(e) => handleUnassignSearch(e.target.value)}
                            />
                            <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                              <IconSearch />
                            </div>
                          </div>
                        </div>

                        <div className="table-responsive">
                          <table className="table-hover">
                            <thead>
                              <tr>
                                <th>Campaign</th>
                                <th>Description</th>
                                <th>Created At</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignedCampaigns.length > 0 ? (
                                assignedCampaigns.map((campaign: any) => (
                                  <tr key={campaign.id}>
                                    <td>{campaign?.name}</td>
                                    <td>{campaign?.description || '-'}</td>
                                  <td>{formatDate(campaign?.createdAt)}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="text-center py-4">
                                    No campaigns assigned
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            Showing {Math.min((unassignPager.currentPage - 1) * unassignPager.pageSize + 1, unassignPager.totalCampaigns)}-
                            {Math.min(unassignPager.currentPage * unassignPager.pageSize, unassignPager.totalCampaigns)} of {unassignPager.totalCampaigns}
                          </div>
                          <div className="flex items-center">
                            <button
                              type="button"
                              disabled={unassignPager.currentPage === 1}
                              className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 ltr:mr-3 rtl:ml-3 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                              onClick={() => {
                                setUnassignPager(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                                fetchAssignedCampaigns(selectedLead.id, unassignSearch, unassignPager.currentPage - 1);
                              }}
                            >
                              <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                            </button>
                            <button
                              type="button"
                              disabled={unassignPager.currentPage === unassignPager.totalPages}
                              className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                              onClick={() => {
                                setUnassignPager(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                                fetchAssignedCampaigns(selectedLead.id, unassignSearch, unassignPager.currentPage + 1);
                              }}
                            >
                              <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-8 flex items-center justify-end gap-4">
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          onClick={() => {
                            setViewLeadModal(false);
                            setTimeout(() => addEditLead(selectedLead), 300);
                          }}
                        >
                          <IconPencilPaper className="ltr:mr-2 rtl:ml-2" />
                          Edit Lead
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => setViewLeadModal(false)}>
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

        {/* Assign Campaign Modal */}
        <Transition appear show={assignCampaignModal} as={Fragment}>
          <Dialog as="div" open={assignCampaignModal} onClose={() => setAssignCampaignModal(false)} className="relative z-50">
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
                      onClick={() => setAssignCampaignModal(false)}
                      className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                    >
                      <IconX />
                    </button>
                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                      Assign Campaign to {selectedLead?.firstName}
                    </div>
                    <div className="p-5">
                      <div className="mb-5 flex items-center">
                        <div className="group relative flex-1">
                          <input
                            type="text"
                            className="peer form-input ltr:!pr-10 rtl:!pl-10"
                            placeholder="Search Campaigns..."
                            value={assignSearch}
                            onChange={(e) => handleAssignSearch(e.target.value)}
                          />
                          <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                            <IconSearch />
                          </div>
                        </div>
                      </div>
                      <div className="table-responsive">
                        <table className="table-hover">
                          <thead>
                            <tr>
                              <th>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={isAssignAll}
                                    onChange={toggleAssignAll}
                                  />
                                  <span className="ltr:ml-2 rtl:mr-2">Campaign</span>
                                </div>
                              </th>
                              <th>Description</th>
                              <th>Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignableCampaigns.length > 0 ? (
                              assignableCampaigns.map((campaign: any) => (
                                <tr key={campaign.id}>
                                  <td>
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={selectedAssignCampaigns.includes(campaign.id)}
                                        onChange={() => toggleAssignCampaign(campaign.id)}
                                      />
                                      <span className="ltr:ml-2 rtl:mr-2">{campaign.name}</span>
                                    </div>
                                  </td>
                                  <td>{campaign.description || '-'}</td>
                                  <td>{formatDate(campaign.createdAt)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="text-center py-4">
                                  No campaigns found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          Showing {Math.min((assignPager.currentPage - 1) * assignPager.pageSize + 1, assignPager.totalCampaigns)}-
                          {Math.min(assignPager.currentPage * assignPager.pageSize, assignPager.totalCampaigns)} of {assignPager.totalCampaigns}
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            disabled={assignPager.currentPage === 1}
                            className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 ltr:mr-3 rtl:ml-3 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                            onClick={() => {
                              setAssignPager(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                              if (selectedLead) {
                                fetchAssignableCampaigns(selectedLead.id, assignSearch, assignPager.currentPage - 1);
                              }
                            }}
                          >
                            <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                          </button>
                          <button
                            type="button"
                            disabled={assignPager.currentPage === assignPager.totalPages}
                            className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                            onClick={() => {
                              setAssignPager(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                              if (selectedLead) {
                                fetchAssignableCampaigns(selectedLead.id, assignSearch, assignPager.currentPage + 1);
                              }
                            }}
                          >
                            <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                        <button type="button" className="btn btn-outline-danger" onClick={() => setAssignCampaignModal(false)}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary ltr:ml-4 rtl:mr-4"
                          onClick={assignCampaigns}
                          disabled={selectedAssignCampaigns.length === 0}
                        >
                          Assign Selected
                        </button>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        {/* Unassign Campaign Modal */}
        <Transition appear show={unassignCampaignModal} as={Fragment}>
          <Dialog as="div" open={unassignCampaignModal} onClose={() => setUnassignCampaignModal(false)} className="relative z-50">
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
                      onClick={() => setUnassignCampaignModal(false)}
                      className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                    >
                      <IconX />
                    </button>
                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                      Unassign Campaign from {selectedLead?.firstName}
                    </div>
                    <div className="p-5">
                      <div className="mb-5 flex items-center">
                        <div className="group relative flex-1">
                          <input
                            type="text"
                            className="peer form-input ltr:!pr-10 rtl:!pl-10"
                            placeholder="Search Campaigns..."
                            value={unassignSearch}
                            onChange={(e) => handleUnassignSearch(e.target.value)}
                          />
                          <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                            <IconSearch />
                          </div>
                        </div>
                      </div>
                      <div className="table-responsive">
                        <table className="table-hover">
                          <thead>
                            <tr>
                              <th>
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={isUnassignAll}
                                    onChange={toggleUnassignAll}
                                  />
                                  <span className="ltr:ml-2 rtl:mr-2">Campaign</span>
                                </div>
                              </th>
                              <th>Description</th>
                              <th>Created At</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignedCampaigns.length > 0 ? (
                              assignedCampaigns.map((campaign: any) => (
                                <tr key={campaign.id}>
                                  <td>
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        className="form-checkbox"
                                        checked={selectedUnassignCampaigns.includes(campaign.id)}
                                        onChange={() => toggleUnassignCampaign(campaign.id)}
                                      />
                                      <span className="ltr:ml-2 rtl:mr-2">{campaign.name}</span>
                                    </div>
                                  </td>
                                  <td>{campaign.description || '-'}</td>
                                  <td>{formatDate(campaign.createdAt)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="text-center py-4">
                                  No campaigns found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          Showing {Math.min((unassignPager.currentPage - 1) * unassignPager.pageSize + 1, unassignPager.totalCampaigns)}-
                          {Math.min(unassignPager.currentPage * unassignPager.pageSize, unassignPager.totalCampaigns)} of {unassignPager.totalCampaigns}
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            disabled={unassignPager.currentPage === 1}
                            className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 ltr:mr-3 rtl:ml-3 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                            onClick={() => {
                              setUnassignPager(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                              if (selectedLead) {
                                fetchAssignedCampaigns(selectedLead.id, unassignSearch, unassignPager.currentPage - 1);
                              }
                            }}
                          >
                            <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                          </button>
                          <button
                            type="button"
                            disabled={unassignPager.currentPage === unassignPager.totalPages}
                            className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                            onClick={() => {
                              setUnassignPager(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                              if (selectedLead) {
                                fetchAssignedCampaigns(selectedLead.id, unassignSearch, unassignPager.currentPage + 1);
                              }
                            }}
                          >
                            <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                        <button type="button" className="btn btn-outline-danger" onClick={() => setUnassignCampaignModal(false)}>
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary ltr:ml-4 rtl:mr-4"
                          onClick={unassignCampaigns}
                          disabled={selectedUnassignCampaigns.length === 0}
                        >
                          Unassign Selected
                        </button>
                      </div>
                    </div>
                  </DialogPanel>
                </TransitionChild>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Transition appear show={importModal} as={Fragment}>
          <Dialog as="div" open={importModal} onClose={() => setImportModal(false)} className="relative z-50">
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
                  <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                    <button
                      type="button"
                      onClick={() => setImportModal(false)}
                      className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                    >
                      <IconX />
                    </button>
                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                      Import Leads
                    </div>
                    <div className="p-5">
                      <div className="space-y-4">
                        <div
                          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${dragOver
                            ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600'
                            }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={() => document.getElementById('fileInput')?.click()}
                        >
                          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <IconCloudUpload className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">
                            {selectedFile ? selectedFile.name : 'Upload a CSV file'}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                            {selectedFile
                              ? 'Click to change file'
                              : 'Click to browse or drag and drop'
                            }
                          </p>
                          <input
                            type="file"
                            id="fileInput"
                            className="hidden"
                            accept=".csv"
                            onChange={handleFileChange}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          Only CSV files are supported. Ensure your file matches the required format.
                        </p>

                        <div className="mt-6 flex items-center justify-end gap-4">
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => {
                              setImportModal(false);
                              setSelectedFile(null);
                            }}
                            disabled={isUploading}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                          >
                            {isUploading ? (
                              <>
                                <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 inline-block align-middle ltr:mr-2 rtl:ml-2"></span>
                                Uploading...
                              </>
                            ) : (
                              'Upload'
                            )}
                          </button>
                        </div>
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

export default LeadsPage;