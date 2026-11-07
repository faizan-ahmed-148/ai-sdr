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

const KnowledgeBasePage = () => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { token } = useSelector((state: any) => state.auth);
    const defaultParams = {
        id: null,
        title: '',
        description: '',
        file: null as File | null,
    };

    const [isShowKnowledgeBaseMenu, setIsShowKnowledgeBaseMenu] = useState(false);
    const [addKnowledgeBaseModal, setAddKnowledgeBaseModal] = useState(false);
    const [viewKnowledgeBaseModal, setViewKnowledgeBaseModal] = useState(false);
    const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

    // Knowledge base data
    const [allKnowledgeBases, setAllKnowledgeBases] = useState<any[]>([]);
    const [pagedKnowledgeBases, setPagedKnowledgeBases] = useState<any[]>([]);
    const [searchKnowledgeBase, setSearchKnowledgeBase] = useState('');
    const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [pager, setPager] = useState({
        currentPage: 1,
        totalPages: 0,
        pageSize: 10,
        totalKnowledgeBases: 0,
    });
    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    // Fetch knowledge bases
    const fetchKnowledgeBases = async (search = '', page = pager.currentPage) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}/api/knowledgebase`, {
                params: {
                    page,
                    limit: pager.pageSize,
                    search: search || undefined,
                },
                headers: { Authorization: `Bearer ${token}` }
            });

            setPagedKnowledgeBases(response.data.data.data);
            setPager(prev => ({
                ...prev,
                currentPage: response.data.data.pagination.page,
                totalPages: response.data.data.pagination.totalPages,
                totalKnowledgeBases: response.data.data.pagination.total
            }));
        } catch (error) {
            showMessage('Failed to fetch knowledge bases', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchKnowledgeBases();
    }, [pager.currentPage]);

    // Debounced search handler
    const handleSearch = (value: string) => {
        setSearchKnowledgeBase(value);

        if (debounceTimer) clearTimeout(debounceTimer);

        const timer = setTimeout(() => {
            setPager(prev => ({ ...prev, currentPage: 1 }));
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

    const changeValue = (e: any) => {
        const { value, id, files } = e.target;
        if (id === 'file') {
            setParams({ ...params, [id]: files ? files[0] : null });
        } else {
            setParams({ ...params, [id]: value });
        }
    };

    const viewKnowledgeBase = (item: any = null) => {
        setSelectedKnowledgeBase(item);
        setTimeout(() => {
            setViewKnowledgeBaseModal(true);
        });
    };

    const addEditKnowledgeBase = (knowledgeBase: any = null) => {
        setIsShowKnowledgeBaseMenu(false);
        let json = JSON.parse(JSON.stringify(defaultParams));

        if (knowledgeBase) {
            const { id, title, description } = knowledgeBase;
            json = { id, title, description, file: null };
        }

        setParams(json);
        setAddKnowledgeBaseModal(true);
    };

    const deleteKnowledgeBase = async (deleteKnowledgeBase: any) => {
        try {
            const { data } = await axios.delete(`${BASE_URL}/api/knowledgebase/${deleteKnowledgeBase.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (data?.status === 'success') {
                fetchKnowledgeBases();
                showMessage('Knowledge base has been deleted successfully.');
            } else {
                showMessage(data?.message || 'Failed to delete knowledge base.', 'error');
            }
        } catch (error: any) {
            showMessage(error?.response?.data?.message || 'Failed to delete knowledge base', 'error');
        }
    };

    const saveKnowledgeBase = async () => {
        if (!params.title) {
            showMessage('Title is required.', 'error');
            return false;
        }
        if (!params.description) {
            showMessage('Description is required.', 'error');
            return false;
        }
        if (!params.id && !params.file) {
            showMessage('PDF file is required.', 'error');
            return false;
        }
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', params.title);
            formData.append('description', params.description);
            if (params.file) {
                formData.append('file', params.file);
            }

            if (params?.id) {
                // Update knowledge base
                const response = await axios.put(`${BASE_URL}/api/knowledgebase/${params.id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                 setIsLoading(false);

                if (response.data.status === 'success') {
                    fetchKnowledgeBases();
                    showMessage('Knowledge base has been updated successfully.');
                    setAddKnowledgeBaseModal(false);
                } else {
                    showMessage(response?.data?.message || 'Failed to save knowledge base.', 'error');
                }
            } else {
                // Create knowledge base
                const response = await axios.post(`${BASE_URL}/api/knowledgebase`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setIsLoading(false);

                if (response.data.status === 'success') {
                    fetchKnowledgeBases();
                    showMessage('Knowledge base has been saved successfully.');
                    setAddKnowledgeBaseModal(false);
                } else {
                    showMessage(response.data.message || 'Failed to save knowledge base.', 'error');
                }
            }
        } catch (error: any) {
            showMessage(error?.response?.data?.message || 'Failed to save knowledge base', 'error');
            setIsLoading(false);
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
                    className={`panel absolute z-10 hidden h-full w-[240px] max-w-full flex-none space-y-4 p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md ${isShowKnowledgeBaseMenu && '!block'
                        }`}
                >
                    <div className="flex h-full flex-col pb-16">
                        <div className="pb-5">
                            <div className="flex items-center text-center">
                                <div className="shrink-0">
                                    <IconClipboardText />
                                </div>
                                <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Knowledge Base</h3>
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
                                        <div className="ltr:ml-3 rtl:mr-3">All Documents</div>
                                    </div>
                                    <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                                        {pager.totalKnowledgeBases}
                                    </div>
                                </button>
                            </div>
                        </PerfectScrollbar>
                        <div className="absolute bottom-0 w-full p-4 ltr:left-0 rtl:right-0">
                            <button className="btn btn-primary w-full" type="button" onClick={() => addEditKnowledgeBase()}>
                                <IconPlus className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                Add New Document
                            </button>
                        </div>
                    </div>
                </div>
                <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowKnowledgeBaseMenu && '!block xl:!hidden'}`} onClick={() => setIsShowKnowledgeBaseMenu(!isShowKnowledgeBaseMenu)}></div>
                <div className="panel h-full flex-1 overflow-auto p-0">
                    <div className="flex h-full flex-col">
                        <div className="flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center">
                            <div className="flex items-center ltr:mr-3 rtl:ml-3">
                                <button type="button" className="block hover:text-primary ltr:mr-3 rtl:ml-3 xl:hidden" onClick={() => setIsShowKnowledgeBaseMenu(!isShowKnowledgeBaseMenu)}>
                                    <IconMenu />
                                </button>
                                <div className="group relative flex-1">
                                    <input
                                        type="text"
                                        className="peer form-input ltr:!pr-10 rtl:!pl-10"
                                        placeholder="Search Documents..."
                                        value={searchKnowledgeBase}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                    <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                                        <IconSearch />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:flex-auto sm:justify-end">
                                <p className="ltr:mr-3 rtl:ml-3">
                                    {Math.min((pager.currentPage - 1) * pager.pageSize + 1, pager.totalKnowledgeBases)}-
                                    {Math.min(pager.currentPage * pager.pageSize, pager.totalKnowledgeBases)} of {pager.totalKnowledgeBases}
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
                        ) : pagedKnowledgeBases.length ? (
                            <div className="table-responsive min-h-[400px] grow overflow-y-auto sm:min-h-[300px]">
                                <table className="table-hover">
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Description</th>
                                            <th>File</th>
                                            <th>Created At</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pagedKnowledgeBases.map((knowledgeBase: any) => {
                                            return (
                                                <tr className="group" key={knowledgeBase.id}>
                                                    <td>
                                                        <div className="flex items-center">
                                                            <div className="ltr:mr-3 rtl:ml-3">
                                                                <div className="grid h-10 w-10 place-content-center rounded-full bg-gray-300 text-sm font-semibold text-white dark:bg-gray-700">
                                                                    {knowledgeBase?.title?.charAt(0)}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="whitespace-nowrap text-base font-semibold group-hover:text-primary">
                                                                    {knowledgeBase?.title}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center">
                                                            <div className="font-medium">{knowledgeBase?.description || '-'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="font-semibold">
                                                        <div className="flex items-center">
                                                            <a 
                                                                href={`${BASE_URL}/uploads/knowledgebase/${knowledgeBase?.file}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-primary hover:underline"
                                                            >
                                                                {knowledgeBase?.file}
                                                            </a>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {new Date(knowledgeBase.createdAt).toLocaleDateString()}
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
                                                                            <button type="button" onClick={() => addEditKnowledgeBase(knowledgeBase)}>
                                                                                <IconPencilPaper className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                Edit
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => viewKnowledgeBase(knowledgeBase)}>
                                                                                <IconClipboardText className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                                                                View Details
                                                                            </button>
                                                                        </li>
                                                                        <li>
                                                                            <button type="button" onClick={() => deleteKnowledgeBase(knowledgeBase)}>
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
                                No documents found
                            </div>
                        )}
                    </div>
                </div>

                {/* Add/Edit Knowledge Base Modal */}
                <Transition appear show={addKnowledgeBaseModal} as={Fragment}>
                    <Dialog as="div" open={addKnowledgeBaseModal} onClose={() => setAddKnowledgeBaseModal(false)} className="relative z-50">
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
                                            onClick={() => setAddKnowledgeBaseModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            {params.id ? 'Edit Document' : 'Add New Document'}
                                        </div>
                                        <div className="p-5">
                                            <form>
                                                <div className="mb-5">
                                                    <label htmlFor="title">Title *</label>
                                                    <input
                                                        id="title"
                                                        type="text"
                                                        placeholder="Enter Document Title"
                                                        className="form-input"
                                                        required
                                                        value={params.title}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="description">Description *</label>
                                                    <textarea
                                                        id="description"
                                                        rows={3}
                                                        placeholder="Enter Document Description"
                                                        className="form-textarea"
                                                        required
                                                        value={params.description}
                                                        onChange={(e) => changeValue(e)}
                                                    ></textarea>
                                                </div>
                                                <div className="mb-5">
                                                    <label htmlFor="file">
                                                        PDF File {!params.id && '*'}
                                                    </label>
                                                    <input
                                                        id="file"
                                                        type="file"
                                                        accept=".pdf"
                                                        className="form-input"
                                                        required={!params.id}
                                                        onChange={(e) => changeValue(e)}
                                                    />
                                                    {params.id && (
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            Leave empty to keep current file
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                                                    <button type="button" className="btn btn-outline-danger" onClick={() => setAddKnowledgeBaseModal(false)}>
                                                        Cancel
                                                    </button>
                                                    <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" disabled={isLoading} onClick={() => saveKnowledgeBase()}>
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

                {/* View Knowledge Base Modal */}
                <Transition appear show={viewKnowledgeBaseModal} as={Fragment}>
                    <Dialog as="div" open={viewKnowledgeBaseModal} onClose={() => setViewKnowledgeBaseModal(false)} className="relative z-50">
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
                                            onClick={() => setViewKnowledgeBaseModal(false)}
                                            className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                                        >
                                            <IconX />
                                        </button>
                                        <div className="flex flex-wrap items-center gap-2 bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                                            <div>{selectedKnowledgeBase?.title}</div>
                                        </div>
                                        <div className="p-5">
                                            <div className="space-y-4">
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Title</div>
                                                    <div className="w-3/4 font-semibold">{selectedKnowledgeBase?.title}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Description</div>
                                                    <div className="w-3/4">{selectedKnowledgeBase?.description}</div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">File</div>
                                                    <div className="w-3/4">
                                                        <a 
                                                            href={`${BASE_URL}/uploads/${selectedKnowledgeBase?.file}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline"
                                                        >
                                                            {selectedKnowledgeBase?.file}
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Content</div>
                                                    <div className="w-3/4">
                                                        <div className="prose dark:prose-invert max-w-none p-4 border rounded bg-gray-50 dark:bg-gray-900 max-h-60 overflow-y-auto">
                                                            {selectedKnowledgeBase?.content || 'No content extracted'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <div className="w-1/4 text-gray-500 dark:text-gray-400">Created At</div>
                                                    <div className="w-3/4">
                                                        {new Date(selectedKnowledgeBase?.createdAt).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex items-center justify-end gap-4">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => {
                                                        setViewKnowledgeBaseModal(false);
                                                        setTimeout(() => addEditKnowledgeBase(selectedKnowledgeBase), 300);
                                                    }}
                                                >
                                                    <IconPencilPaper className="ltr:mr-2 rtl:ml-2" />
                                                    Edit Document
                                                </button>
                                                <button type="button" className="btn btn-outline-danger" onClick={() => setViewKnowledgeBaseModal(false)}>
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

export default KnowledgeBasePage;