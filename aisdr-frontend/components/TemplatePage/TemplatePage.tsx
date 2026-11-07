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

const TemplatesPage = () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { token } = useSelector((state: any) => state.auth);
    const defaultParams = {
        id: null,
        name: '',
        from: '',
        subject: '',
        body: ''
    };

    const [isShowTemplateMenu, setIsShowTemplateMenu] = useState(false);
    const [addTemplateModal, setAddTemplateModal] = useState(false);
    const [viewTemplateModal, setViewTemplateModal] = useState(false);
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    // Template data
    const [allTemplates, setAllTemplates] = useState<any[]>([]);
    const [pagedTemplates, setPagedTemplates] = useState<any[]>([]);
    const [searchTemplate, setSearchTemplate] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<any>(defaultParams);
    const [isLoading, setIsLoading] = useState(true);

    const [pager, setPager] = useState({
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        totalTemplates: 0,
    });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    // Fetch templates
    const fetchTemplates = async (search = '', page = pager.currentPage) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/templates`, {
                params: {
                    page,
                    limit: pager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setPagedTemplates(response.data.data);
            setPager(prev => ({
                ...prev,
                currentPage: response.data.pagination.currentPage,
                totalPages: response.data.pagination.totalPages,
                totalTemplates: response.data.pagination.totalTemplates
            }));
        } catch (error) {
            showMessage('Failed to fetch templates', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, [pager.currentPage]);

    // Debounced search handler
    const handleSearch = (value: string) => {
        setSearchTemplate(value);

        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(() => {
            setPager(prev => ({ ...prev, currentPage: 1 }));
            fetchTemplates(value, 1);
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

    const viewTemplate = (item: any = null) => {
        setSelectedTemplate(item);
        setTimeout(() => {
            setViewTemplateModal(true);
        });
    };

    const addEditTemplate = (template: any = null) => {
        setIsShowTemplateMenu(false);
        let json = JSON.parse(JSON.stringify(defaultParams));

        if (template) {
            const { id, name, from, subject, body } = template;
            json = { id, name, from, subject, body };
        }

        setParams(json);
        setAddTemplateModal(true);
    };

    const deleteTemplate = async (template: any) => {
        try {
            const { data } = await axios.delete(`${BASE_URL}/api/templates/${template.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (data?.status === 'success') {
                fetchTemplates();
                showMessage('Template has been deleted successfully.');
            } else {
                showMessage(data?.message || 'Failed to delete template.', 'error');
            }
        } catch (error: any) {
            showMessage(error?.response?.data?.message || 'Failed to delete template', 'error');
        }
    };

    const saveTemplate = async () => {
        if (!params.name) {
            showMessage('Name is required.', 'error');
            return false;
        }
        if (!params.from) {
            showMessage('From field is required.', 'error');
            return false;
        }
        if (!params.subject) {
            showMessage('Subject is required.', 'error');
            return false;
        }
        if (!params.body) {
            showMessage('Body content is required.', 'error');
            return false;
        }

        try {
            if (params?.id) {
                let payload = { ...params };
                delete payload.id;

                // Update template
                const response = await axios.put(`${BASE_URL}/api/templates/${params.id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.status === 'success') {
                    fetchTemplates();
                    showMessage('Template has been updated successfully.');
                    setAddTemplateModal(false);
                } else {
                    showMessage(response?.data?.message || 'Failed to save template.', 'error');
                }

            } else {
                let payload = { ...params };
                delete payload.id;

                // Create template
                const response = await axios.post(`${BASE_URL}/api/templates`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.data.status === 'success') {
                    fetchTemplates();
                    showMessage('Template has been saved successfully.');
                    setAddTemplateModal(false);
                } else {
                    showMessage(response.data.message || 'Failed to save template.', 'error');
                }
            }

        } catch (error: any) {
            showMessage(error?.response?.data?.message || 'Failed to save template', 'error');
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

    return (
        <div>
            <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
                <div
                    className={`panel absolute z-10 hidden h-full w-[240px] max-w-full flex-none space-y-4 p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md ${isShowTemplateMenu && '!block'
                        }`}
                >
                    <div className="flex h-full flex-col pb-16">
                        <div className="pb-5">
                            <div className="flex items-center text-center">
                                <div className="shrink-0">
                                    <IconClipboardText />
                                </div>
                                <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Templates</h3>
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
                                        <div className="ltr:ml-3 rtl:mr-3">All Templates</div>
                                    </div>
                                    <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                                        {pager.totalTemplates}
                                    </div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                        <div className="absolute bottom-0 w-full p-4 ltr:left-0 rtl:right-0">
                            <button className="btn btn-primary w-full" type="button" onClick={() => addEditTemplate()}>
                                <IconPlus className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Add New Template
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowTemplateMenu && '!block xl:!hidden'}`} onClick={() => setIsShowTemplateMenu(!isShowTemplateMenu)}></div>
                <div className="panel h-full flex-1 overflow-auto p-0">
                    <div className="flex h-full flex-col">
                        <div className="flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="flex items-center ltr:mr-3 rtl:ml-3">
                                <button type="button" className="block hover:text-primary ltr:mr-3 rtl:ml-3 xl:hidden" onClick={() => setIsShowTemplateMenu(!isShowTemplateMenu)}>
                                    <IconMenu />
                                </button>
                                <div className="group relative flex-1">
                                    <input
                                        type="text"
                                        className="peer form-input ltr:!pr-10 rtl:!pl-10"
                                        placeholder="Search Templates..."
                                        value={searchTemplate}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                                        <IconSearch />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:flex-auto sm:justify-end">
                                <p className="ltr:mr-3 rtl:ml-3">
                                    {Math.min((pager.currentPage - 1) * pager.pageSize + 1, pager.totalTemplates)}-
                                    {Math.min(pager.currentPage * pager.pageSize, pager.totalTemplates)} of {pager.totalTemplates}
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
                        ) : pagedTemplates.length ? (
                            <div className="table-responsive min-h-[400px] grow overflow-y-auto sm:min-h-[300px]">
                                <table className="table-hover">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>From</th>
                                            <th>Subject</th>
                                            <th>Created At</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedTemplates.map((template: any) => {
                                            return (
                                                <tr className="group" key={template.id}>
                                                    <td>
                                                        <div className="flex items-center">
                                                            <div className="ltr:mr-3 rtl:ml-3">
                                                                <div className="grid h-10 w-10 place-content-center rounded-full bg-gray-300 text-sm font-semibold text-white dark:bg-gray-700">
                                                                    {template?.name?.charAt(0)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="whitespace-nowrap text-base font-semibold group-hover:text-primary">
                                                                    {template?.name}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center">
                                                            <div className="font-medium">{template?.from || '-'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="font-semibold">
                                                        <div className="flex items-center">
                                                            {template?.subject || '-'}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {new Date(template.createdAt).toLocaleDateString()}
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
                                                                            <button type="button" onClick={() => addEditTemplate(template)}>
                                                                                <IconPencilPaper className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                Edit
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => viewTemplate(template)}>
                                                                                <IconClipboardText className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                View Details
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => deleteTemplate(template)}>
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
                                No templates found
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Template Modal */}
                <Transition appear show={addTemplateModal} as={Fragment}>
                    <Dialog as="div" open={addTemplateModal} onClose={() => setAddTemplateModal(false)} className="relative z-50">
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
                                            onClick={() => setAddTemplateModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            {params.id ? 'Edit Template' : 'Add New Template'}
                                        </div>
                                        <div className="p-5">
                                            <form>
                                                <div className="mb-5">
                                                    <label htmlFor="name">Name *</label>
                                                    <input
                                                        id="name"
                                                        type="text"
                                                        placeholder="Enter Template Name"
                                                        className="form-input"
                                                        required
                                                        value={params.name}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="from">From *</label>
                                                    <input
                                                        id="from"
                                                        type="email"
                                                        placeholder="Enter Sender Email"
                                                        className="form-input"
                                                        value={params.from}
                                                        required
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="subject">Subject *</label>
                                                    <input
                                                        id="subject"
                                                        type="text"
                                                        placeholder="Enter Email Subject"
                                                        className="form-input"
                                                        required
                                                        value={params.subject}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="body">Content *</label>
                                                    <textarea
                                                        id="body"
                                                        rows={10}
                                                        placeholder="Enter Template Content"
                                                        className="form-textarea"
                                                        required
                                                        value={params.body}
                                                        onChange={(e) => changeValue(e)}
                                                    ></textarea>
                                                </div>
                                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddTemplateModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => saveTemplate()}>
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

                {/* View Template Modal */}
                <Transition appear show={viewTemplateModal} as={Fragment}>
                    <Dialog as="div" open={viewTemplateModal} onClose={() => setViewTemplateModal(false)} className="relative z-50">
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
                                            onClick={() => setViewTemplateModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            <div>{selectedTemplate.name}</div>
                                        </div>
                                        <div className="p-5">
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Name</div>
                                                    <div className="w-3/4 font-semibold">{selectedTemplate.name}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">From</div>
                                                    <div className="w-3/4">{selectedTemplate.from}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Subject</div>
                                                    <div className="w-3/4">{selectedTemplate.subject}</div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Content</div>
                                                    <div className="w-3/4">
                                                        <div className="prose dark:prose-invert max-w-none p-4 border rounded bg-gray-50 dark:bg-gray-900">
                                                            {selectedTemplate.body}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Created At</div>
                                                    <div className="w-3/4">
                                                        {new Date(selectedTemplate.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex items-center justify-end gap-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => {
                                                        setViewTemplateModal(false);
                                                        setTimeout(() => addEditTemplate(selectedTemplate), 300);
                                                    }}
                                                >
                                                    <IconPencilPaper className="ltr:mr-2 rtl:ml-2" />
                                                    Edit Template
                                                </button>
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setViewTemplateModal(false)}>
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

export default TemplatesPage;