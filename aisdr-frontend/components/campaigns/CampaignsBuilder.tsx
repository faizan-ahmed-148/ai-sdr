'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import IconMenu from '@/components/icon/icon-menu';
import IconClipboardText from '@/components/icon/icon-clipboard-text';
import IconUser from '@/components/icon/icon-user';
import IconFile from '@/components/icon/icon-file';
import IconGlobe from '@/components/icon/icon-globe';
import IconThumbUp from '@/components/icon/icon-thumb-up';
import IconSearch from '@/components/icon/icon-search';
import IconCheck from '@/components/icon/icon-checks';
import CampaignCsvPage from './CampaignCsvPage';
import IconStar from '../icon/icon-star';
import WizaLeadsPage from '../winzaLeads/WizaLeadsPage';

interface Lead {
    id: number;
    name: string;
    company: string;
    title: string;
    email: string;
    status: 'verified' | 'unverified';
}

interface CompanyFilters {
    industry: string;
    website: string;
    companySize: string;
    hqLocation: string;
    keywords: string;
    sicCodes: string;
    fundingStage: string;
    annualRevenue: string;
    technologies: string;
    ecommerceStatus: string;
    websiteTraffic: { value: string; dateFilter: string };
    yearFounded: string;
    departmentSize: string;
}

interface LeadFilters {
    fullName: string;
    jobTitle: string;
    managementLevel: string;
    department: string;
    pastCompanies: string;
    experience: string;
    postingOnLinkedIn: boolean;
    recentlyChangedJobs: boolean;
    featuredInNews: boolean;
}

interface AccountResearch {
    mode: string;
    web: { query: string; latestActivity: string };
    news: { keywords: string; date: string };
    technology: { stack: string };
    includeOnlyEnriched: boolean;
}

interface HubspotAutomation {
    syncNewContacts: boolean;
    enrichContacts: boolean;
    syncEvents: boolean;
    addNewContacts: boolean;
    createCallTasks: boolean;
}

interface SocialSignal {
    linkedInUrl: string;
    postType: string;
    signalType: string;
    runDaily: boolean;
}

const CampaignBuilder = () => {

    const [isShowMenu, setIsShowMenu] = useState(false);
    
    // Active tab state
    const [activeTab, setActiveTab] = useState<'cold-outreach' | 'hubspot' | 'csv-import' | 'website-visitors' | 'social-signals' | 'wiza-leads'>('wiza-leads');
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    
    // Common states
    const [selectedPersona, setSelectedPersona] = useState<string>('marketing-manager');
    const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);

    // Cold Outreach states
    const [leadDatabase, setLeadDatabase] = useState<string>('zoominfo');
    const [companyFilters, setCompanyFilters] = useState<CompanyFilters>({
        industry: '',
        website: '',
        companySize: '',
        hqLocation: '',
        keywords: '',
        sicCodes: '',
        fundingStage: '',
        annualRevenue: '',
        technologies: '',
        ecommerceStatus: '',
        websiteTraffic: { value: '', dateFilter: '' },
        yearFounded: '',
        departmentSize: ''
    });

    const [leadFilters, setLeadFilters] = useState<LeadFilters>({
        fullName: '',
        jobTitle: '',
        managementLevel: '',
        department: '',
        pastCompanies: '',
        experience: '',
        postingOnLinkedIn: false,
        recentlyChangedJobs: false,
        featuredInNews: false
    });

    const [accountResearch, setAccountResearch] = useState<AccountResearch>({
        mode: 'quick',
        web: { query: '', latestActivity: '' },
        news: { keywords: '', date: '' },
        technology: { stack: '' },
        includeOnlyEnriched: false
    });

    const [aiSearchQuery, setAiSearchQuery] = useState<string>('');

    // HubSpot states
    const [hubspotConnected, setHubspotConnected] = useState<boolean>(false);
    const [hubspotLists, setHubspotLists] = useState<string[]>([]);
    const [selectedHubspotList, setSelectedHubspotList] = useState<string>('');
    const [hubspotAutomation, setHubspotAutomation] = useState<HubspotAutomation>({
        syncNewContacts: true,
        enrichContacts: true,
        syncEvents: false,
        addNewContacts: false,
        createCallTasks: false
    });

    // Website Visitors states
    const [selectedPages, setSelectedPages] = useState<string[]>([]);

    // Social Signals states
    const [socialSignal, setSocialSignal] = useState<SocialSignal>({
        linkedInUrl: '',
        postType: 'hiring',
        signalType: 'like',
        runDaily: false
    });

    // Generate mock leads data
    useEffect(() => {
        const mockLeads: Lead[] = [
            { id: 1, name: 'John Doe', company: 'TechCorp', title: 'Marketing Director', email: 'john@techcorp.com', status: 'verified' },
            { id: 2, name: 'Jane Smith', company: 'InnovateX', title: 'CTO', email: 'jane@innovatex.com', status: 'unverified' },
            { id: 3, name: 'Mike Johnson', company: 'DataSystems', title: 'Sales Manager', email: 'mike@datasystems.com', status: 'verified' },
            { id: 4, name: 'Sarah Williams', company: 'CloudTech', title: 'Product Owner', email: 'sarah@cloudtech.com', status: 'verified' },
            { id: 5, name: 'David Brown', company: 'NextGen', title: 'Marketing Specialist', email: 'david@nextgen.com', status: 'unverified' },
        ];
        setLeads(mockLeads);
    }, []);

    // Handle lead selection
    const toggleLeadSelection = (id: number) => {
        if (selectedLeads.includes(id)) {
            setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
        } else {
            setSelectedLeads([...selectedLeads, id]);
        }
    };

    // Select all leads
    const selectAllLeads = () => {
        if (selectedLeads.length === leads.length) {
            setSelectedLeads([]);
        } else {
            setSelectedLeads(leads.map(lead => lead.id));
        }
    };

    // Handle filter changes
    const handleCompanyFilterChange = (field: keyof CompanyFilters, value: string) => {
        setCompanyFilters({ ...companyFilters, [field]: value });
    };

    const handleLeadFilterChange = (field: keyof LeadFilters, value: string | boolean) => {
        setLeadFilters({ ...leadFilters, [field]: value });
    };

    // Render sidebar navigation
    const renderSidebar = () => (
        <div className={`panel absolute z-10 hidden h-full w-[240px] max-w-full flex-none space-y-4 p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md ${isShowMenu && '!block'}`}>
            <div className="flex h-full flex-col pb-16">
                <div className="pb-5">
                    <div className="flex items-center text-center">
                        <div className="shrink-0">
                            <IconClipboardText />
                        </div>
                        <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Campaign Builder</h3>
                    </div>
                </div>
                <div className="mb-5 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                <div className="space-y-1">
                    {[
                         { icon: <IconStar />, name: 'Wiza Leads', id: 'wiza-leads' },
                        { icon: <IconUser />, name: 'Cold Outreach', id: 'cold-outreach' },
                        { icon: <IconCheck />, name: 'HubSpot', id: 'hubspot' },
                        { icon: <IconFile />, name: 'CSV Import', id: 'csv-import' },
                        { icon: <IconGlobe />, name: 'Website Visitors', id: 'website-visitors' },
                        { icon: <IconThumbUp />, name: 'Social Signals', id: 'social-signals' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                                activeTab === item.id ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                            }`}
                            onClick={() => {
                                setActiveTab(item.id as any);
                                setIsShowMenu(false);
                            }}
                        >
                            <div className="flex items-center">
                                {item.icon}
                                <div className="ltr:ml-3 rtl:mr-3">{item.name}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    // Render filter section
    const renderFiltersSection = () => (
        <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Company Filters */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Company Filters</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Industry</label>
                            <select
                                value={companyFilters.industry}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleCompanyFilterChange('industry', e.target.value)}
                                className="form-select mt-1 w-full"
                            >
                                <option value="">All Industries</option>
                                <option value="technology">Technology</option>
                                <option value="finance">Finance</option>
                                <option value="healthcare">Healthcare</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Size</label>
                            <select
                                value={companyFilters.companySize}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleCompanyFilterChange('companySize', e.target.value)}
                                className="form-select mt-1 w-full"
                            >
                                <option value="">Any Size</option>
                                <option value="1-10">1-10 employees</option>
                                <option value="11-50">11-50 employees</option>
                                <option value="51-200">51-200 employees</option>
                                <option value="201-500">201-500 employees</option>
                                <option value="501+">501+ employees</option>
                            </select>
                        </div>
                        {showAdvancedFilters && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Annual Revenue</label>
                                    <select
                                        value={companyFilters.annualRevenue}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => handleCompanyFilterChange('annualRevenue', e.target.value)}
                                        className="form-select mt-1 w-full"
                                    >
                                        <option value="">Any Revenue</option>
                                        <option value="0-1M">$0-$1M</option>
                                        <option value="1M-10M">$1M-$10M</option>
                                        <option value="10M-50M">$10M-$50M</option>
                                        <option value="50M+">$50M+</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Technologies Used</label>
                                    <input
                                        type="text"
                                        value={companyFilters.technologies}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleCompanyFilterChange('technologies', e.target.value)}
                                        className="form-input mt-1 w-full"
                                        placeholder="e.g., HubSpot, Salesforce"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Lead Filters */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Lead Filters</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Job Title</label>
                            <input
                                type="text"
                                value={leadFilters.jobTitle}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleLeadFilterChange('jobTitle', e.target.value)}
                                className="form-input mt-1 w-full"
                                placeholder="e.g., Marketing Manager"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Management Level</label>
                            <select
                                value={leadFilters.managementLevel}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleLeadFilterChange('managementLevel', e.target.value)}
                                className="form-select mt-1 w-full"
                            >
                                <option value="">Any Level</option>
                                <option value="executive">Executive</option>
                                <option value="director">Director</option>
                                <option value="manager">Manager</option>
                                <option value="individual">Individual Contributor</option>
                            </select>
                        </div>
                        {showAdvancedFilters && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Experience (Years)</label>
                                    <input
                                        type="number"
                                        value={leadFilters.experience}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleLeadFilterChange('experience', e.target.value)}
                                        className="form-input mt-1 w-full"
                                        placeholder="Minimum years"
                                    />
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={leadFilters.recentlyChangedJobs}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleLeadFilterChange('recentlyChangedJobs', e.target.checked)}
                                        className="form-checkbox rounded"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Recently Changed Jobs</label>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {!showAdvancedFilters && (
                <button
                    onClick={() => setShowAdvancedFilters(true)}
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                    + Show Advanced Filters
                </button>
            )}
        </div>
    );

    // Render leads table
    const renderLeadsTable = () => (
        <div className="table-responsive">
            <table className="table-hover">
                <thead>
                    <tr>
                        <th>
                            <input
                                type="checkbox"
                                className="form-checkbox rounded"
                                checked={selectedLeads.length === leads.length && leads.length > 0}
                                onChange={selectAllLeads}
                            />
                        </th>
                        <th>Name</th>
                        <th>Company</th>
                        <th>Title</th>
                        <th>Email</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {leads.map((lead) => (
                        <tr key={lead.id} className={selectedLeads.includes(lead.id) ? 'bg-gray-100 dark:bg-gray-700' : ''}>
                            <td>
                                <input
                                    type="checkbox"
                                    className="form-checkbox rounded"
                                    checked={selectedLeads.includes(lead.id)}
                                    onChange={() => toggleLeadSelection(lead.id)}
                                />
                            </td>
                            <td>
                                <div className="whitespace-nowrap font-semibold">{lead.name}</div>
                            </td>
                            <td>{lead.company}</td>
                            <td>{lead.title}</td>
                            <td>{lead.email}</td>
                            <td>
                                <span className={`badge ${lead.status === 'verified' ? 'badge-outline-success' : 'badge-outline-warning'}`}>
                                    {lead.status === 'verified' ? 'Verified' : 'Unverified'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    // Cold Outreach specific components
    const renderColdOutreach = () => {
        return (
            <div>
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Lead Database</h3>
                    <div className="flex flex-wrap gap-4">
                        {['ZoomInfo', 'LinkedIn Sales Navigator', 'Unified Waterfall Method'].map((option) => (
                            <div key={option} className="flex items-center">
                                <input
                                    type="radio"
                                    checked={leadDatabase === option.toLowerCase().replace(/ /g, '-')}
                                    onChange={() => setLeadDatabase(option.toLowerCase().replace(/ /g, '-'))}
                                    className="form-radio"
                                />
                                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">{option}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {renderFiltersSection()}

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Account Research</h3>
                    <div className="flex flex-wrap gap-4 mb-4">
                        {['Quick Search', 'Full Search', 'Exact Match Search'].map((option) => {
                            const mode = option.toLowerCase().replace(/ /g, '-');
                            return (
                                <div key={option} className="flex items-center">
                                    <input
                                        type="radio"
                                        checked={accountResearch.mode === mode}
                                        onChange={() => setAccountResearch({ ...accountResearch, mode })}
                                        className="form-radio"
                                    />
                                    <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">{option}</label>
                                </div>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">WEB Search</label>
                            <input
                                type="text"
                                value={accountResearch.web.query}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountResearch({
                                    ...accountResearch,
                                    web: { ...accountResearch.web, query: e.target.value }
                                })}
                                className="form-input mt-1 w-full"
                                placeholder="Search query"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">NEWS Keywords</label>
                            <input
                                type="text"
                                value={accountResearch.news.keywords}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountResearch({
                                    ...accountResearch,
                                    news: { ...accountResearch.news, keywords: e.target.value }
                                })}
                                className="form-input mt-1 w-full"
                                placeholder="Keywords"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">TECH Stack</label>
                            <select
                                value={accountResearch.technology.stack}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => setAccountResearch({
                                    ...accountResearch,
                                    technology: { ...accountResearch.technology, stack: e.target.value }
                                })}
                                className="form-select mt-1 w-full"
                            >
                                <option value="">Select technology</option>
                                <option value="marketing">Marketing Tech</option>
                                <option value="crm">CRM Systems</option>
                                <option value="analytics">Analytics</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={accountResearch.includeOnlyEnriched}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setAccountResearch({
                                ...accountResearch,
                                includeOnlyEnriched: e.target.checked
                            })}
                            className="form-checkbox rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Include Only Enriched Leads</label>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">AI Search</h3>
                    <div className="flex">
                        <input
                            type="text"
                            value={aiSearchQuery}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setAiSearchQuery(e.target.value)}
                            placeholder="e.g., Marketing managers in funded startups using HubSpot"
                            className="form-input flex-1 ltr:rounded-r-none rtl:rounded-l-none"
                        />
                        <button className="btn btn-primary ltr:rounded-l-none rtl:rounded-r-none">
                            Apply
                        </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {aiSearchQuery && (
                            <>
                                <span className="badge badge-outline-primary">
                                    Marketing Managers
                                    <button className="ml-2 text-primary hover:text-primary-dark">×</button>
                                </span>
                                <span className="badge badge-outline-primary">
                                    Funded Startups
                                    <button className="ml-2 text-primary hover:text-primary-dark">×</button>
                                </span>
                                <span className="badge badge-outline-primary">
                                    HubSpot Users
                                    <button className="ml-2 text-primary hover:text-primary-dark">×</button>
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {renderLeadsTable()}
            </div>
        );
    };

    // HubSpot Integration
    const renderHubSpot = () => (
        <div>
            <div className="mb-6">
                <button
                    onClick={() => setHubspotConnected(true)}
                    className={`btn ${hubspotConnected ? 'btn-success' : 'btn-primary'}`}
                >
                    {hubspotConnected ? 'Connected to HubSpot' : 'Connect HubSpot Account'}
                </button>
            </div>

            {hubspotConnected && (
                <>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-3">Contact List</h3>
                        <select
                            value={selectedHubspotList}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedHubspotList(e.target.value)}
                            className="form-select w-full md:w-1/2"
                        >
                            <option value="">Select a list</option>
                            <option value="marketing">Marketing Leads</option>
                            <option value="sales">Sales Prospects</option>
                            <option value="customers">Customer List</option>
                        </select>
                    </div>

                    <div className="space-y-4 mb-6">
                        <h3 className="text-lg font-semibold">Automation Settings</h3>
                        {[
                            { id: 'syncNewContacts', label: 'Sync new contacts from HubSpot' },
                            { id: 'enrichContacts', label: 'Enrich contacts using AI enrichment' },
                            { id: 'syncEvents', label: 'Sync events back to HubSpot' },
                            { id: 'addNewContacts', label: 'Add new contacts from AISDR into HubSpot' },
                            { id: 'createCallTasks', label: 'Create call tasks in HubSpot' }
                        ].map((option) => (
                            <div key={option.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={hubspotAutomation[option.id as keyof HubspotAutomation]}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setHubspotAutomation({
                                        ...hubspotAutomation,
                                        [option.id]: e.target.checked
                                    })}
                                    className="form-checkbox rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">{option.label}</label>
                            </div>
                        ))}
                    </div>

                    {renderLeadsTable()}
                </>
            )}
        </div>
    );

    // CSV Import
    const renderCSVImport = () => (
        <CampaignCsvPage />
    );

    // Website Visitors
    const renderWebsiteVisitors = () => (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Select Pages</h3>
                <select
                    multiple
                    value={selectedPages}
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setSelectedPages(Array.from(e.target.selectedOptions, option => option.value))}
                    className="form-multiselect w-full h-32"
                >
                    <option value="/">Homepage</option>
                    <option value="/pricing">Pricing</option>
                    <option value="/features">Features</option>
                    <option value="/blog">Blog</option>
                    <option value="/contact">Contact Us</option>
                    <option value="/demo">Request Demo</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">Hold Ctrl/Cmd to select multiple pages</p>
            </div>

            {renderFiltersSection()}

            <div className="mb-4">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="include-in-campaign"
                        className="form-checkbox rounded"
                    />
                    <label htmlFor="include-in-campaign" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Include in Campaign
                    </label>
                </div>
            </div>

            {renderLeadsTable()}
        </div>
    );

    // Social Signals
    const renderSocialSignals = () => (
        <div>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn Profile URL</label>
                <input
                    type="url"
                    value={socialSignal.linkedInUrl}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSocialSignal({ ...socialSignal, linkedInUrl: e.target.value })}
                    className="form-input mt-1 w-full"
                    placeholder="https://linkedin.com/in/username"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Post Type</label>
                    <select
                        value={socialSignal.postType}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setSocialSignal({ ...socialSignal, postType: e.target.value })}
                        className="form-select mt-1 w-full"
                    >
                        <option value="hiring">Hiring</option>
                        <option value="announcement">Announcement</option>
                        <option value="promotion">Promotion</option>
                        <option value="event">Event</option>
                        <option value="product">Product Launch</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Signal Type</label>
                    <select
                        value={socialSignal.signalType}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setSocialSignal({ ...socialSignal, signalType: e.target.value })}
                        className="form-select mt-1 w-full"
                    >
                        <option value="like">Like</option>
                        <option value="comment">Comment</option>
                        <option value="share">Share</option>
                        <option value="post">Original Post</option>
                    </select>
                </div>
            </div>

            <button className="btn btn-primary mb-6">
                Start Account Research
            </button>

            {renderLeadsTable()}

            <div className="flex items-center mt-4">
                <input
                    type="checkbox"
                    checked={socialSignal.runDaily}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setSocialSignal({ ...socialSignal, runDaily: e.target.checked })}
                    className="form-checkbox rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Run daily & add new matching leads automatically</label>
            </div>
        </div>
    );

    // Render active tab content
    const renderActiveTab = () => {
        switch (activeTab) {
            case 'wiza-leads':
                return <WizaLeadsPage />;
            case 'cold-outreach':
                return renderColdOutreach();
            case 'hubspot':
                return renderHubSpot();
            case 'csv-import':
                return renderCSVImport();
            case 'website-visitors':
                return renderWebsiteVisitors();
            case 'social-signals':
                return renderSocialSignals();
            default:
                return renderColdOutreach();
        }
    };

    return (
        <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
            {renderSidebar()}
            
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
                                    className="form-input ltr:!pr-10 rtl:!pl-10"
                                    placeholder="Search Leads..."
                                />
                                <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                                    <IconSearch />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
                    
                    <div className="p-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">AI Campaign Builder</h2>
                        {renderActiveTab()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignBuilder;