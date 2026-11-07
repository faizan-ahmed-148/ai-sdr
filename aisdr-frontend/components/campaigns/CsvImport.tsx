'use client';
import React, { ChangeEvent, useState, useEffect, Fragment, useCallback } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import IconX from '@/components/icon/icon-x';
import IconSearch from '@/components/icon/icon-search';
import IconPlus from '@/components/icon/icon-plus';
import IconClipboardText from '@/components/icon/icon-clipboard-text';
import IconCloudUpload from '@/components/icon/icon-send';
import IconCalendar from '@/components/icon/icon-calendar';
import IconCheck from '@/components/icon/icon-checks';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import Swal from 'sweetalert2';
import PerfectScrollbar from 'react-perfect-scrollbar';

interface Campaign {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

interface IRootState {
  themeConfig: {
    rtlClass: string;
  };
}

const CsvImport = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token } = useSelector((state: any) => state.auth);
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
  
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  // Campaign list state
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pager, setPager] = useState({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    totalItems: 0,
  });

  // Format date for display
  const formatDate = useCallback((dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }, []);

  // Handle file drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0] || null;
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      showMessage('Please upload a CSV file only', 'error');
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  // Fetch campaigns for selection
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

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCampaigns(searchTerm, 1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: number) => {
    if (selectedCampaigns.includes(campaignId)) {
      setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaignId));
    } else {
      setSelectedCampaigns([...selectedCampaigns, campaignId]);
    }
  };

  // Select all campaigns
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(campaigns.map(campaign => campaign.id));
    }
    setIsAllSelected(!isAllSelected);
  };

  // Submit CSV with campaign assignments
  const handleSubmit = async () => {
    if (!csvFile) {
      showMessage('Please upload a CSV file', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('file', csvFile);
      formData.append('campaignIds', JSON.stringify(selectedCampaigns));

      const response = await axios.post(`${BASE_URL}/api/lead/csv/campaign`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status === 'success') {
        showMessage('Leads imported successfully!');
        setCsvFile(null);
        setSelectedCampaigns([]);
      } else {
        showMessage(response.data.message || 'Failed to import leads', 'error');
      }
    } catch (error: any) {
      showMessage(error.response?.data?.message || 'Failed to import leads', 'error');
    } finally {
      setIsSubmitting(false);
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

  return (
    <div className="panel h-full">
        <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
          <div className="flex-1">
            <h3 className="mb-4 text-xl font-bold text-primary">Import Leads from CSV</h3>
            <p className="mb-6 text-gray-500 dark:text-gray-400">
              Easily import your leads from a CSV file. Ensure your file has columns for first name, last name, email, and phone number.
            </p>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold">Assign to Campaigns</h4>
                <button 
                  onClick={() => setShowCampaignModal(true)}
                  className="btn btn-primary py-1.5 px-3"
                >
                  <IconPlus className="h-4 w-4 mr-1" />
                  Select Campaigns
                </button>
              </div>
              
              {selectedCampaigns.length > 0 ? (
                <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Selected Campaigns:</span> {selectedCampaigns.length}
                  </p>
                  <button 
                    onClick={() => setSelectedCampaigns([])}
                    className="text-xs text-danger hover:opacity-80"
                  >
                    Clear selection
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No campaigns selected (optional)
                </p>
              )}
            </div>
            
            <div className="mt-8 flex flex-wrap justify-end gap-3">
              <button 
                className="btn btn-outline-dark"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!csvFile || isSubmitting}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin border-2 border-white border-l-transparent rounded-full w-4 h-4 inline-block align-middle ltr:mr-2 rtl:ml-2"></span>
                    Importing...
                  </>
                ) : 'Import Leads'}
              </button>
            </div>
          </div>
          
          <div className="w-full max-w-md">
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                dragOver 
                  ? 'border-primary bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-gray-300 dark:border-gray-700'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput')?.click()}
            >
              <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <IconCloudUpload className="w-8 h-8 text-primary" />
              </div>
              
              <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                {csvFile ? 'File Selected' : 'Upload CSV File'}
              </h4>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {csvFile 
                  ? csvFile.name 
                  : 'Click to browse or drag and drop your CSV file here'}
              </p>
              
              <div className="mb-4">
                <button className="btn btn-outline-primary mx-auto">
                  {csvFile ? 'Change File' : 'Browse Files'}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supported formats: CSV (max 10MB)
              </p>
              
              {csvFile && (
                <div className="mt-4 inline-flex items-center text-sm text-success">
                  <IconCheck className="w-4 h-4 mr-1" />
                  Ready to import
                </div>
              )}
              
              <input
                type="file"
                id="fileInput"
                className="hidden"
                accept=".csv"
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCsvFile(e.target.files?.[0] || null)}
              />
            </div>
            
            <div className="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <h5 className="flex items-center text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                <IconClipboardText className="w-5 h-5 mr-2 text-primary" />
                CSV Format Requirements
              </h5>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li className="flex items-start">
                  <span className="inline-block mr-2">•</span>
                  <span>Columns: First Name, Last Name, Email, Phone</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block mr-2">•</span>
                  <span>Optional columns: Company, Website, Notes</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block mr-2">•</span>
                  <span>First row should be headers</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block mr-2">•</span>
                  <span>UTF-8 encoding recommended</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

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
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${
                              selectedCampaigns.includes(campaign.id)
                                ? 'bg-primary/10 border border-primary/20'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                            onClick={() => handleCampaignSelect(campaign.id)}
                          >
                            <div className={`flex items-center justify-center w-6 h-6 rounded-full border mr-3 ${
                              selectedCampaigns.includes(campaign.id)
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

export default CsvImport;