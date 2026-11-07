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
import { IRootState } from '@/store';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import React, { Fragment, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import PerfectScrollbar from 'react-perfect-scrollbar';

const TeamPage = () => {
  const defaultParams = {
    id: null,
    name: '',
    role: '',
    email: '',
    phone: '',
    location: '',
    status: 'active',
    avatar: '',
  };

  const [selectedTab, setSelectedTab] = useState('');
  const [isShowTeamMenu, setIsShowTeamMenu] = useState(false);
  const [addTeamModal, setAddTeamModal] = useState(false);
  const [viewTeamModal, setViewTeamModal] = useState(false);
  const [params, setParams] = useState<any>(JSON.parse(JSON.stringify(defaultParams)));

  // Team member data
  const [allTeams, setAllTeams] = useState([
    {
      id: 1,
      name: 'John Smith',
      role: 'Lead Developer',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
      status: 'active',
      avatar: 'profile-15.jpeg',
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      role: 'Product Manager',
      email: 'sarah.j@example.com',
      phone: '+1 (555) 987-6543',
      location: 'New York, NY',
      status: 'active',
      avatar: 'profile-1.jpeg',
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'UX Designer',
      email: 'michael.c@example.com',
      phone: '+1 (555) 234-5678',
      location: 'Seattle, WA',
      status: 'active',
      avatar: 'profile-5.jpeg',
    },
    {
      id: 4,
      name: 'Emily Rodriguez',
      role: 'Marketing Director',
      email: 'emily.r@example.com',
      phone: '+1 (555) 876-5432',
      location: 'Chicago, IL',
      status: 'active',
      avatar: 'profile-16.jpeg',
    },
    {
      id: 5,
      name: 'David Wilson',
      role: 'Sales Executive',
      email: 'david.w@example.com',
      phone: '+1 (555) 345-6789',
      location: 'Austin, TX',
      status: 'inactive',
      avatar: 'profile-17.jpeg',
    },
    {
      id: 6,
      name: 'Jessica Lee',
      role: 'Frontend Developer',
      email: 'jessica.l@example.com',
      phone: '+1 (555) 765-4321',
      location: 'Boston, MA',
      status: 'active',
      avatar: 'profile-18.jpeg',
    },
    {
      id: 7,
      name: 'Robert Garcia',
      role: 'Data Analyst',
      email: 'robert.g@example.com',
      phone: '+1 (555) 456-7890',
      location: 'Denver, CO',
      status: 'active',
      avatar: 'profile-20.jpeg',
    },
    {
      id: 8,
      name: 'Amanda Thompson',
      role: 'Customer Success',
      email: 'amanda.t@example.com',
      phone: '+1 (555) 654-3210',
      location: 'Miami, FL',
      status: 'on leave',
      avatar: 'profile-24.jpeg',
    },
    {
      id: 9,
      name: 'Kevin Patel',
      role: 'DevOps Engineer',
      email: 'kevin.p@example.com',
      phone: '+1 (555) 543-2109',
      location: 'Portland, OR',
      status: 'active',
      avatar: 'profile-25.jpeg',
    },
    {
      id: 10,
      name: 'Lisa Anderson',
      role: 'HR Manager',
      email: 'lisa.a@example.com',
      phone: '+1 (555) 321-0987',
      location: 'Atlanta, GA',
      status: 'active',
      avatar: 'profile-26.jpeg',
    },
    {
        id: 11,
        name: 'Lisa Anderson',
        role: 'HR Manager',
        email: 'lisa.a@example.com',
        phone: '+1 (555) 321-0987',
        location: 'Atlanta, GA',
        status: 'active',
        avatar: 'profile-26.jpeg',
      },
  ]);

  const [filteredTeams, setFilteredTeams] = useState<any>(allTeams);
  const [pagedTeams, setPagedTeams] = useState<any>(filteredTeams);
  const [searchTeam, setSearchTeam] = useState<any>('');
  const [selectedTeam, setSelectedTeam] = useState<any>(defaultParams);

  const [pager] = useState<any>({
    currentPage: 1,
    totalPages: 0,
    pageSize: 10,
    startIndex: 0,
    endIndex: 0,
  });

  useEffect(() => {
    searchTeams();
  }, [selectedTab, searchTeam, allTeams]);

  const changeValue = (e: any) => {
    const { value, id } = e.target;
    setParams({ ...params, [id]: value });
  };

  const searchTeams = (isResetPage = true) => {
    if (isResetPage) {
      pager.currentPage = 1;
    }
    let res;
    
    if (selectedTab === 'active' || selectedTab === 'inactive' || selectedTab === 'on leave') {
      res = allTeams.filter((d) => d.status === selectedTab);
    } else {
      res = allTeams;
    }

    setFilteredTeams([...res.filter((d: any) => 
      d.name?.toLowerCase().includes(searchTeam) || 
      d.email?.toLowerCase().includes(searchTeam) ||
      d.role?.toLowerCase().includes(searchTeam)
    )]);
    getPager(res.filter((d: any) => 
      d.name?.toLowerCase().includes(searchTeam) || 
      d.email?.toLowerCase().includes(searchTeam) ||
      d.role?.toLowerCase().includes(searchTeam)
    ));
  };

  const getPager = (res: any) => {
    setTimeout(() => {
      if (res.length) {
        pager.totalPages = pager.pageSize < 1 ? 1 : Math.ceil(res.length / pager.pageSize);
        if (pager.currentPage > pager.totalPages) {
          pager.currentPage = 1;
        }
        pager.startIndex = (pager.currentPage - 1) * pager.pageSize;
        pager.endIndex = Math.min(pager.startIndex + pager.pageSize - 1, res.length - 1);
        setPagedTeams(res.slice(pager.startIndex, pager.endIndex + 1));
      } else {
        setPagedTeams([]);
        pager.startIndex = -1;
        pager.endIndex = -1;
      }
    });
  };

  const tabChanged = () => {
    setIsShowTeamMenu(false);
  };

  const viewTeam = (item: any = null) => {
    setSelectedTeam(item);
    setTimeout(() => {
      setViewTeamModal(true);
    });
  };

  const addEditTeam = (team: any = null) => {
    setIsShowTeamMenu(false);
    let json = JSON.parse(JSON.stringify(defaultParams));
    setParams(json);
    if (team) {
      let json1 = JSON.parse(JSON.stringify(team));
      setParams(json1);
    }
    setAddTeamModal(true);
  };

  const deleteTeam = (team: any) => {
    setAllTeams(allTeams.filter((d: any) => d.id !== team.id));
    searchTeams(false);
    showMessage('Team member has been deleted.');
  };

  const saveTeam = () => {
    if (!params.name) {
      showMessage('Name is required.', 'error');
      return false;
    }
    if (params.id) {
      // Update team member
      setAllTeams(
        allTeams.map((d: any) => {
          if (d.id === params.id) {
            d = params;
          }
          return d;
        }),
      );
    } else {
      // Add team member
      const maxId = allTeams?.length ? allTeams.reduce((max, obj) => (obj.id > max ? obj.id : max), allTeams[0].id) : 0;
      let team = params;
      team.id = maxId + 1;
      allTeams.unshift(team);
      searchTeams();
    }
    showMessage('Team member has been saved successfully.');
    setAddTeamModal(false);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-outline-success">Active</span>;
      case 'inactive':
        return <span className="badge badge-outline-danger">Inactive</span>;
      case 'on leave':
        return <span className="badge badge-outline-warning">On Leave</span>;
      default:
        return <span className="badge badge-outline-info">{status}</span>;
    }
  };

  return (
    <div>
      <div className="relative flex h-full gap-5 sm:h-[calc(100vh_-_150px)]">
        <div
          className={`panel absolute z-10 hidden h-full w-[240px] max-w-full flex-none space-y-4 p-4 ltr:rounded-r-none rtl:rounded-l-none xl:relative xl:block xl:h-auto ltr:xl:rounded-r-md rtl:xl:rounded-l-md ${
            isShowTeamMenu && '!block'
          }`}
        >
          <div className="flex h-full flex-col pb-16">
            <div className="pb-5">
              <div className="flex items-center text-center">
                <div className="shrink-0">
                  <IconUser />
                </div>
                <h3 className="text-lg font-semibold ltr:ml-3 rtl:mr-3">Team Members</h3>
              </div>
            </div>
            <div className="mb-5 h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>
            <PerfectScrollbar className="relative h-full grow ltr:-mr-3.5 ltr:pr-3.5 rtl:-ml-3.5 rtl:pl-3.5">
              <div className="space-y-1">
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                    selectedTab === '' ? 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary' : ''
                  }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('');
                  }}
                >
                  <div className="flex items-center">
                    <IconListCheck className="h-4.5 w-4.5 shrink-0" />
                    <div className="ltr:ml-3 rtl:mr-3">All Members</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allTeams && allTeams.length}
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                    selectedTab === 'active' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                  }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('active');
                  }}
                >
                  <div className="flex items-center">
                    <IconThumbUp className="h-5 w-5 shrink-0" />
                    <div className="ltr:ml-3 rtl:mr-3">Active</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allTeams && allTeams.filter((d) => d.status === 'active').length}
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                    selectedTab === 'inactive' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                  }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('inactive');
                  }}
                >
                  <div className="flex items-center">
                    <IconSquareRotated className="h-5 w-5 shrink-0 fill-danger" />
                    <div className="ltr:ml-3 rtl:mr-3">Inactive</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allTeams && allTeams.filter((d) => d.status === 'inactive').length}
                  </div>
                </button>
                <button
                  type="button"
                  className={`flex h-10 w-full items-center justify-between rounded-md p-2 font-medium hover:bg-white-dark/10 hover:text-primary dark:hover:bg-[#181F32] dark:hover:text-primary ${
                    selectedTab === 'on leave' && 'bg-gray-100 text-primary dark:bg-[#181F32] dark:text-primary'
                  }`}
                  onClick={() => {
                    tabChanged();
                    setSelectedTab('on leave');
                  }}
                >
                  <div className="flex items-center">
                    <IconStar className="shrink-0" />
                    <div className="ltr:ml-3 rtl:mr-3">On Leave</div>
                  </div>
                  <div className="whitespace-nowrap rounded-md bg-primary-light px-2 py-0.5 font-semibold dark:bg-[#060818]">
                    {allTeams && allTeams.filter((d) => d.status === 'on leave').length}
                  </div>
                </button>
              </div>
            </PerfectScrollbar>
            <div className="absolute bottom-0 w-full p-4 ltr:left-0 rtl:right-0">
              <button className="btn btn-primary w-full" type="button" onClick={() => addEditTeam()}>
                <IconPlus className="shrink-0 ltr:mr-2 rtl:ml-2" />
                Add New Member
              </button>
            </div>
          </div>
        </div>
        <div className={`overlay absolute z-[5] hidden h-full w-full rounded-md bg-black/60 ${isShowTeamMenu && '!block xl:!hidden'}`} onClick={() => setIsShowTeamMenu(!isShowTeamMenu)}></div>
        <div className="panel h-full flex-1 overflow-auto p-0">
          <div className="flex h-full flex-col">
            <div className="flex w-full flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex items-center ltr:mr-3 rtl:ml-3">
                <button type="button" className="block hover:text-primary ltr:mr-3 rtl:ml-3 xl:hidden" onClick={() => setIsShowTeamMenu(!isShowTeamMenu)}>
                  <IconMenu />
                </button>
                <div className="group relative flex-1">
                  <input
                    type="text"
                    className="peer form-input ltr:!pr-10 rtl:!pl-10"
                    placeholder="Search Team Member..."
                    value={searchTeam}
                    onChange={(e) => setSearchTeam(e.target.value)}
                    onKeyUp={() => searchTeams()}
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
                    <IconSearch />
                  </div>
                </div>
              </div>
              <div className="flex flex-1 items-center justify-center sm:flex-auto sm:justify-end">
                <p className="ltr:mr-3 rtl:ml-3">{pager.startIndex + 1 + '-' + (pager.endIndex + 1) + ' of ' + filteredTeams.length}</p>
                <button
                  type="button"
                  disabled={pager.currentPage === 1}
                  className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 ltr:mr-3 rtl:ml-3 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                  onClick={() => {
                    pager.currentPage--;
                    searchTeams(false);
                  }}
                >
                  <IconCaretDown className="h-5 w-5 rotate-90 rtl:-rotate-90" />
                </button>
                <button
                  type="button"
                  disabled={pager.currentPage === pager.totalPages}
                  className="rounded-md bg-[#f4f4f4] p-1 enabled:hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white-dark/20 enabled:dark:hover:bg-white-dark/30"
                  onClick={() => {
                    pager.currentPage++;
                    searchTeams(false);
                  }}
                >
                  <IconCaretDown className="h-5 w-5 -rotate-90 rtl:rotate-90" />
                </button>
              </div>
            </div>
            <div className="h-px w-full border-b border-white-light dark:border-[#1b2e4b]"></div>

            {pagedTeams.length ? (
              <div className="table-responsive min-h-[400px] grow overflow-y-auto sm:min-h-[300px]">
                <table className="table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedTeams.map((team: any) => {
                      return (
                        <tr className="group cursor-pointer" key={team.id}>
                          <td>
                            <div className="flex items-center">
                              <div className="ltr:mr-3 rtl:ml-3">
                                {team.avatar ? (
                                  <img src={`/assets/images/${team.avatar}`} className="h-10 w-10 rounded-full object-cover" alt="avatar" />
                                ) : (
                                  <div className="grid h-10 w-10 place-content-center rounded-full bg-gray-300 text-sm font-semibold dark:bg-gray-700">
                                    {team.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div onClick={() => viewTeam(team)}>
                                <div className="whitespace-nowrap text-base font-semibold group-hover:text-primary">
                                  {team.name}
                                </div>
                                <div className="text-white-dark">
                                  {team.phone}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="font-medium">{team.role}</div>
                            <div className="text-white-dark">{team.location}</div>
                          </td>
                          <td>
                            <a href={`mailto:${team.email}`} className="text-primary hover:underline">
                              {team.email}
                            </a>
                          </td>
                          <td>{getStatusBadge(team.status)}</td>
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
                                      <button type="button" onClick={() => addEditTeam(team)}>
                                        <IconPencilPaper className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        Edit
                                      </button>
                                    </li>
                                    <li>
                                      <button type="button" onClick={() => viewTeam(team)}>
                                        <IconUser className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                                        View Details
                                      </button>
                                    </li>
                                    <li>
                                      <button type="button" onClick={() => deleteTeam(team)}>
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
                No team members found
              </div>
            )}
          </div>
        </div>

        <Transition appear show={addTeamModal} as={Fragment}>
          <Dialog as="div" open={addTeamModal} onClose={() => setAddTeamModal(false)} className="relative z-50">
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
                      onClick={() => setAddTeamModal(false)}
                      className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                    >
                      <IconX />
                    </button>
                    <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                      {params.id ? 'Edit Team Member' : 'Add Team Member'}
                    </div>
                    <div className="p-5">
                      <form>
                        <div className="mb-5">
                          <label htmlFor="name">Full Name</label>
                          <input 
                            id="name" 
                            type="text" 
                            placeholder="Enter Full Name" 
                            className="form-input" 
                            value={params.name} 
                            onChange={(e) => changeValue(e)} 
                          />
                        </div>
                        <div className="mb-5">
                          <label htmlFor="role">Role</label>
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
                          <label htmlFor="email">Email</label>
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
                          <label htmlFor="phone">Phone</label>
                          <input 
                            id="phone" 
                            type="text" 
                            placeholder="Enter Phone Number" 
                            className="form-input" 
                            value={params.phone} 
                            onChange={(e) => changeValue(e)} 
                          />
                        </div>
                        <div className="mb-5">
                          <label htmlFor="location">Location</label>
                          <input 
                            id="location" 
                            type="text" 
                            placeholder="Enter Location" 
                            className="form-input" 
                            value={params.location} 
                            onChange={(e) => changeValue(e)} 
                          />
                        </div>
                        <div className="mb-5">
                          <label htmlFor="status">Status</label>
                          <select 
                            id="status" 
                            className="form-select" 
                            value={params.status} 
                            onChange={(e) => changeValue(e)}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="on leave">On Leave</option>
                          </select>
                        </div>
                        <div className="mt-8 flex items-center justify-end ltr:text-right rtl:text-left">
                          <button type="button" className="btn btn-outline-danger" onClick={() => setAddTeamModal(false)}>
                            Cancel
                          </button>
                          <button type="button" className="btn btn-primary ltr:ml-4 rtl:mr-4" onClick={() => saveTeam()}>
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

        <Transition appear show={viewTeamModal} as={Fragment}>
          <Dialog as="div" open={viewTeamModal} onClose={() => setViewTeamModal(false)} className="relative z-50">
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
                      onClick={() => setViewTeamModal(false)}
                      className="absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                    >
                      <IconX />
                    </button>
                    <div className="flex flex-wrap items-center gap-2 bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">
                      <div>{selectedTeam.name}</div>
                      {getStatusBadge(selectedTeam.status)}
                    </div>
                    <div className="p-5">
                      <div className="flex items-center mb-7">
                        <div className="ltr:mr-4 rtl:ml-4">
                          {selectedTeam.avatar ? (
                            <img src={`/assets/images/${selectedTeam.avatar}`} className="h-16 w-16 rounded-full object-cover" alt="avatar" />
                          ) : (
                            <div className="grid h-16 w-16 place-content-center rounded-full bg-gray-300 text-xl font-semibold dark:bg-gray-700">
                              {selectedTeam.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-bold">{selectedTeam.name}</h2>
                          <p className="text-primary">{selectedTeam.role}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-1/4 text-gray-500 dark:text-gray-400">Email</div>
                          <div className="w-3/4">
                            <a href={`mailto:${selectedTeam.email}`} className="text-primary hover:underline">
                              {selectedTeam.email}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1/4 text-gray-500 dark:text-gray-400">Phone</div>
                          <div className="w-3/4">{selectedTeam.phone}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1/4 text-gray-500 dark:text-gray-400">Location</div>
                          <div className="w-3/4">{selectedTeam.location}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="w-1/4 text-gray-500 dark:text-gray-400">Status</div>
                          <div className="w-3/4">{getStatusBadge(selectedTeam.status)}</div>
                        </div>
                      </div>
                      
                      <div className="mt-8 flex items-center justify-end">
                        <button type="button" className="btn btn-outline-danger" onClick={() => setViewTeamModal(false)}>
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

export default TeamPage;