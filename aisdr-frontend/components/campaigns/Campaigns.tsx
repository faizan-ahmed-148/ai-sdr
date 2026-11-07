'use client';
import { Fragment, useState } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import IconClipboardText from '@/components/icon/icon-clipboard-text';
import IconPlus from '@/components/icon/icon-plus';
import IconSearch from '@/components/icon/icon-search';
import IconCaretDown from '@/components/icon/icon-caret-down';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconPencilPaper from '@/components/icon/icon-pencil-paper';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconCalendar from '@/components/icon/icon-calendar';
import IconUser from '@/components/icon/icon-user';
import IconSend from '@/components/icon/icon-send';
import IconThumbUp from '@/components/icon/icon-thumb-up';
import IconX from '@/components/icon/icon-x';
import IconSettings from '@/components/icon/icon-settings';
import IconListCheck from '@/components/icon/icon-list-check';
import IconBrain from '@/components/icon/icon-box';
import IconEye from '@/components/icon/icon-eye';
import Swal from 'sweetalert2';

// Interfaces for type safety
interface TeamMember {
  id: number;
  name: string;
  email: string;
  linkedin: boolean;
}

interface AIModel {
  id: number;
  name: string;
  provider: string;
}

interface Campaign {
  id: number;
  name: string;
  goal: string;
  status: 'active' | 'paused' | 'completed';
  created: string;
  emailsSent: number;
  meetingsBooked: number;
  replyRate: number;
}

interface SequenceItem {
  days?: number;
  action?: string;
  content: string;
}

interface CampaignData {
  name: string;
  goal: string;
  calendarLink: string;
  emailSequence: SequenceItem[];
  linkedInSequence: SequenceItem[];
  smsSequence: SequenceItem[];
  teamMembers: number[];
  timezone: string;
  schedule: { start: string; end: string };
  limits: { email: number; linkedin: number; sms: number };
  settings: {
    includeName: boolean;
    unsubscribeLink: boolean;
    aiReplies: boolean;
    aiMemes: boolean;
    aiVideos: boolean;
  };
  aiModel: number;
  generatedContent: any[];
  [key: string]: any;
}

type SequenceType = 'emailSequence' | 'linkedInSequence' | 'smsSequence';

// Dummy data
const teamMembers: TeamMember[] = [
  { id: 1, name: 'John Doe', email: 'john@company.com', linkedin: true },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com', linkedin: true },
  { id: 3, name: 'Robert Johnson', email: 'robert@company.com', linkedin: false },
];

const aiModels: AIModel[] = [
  { id: 1, name: 'OpenAI GPT-4o', provider: 'OpenAI' },
  { id: 2, name: 'Anthropic Claude', provider: 'Anthropic' },
  { id: 3, name: 'Custom LLM', provider: 'Custom API' },
];

const campaignsData: Campaign[] = [
  {
    id: 1,
    name: 'Q3 Enterprise Outreach',
    goal: 'Book meetings',
    status: 'active',
    created: '2023-06-15',
    emailsSent: 1245,
    meetingsBooked: 42,
    replyRate: 12.3,
  },
  {
    id: 2,
    name: 'Startup Partnership Program',
    goal: 'Generate replies',
    status: 'paused',
    created: '2023-06-10',
    emailsSent: 876,
    meetingsBooked: 28,
    replyRate: 9.7,
  },
  {
    id: 3,
    name: 'Enterprise Solution Demo',
    goal: 'Book meetings',
    status: 'completed',
    created: '2023-05-28',
    emailsSent: 2100,
    meetingsBooked: 67,
    replyRate: 15.2,
  },
];

const initialCampaignData: CampaignData = {
  name: '',
  goal: 'book-meetings',
  calendarLink: '',
  emailSequence: [{ days: 2, content: '' }],
  linkedInSequence: [
    { action: 'connect', content: '' },
    { action: 'message', content: '' },
  ],
  smsSequence: [{ days: 1, content: '' }],
  teamMembers: [1],
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  schedule: { start: '09:00', end: '17:00' },
  limits: { email: 50, linkedin: 20, sms: 10 },
  settings: {
    includeName: true,
    unsubscribeLink: true,
    aiReplies: true,
    aiMemes: false,
    aiVideos: false,
  },
  aiModel: 1,
  generatedContent: [],
};

const CampaignsPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>(campaignsData);
  const [searchCampaign, setSearchCampaign] = useState('');
  const [addCampaignModal, setAddCampaignModal] = useState(false);
  const [viewCampaignModal, setViewCampaignModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<number | null>(null);

  // Campaign form state
  const [campaignData, setCampaignData] = useState<CampaignData>(initialCampaignData);

  const filteredCampaigns = campaigns.filter(campaign => 
    campaign.name.toLowerCase().includes(searchCampaign.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaignData({ ...campaignData, [name]: value });
  };

  const handleSequenceChange = (type: SequenceType, index: number, value: string) => {
    const newSequence = [...campaignData[type]];
    newSequence[index].content = value;
    setCampaignData({ ...campaignData, [type]: newSequence });
  };

  const addSequenceItem = (type: SequenceType) => {
    const newItem = type === 'emailSequence' ? { days: 2, content: '' } : 
                    type === 'linkedInSequence' ? { action: 'message', content: '' } : 
                    { days: 1, content: '' };
    
    setCampaignData({ 
      ...campaignData, 
      [type]: [...campaignData[type], newItem] 
    });
  };

  const removeSequenceItem = (type: SequenceType, index: number) => {
    const newSequence = [...campaignData[type]];
    newSequence.splice(index, 1);
    setCampaignData({ ...campaignData, [type]: newSequence });
  };

  const toggleTeamMember = (id: number) => {
    setCampaignData(prev => {
      const exists = prev.teamMembers.includes(id);
      return {
        ...prev,
        teamMembers: exists 
          ? prev.teamMembers.filter(memberId => memberId !== id) 
          : [...prev.teamMembers, id]
      };
    });
  };

  const generateContent = () => {
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      const generated = [
        { type: 'email', content: `Hi {firstName},\n\nI noticed your work at {company} and thought our solution could help you achieve {goal}. Would you be open to a quick chat next week?` },
        { type: 'linkedin', content: `Hi {firstName}, I just sent you an email about how we help companies like {company}. Let me know if you'd like to connect!` },
        { type: 'sms', content: `Hi {firstName}, just checking if you saw my email about {company}? Let me know if you'd like to chat!` }
      ];
      
      setCampaignData((prev) => ({
        ...prev,
        generatedContent: generated,
        emailSequence: prev.emailSequence.map((item, i) => 
          i === 0 ? { ...item, content: generated[0].content } : item
        ),
        linkedInSequence: prev.linkedInSequence.map((item, i) => 
          i === 1 ? { ...item, content: generated[1].content } : item
        ),
        smsSequence: prev.smsSequence.map((item, i) => 
          i === 0 ? { ...item, content: generated[2].content } : item
        )
      }));
      setIsGenerating(false);
      setCurrentStep(7);
    }, 2000);
  };

  const saveCampaign = () => {
    if (isEditing && editingCampaignId) {
      // Update existing campaign
      setCampaigns(campaigns.map(c => 
        c.id === editingCampaignId ? { 
          ...c, 
          name: campaignData.name,
          goal: campaignData.goal === 'book-meetings' ? 'Book meetings' : 'Generate replies',
        } : c
      ));
      showMessage('Campaign updated successfully!');
    } else {
      // Create new campaign
      const newCampaign: Campaign = {
        id: campaigns.length + 1,
        name: campaignData.name,
        goal: campaignData.goal === 'book-meetings' ? 'Book meetings' : 'Generate replies',
        status: 'active',
        created: new Date().toISOString().split('T')[0],
        emailsSent: 0,
        meetingsBooked: 0,
        replyRate: 0,
      };

      setCampaigns([...campaigns, newCampaign]);
      showMessage('Campaign created successfully!');
    }

    setAddCampaignModal(false);
    setCurrentStep(1);
    setIsEditing(false);
    setEditingCampaignId(null);
    setCampaignData(initialCampaignData);
  };

  const deleteCampaign = (id: number) => {
    setCampaigns(campaigns.filter(campaign => campaign.id !== id));
    showMessage('Campaign has been deleted.');
  };

  const handleEditCampaign = (campaign: Campaign) => {
    setIsEditing(true);
    setEditingCampaignId(campaign.id);
    setCampaignData({
      ...initialCampaignData,
      name: campaign.name,
      goal: campaign.goal === 'Book meetings' ? 'book-meetings' : 'generate-replies',
    });
    setAddCampaignModal(true);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="badge badge-outline-primary">Active</span>;
      case 'paused': return <span className="badge badge-outline-warning">Paused</span>;
      case 'completed': return <span className="badge badge-outline-success">Completed</span>;
      default: return <span className="badge badge-outline-info">{status}</span>;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 campaignData={campaignData} handleInputChange={handleInputChange} />;
      case 2: return (
        <Step2 
          campaignData={campaignData} 
          handleSequenceChange={handleSequenceChange}
          addSequenceItem={addSequenceItem}
          removeSequenceItem={removeSequenceItem}
        />
      );
      case 3: return (
        <Step3 
          campaignData={campaignData} 
          teamMembers={teamMembers} 
          toggleTeamMember={toggleTeamMember} 
        />
      );
      case 4: return <Step4 campaignData={campaignData} handleInputChange={handleInputChange} />;
      case 5: return <Step5 campaignData={campaignData} handleInputChange={handleInputChange} />;
      case 6: return <Step6 campaignData={campaignData} handleInputChange={handleInputChange} aiModels={aiModels} />;
      case 7: return (
        <Step7 
          campaignData={campaignData} 
          handleSequenceChange={handleSequenceChange}
          isGenerating={isGenerating}
        />
      );
      default: return <Step1 campaignData={campaignData} handleInputChange={handleInputChange} />;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 p-4">
        <h2 className="text-xl font-bold">Campaigns</h2>
        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Campaigns..."
              className="peer form-input py-2 ltr:pr-11 rtl:pl-11"
              value={searchCampaign}
              onChange={e => setSearchCampaign(e.target.value)}
            />
            <div className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]">
              <IconSearch />
            </div>
          </div>
          <button 
            type="button" 
            className="btn btn-primary flex gap-2"
            onClick={() => {
              setAddCampaignModal(true);
              setIsEditing(false);
              setEditingCampaignId(null);
              setCampaignData(initialCampaignData);
            }}
          >
            <IconPlus />
            Add Campaign
          </button>
        </div>
      </div>

      <div className="table-responsive min-h-[400px] grow overflow-y-auto sm:min-h-[300px]">
        <table className="table-hover min-w-[800px] border">
          <thead className='border'> 
            <tr className='border'>
              <th>Campaign Name</th>
              <th>Goal</th>
              <th>Status</th>
              <th>Created</th>
              <th>Emails Sent</th>
              <th>Meetings</th>
              <th>Reply Rate</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody className='border'>
            {filteredCampaigns.map(campaign => (
              <tr key={campaign.id} className="group cursor-pointer border" >
                <td>
                  <div className="font-semibold hover:text-primary cursor-pointer" 
                    onClick={() => {
                      setSelectedCampaign(campaign);
                      setViewCampaignModal(true);
                    }}
                  >
                    {campaign.name}
                  </div>
                </td>
                <td>{campaign.goal}</td>
                <td>{getStatusBadge(campaign.status)}</td>
                <td>{campaign.created}</td>
                <td>{campaign.emailsSent}</td>
                <td>{campaign.meetingsBooked}</td>
                <td>{campaign.replyRate}%</td>
                <td className="text-center">
                  <div className="flex justify-center">
                    <div className="dropdown ">
                      <ul className="dropdown-content min-w-[120px]" style={{backgroundColor: 'transparent', boxShadow: 'none'}}>
                        <li>
                          <button 
                            type="button" 
                            onClick={() => {
                              setSelectedCampaign(campaign);
                              setViewCampaignModal(true);
                            }}
                          >
                            <IconEye className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                            View Details
                          </button>
                        </li>
                        <li>
                          <button 
                            type="button" 
                            onClick={() => handleEditCampaign(campaign)}
                          >
                            <IconPencilPaper className="h-4.5 w-4.5 shrink-0 ltr:mr-2 rtl:ml-2" />
                            Edit
                          </button>
                        </li>
                        <li>
                          <button 
                            type="button" 
                            onClick={() => deleteCampaign(campaign.id)}
                          >
                            <IconTrashLines className="shrink-0 ltr:mr-2 rtl:ml-2" />
                            Delete
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Campaign Modal */}
      <Transition appear show={addCampaignModal} as={Fragment}>
        <Dialog as="div" open={addCampaignModal} onClose={() => setAddCampaignModal(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[black]/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="panel w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <h5 className="text-lg font-bold">
                      {isEditing ? 'Edit Campaign' : 
                       currentStep === 7 ? 'Review & Launch Campaign' : 
                       'Create New Campaign'}
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        setAddCampaignModal(false);
                        setIsEditing(false);
                        setEditingCampaignId(null);
                      }}
                      className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-600"
                    >
                      <IconX />
                    </button>
                  </div>
                  
                  {/* Step Navigation */}
                  <div className="flex flex-wrap border-b border-white-light px-5 py-3 dark:border-[#1b2e4b]">
                    {[1, 2, 3, 4, 5, 6, 7].map(step => (
                      <button
                        key={step}
                        type="button"
                        className={`flex items-center px-4 py-2 font-medium ${
                          currentStep === step 
                            ? 'text-primary border-b-2 border-primary' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                        onClick={() => setCurrentStep(step)}
                      >
                        {step === 1 && <IconClipboardText className="ltr:mr-2 rtl:ml-2" />}
                        {step === 2 && <IconListCheck className="ltr:mr-2 rtl:ml-2" />}
                        {step === 3 && <IconUser className="ltr:mr-2 rtl:ml-2" />}
                        {step === 4 && <IconCalendar className="ltr:mr-2 rtl:ml-2" />}
                        {step === 5 && <IconSettings className="ltr:mr-2 rtl:ml-2" />}
                        {step === 6 && <IconBrain className="ltr:mr-2 rtl:ml-2" />}
                        {step === 7 && <IconEye className="ltr:mr-2 rtl:ml-2" />}
                        Step {step}
                      </button>
                    ))}
                  </div>
                  
                  <div className="p-5">
                    {renderStep()}
                    
                    <div className="mt-8 flex items-center justify-between">
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        disabled={currentStep === 1}
                        onClick={() => setCurrentStep(currentStep - 1)}
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center gap-4">
                        {currentStep === 6 && (
                          <button
                            type="button"
                            className="btn btn-success flex items-center gap-2"
                            onClick={generateContent}
                            disabled={isGenerating}
                          >
                            {isGenerating ? 'Generating...' : (
                              <>
                                <IconBrain />
                                Generate Content
                              </>
                            )}
                          </button>
                        )}
                        
                        {currentStep < 7 ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => setCurrentStep(currentStep + 1)}
                          >
                            Next
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-success flex items-center gap-2"
                            onClick={saveCampaign}
                          >
                            <IconSend />
                            {isEditing ? 'Update Campaign' : 'Launch Campaign'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* View Campaign Modal */}
      <Transition appear show={viewCampaignModal} as={Fragment}>
        <Dialog as="div" open={viewCampaignModal} onClose={() => setViewCampaignModal(false)} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[black]/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-8">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="panel w-full max-w-2xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <h5 className="text-lg font-bold">Campaign Details</h5>
                    <button
                      type="button"
                      onClick={() => setViewCampaignModal(false)}
                      className="text-gray-400 hover:text-gray-800 dark:hover:text-gray-600"
                    >
                      <IconX />
                    </button>
                  </div>
                  <div className="p-5">
                    {selectedCampaign && (
                      <div className="space-y-6">
                        <div className="flex items-center">
                          <div className="grid h-16 w-16 place-content-center rounded-full bg-gray-300 text-xl font-semibold text-white dark:bg-gray-700">
                            {selectedCampaign.name.charAt(0)}
                          </div>
                          <div className="ltr:ml-4 rtl:mr-4">
                            <h2 className="text-xl font-bold">{selectedCampaign.name}</h2>
                            <div className="mt-1 flex items-center gap-2">
                              {getStatusBadge(selectedCampaign.status)}
                              <span className="text-gray-500 dark:text-gray-400">
                                Created: {selectedCampaign.created}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          <div className="rounded border border-white-light bg-gray-50 p-4 dark:border-dark dark:bg-[#060818]">
                            <div className="text-lg font-semibold text-primary">{selectedCampaign.emailsSent}</div>
                            <div className="text-sm text-gray-500">Emails Sent</div>
                          </div>
                          <div className="rounded border border-white-light bg-gray-50 p-4 dark:border-dark dark:bg-[#060818]">
                            <div className="text-lg font-semibold text-primary">{selectedCampaign.meetingsBooked}</div>
                            <div className="text-sm text-gray-500">Meetings Booked</div>
                          </div>
                          <div className="rounded border border-white-light bg-gray-50 p-4 dark:border-dark dark:bg-[#060818]">
                            <div className="text-lg font-semibold text-primary">{selectedCampaign.replyRate}%</div>
                            <div className="text-sm text-gray-500">Reply Rate</div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="mb-3 text-lg font-semibold">Campaign Goal</h4>
                          <p>{selectedCampaign.goal}</p>
                        </div>
                        
                        <div>
                          <h4 className="mb-3 text-lg font-semibold">Team Members</h4>
                          <div className="flex flex-wrap gap-2">
                            {teamMembers.slice(0, 3).map(member => (
                              <div key={member.id} className="flex items-center rounded-full bg-gray-100 px-3 py-1 dark:bg-gray-700">
                                <div className="h-2 w-2 rounded-full bg-success ltr:mr-2 rtl:ml-2"></div>
                                {member.name}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-4">
                          <button type="button" className="btn btn-outline-primary">
                            View Sequence
                          </button>
                          <button type="button" className="btn btn-outline-danger" onClick={() => setViewCampaignModal(false)}>
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

// Step Components
const Step1 = ({ campaignData, handleInputChange }: any) => (
  <div className="space-y-5">
    <div>
      <label htmlFor="name">Campaign Name *</label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="Enter campaign name"
        className="form-input"
        value={campaignData.name}
        onChange={handleInputChange}
        required
      />
    </div>
    
    <div>
      <label>Campaign Goal *</label>
      <div className="mt-2 flex flex-wrap gap-4">
        <label className="inline-flex cursor-pointer">
          <input
            type="radio"
            name="goal"
            value="book-meetings"
            checked={campaignData.goal === 'book-meetings'}
            onChange={handleInputChange}
            className="form-radio"
          />
          <span className="ltr:ml-2 rtl:mr-2">Book Meetings</span>
        </label>
        <label className="inline-flex cursor-pointer">
          <input
            type="radio"
            name="goal"
            value="generate-replies"
            checked={campaignData.goal === 'generate-replies'}
            onChange={handleInputChange}
            className="form-radio"
          />
          <span className="ltr:ml-2 rtl:mr-2">Generate Replies</span>
        </label>
      </div>
    </div>
    
    <div>
      <label htmlFor="calendarLink">Calendar Booking Link</label>
      <input
        id="calendarLink"
        name="calendarLink"
        type="url"
        placeholder="https://calendly.com/your-link"
        className="form-input"
        value={campaignData.calendarLink}
        onChange={handleInputChange}
      />
      <div className="mt-1 text-xs text-gray-500">
        Link to your Calendly, HubSpot, or other booking system
      </div>
    </div>
  </div>
);

const Step2 = ({ campaignData, handleSequenceChange, addSequenceItem, removeSequenceItem }: any) => (
  <div className="space-y-6">
    {/* Email Sequence */}
    <div>
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">Email Sequence</h4>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => addSequenceItem('emailSequence')}
        >
          Add Step
        </button>
      </div>
      
      <div className="mt-4 space-y-4">
        {campaignData.emailSequence.map((step: any, index: number) => (
          <div key={index} className="rounded border border-white-light p-4 dark:border-dark">
            <div className="flex items-center justify-between">
              <div className="font-medium">Email {index + 1}</div>
              {index > 0 && (
                <button
                  type="button"
                  className="text-danger hover:opacity-70"
                  onClick={() => removeSequenceItem('emailSequence', index)}
                >
                  <IconX className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label>Days after previous</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={step.days}
                  onChange={e => {
                    const newSequence = [...campaignData.emailSequence];
                    newSequence[index].days = parseInt(e.target.value);
                    handleSequenceChange('emailSequence', index, newSequence[index].content);
                  }}
                />
              </div>
            </div>
            
            <div className="mt-3">
              <label>Email Content</label>
              <textarea
                rows={4}
                className="form-textarea mt-1"
                placeholder="Write your email content..."
                value={step.content}
                onChange={e => handleSequenceChange('emailSequence', index, e.target.value)}
              ></textarea>
              <div className="mt-1 text-xs text-gray-500">
                Use {"{firstName}"}, {"{company}"} for personalization
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    
    {/* LinkedIn Sequence */}
    <div className="pt-5">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">LinkedIn Sequence</h4>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => addSequenceItem('linkedInSequence')}
        >
          Add Step
        </button>
      </div>
      
      <div className="mt-4 space-y-4">
        {campaignData.linkedInSequence.map((step: any, index: number) => (
          <div key={index} className="rounded border border-white-light p-4 dark:border-dark">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {index === 0 ? 'Connection Request' : 
                 index === 1 ? 'Message After Connection' : 
                 `Follow-up ${index}`}
              </div>
              {index > 1 && (
                <button
                  type="button"
                  className="text-danger hover:opacity-70"
                  onClick={() => removeSequenceItem('linkedInSequence', index)}
                >
                  <IconX className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="mt-3">
              <label>Message Content</label>
              <textarea
                rows={3}
                className="form-textarea mt-1"
                placeholder="Write your LinkedIn message..."
                value={step.content}
                onChange={e => handleSequenceChange('linkedInSequence', index, e.target.value)}
              ></textarea>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* SMS Sequence */}
    <div className="pt-5">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">SMS Sequence</h4>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={() => addSequenceItem('smsSequence')}
        >
          Add Step
        </button>
      </div>
      
      <div className="mt-4 space-y-4">
        {campaignData.smsSequence.map((step: any, index: number) => (
          <div key={index} className="rounded border border-white-light p-4 dark:border-dark">
            <div className="flex items-center justify-between">
              <div className="font-medium">SMS {index + 1}</div>
              {index > 0 && (
                <button
                  type="button"
                  className="text-danger hover:opacity-70"
                  onClick={() => removeSequenceItem('smsSequence', index)}
                >
                  <IconX className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label>Days after previous</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  value={step.days}
                  onChange={e => {
                    const newSequence = [...campaignData.smsSequence];
                    newSequence[index].days = parseInt(e.target.value);
                    handleSequenceChange('smsSequence', index, newSequence[index].content);
                  }}
                />
              </div>
            </div>
            
            <div className="mt-3">
              <label>SMS Content</label>
              <textarea
                rows={3}
                className="form-textarea mt-1"
                placeholder="Write your SMS content..."
                value={step.content}
                onChange={e => handleSequenceChange('smsSequence', index, e.target.value)}
              ></textarea>
              <div className="mt-1 text-xs text-gray-500">
                Max 160 characters
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Step3 = ({ campaignData, teamMembers, toggleTeamMember }: any) => (
  <div>
    <h4 className="mb-4 text-lg font-semibold">Assign Team Members</h4>
    
    <div className="space-y-4">
      {teamMembers.map((member: any) => (
        <div 
          key={member.id} 
          className={`flex cursor-pointer items-center justify-between rounded border p-4 transition-all ${
            campaignData.teamMembers.includes(member.id)
              ? 'border-primary bg-primary-light dark:bg-primary-dark/20'
              : 'border-white-light dark:border-dark'
          }`}
          onClick={() => toggleTeamMember(member.id)}
        >
          <div className="flex items-center">
            <div className="grid h-10 w-10 place-content-center rounded-full bg-gray-300 text-sm font-semibold text-white dark:bg-gray-700">
              {member.name.charAt(0)}
            </div>
            <div className="ltr:ml-3 rtl:mr-3">
              <div className="font-semibold">{member.name}</div>
              <div className="text-xs text-gray-500">{member.email}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            {member.linkedin && (
              <span className="badge badge-outline-info ltr:mr-2 rtl:ml-2">LinkedIn</span>
            )}
            <span className={`h-4 w-4 rounded-full border ${
              campaignData.teamMembers.includes(member.id) 
                ? 'border-primary bg-primary' 
                : 'border-gray-400'
            }`}></span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Step4 = ({ campaignData, handleInputChange }: any) => (
  <div className="space-y-5">
    <div>
      <label htmlFor="timezone">Timezone</label>
      <select
        id="timezone"
        name="timezone"
        className="form-select"
        value={campaignData.timezone}
        onChange={handleInputChange}
      >
        <option value="America/New_York">Eastern Time (ET)</option>
        <option value="America/Chicago">Central Time (CT)</option>
        <option value="America/Denver">Mountain Time (MT)</option>
        <option value="America/Los_Angeles">Pacific Time (PT)</option>
        <option value="Europe/London">London (GMT)</option>
        <option value="Europe/Paris">Paris (CET)</option>
      </select>
    </div>
    
    <div>
      <label>Sending Schedule</label>
      <div className="mt-2 flex items-center gap-3">
        <input
          type="time"
          name="schedule.start"
          className="form-input"
          value={campaignData.schedule.start}
          onChange={e => handleInputChange({
            target: {
              name: 'schedule',
              value: { ...campaignData.schedule, start: e.target.value }
            }
          })}
        />
        <span>to</span>
        <input
          type="time"
          name="schedule.end"
          className="form-input"
          value={campaignData.schedule.end}
          onChange={e => handleInputChange({
            target: {
              name: 'schedule',
              value: { ...campaignData.schedule, end: e.target.value }
            }
          })}
        />
      </div>
    </div>
    
    <div>
      <label>Daily Limits</label>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block">Emails</label>
          <input
            type="number"
            min="1"
            className="form-input"
            value={campaignData.limits.email}
            onChange={e => handleInputChange({
              target: {
                name: 'limits',
                value: { ...campaignData.limits, email: parseInt(e.target.value) }
              }
            })}
          />
        </div>
        <div>
          <label className="mb-1 block">LinkedIn</label>
          <input
            type="number"
            min="1"
            className="form-input"
            value={campaignData.limits.linkedin}
            onChange={e => handleInputChange({
              target: {
                name: 'limits',
                value: { ...campaignData.limits, linkedin: parseInt(e.target.value) }
              }
            })}
          />
        </div>
        <div>
          <label className="mb-1 block">SMS</label>
          <input
            type="number"
            min="1"
            className="form-input"
            value={campaignData.limits.sms}
            onChange={e => handleInputChange({
              target: {
                name: 'limits',
                value: { ...campaignData.limits, sms: parseInt(e.target.value) }
              }
            })}
          />
        </div>
      </div>
    </div>
  </div>
);

const Step5 = ({ campaignData, handleInputChange }: any) => (
  <div className="space-y-5">
    <div>
      <label>Personalization Settings</label>
      <div className="mt-3 space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={campaignData.settings.includeName}
            onChange={e => handleInputChange({
              target: {
                name: 'settings',
                value: { ...campaignData.settings, includeName: e.target.checked }
              }
            })}
          />
          <span className="ltr:ml-2 rtl:mr-2">Include lead's name in subject line</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={campaignData.settings.unsubscribeLink}
            onChange={e => handleInputChange({
              target: {
                name: 'settings',
                value: { ...campaignData.settings, unsubscribeLink: e.target.checked }
              }
            })}
          />
          <span className="ltr:ml-2 rtl:mr-2">Include unsubscribe link in emails</span>
        </label>
      </div>
    </div>
    
    <div>
      <label>AI Features</label>
      <div className="mt-3 space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={campaignData.settings.aiReplies}
            onChange={e => handleInputChange({
              target: {
                name: 'settings',
                value: { ...campaignData.settings, aiReplies: e.target.checked }
              }
            })}
          />
          <span className="ltr:ml-2 rtl:mr-2">Enable AI Smart Replies</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={campaignData.settings.aiMemes}
            onChange={e => handleInputChange({
              target: {
                name: 'settings',
                value: { ...campaignData.settings, aiMemes: e.target.checked }
              }
            })}
          />
          <span className="ltr:ml-2 rtl:mr-2">Enable AI Memes</span>
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            className="form-checkbox"
            checked={campaignData.settings.aiVideos}
            onChange={e => handleInputChange({
              target: {
                name: 'settings',
                value: { ...campaignData.settings, aiVideos: e.target.checked }
              }
            })}
          />
          <span className="ltr:ml-2 rtl:mr-2">Enable AI Video Snippets</span>
        </label>
      </div>
    </div>
  </div>
);

const Step6 = ({ campaignData, handleInputChange, aiModels }: any) => (
  <div className="space-y-5">
    <div>
      <label htmlFor="aiModel">Select AI Model</label>
      <select
        id="aiModel"
        name="aiModel"
        className="form-select mt-1"
        value={campaignData.aiModel}
        onChange={e => handleInputChange({
          target: {
            name: 'aiModel',
            value: parseInt(e.target.value)
          }
        })}
      >
        {aiModels.map((model: any) => (
          <option key={model.id} value={model.id}>
            {model.name} ({model.provider})
          </option>
        ))}
      </select>
    </div>
    
    <div className="rounded border border-info bg-info-light p-4 dark:bg-info-dark/20">
      <div className="flex items-start">
        <IconBrain className="h-6 w-6 shrink-0 text-info ltr:mr-2 rtl:ml-2" />
        <p className="text-info">
          The AI will generate personalized outreach content based on your campaign goals, 
          lead information, and industry best practices. You can edit the generated content before launching.
        </p>
      </div>
    </div>
  </div>
);

const Step7 = ({ campaignData, handleSequenceChange, isGenerating }: any) => (
  <div className="space-y-6">
    <div className="rounded border border-success bg-success-light p-4 dark:bg-success-dark/20">
      <div className="flex items-start">
        <IconThumbUp className="h-6 w-6 shrink-0 text-success ltr:mr-2 rtl:ml-2" />
        <p className="text-success">
          Your campaign content has been generated! Review and make any final adjustments before launching.
        </p>
      </div>
    </div>
    
    <div>
      <h4 className="mb-3 text-lg font-semibold">Generated Email Sequence</h4>
      <div className="space-y-4">
        {campaignData.emailSequence.map((step: any, index: number) => (
          <div key={index} className="rounded border border-white-light p-4 dark:border-dark">
            <div className="font-medium">Email {index + 1} (Day {step.days})</div>
            <div className="mt-3 whitespace-pre-line rounded bg-gray-50 p-3 dark:bg-gray-800">
              {step.content || <span className="text-gray-400">No content generated</span>}
            </div>
            <textarea
              rows={4}
              className="form-textarea mt-3"
              value={step.content}
              onChange={e => handleSequenceChange('emailSequence', index, e.target.value)}
            ></textarea>
          </div>
        ))}
      </div>
    </div>
    
    <div className="pt-4">
      <h4 className="mb-3 text-lg font-semibold">Generated LinkedIn Sequence</h4>
      <div className="space-y-4">
        {campaignData.linkedInSequence.map((step: any, index: number) => (
          <div key={index} className="rounded border border-white-light p-4 dark:border-dark">
            <div className="font-medium">
              {index === 0 ? 'Connection Request' : 
               index === 1 ? 'Message After Connection' : 
               `Follow-up ${index}`}
            </div>
            <div className="mt-3 whitespace-pre-line rounded bg-gray-50 p-3 dark:bg-gray-800">
              {step.content || <span className="text-gray-400">No content generated</span>}
            </div>
            <textarea
              rows={3}
              className="form-textarea mt-3"
              value={step.content}
              onChange={e => handleSequenceChange('linkedInSequence', index, e.target.value)}
            ></textarea>
          </div>
        ))}
      </div>
    </div>

    <div className="pt-4">
      <h4 className="mb-3 text-lg font-semibold">Generated SMS Sequence</h4>
      <div className="space-y-4">
        {campaignData.smsSequence.map((step: any, index: number) => (
          <div key={index} className="rounded border border-white-light p-4 dark:border-dark">
            <div className="font-medium">SMS {index + 1} (Day {step.days})</div>
            <div className="mt-3 whitespace-pre-line rounded bg-gray-50 p-3 dark:bg-gray-800">
              {step.content || <span className="text-gray-400">No content generated</span>}
            </div>
            <textarea
              rows={3}
              className="form-textarea mt-3"
              value={step.content}
              onChange={e => handleSequenceChange('smsSequence', index, e.target.value)}
            ></textarea>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CampaignsPage;