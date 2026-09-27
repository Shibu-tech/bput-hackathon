import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import {
  ShieldCheck,
  Moon,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Users,
  Wrench,
  Radio,
  FileSpreadsheet,
  Phone,
  BarChart3,
  Search,
} from 'lucide-react';
import campusAerialImg from '../../assets/images/campus_hostel_aerial_1790190005312.jpg';
import { WardenAnalyticsView } from './WardenAnalyticsView';

export const WardenDashboard: React.FC = () => {
  const {
    language,
    gatePasses,
    approveGatePass,
    rejectGatePass,
    complaints,
    deduplicatedTickets,
    rollCallRecords,
    nightCurfewReportTime,
    triggerNightCurfewReport,
    broadcasts,
    sendBroadcast,
    triggerEmergencyAlert,
  } = useCampusOps();

  const t = translations[language];

  // Warden active tab
  const [activeTab, setActiveTab] = useState<'rollcall' | 'approvals' | 'workload' | 'analytics' | 'broadcast'>('rollcall');

  // Broadcast creation state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'block' | 'branch' | 'batch'>('block');
  const [targetValue, setTargetValue] = useState('Ramanujan Hostel (Block A & B)');
  const [broadcastPriority, setBroadcastPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [broadcastSentMessage, setBroadcastSentMessage] = useState('');

  // Search filter for rollcall
  const [rollSearch, setRollSearch] = useState('');

  // Reject modal
  const [rejectingPassId, setRejectingPassId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Parent telephonic verification pending');

  const pendingPasses = gatePasses.filter((p) => p.status === 'pending');
  const overduePasses = gatePasses.filter((p) => p.status === 'overdue');

  // Stats calculation for 10:30 PM Curfew
  const totalStudents = 856;
  const onPassCount = rollCallRecords.filter((r) => r.status === 'on_gate_pass').length + 11;
  const overdueCount = rollCallRecords.filter((r) => r.status === 'overdue').length;
  const insideCount = totalStudents - onPassCount - overdueCount;

  const { user } = useAuth();
  const wardenDisplayName = user?.fullName || 'Hostel Warden';

  const handleApprove = (id: string) => {
    approveGatePass(id, `${wardenDisplayName} (Hostel Warden)`);
  };

  const handleReject = () => {
    if (rejectingPassId) {
      rejectGatePass(rejectingPassId, rejectReason);
      setRejectingPassId(null);
    }
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) return;

    sendBroadcast({
      title: broadcastTitle,
      content: broadcastContent,
      target: targetType,
      targetValue,
      sender: `${wardenDisplayName} (Warden Office)`,
      priority: broadcastPriority,
      totalRecipients: targetType === 'all' ? 1550 : 420,
    });

    setBroadcastSentMessage('Targeted notice sent! Replaces WhatsApp group blast with read-tracking.');
    setBroadcastTitle('');
    setBroadcastContent('');
    setTimeout(() => setBroadcastSentMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Warden Header & Night Curfew Banner */}
      <div className="relative bg-slate-900 text-white rounded-xl p-5 shadow-sm space-y-4 overflow-hidden border border-slate-800">
        <img
          src={campusAerialImg}
          alt="University Campus Overview"
          className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
          referrerPolicy="no-referrer"
        />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xs uppercase tracking-widest text-indigo-400 font-semibold">
                Central Administrative Control
              </span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-xs text-slate-300">{wardenDisplayName} (Hostel Warden)</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Hostel Life Operations & Student Safety Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Zero physical registers · Automated night roll call · Real-time workload & resolution metrics
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer border shadow-xs ${activeTab === 'analytics'
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
            >
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              <span>Real-Time Analytics</span>
            </button>
            <button
              onClick={triggerNightCurfewReport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <Moon className="w-4 h-4" />
              Trigger 10:30 PM Curfew Audit
            </button>
          </div>
        </div>

        {/* 10:30 PM Safety Status HUD Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          <div className="bg-slate-800/80 p-3 rounded-lg">
            <div className="text-2xs text-slate-400 font-medium">Total Hostel Roster</div>
            <div className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">
              {totalStudents}
            </div>
            <div className="text-3xs text-slate-400 mt-0.5">Ramanujan + Gargi + Aryabhatta</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg">
            <div className="text-2xs text-emerald-400 font-medium">Inside Hostel / Mess</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
              {insideCount}
            </div>
            <div className="text-3xs text-emerald-300 mt-0.5">98.2% Accounted & Eaten</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg">
            <div className="text-2xs text-blue-400 font-medium">Out on Valid Gate Pass</div>
            <div className="text-xl font-bold font-mono text-blue-400 mt-0.5 tabular-nums">
              {onPassCount}
            </div>
            <div className="text-3xs text-slate-400 mt-0.5">Biometric exit logged</div>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-lg border border-red-500/30">
            <div className="text-2xs text-red-400 font-medium">Curfew Overdue Alerts</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-0.5 tabular-nums">
              {overdueCount}
            </div>
            <div className="text-3xs text-red-300 mt-0.5">Urgent Warden Action Required</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg shadow-xs overflow-x-auto">
        {[
          { id: 'rollcall', label: '10:30 PM Night Roll Call', count: overdueCount > 0 ? overdueCount : undefined },
          { id: 'approvals', label: 'Pending Gate Passes', count: pendingPasses.length },
          { id: 'workload', label: 'Staff Workload & SLA Matrix', count: complaints.filter(c => c.status !== 'resolved').length },
          { id: 'analytics', label: 'Real-Time Trends & Analytics' },
          { id: 'broadcast', label: 'Targeted Circulars & WhatsApp Replacement' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === tab.id
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-2xs px-1.5 py-0.2 rounded-full ${activeTab === tab.id
                  ? 'bg-slate-800 text-slate-200'
                  : 'bg-indigo-100 text-indigo-800'
                  }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: 10:30 PM NIGHT ROLL CALL & CURFEW SAFETY */}
      {activeTab === 'rollcall' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Automated Night Safety Audit (Generated {nightCurfewReportTime || '22:30'})
              </h2>
              <p className="text-xs text-slate-500">
                Replaces manual physical warden door-knocking registers. Verifies meal dining scan and biometric gate logs.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter student or room..."
                  value={rollSearch}
                  onChange={(e) => setRollSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Overdue Alert Banner if any */}
          {overdueCount > 0 && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-bold text-red-900">
                  {overdueCount} Student(s) Past Mandatory Curfew Without Recorded Check-in!
                </div>
                <div className="text-xs text-red-800">
                  Immediate emergency contacts and guardian alert triggers available below.
                </div>
              </div>
            </div>
          )}

          {/* Roll Call Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium">
                  <th className="pb-2.5">Roll Number</th>
                  <th className="pb-2.5">Student Name</th>
                  <th className="pb-2.5">Room & Block</th>
                  <th className="pb-2.5">Curfew Status</th>
                  <th className="pb-2.5">Last Verified Location & Time</th>
                  <th className="pb-2.5 text-right">Emergency Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rollCallRecords
                  .filter(
                    (r) =>
                      r.name.toLowerCase().includes(rollSearch.toLowerCase()) ||
                      r.rollNumber.toLowerCase().includes(rollSearch.toLowerCase()) ||
                      r.room.includes(rollSearch),
                  )
                  .map((r) => {
                    const isOverdue = r.status === 'overdue';
                    return (
                      <tr key={r.rollNumber} className={isOverdue ? 'bg-red-50/50' : 'hover:bg-slate-50'}>
                        <td className="py-3 font-mono font-medium text-slate-900">
                          {r.rollNumber}
                        </td>
                        <td className="py-3 font-semibold text-slate-900">
                          {r.name}
                        </td>
                        <td className="py-3 text-slate-600">
                          Room {r.room} · {r.block}
                        </td>
                        <td className="py-3">
                          <span
                            className={`text-2xs font-semibold uppercase px-2 py-0.5 rounded ${r.status === 'inside'
                              ? 'bg-emerald-50 text-emerald-700'
                              : r.status === 'mess_checked_in'
                                ? 'bg-indigo-50 text-indigo-700'
                                : r.status === 'on_gate_pass'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-red-600 text-white font-bold'
                              }`}
                          >
                            {r.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-2xs text-slate-600 font-mono">
                          {r.lastSeenTime}
                        </td>
                        <td className="py-3 text-right">
                          {isOverdue ? (
                            <button
                              onClick={() =>
                                alert(`Emergency dialing student phone ${r.contactNumber} and dispatching SMS alert to guardian.`)
                              }
                              className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-2xs font-bold rounded cursor-pointer transition-colors inline-flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              Contact & Alert
                            </button>
                          ) : (
                            <span className="text-2xs text-slate-400">Verified Safe</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING GATE PASS APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Gate Pass Approvals Queue ({pendingPasses.length} pending)
              </h2>
              <p className="text-xs text-slate-500">
                Review late-night outing & weekend leave requests with verified parent consent.
              </p>
            </div>
          </div>

          {pendingPasses.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All gate pass requests reviewed. Zero pending queues!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPasses.map((pass) => (
                <div
                  key={pass.id}
                  className="border border-slate-200 rounded-xl p-4 bg-slate-50/40 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold text-slate-900">{pass.passCode}</span>
                      <span className="text-2xs font-semibold uppercase bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded ml-2">
                        {pass.passType.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      Out: {pass.outTime} → In: {pass.expectedInTime}
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-900">{pass.studentName}</div>
                    <div className="text-xs text-slate-500">
                      {pass.rollNumber} · Room {pass.roomNumber} ({pass.hostelBlock})
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200 space-y-1">
                    <div><strong>Destination:</strong> {pass.destination}</div>
                    <div><strong>Purpose:</strong> {pass.purpose}</div>
                    <div className="text-2xs text-emerald-700 font-medium pt-1 border-t border-slate-100 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Parent Consent Verified via SMS ({pass.parentPhone})
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setRejectingPassId(pass.id)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-md cursor-pointer transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(pass.id)}
                      className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md cursor-pointer shadow-xs transition-colors"
                    >
                      1-Click Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: STAFF WORKLOAD & SLA RESOLUTION TIMES */}
      {activeTab === 'workload' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Mean Time To Resolution (MTTR)</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                2.4 hrs
              </div>
              <div className="text-2xs text-emerald-600 mt-0.5">↓ 68% vs physical warden registers</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Active Maintenance Tickets</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {complaints.filter((c) => c.status !== 'resolved').length}
              </div>
              <div className="text-2xs text-slate-500 mt-0.5">Directly assigned to duty technicians</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs text-slate-500 font-medium">Recurring Outage Deduplication</div>
              <div className="text-2xl font-bold font-mono text-purple-600 mt-1 tabular-nums">
                {deduplicatedTickets.length} Clustered
              </div>
              <div className="text-2xs text-purple-700 mt-0.5">Prevented 20+ duplicate tickets</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Department Technician Workload Distribution
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {[
                { trade: 'Electrical', tech: 'Rajesh Kumar', open: 2, resolvedToday: 6, status: 'On Duty' },
                { trade: 'Plumbing', tech: 'Mohammed Arif', open: 1, resolvedToday: 4, status: 'On Duty' },
                { trade: 'Network & Wi-Fi', tech: 'Suresh Menon', open: 3, resolvedToday: 9, status: 'Active on Rack' },
                { trade: 'Carpentry', tech: 'Hari Om', open: 0, resolvedToday: 3, status: 'Standby' },
              ].map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{item.trade}</span>
                    <span className="text-2xs text-emerald-600 font-medium">{item.status}</span>
                  </div>
                  <div className="text-2xs text-slate-500">{item.tech}</div>
                  <div className="flex justify-between text-2xs pt-1 border-t border-slate-200 font-mono">
                    <span className="text-amber-700">Open: {item.open}</span>
                    <span className="text-emerald-700">Resolved: {item.resolvedToday}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick jump to analytics */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-lg shadow-xs shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Detailed Resolution Time & Hostel Occupancy Analytics
                  </h4>
                  <p className="text-2xs text-slate-600 mt-0.5">
                    Interactive Recharts telemetry for MTTR breakdown by trade, SLA benchmarks, and 24-hour diurnal occupancy flow.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                Open Analytics HUD →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB: REAL-TIME DATA VISUALIZATION & OCCUPANCY TRENDS */}
      {activeTab === 'analytics' && (
        <WardenAnalyticsView />
      )}

      {/* TAB 4: TARGETED BROADCAST NOTIFICATIONS (WHATSAPP REPLACEMENT) */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Send Targeted Circular</h3>
              <p className="text-xs text-slate-500">
                Segment by hostel block, branch, or batch with delivery & read confirmation.
              </p>
            </div>

            {broadcastSentMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200">
                {broadcastSentMessage}
              </div>
            )}

            <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Segment</label>
                <select
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value as any);
                    if (e.target.value === 'block') setTargetValue('Ramanujan Hostel (Block A & B)');
                    else if (e.target.value === 'batch') setTargetValue('Batch 2024 (1st Year)');
                    else setTargetValue('All Campus Students');
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                >
                  <option value="block">Hostel Block Specific</option>
                  <option value="batch">Academic Batch (e.g. 2024)</option>
                  <option value="branch">Engineering Branch</option>
                  <option value="all">Entire University Campus</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Segment Value</label>
                <input
                  type="text"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject / Headline</label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Cleanliness drive or electricity maintenance"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Content</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  placeholder="Type official notification body..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastPriority('normal')}
                    className={`py-1.5 text-center rounded border cursor-pointer ${broadcastPriority === 'normal'
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-white text-slate-700 border-slate-200'
                      }`}
                  >
                    Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastPriority('urgent')}
                    className={`py-1.5 text-center rounded border cursor-pointer ${broadcastPriority === 'urgent'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-white text-slate-700 border-slate-200'
                      }`}
                  >
                    Urgent
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast Circular
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Broadcast Delivery & Read Confirmation Analytics
            </h3>
            <div className="space-y-3">
              {broadcasts.map((b) => (
                <div key={b.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{b.title}</span>
                      <span className="text-2xs uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-medium">
                        {b.target}: {b.targetValue}
                      </span>
                    </div>
                    <span className="text-2xs text-slate-400 font-mono">{b.sentAt}</span>
                  </div>

                  <p className="text-slate-600 text-xs">{b.content}</p>

                  <div className="flex items-center justify-between pt-1 text-2xs text-slate-500 border-t border-slate-200">
                    <span>Sent by: {b.sender}</span>
                    <div className="font-mono font-medium text-indigo-700">
                      Read by {b.readCount} / {b.totalRecipients} students ({Math.round((b.readCount / b.totalRecipients) * 100)}% reach)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REJECT PASS REASON MODAL */}
      {rejectingPassId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-5 space-y-3 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">Reason for Rejection</h3>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectingPassId(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-1.5 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
