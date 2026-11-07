'use client';
import React, { useState, useEffect, ChangeEvent, Fragment, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import IconClipboardText from '@/components/icon/icon-clipboard-text';
import IconSearch from '@/components/icon/icon-search';
import IconLoading from '@/components/icon/icon-loader';
import IconCheck from '@/components/icon/icon-checks';
import IconEye from '@/components/icon/icon-eye';
import IconList from '@/components/icon/icon-lock';
import { useSelector } from 'react-redux';
import IconPlus from '../icon/icon-plus';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import IconX from '../icon/icon-x';
import IconCalendar from '../icon/icon-calendar';

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

interface WizaProfile {
    id: string;
    full_name: string;
    linkedin_url: string;
    industry: string;
    job_title: string;
    job_title_role: string | null;
    job_title_sub_role: string | null;
    job_company_name: string;
    job_company_website: string;
    location_name: string;
    email?: string;
    phone?: string;
    [key: string]: any; // Additional dynamic fields
}

interface WizaFilters {
    first_name?: string[];
    last_name?: string[];
    job_title?: Array<{ v: string; s: string }>;
    job_title_level?: string[];
    job_role?: string[];
    job_sub_role?: string[];
    location?: { v: string; b: string; s: string };
    job_company?: Array<{ v: string; s: string }>;
    past_company?: Array<{ v: string; s: string }>;
    company_location?: Array<{ v: string; b: string; s: string }>;
    company_industry?: string[];
    company_size?: string[];
    revenue?: string[];
    funding_stage?: { t: string; v: string[] };
    year_founded_start?: string;
    year_founded_end?: string;
}

interface ProspectListResponse {
    status: {
        code: number;
        message: string;
    };
    type: string;
    data: {
        id: number;
        name: string;
        status: string;
        stats: {
            people: number;
            credits: {
                email_credits: number;
                phone_credits: number;
                export_credits: number;
                api_credits: {
                    email_credits: number;
                    phone_credits: number;
                    scrape_credits: number;
                    total: number;
                };
            };
        };
        finished_at: string;
        created_at: string;
        enrichment_level: string;
        email_options: {
            accept_work: boolean;
            accept_personal: boolean;
            accept_generic: boolean;
        };
        report_type: string;
    };
}
interface Campaign {
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
}
const WizaLeadsPage = () => {
    const [apiKey, setApiKey] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [profiles, setProfiles] = useState<WizaProfile[]>([]);
    const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
    const [totalProfiles, setTotalProfiles] = useState<number>(0);
    const [filters, setFilters] = useState<WizaFilters>({});
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'search' | 'createList'>('createList');
    const [selectedProfile, setSelectedProfile] = useState<WizaProfile | null>(null);
    const [listName, setListName] = useState<string>('');
    const [maxProfiles, setMaxProfiles] = useState<number>(10);
    const [enrichmentLevel, setEnrichmentLevel] = useState<string>('partial');
    const [listResponse, setListResponse] = useState<ProspectListResponse | null>(null);
    const [listLoading, setListLoading] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [prospectData, setProspectData] = useState<any[]>([]);
    const [prospect_list_Id, setProspect_list_Id] = useState<any[]>([]);
    const [isSegement, setIsSegement] = useState<any>('people');
    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    const [searchTerm, setSearchTerm] = useState('');
    const [pager, setPager] = useState({
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        totalItems: 0,
    });

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { token } = useSelector((state: any) => state.auth);
    // API key from environment or input
    const [isAssignAll, setIsAssignAll] = useState(false);
    const handleCampaignSelect = (campaignId: number) => {
        if (selectedCampaigns.includes(campaignId)) {
            setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaignId));
        } else {
            setSelectedCampaigns([campaignId]);
        }
    };


    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCampaigns(searchTerm, 1);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchCampaigns = async (search = '', page = 1) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/campaigns`, {
                params: {
                    page,
                    limit: pager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setCampaigns(response.data.data);
            setPager(prev => ({
                ...prev,
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
                totalItems: response.data.pagination.totalCampaigns
            }));
        } catch (error) {
            showMessage('Failed to fetch campaigns', 'error');
        } finally {
            setIsLoading(false);
        }
    };
    const fetchProspects = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/prospect/list`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProspectData(response.data.data);
        } catch (error) {
            showMessage('Failed to fetch propect', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_WIZA_API_KEY || '';
        if (key) {
            setApiKey(key);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'search') {
            fetchProspects();
        }
    }, [activeTab])
    const formatDate = useCallback((dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }, []);

    // Fetch profiles from Wiza API
    const fetchProfiles = async () => {
        setProfiles([]);
        if (!prospect_list_Id) {
            showMessage('Please select a list ID ', 'error');
            return;
        }


        setLoading(true);
        showMessage('Fetching leads from Wiza...', 'info');

        try {
            const response = await axios.get(
                `${BASE_URL}/api/prospect/list/${prospect_list_Id}/contacts`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            console.log(response, '==========>response');

            if (response.data.status == 'success') {
                setProfiles(response.data.data.map((profile: any, index: number) => ({
                    ...profile,
                    id: `wiza-${index}-${Date.now()}`
                })))
                showMessage(`Successfully fetched ${response.data.data.length} leads`, 'success');
            } else {
                showMessage(response.data.message || 'No leads found with current filters', 'warning');
            }
            setSelectedProfiles([]);
            setIsAssignAll(false);
        } catch (error: any) {
            console.error('Error fetching Wiza leads:', error);
            showMessage(error?.response?.data?.message || 'Failed to fetch leads', 'error');
        } finally {
            setLoading(false);
        }
    };


    // Create prospect list
    const createProspectList = async () => {
        if (!filters?.job_title) {
            showMessage('Please enter a job title', 'error');
            return;
        }

        if (!listName) {
            showMessage('Please enter a list name', 'error');
            return;
        }

        setListLoading(true);
        showMessage('Creating prospect list...', 'info');

        try {
            const response = await axios.post(
                `${BASE_URL}/api/prospect/create`,
                {
                    filters: filters,
                    list: {
                        name: listName,
                        max_profiles: maxProfiles,
                        enrichment_level: enrichmentLevel,
                        email_options: {
                            accept_work: true,
                            accept_personal: true,
                            accept_generic: true
                        }
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.data.status === 'success') {
                setListResponse(response?.data);
                showMessage('Prospect list created successfully!', 'success');
            } else {
                showMessage(response.data.message || 'Failed to create Prospect', 'error');
            }

        } catch (error: any) {
            console.error('Error creating prospect list:', error);
            showMessage(error?.response?.data?.message || 'Failed to create Prospect', 'error');

        } finally {
            setListLoading(false);
        }
    };

    // View profile details
    const viewProfileDetails = (profile: WizaProfile) => {
        setSelectedProfile(profile);
    };

    // Close profile details modal
    const closeProfileDetails = () => {
        setSelectedProfile(null);
    };

    // Handle filter changes
    const handleFilterChange = (field: keyof WizaFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Toggle profile selection
    const toggleProfileSelection = (id: string) => {
        if (selectedProfiles.includes(id)) {
            setSelectedProfiles(selectedProfiles.filter(profileId => profileId !== id));
        } else {
            setSelectedProfiles([...selectedProfiles, id]);
        }
    };
    const toggleAssignAll = () => {
        if (isAssignAll) {
            setSelectedProfiles([]);
        } else {
            setSelectedProfiles(profiles.map(profile => profile.id));
        }
        setIsAssignAll(!isAssignAll);
    };
    // Select all profiles


    // Search profiles
    const searchProfiles = () => {
        fetchProfiles();
    };

    const handleSubmit = async () => {

        try {
            const profileData = profiles.filter(profile => selectedProfiles.includes(profile.id));

            const makingPayload = profileData.map((profile: any) => {
                const {
                    first_name,
                    last_name,
                    email,
                    mobile_phone1,
                    phone_number1,
                    phone_number2,
                    phone_number3,
                    company,
                    title,
                    ...rest // all other fields go here
                } = profile;

                return {
                    firstName:first_name,
                    lastName: last_name,
                    email,
                    company,
                    role:title,
                    phone: mobile_phone1 || phone_number1 || phone_number2 || phone_number3,
                    additionalFields: rest
                };
            });
console.log(profileData,'profileData');

            if (!selectedCampaigns[0] || !profileData || profileData.length === 0) {
                showMessage('Please select a campaign and at least one profile', 'error');
            }
            setListLoading(true);
            showMessage('Adding profiles to  Leads...', 'info');

            const response = await axios.post(
                `${BASE_URL}/api/leads/many`,
                {
                    campaignId: selectedCampaigns[0],
                    leads: makingPayload
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (response.data.status === 'success') {
                setSelectedProfiles([]);
                setIsAssignAll(false);
                showMessage('added successfully!', 'success');
            } else {
                showMessage(response.data.message || 'Failed to add', 'error');
            }

        } catch (error: any) {
            console.error('Error creating prospect list:', error);
            showMessage(error?.response?.data?.message || 'Failed to add', 'error');

        } finally {
            setListLoading(false);
        }
    }
    // Render filters section
    const renderFilters = () => (
        <div className="mb-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Name Filters */}
                <div>
                    <label className="block text-sm font-medium mb-1">First Name</label>
                    <input
                        type="text"
                        onChange={(e) => handleFilterChange('first_name', [e.target.value])}
                        className="form-input w-full"
                        placeholder="e.g., John"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Last Name</label>
                    <input
                        type="text"
                        onChange={(e) => handleFilterChange('last_name', [e.target.value])}
                        className="form-input w-full"
                        placeholder="e.g., Smith"
                    />
                </div>

                {/* Job Filters */}
                <div>
                    <label className="block text-sm font-medium mb-1">Job Title</label>
                    <input
                        type="text"
                        onChange={(e) => handleFilterChange('job_title', [{ v: e.target.value, s: 'i' }])}
                        className="form-input w-full"
                        placeholder="e.g., CEO"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Job Level</label>
                    <select
                        onChange={(e) => handleFilterChange('job_title_level', [e.target.value])}
                        className="form-select w-full"
                    >
                        <option value="">Select level</option>
                        <option value="CXO">CXO</option>
                        <option value="VP">VP</option>
                        <option value="Director">Director</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Job Role</label>
                    <select
                        onChange={(e) => handleFilterChange('job_role', [e.target.value])}
                        className="form-select w-full"
                    >
                        <option value="">Select role</option>
                        <option value="finance">Finance</option>
                        <option value="engineering">Engineering</option>
                        <option value="marketing">Marketing</option>
                        <option value="sales">Sales</option>
                    </select>
                </div>

                {/* Company Filters */}
                <div>
                    <label className="block text-sm font-medium mb-1">Company Name</label>
                    <input
                        type="text"
                        onChange={(e) => handleFilterChange('job_company', [{ v: e.target.value, s: 'i' }])}
                        className="form-input w-full"
                        placeholder="e.g., Google"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Company Industry</label>
                    <input
                        type="text"
                        onChange={(e) => handleFilterChange('company_industry', [e.target.value])}
                        className="form-input w-full"
                        placeholder="e.g., Technology"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Company Size</label>
                    <select
                        onChange={(e) => handleFilterChange('company_size', [e.target.value])}
                        className="form-select w-full"
                    >
                        <option value="">Select size</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="501-1000">501-1000</option>
                        <option value="1001-5000">1001-5000</option>
                        <option value="5001-10000">5001-10000</option>
                        <option value="10001+">10001+</option>
                    </select>
                </div>

                {/* Location Filters */}
                <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                        type="text"
                        onChange={(e) => handleFilterChange('location', [{ v: e.target.value, b: 'city', s: 'i' }])}
                        className="form-input w-full"
                        placeholder="e.g., Toronto, Ontario, Canada"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Company Location</label>
                    <input
                        type="text"
                        onChange={(e) => handleFilterChange('company_location', [{ v: e.target.value, b: 'city', s: 'i' }])}
                        className="form-input w-full"
                        placeholder="e.g., Toronto, Ontario, Canada"
                    />
                </div>

                {/* Funding Filters */}
                <div>
                    <label className="block text-sm font-medium mb-1">Revenue</label>
                    <select
                        onChange={(e) => handleFilterChange('revenue', [e.target.value])}
                        className="form-select w-full"
                    >
                        <option value="">Select revenue</option>
                        <option value="$0-$1M">$0-$1M</option>
                        <option value="$1M-$10M">$1M-$10M</option>
                        <option value="$10M-$50M">$10M-$50M</option>
                        <option value="$50M-$100M">$50M-$100M</option>
                        <option value="$100M+">$100M+</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Funding Stage</label>
                    <select
                        onChange={(e) => handleFilterChange('funding_stage', { t: 'last', v: [e.target.value] })}
                        className="form-select w-full"
                    >
                        <option value="">Select stage</option>
                        <option value="pre_seed">Pre-seed</option>
                        <option value="seed">Seed</option>
                        <option value="series_a">Series A</option>
                        <option value="series_b">Series B</option>
                        <option value="series_c">Series C+</option>
                    </select>
                </div>

                {/* Year Founded */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Founded From</label>
                        <input
                            type="number"
                            onChange={(e) => handleFilterChange('year_founded_start', e.target.value)}
                            className="form-input w-full"
                            placeholder="e.g., 2010"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Founded To</label>
                        <input
                            type="number"
                            onChange={(e) => handleFilterChange('year_founded_end', e.target.value)}
                            className="form-input w-full"
                            placeholder="e.g., 2023"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <div>
                    {apiKey ? (
                        <div className="flex items-center text-success">
                            <IconCheck className="w-5 h-5 mr-2" />
                            <span>API Key Configured</span>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="form-input mr-2"
                                placeholder="Enter Wiza API Key"
                            />
                            <button className="btn btn-primary" onClick={() => showMessage('API Key saved', 'success')}>
                                Save
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={activeTab === 'search' ? fetchProfiles : createProspectList}
                    disabled={loading || listLoading}
                    className="btn btn-primary"
                >
                    {loading || listLoading ? <IconLoading className="animate-spin mr-2" /> : null}
                    {activeTab === 'search'
                        ? (loading ? 'Searching...' : 'Search Leads')
                        : (listLoading ? 'Creating...' : 'Create Prospect List')}
                </button>
            </div>
        </div>
    );

    // Render profile details modal
    const renderProfileDetails = () => {
        if (!selectedProfile) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold">Profile Details</h3>
                            <button
                                onClick={closeProfileDetails}
                                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-lg mb-2">Personal Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-semibold">Full Name:</span> {selectedProfile?.full_name}</p>
                                    <p><span className="font-semibold">First Name:</span> {selectedProfile?.first_name}</p>
                                    <p><span className="font-semibold">Last Name:</span> {selectedProfile?.last_name}</p>
                                    <p><span className="font-semibold">Email:</span> {selectedProfile?.email}</p>
                                    <p><span className="font-semibold">Other Emails:</span> {selectedProfile?.other_work_emails}</p>
                                    <p><span className="font-semibold">Location:</span> {selectedProfile?.location}</p>
                                    <p><span className="font-semibold">Locality:</span> {selectedProfile?.locality}</p>
                                    <p><span className="font-semibold">Region:</span> {selectedProfile?.region}</p>
                                    <p><span className="font-semibold">Country:</span> {selectedProfile?.country}</p>
                                    <p>
                                        <span className="font-semibold">LinkedIn:</span>
                                        <a href={selectedProfile?.linkedin_profile_url} target="_blank" rel="noopener noreferrer" className="text-primary ml-2">
                                            View Profile
                                        </a>
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium text-lg mb-2">Professional Information</h4>
                                <div className="space-y-2">
                                    <p><span className="font-semibold">Title:</span> {selectedProfile?.title}</p>
                                    <p><span className="font-semibold">Company:</span> {selectedProfile?.company}</p>
                                    <p><span className="font-semibold">Company Domain:</span> {selectedProfile?.company_domain}</p>
                                    <p><span className="font-semibold">Industry:</span> {selectedProfile?.company_industry}</p>
                                    <p><span className="font-semibold">Size:</span> {selectedProfile?.company_size} ({selectedProfile?.company_size_range})</p>
                                    <p><span className="font-semibold">Founded:</span> {selectedProfile?.company_founded}</p>
                                    <p><span className="font-semibold">Revenue:</span> {selectedProfile?.company_revenue}</p>
                                    <p><span className="font-semibold">Description:</span> {selectedProfile?.company_description}</p>
                                    <p><span className="font-semibold">Location:</span> {selectedProfile?.company_location}</p>
                                    <p><span className="font-semibold">Company LinkedIn:</span>
                                        <a href={selectedProfile?.company_linkedin} target="_blank" rel="noopener noreferrer" className="text-primary ml-2">
                                            View Company
                                        </a>
                                    </p>
                                    <p><span className="font-semibold">Company Twitter:</span>
                                        <a href={selectedProfile?.company_twitter} target="_blank" rel="noopener noreferrer" className="text-primary ml-2">
                                            Twitter
                                        </a>
                                    </p>
                                    <p><span className="font-semibold">Company Facebook:</span>
                                        <a href={selectedProfile?.company_facebook} target="_blank" rel="noopener noreferrer" className="text-primary ml-2">
                                            Facebook
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h4 className="font-medium text-lg mb-2">Raw Data</h4>
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                                <pre className="text-xs overflow-x-auto">
                                    {JSON.stringify(selectedProfile, null, 2)}
                                </pre>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={closeProfileDetails}
                                className="btn btn-outline-primary"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        );
    };


    // Render create list form
    const renderCreateListForm = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-1">List Name</label>
                    <input
                        type="text"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        className="form-input w-full"
                        placeholder="e.g., VP of Sales in San Francisco"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Max Profiles</label>
                    <input
                        type="number"
                        value={maxProfiles}
                        onChange={(e) => setMaxProfiles(Number(e.target.value))}
                        className="form-input w-full"
                        min="1"
                        max="1000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Enrichment Level</label>
                    <select
                        value={enrichmentLevel}
                        onChange={(e) => setEnrichmentLevel(e.target.value)}
                        className="form-select w-full"
                    >
                        <option value="full">Full</option>
                        <option value="partial">Partial</option>
                    </select>
                </div>
            </div>

            {renderFilters()}

            {listResponse && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-lg mb-2">List Creation Response</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><span className="font-semibold">List ID:</span> {listResponse.data.id || '-'}</p>
                            <p><span className="font-semibold">List Name:</span> {listResponse.data.name || '-'}</p>
                            <p><span className="font-semibold">Status:</span> {listResponse.data.status || '-'}</p>
                        </div>
                        <div>
                            <p><span className="font-semibold">People Found:</span> {listResponse.data.stats.people || '-'}</p>
                            <p><span className="font-semibold">Email Credits:</span> {listResponse.data.stats.credits?.email_credits || '-'}</p>
                            <p><span className="font-semibold">Phone Credits:</span> {listResponse.data.stats.credits?.phone_credits || '-'}</p>
                            <p><span className="font-semibold">Created At:</span> {new Date(listResponse.data?.created_at || '-').toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <h5 className="font-semibold mb-2">Raw Response</h5>
                        <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs overflow-x-auto">
                            {JSON.stringify(listResponse, null, 2)}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );

    // Render profiles table
    const renderProfilesTable = () => {


        return (
            <div className="mt-6">

                <div className='mb-4'>
                    <label className="block text-sm font-medium mb-1">Select Prospects</label>
                    <select
                        onChange={(e: any) => setProspect_list_Id(e.target.value)}
                        className="form-select w-full"
                    >
                        <option value="">-</option>
  {prospectData.map((p) => (
    <option key={p?.listId} value={p?.listId}>
      {(p?.name ?? "").padEnd(24)} <span className='text-gray-400 bg-gray-100 px-2 py-0.5'>{"|"} {p?.status ?? ""}</span>
    </option>
  ))}
                    </select>
                </div>
                {/* <div className='mb-4'>
                    <label className="block text-sm font-medium mb-1">Select Segments</label>
                    <select
                        onChange={(e: any) => setIsSegement(e.target.value)}
                        className="form-select w-full"
                    >
                        <option value="people">All contacts</option>
                        <option value="valid">Only valid contacts</option>
                        <option value="risky">Only risky contacts</option>
                    </select>
                </div> */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <span className="font-semibold">{profiles?.length || 0}</span> leads found
                    </div>
                    <div className="flex items-center space-x-4">

                        <button
                            onClick={searchProfiles}
                            className="btn btn-primary"
                        >
                            Search
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="table-hover">
                        <thead>
                            <tr>
                                <th><input
                                    type="checkbox"
                                    className="form-checkbox"
                                    checked={isAssignAll}
                                    onChange={toggleAssignAll}
                                /></th>
                                <th>Name</th>
                                <th>Title</th>
                                <th>Email</th>
                                <th>Company</th>
                                <th>Industry</th>
                                <th>Location</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((profile) => (
                                <tr key={profile.id} className={selectedProfiles.includes(profile.id) ? 'bg-gray-100 dark:bg-gray-700' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            className="form-checkbox rounded"
                                            checked={selectedProfiles.includes(profile.id)}
                                            onChange={() => toggleProfileSelection(profile.id)}
                                        />
                                    </td>
                                    <td className="font-semibold">{profile?.full_name}</td>
                                    <td>{profile?.title}</td>
                                    <td>{profile?.email}</td>
                                    <td>
                                        {profile?.company_domain ? (
                                            <a href={`https://${profile?.company_domain}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                                {profile?.company}
                                            </a>
                                        ) : (
                                            profile?.company
                                        )}
                                    </td>
                                    <td>{profile?.company_industry}</td>
                                    <td>{profile?.location}</td>
                                    <td>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => viewProfileDetails(profile)}
                                                className="btn btn-sm btn-outline-primary"
                                                title="View details"
                                            >
                                                <IconEye className="w-4 h-4" />
                                            </button>
                                            {profile?.linkedin && (
                                                <a
                                                    href={profile?.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-sm btn-outline-primary"
                                                    title="View LinkedIn"
                                                >
                                                    LinkedIn
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>

                {selectedProfiles.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded flex justify-between items-center">
                        <div>
                            <span className="font-semibold">{selectedProfiles.length}</span> leads selected
                        </div>
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3 gap-4">
                                <button
                                    onClick={() => setShowCampaignModal(true)}
                                    className="btn btn-primary py-1.5 px-3"
                                >
                                    <IconPlus className="h-4 w-4 mr-1" />
                                    Select Campaigns
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="btn btn-primary py-1.5 px-3"
                                >
                                    <IconPlus className="h-4 w-4 mr-1" />
                                    Create Leads
                                </button>
                            </div>

                        </div>
                        {/* <div className="space-x-2">
                            <button className="btn btn-outline-primary">Export Selected</button>
                            <button className="btn btn-primary">Add to Campaign</button>
                        </div> */}
                    </div>
                )}
                {/* Campaign Selection Modal */}
                <Transition appear show={showCampaignModal} as={Fragment}>
                    <Dialog as="div" open={showCampaignModal} onClose={() => setShowCampaignModal(false)} className="relative z-50">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-50" />
                        </TransitionChild>

                        <div className="fixed inset-0 z-50 overflow-y-auto">
                            <div className="flex min-h-full items-center justify-center p-4 text-center">
                                <TransitionChild
                                    as={Fragment}
                                    enter="ease-out duration-300"
                                    enterFrom="opacity-0 scale-95"
                                    enterTo="opacity-100 scale-100"
                                    leave="ease-in duration-200"
                                    leaveFrom="opacity-100 scale-100"
                                    leaveTo="opacity-0 scale-95"
                                >
                                    <DialogPanel className="w-full max-w-3xl transform overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                                        <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Assign to Campaigns
                                            </h3>
                                            <button
                                                type="button"
                                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                onClick={() => setShowCampaignModal(false)}
                                            >
                                                <IconX className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="mt-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="form-input w-full py-2 px-3 pl-10 rounded-lg bg-gray-50 border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                    placeholder="Search campaigns..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                                <div className="absolute inset-y-0 left-0 flex items-center px-3 pointer-events-none text-gray-400">
                                                    <IconSearch className="w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 max-h-[50vh] overflow-auto">
                                            {isLoading ? (
                                                <div className="flex justify-center items-center py-10">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                                </div>
                                            ) : campaigns.length > 0 ? (
                                                <div className="space-y-2">
                                                    {campaigns.map((campaign) => (
                                                        <div
                                                            key={campaign.id}
                                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${selectedCampaigns.includes(campaign.id)
                                                                ? 'bg-primary/10 border border-primary/20'
                                                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                                                }`}
                                                            onClick={() => handleCampaignSelect(campaign.id)}
                                                        >
                                                            <div className={`flex items-center justify-center w-6 h-6 rounded-full border mr-3 ${selectedCampaigns.includes(campaign.id)
                                                                ? 'bg-primary border-primary text-white'
                                                                : 'border-gray-300 dark:border-gray-600'
                                                                }`}>
                                                                {selectedCampaigns.includes(campaign.id) && (
                                                                    <IconCheck className="w-3 h-3" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-medium text-gray-900 dark:text-white">{campaign.name}</h4>
                                                                {campaign.description && (
                                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{campaign.description}</p>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                                <IconCalendar className="w-4 h-4 mr-1" />
                                                                {formatDate(campaign.createdAt)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-10">
                                                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                                                        <IconSearch className="w-8 h-8 text-gray-400" />
                                                    </div>
                                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No campaigns found</h4>
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        {searchTerm ? 'Try a different search term' : 'Create a campaign first'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {pager.totalPages > 1 && (
                                            <div className="mt-6 flex items-center justify-between">
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    Page {pager.currentPage} of {pager.totalPages}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => fetchCampaigns(searchTerm, pager.currentPage - 1)}
                                                        disabled={pager.currentPage === 1}
                                                        className="btn btn-outline-primary px-3 py-1.5 text-sm disabled:opacity-50"
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={() => fetchCampaigns(searchTerm, pager.currentPage + 1)}
                                                        disabled={pager.currentPage === pager.totalPages}
                                                        className="btn btn-outline-primary px-3 py-1.5 text-sm disabled:opacity-50"
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6 flex justify-end border-t border-gray-200 dark:border-gray-700 pt-4">
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => setShowCampaignModal(false)}
                                            >
                                                Confirm Selection
                                            </button>
                                        </div>
                                    </DialogPanel>
                                </TransitionChild>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        );
    };

    return (
        <div className="panel">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <IconClipboardText className="text-primary mr-3" />
                    <h3 className="text-xl font-semibold">Wiza Leads Integration</h3>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
                <ul className="flex flex-wrap -mb-px">
                    <li className="mr-2">

                        <button
                            onClick={() => setActiveTab('createList')}
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'createList' ? 'border-primary text-primary' : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
                        >
                            <IconList className="w-5 h-5 mr-2 inline" />
                            Create Prospect List
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            onClick={() => setActiveTab('search')}
                            className={`inline-block p-4 border-b-2 rounded-t-lg ${activeTab === 'search' ? 'border-primary text-primary' : 'border-transparent hover:text-gray-600 hover:border-gray-300 dark:hover:text-gray-300'}`}
                        >
                            <IconSearch className="w-5 h-5 mr-2 inline" />
                            Prospect Search
                        </button>
                    </li>
                </ul>
            </div>

            {activeTab === 'search' ? renderProfilesTable() : renderCreateListForm()}
            {selectedProfile && renderProfileDetails()}
        </div>
    );
};

export default WizaLeadsPage;