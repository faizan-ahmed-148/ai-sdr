'use client';
import Dropdown from '@/components/dropdown';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconMail from '@/components/icon/icon-mail';
import IconLinkedin from '@/components/icon/icon-linkedin';
import IconCalendar from '@/components/icon/icon-calendar';
import IconMessage from '@/components/icon/icon-message';
import IconThumbUp from '@/components/icon/icon-thumb-up';
import IconCalendarEvent from '@/components/icon/icon-calendar';
import { IRootState } from '@/store';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#00AB55', '#FFC107', '#FF5722', '#2196F3', '#9C27B0'];

const ComponentsDashboardAnalytics = () => {
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
  
  // State management
  const [selectedCampaign, setSelectedCampaign] = useState('All Campaigns');
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [activeTab, setActiveTab] = useState('replies');
  
  // Sample data
  const campaigns = ['All Campaigns', 'Tech Startup Outreach', 'Enterprise Sales', 'Partnership Program'];
  const dateRanges = ['Today', 'Last 7 Days', 'Last 30 Days', 'This Quarter'];
  const tabs = [
    { id: 'replies', label: 'Latest Replies', icon: <IconMessage /> },
    { id: 'positive', label: 'Positive Replies', icon: <IconThumbUp /> },
    { id: 'meetings', label: 'Meetings Booked', icon: <IconCalendarEvent /> },
    { id: 'linkedin', label: 'LinkedIn Replies', icon: <IconLinkedin /> }
  ];
  
  const emailStats = {
    sent: 1245,
    engaged: 342,
    openRate: 68.2,
    responseRate: 27.5,
    positiveRate: 12.3,
    meetings: 28
  };
  
  const linkedinStats = {
    engaged: 187,
    acceptanceRate: 63.4,
    responseRate: 38.7
  };
  
  const activityData = {
    replies: [
      { id: 1, campaign: 'Tech Startup', from: 'sender@company.com', to: 'Alex Johnson', channel: 'Email', preview: 'Thanks for reaching out...', date: '2023-06-24 14:30' },
      { id: 2, campaign: 'Enterprise Sales', from: 'myaccount@linkedin', to: 'Sarah Miller', channel: 'LinkedIn', preview: 'Interested in learning more...', date: '2023-06-24 12:15' }
    ],
    positive: [
      { id: 1, campaign: 'Partnership Program', from: 'sender@company.com', to: 'Michael Chen', channel: 'Email', preview: 'This looks perfect for our needs...', date: '2023-06-23 09:45' }
    ],
    meetings: [
      { id: 1, campaign: 'Tech Startup', from: 'myaccount@linkedin', to: 'Jessica Williams', channel: 'LinkedIn', preview: 'Let\'s schedule a call next week...', date: '2023-06-22 16:20' }
    ],
    linkedin: [
      { id: 1, campaign: 'Enterprise Sales', from: 'myaccount@linkedin', to: 'Robert Davis', channel: 'LinkedIn', preview: 'Can you send me more details?', date: '2023-06-24 10:30' }
    ]
  };
  
  // Chart data
  const engagementData = [
    { name: 'Mon', email: 45, linkedin: 30 },
    { name: 'Tue', email: 52, linkedin: 38 },
    { name: 'Wed', email: 48, linkedin: 42 },
    { name: 'Thu', email: 78, linkedin: 55 },
    { name: 'Fri', email: 65, linkedin: 40 },
    { name: 'Sat', email: 32, linkedin: 28 },
    { name: 'Sun', email: 24, linkedin: 20 },
  ];
  
  const responseRateData = [
    { name: 'Email', rate: emailStats.responseRate, positive: emailStats.positiveRate },
    { name: 'LinkedIn', rate: linkedinStats.responseRate, positive: 25.4 },
  ];
  
  const channelData = [
    { name: 'Email', value: 65 },
    { name: 'LinkedIn', value: 35 },
  ];
  
  const campaignPerformance = [
    { name: 'Tech Startup', emails: 420, replies: 125, meetings: 15 },
    { name: 'Enterprise', emails: 380, replies: 98, meetings: 8 },
    { name: 'Partnership', emails: 290, replies: 74, meetings: 5 },
  ];
  
  const currentData = activityData[activeTab as keyof typeof activityData];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Campaign Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400">Monitor your outreach performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn bg-primary text-white">Export Report</button>
          <button className="btn bg-gray-100 dark:bg-dark text-gray-700 dark:text-gray-300">
            <IconCalendar className="w-5 h-5" />
            <span>Schedule Report</span>
          </button>
        </div>
      </div>

      {/* Campaign Selector and Date Range Filter */}
      <div className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center flex-wrap gap-4">
            <div>
              <label className="block mb-2 text-sm font-medium">Campaign</label>
              <Dropdown
                placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                btnClassName="!flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-gray-800"
                button={
                  <>
                    <span>{selectedCampaign}</span>
                    <IconHorizontalDots className="ml-2 text-gray-500 dark:text-gray-400" />
                  </>
                }
              >
                <ul className="min-w-[200px] bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2">
                  {campaigns.map(campaign => (
                    <li key={campaign}>
                      <button 
                        type="button" 
                        onClick={() => setSelectedCampaign(campaign)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {campaign}
                      </button>
                    </li>
                  ))}
                </ul>
              </Dropdown>
            </div>
            
            <div>
              <label className="block mb-2 text-sm font-medium">Date Range</label>
              <Dropdown
                placement={`${isRtl ? 'bottom-end' : 'bottom-start'}`}
                btnClassName="!flex items-center border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-sm font-medium bg-white dark:bg-dark hover:bg-gray-50 dark:hover:bg-gray-800"
                button={
                  <>
                    <IconCalendar className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                    <span>{dateRange}</span>
                  </>
                }
              >
                <ul className="min-w-[150px] bg-white dark:bg-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2">
                  {dateRanges.map(range => (
                    <li key={range}>
                      <button 
                        type="button" 
                        onClick={() => setDateRange(range)}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {range}
                      </button>
                    </li>
                  ))}
                </ul>
              </Dropdown>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 flex items-center">
              <div className="bg-emerald-500 w-3 h-3 rounded-full mr-2"></div>
              <span className="text-sm">+12.5% from last week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Chart */}
        <div className="panel p-5">
          <h5 className="text-lg font-semibold mb-5">Engagement Over Time</h5>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={engagementData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={isDark ? 0.1 : 1} />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#fff',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="email" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} name="Email" />
                <Line type="monotone" dataKey="linkedin" stroke="#0ea5e9" strokeWidth={2} name="LinkedIn" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Channel Distribution */}
        <div className="panel p-5">
          <h5 className="text-lg font-semibold mb-5">Channel Distribution</h5>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {channelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value:any) => [`${value}%`, 'Percentage']}
                  contentStyle={{
                    backgroundColor: isDark ? '#1f2937' : '#fff',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email Performance */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-6">
            <h5 className="text-lg font-semibold">Email Performance</h5>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
              <IconMail className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-4 border border-blue-100 dark:border-blue-900/50">
              <div className="text-sm text-blue-600 dark:text-blue-300 mb-1">Total Emails Sent</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{emailStats.sent.toLocaleString()}</div>
              <div className="mt-2 h-2 w-full bg-blue-100 dark:bg-blue-900/50 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-sm text-emerald-600 dark:text-emerald-300 mb-1">Leads Engaged</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{emailStats.engaged.toLocaleString()}</div>
              <div className="mt-2 h-2 w-full bg-emerald-100 dark:bg-emerald-900/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${(emailStats.engaged / emailStats.sent) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl p-4 border border-amber-100 dark:border-amber-900/50">
              <div className="text-sm text-amber-600 dark:text-amber-300 mb-1">Open Rate</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{emailStats.openRate}%</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-500">+2.4%</span>
                <span className="text-xs text-gray-500 ml-1">from last week</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-violet-100 dark:border-violet-900/50">
              <div className="text-sm text-violet-600 dark:text-violet-300 mb-1">Response Rate</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{emailStats.responseRate}%</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-500">+3.1%</span>
                <span className="text-xs text-gray-500 ml-1">from last week</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 rounded-xl p-4 border border-rose-100 dark:border-rose-900/50">
              <div className="text-sm text-rose-600 dark:text-rose-300 mb-1">Positive Response</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{emailStats.positiveRate}%</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-500">+1.7%</span>
                <span className="text-xs text-gray-500 ml-1">from last week</span>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl p-4 border border-indigo-100 dark:border-indigo-900/50">
              <div className="text-sm text-indigo-600 dark:text-indigo-300 mb-1">Meetings Booked</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{emailStats.meetings}</div>
              <div className="flex items-center mt-1">
                <span className="text-xs text-green-500">+4</span>
                <span className="text-xs text-gray-500 ml-1">this week</span>
              </div>
            </div>
          </div>
        </div>

        {/* LinkedIn Performance */}
        <div className="panel p-5">
          <div className="flex items-center justify-between mb-6">
            <h5 className="text-lg font-semibold">LinkedIn Performance</h5>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0a66c2]/10 text-[#0a66c2] dark:bg-[#0a66c2] dark:text-white-light">
              <IconLinkedin className="w-5 h-5" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-r from-[#0a66c2]/10 to-[#0a66c2]/20 dark:from-[#0a66c2]/20 dark:to-[#0a66c2]/30 rounded-xl p-4 border border-[#0a66c2]/20 dark:border-[#0a66c2]/30">
              <div className="text-sm text-[#0a66c2] dark:text-[#80bbff] mb-1">Leads Engaged</div>
              <div className="text-2xl font-bold text-gray-800 dark:text-white">{linkedinStats.engaged.toLocaleString()}</div>
              <div className="mt-2 h-2 w-full bg-[#0a66c2]/20 dark:bg-[#0a66c2]/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#0a66c2]" 
                  style={{ width: `${(linkedinStats.engaged / 300) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/30 dark:to-cyan-900/30 rounded-xl p-4 border border-sky-100 dark:border-sky-900/50">
                <div className="text-sm text-sky-600 dark:text-sky-300 mb-1">Acceptance Rate</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{linkedinStats.acceptanceRate}%</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border border-green-100 dark:border-green-900/50">
                <div className="text-sm text-green-600 dark:text-green-300 mb-1">Response Rate</div>
                <div className="text-2xl font-bold text-gray-800 dark:text-white">{linkedinStats.responseRate}%</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h6 className="font-medium mb-3">Response Time</h6>
              <div className="flex items-center justify-between">
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-8 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500" style={{ width: '42%' }}></div>
                </div>
                <div className="ml-4 text-xl font-bold">4.2h</div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0h</span>
                <span>Avg: 4.2h</span>
                <span>24h</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Performance Charts */}
      <div className="panel p-5">
        <h5 className="text-lg font-semibold mb-5">Campaign Performance</h5>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={campaignPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={isDark ? 0.1 : 1} />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#fff',
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                  borderRadius: '0.5rem'
                }}
              />
              <Legend />
              <Bar dataKey="emails" name="Emails Sent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="replies" name="Replies" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meetings" name="Meetings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="panel p-0 overflow-hidden">
        <div className="p-5">
          <div className="flex items-center justify-between">
            <h5 className="text-lg font-semibold dark:text-white-light">Activity Feed</h5>
            <button className="btn btn-sm btn-outline-primary">View All</button>
          </div>
          
          {/* Tabs */}
          <div className="mt-5 flex overflow-x-auto border-b border-gray-200 dark:border-gray-700">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`flex items-center px-4 py-3 border-b-2 -mb-px whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Analytics Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CAMPAIGN</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">FROM</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">TO</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CHANNEL</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PREVIEW</th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">DATE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">{item.campaign}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.from}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-2"></div>
                      <span className="font-medium">{item.to}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.channel === 'Email' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                        : 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300'
                    }`}>
                      {item.channel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{item.preview}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.date}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComponentsDashboardAnalytics;