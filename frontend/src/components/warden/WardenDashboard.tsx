import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { useAuth } from '../../context/AuthContext';
import { translations } from '../../utils/translations';
import { ComplaintCategory, ComplaintPriority, Complaint, isHostelComplaint } from '../../types';
import { dutyTechniciansList } from '../../data/mockData';
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
  Zap,
  Wifi,
  Droplets,
  Hammer,
  Wind,
  Sparkles,
  UserCheck,
  RotateCcw,
  FileText,
  Check,
  Layers,
  ChevronRight,
  Filter,
  Calendar,
} from 'lucide-react';
import campusAerialImg from '../../assets/images/campus_hostel_aerial_1790190005312.jpg';
import { WardenAnalyticsView } from './WardenAnalyticsView';
import { HostelCareWardenPortal } from './HostelCareWardenPortal';

export const WardenDashboard: React.FC = () => {
  const {
    language,
    gatePasses,
    approveGatePass,
    rejectGatePass,
    complaints,
    deduplicatedTickets,
    assignComplaint,
    reopenComplaint,
    rollCallRecords,
    nightCurfewReportTime,
    triggerNightCurfewReport,
    broadcasts,
    sendBroadcast,
    triggerEmergencyAlert,
  } = useCampusOps();

  const t = translations[language];

  // Strictly filter for Hostel Maintenance complaints on the Warden Dashboard
  const hostelComplaints = useMemo(() => complaints.filter(isHostelComplaint), [complaints]);

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

  const pendingPasses = gatePasses.filter(
    (p) => p.status === 'pending' && (p.passType === 'long_leave' || p.passType === 'weekend_leave')
  );
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

  // Maintenance Task Dispatch & Review States
  const [taskSubView, setTaskSubView] = useState<'dispatch' | 'review' | 'roster'>('dispatch');
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<ComplaintCategory | 'all'>('all');
  const [taskStatusFilter, setTaskStatusFilter] = useState<'all' | 'open' | 'assigned' | 'resolved' | 'rejected'>('all');
  const [taskSearch, setTaskSearch] = useState('');

  // Assignment Modal State
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [assignCategory, setAssignCategory] = useState<ComplaintCategory>('electrical');
  const [assignTech, setAssignTech] = useState('Rajesh Kumar (Senior Electrician)');
  const [assignPriority, setAssignPriority] = useState<ComplaintPriority>('medium');
  const [wardenInstruction, setWardenInstruction] = useState('');

  // Re-open Modal State
  const [reopeningComplaint, setReopeningComplaint] = useState<Complaint | null>(null);
  const [reopenNotes, setReopenNotes] = useState('');

  const handleOpenAssignModal = (complaint: Complaint) => {
    setAssigningComplaint(complaint);
    setAssignCategory(complaint.category);
    const defaultTechObj = dutyTechniciansList.find((t) => t.trade === complaint.category);
    setAssignTech(defaultTechObj ? `${defaultTechObj.name} (${defaultTechObj.tradeLabel})` : 'Rajesh Kumar (Senior Electrician)');
    setAssignPriority(complaint.priority || 'medium');
    setWardenInstruction(complaint.wardenNotes || '');
  };

  const handleConfirmAssignment = async () => {
    if (!assigningComplaint) return;
    await assignComplaint(
      assigningComplaint.id,
      assignTech,
      assignCategory,
      wardenInstruction.trim() || undefined,
      assignPriority,
      `${wardenDisplayName} (Hostel Warden)`
    );
    setAssigningComplaint(null);
  };

  const handleOpenReopenModal = (complaint: Complaint) => {
    setReopeningComplaint(complaint);
    setReopenNotes('Re-investigation requested by Warden: please verify repair on-site with student.');
  };

  const handleConfirmReopen = async () => {
    if (!reopeningComplaint) return;
    await reopenComplaint(reopeningComplaint.id, reopenNotes.trim());
    setReopeningComplaint(null);
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
              <span className="text-slate-400 text-xs">Â·</span>
              <span className="text-xs text-slate-300">{wardenDisplayName} (Hostel Warden)</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-1">
              Hostel Life Operations & Student Safety Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-0.5">
              Zero physical registers Â· Automated night roll call Â· Real-time workload & resolution metrics
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
          { id: 'workload', label: 'Hostel Complaints & AI Overview', count: complaints.filter(c => c.status === 'open' || c.status === 'rejected').length || undefined },
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
                          Room {r.room} Â· {r.block}
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

      {/* TAB 2: PENDING LEAVE PASS APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Leave Pass Approvals Queue ({pendingPasses.length} pending)
              </h2>
              <p className="text-xs text-slate-500">
                Review Long Leave requests with travel dates & guardian consent. Note: Standard Day Passes are automatically cleared by campus policy and do not require Warden authorization.
              </p>
            </div>
          </div>

          {pendingPasses.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              All long leave pass requests reviewed. Zero pending queues!
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
                      Out: {pass.outTime} â†’ In: {pass.expectedInTime}
                    </span>
                  </div>

                  {pass.leaveDate && (
                    <div className="flex items-center gap-1.5 text-2xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3 h-3 text-indigo-600" />
                      <span>Weekend Leave: {pass.leaveDate} &rarr; {pass.returnDate || 'Return'}</span>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-bold text-slate-900">{pass.studentName}</div>
                    <div className="text-xs text-slate-500">
                      {pass.rollNumber} Â· Room {pass.roomNumber} ({pass.hostelBlock})
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

      {/* TAB 3: MAINTENANCE TASK DISPATCH & OPERATIONS REVIEW DESK */}
      {activeTab === 'workload' && (
        <div className="space-y-6">
          {/* HOSTELCARE AI WARDEN PORTAL OVERVIEW */}
          <HostelCareWardenPortal />
          {/* Top Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Total Complaints</div>
              <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {hostelComplaints.length}
              </div>
              <div className="text-2xs text-slate-400 mt-0.5">Across all campus blocks</div>
            </div>

            <div
              className={`border rounded-xl p-4 shadow-xs ${
                hostelComplaints.filter((c) => c.status === 'open').length > 0
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="text-2xs text-amber-700 font-semibold uppercase tracking-wider">Needs Dispatch</div>
              <div className="text-2xl font-bold font-mono text-amber-800 mt-1 tabular-nums">
                {hostelComplaints.filter((c) => c.status === 'open').length}
              </div>
              <div className="text-2xs text-amber-600 mt-0.5">Awaiting Warden assignment</div>
            </div>

            <div className="bg-white border border-blue-200 bg-blue-50/30 rounded-xl p-4 shadow-xs">
              <div className="text-2xs text-blue-700 font-semibold uppercase tracking-wider">With Duty Techs</div>
              <div className="text-2xl font-bold font-mono text-blue-800 mt-1 tabular-nums">
                {hostelComplaints.filter((c) => c.status === 'assigned' || c.status === 'in_progress').length}
              </div>
              <div className="text-2xs text-blue-600 mt-0.5">In field repair progress</div>
            </div>

            <div className="bg-white border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 shadow-xs">
              <div className="text-2xs text-emerald-700 font-semibold uppercase tracking-wider">Resolved</div>
              <div className="text-2xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
                {hostelComplaints.filter((c) => c.status === 'resolved').length}
              </div>
              <div className="text-2xs text-emerald-600 mt-0.5">With work documentation</div>
            </div>

            <div
              className={`border rounded-xl p-4 shadow-xs ${
                hostelComplaints.filter((c) => c.status === 'rejected').length > 0
                  ? 'bg-rose-50/50 border-rose-300'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="text-2xs text-rose-700 font-semibold uppercase tracking-wider">Rejected / Flagged</div>
              <div className="text-2xl font-bold font-mono text-rose-800 mt-1 tabular-nums">
                {hostelComplaints.filter((c) => c.status === 'rejected').length}
              </div>
              <div className="text-2xs text-rose-600 mt-0.5">Awaiting Warden review</div>
            </div>
          </div>

          {/* Sub-view Navigation Bar */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-2 border border-slate-200 rounded-xl shadow-xs">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setTaskSubView('dispatch')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  taskSubView === 'dispatch' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Task Dispatch & Assignment</span>
                <span className="text-2xs px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 font-mono">
                  {hostelComplaints.filter((c) => c.status === 'open' || c.status === 'assigned').length}
                </span>
              </button>

              <button
                onClick={() => setTaskSubView('review')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  taskSubView === 'review' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-600" />
                <span>Review Audit Log</span>
                <span className="text-2xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
                  {hostelComplaints.length}
                </span>
              </button>

              <button
                onClick={() => setTaskSubView('roster')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  taskSubView === 'roster' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-600" />
                <span>Duty Technician Roster</span>
                <span className="text-2xs px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 font-mono">
                  {dutyTechniciansList.length}
                </span>
              </button>
            </div>

            <button
              onClick={() => setActiveTab('analytics')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-200 cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Real-Time Analytics HUD â†’</span>
            </button>
          </div>

          {/* SUB-VIEW 1: TASK DISPATCH & ASSIGNMENT */}
          {taskSubView === 'dispatch' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Warden Maintenance Dispatch Queue
                    </h3>
                    <p className="text-xs text-slate-500">
                      Assign reported student complaints to respective trade duty technicians with operational instructions.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-slate-500">
                      <strong>{hostelComplaints.filter((c) => c.status === 'open').length}</strong> unassigned
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hostelComplaints
                    .filter((c) => c.status !== 'resolved')
                    .map((c) => {
                      const isUnassigned = c.status === 'open';
                      return (
                        <div
                          key={c.id}
                          className={`border rounded-xl p-4 space-y-3 shadow-xs transition-all ${
                            isUnassigned
                              ? 'border-amber-300 bg-amber-50/20'
                              : c.status === 'rejected'
                              ? 'border-rose-300 bg-rose-50/20'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                                {c.ticketNumber}
                              </span>
                              <span className="text-2xs uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                                {c.category}
                              </span>
                              {c.priority && (
                                <span
                                  className={`text-3xs uppercase font-semibold px-1.5 py-0.2 rounded ${
                                    c.priority === 'critical'
                                      ? 'bg-rose-600 text-white'
                                      : c.priority === 'high'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {c.priority}
                                </span>
                              )}
                            </div>

                            <span
                              className={`text-2xs font-semibold uppercase px-2 py-0.5 rounded ${
                                isUnassigned
                                  ? 'bg-amber-100 text-amber-800'
                                  : c.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {isUnassigned ? 'Needs Dispatch' : c.status.replace('_', ' ')}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                            <p className="text-2xs text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-2xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                            <div>
                              <span className="text-slate-400 block">Location:</span>
                              <span className="font-medium text-slate-800">
                                Room {c.roomNumber} ({c.hostelBlock})
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Student:</span>
                              <span className="font-medium text-slate-800">
                                {c.studentName} ({c.rollNumber})
                              </span>
                            </div>
                          </div>

                          {/* Assignment Status details */}
                          {c.assignedTo ? (
                            <div className="p-2 bg-indigo-50/60 rounded-lg border border-indigo-100 text-2xs text-indigo-900 space-y-0.5">
                              <div className="flex items-center justify-between font-semibold">
                                <span>Duty Tech: {c.assignedTo}</span>
                                {c.assignedAt && <span className="font-mono text-3xs text-indigo-500">{c.assignedAt}</span>}
                              </div>
                              {c.wardenNotes && (
                                <p className="text-indigo-800 italic text-2xs">
                                  Directive: "{c.wardenNotes}"
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 text-2xs text-amber-800 flex items-center gap-1.5 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>No duty technician assigned yet. Direct dispatch available below.</span>
                            </div>
                          )}

                          {c.status === 'rejected' && c.rejectionReason && (
                            <div className="p-2 bg-rose-50 rounded-lg border border-rose-200 text-2xs text-rose-800 space-y-0.5">
                              <div className="font-semibold flex items-center gap-1 text-rose-900">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Rejected by Tech: {c.rejectedBy || c.assignedTo}
                              </div>
                              <p className="text-rose-700 italic">"{c.rejectionReason}"</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                            <span className="text-3xs text-slate-400 font-mono">Reported {c.createdAt}</span>
                            <button
                              onClick={() => handleOpenAssignModal(c)}
                              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{c.assignedTo ? 'Re-assign Technician' : 'Assign Duty Tech'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW 2: REVIEW AUDIT LOG (REVIEW ALL THINGS HAPPENED) */}
          {taskSubView === 'review' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Comprehensive Maintenance Operations Review Desk
                  </h3>
                  <p className="text-xs text-slate-500">
                    Audit the complete lifecycle: review technician repair documentation, rejected justifications, and SLA timelines.
                  </p>
                </div>

                <div className="relative min-w-[220px]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search ticket, room, student..."
                    value={taskSearch}
                    onChange={(e) => setTaskSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Status & Category Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                  <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold mr-1">Status:</span>
                  {[
                    { id: 'all', label: 'All', count: hostelComplaints.length },
                    { id: 'open', label: 'Needs Dispatch', count: hostelComplaints.filter((c) => c.status === 'open').length },
                    { id: 'assigned', label: 'In Progress', count: hostelComplaints.filter((c) => c.status === 'assigned' || c.status === 'in_progress').length },
                    { id: 'resolved', label: 'Resolved', count: hostelComplaints.filter((c) => c.status === 'resolved').length },
                    { id: 'rejected', label: 'Rejected', count: hostelComplaints.filter((c) => c.status === 'rejected').length },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setTaskStatusFilter(st.id as any)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        taskStatusFilter === st.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st.label} ({st.count})
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold">Category:</span>
                  <select
                    value={taskCategoryFilter}
                    onChange={(e) => setTaskCategoryFilter(e.target.value as any)}
                    className="px-2.5 py-1 text-xs border border-slate-300 rounded-md bg-white focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    <option value="wifi">Wi-Fi & Network</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="ac">HVAC / AC</option>
                    <option value="cleaning">Housekeeping</option>
                  </select>
                </div>
              </div>

              {/* Review Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hostelComplaints
                  .filter((c) => {
                    const matchesCategory = taskCategoryFilter === 'all' || c.category === taskCategoryFilter;
                    const matchesStatus =
                      taskStatusFilter === 'all'
                        ? true
                        : taskStatusFilter === 'assigned'
                        ? c.status === 'assigned' || c.status === 'in_progress'
                        : c.status === taskStatusFilter;
                    const matchesSearch =
                      taskSearch.trim() === '' ||
                      c.ticketNumber.toLowerCase().includes(taskSearch.toLowerCase()) ||
                      c.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
                      c.roomNumber.toLowerCase().includes(taskSearch.toLowerCase()) ||
                      c.studentName.toLowerCase().includes(taskSearch.toLowerCase());
                    return matchesCategory && matchesStatus && matchesSearch;
                  })
                  .map((c) => {
                    const isResolved = c.status === 'resolved';
                    const isRejected = c.status === 'rejected';

                    return (
                      <div
                        key={c.id}
                        className={`border rounded-xl p-4 space-y-3 shadow-xs ${
                          isResolved
                            ? 'border-emerald-200 bg-emerald-50/20'
                            : isRejected
                            ? 'border-rose-200 bg-rose-50/20'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              {c.ticketNumber}
                            </span>
                            <span className="text-2xs uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                              {c.category}
                            </span>
                          </div>

                          <span
                            className={`text-2xs font-semibold uppercase px-2 py-0.5 rounded ${
                              isResolved
                                ? 'bg-emerald-100 text-emerald-800'
                                : isRejected
                                ? 'bg-rose-100 text-rose-800 font-bold'
                                : c.status === 'open'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {c.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                          <p className="text-2xs text-slate-500 mt-0.5">{c.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-2xs p-2 bg-slate-50 rounded border border-slate-100">
                          <div>
                            <span className="text-slate-400 block">Room:</span>
                            <span className="font-medium text-slate-800">{c.roomNumber} ({c.hostelBlock})</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">Student:</span>
                            <span className="font-medium text-slate-800">{c.studentName} ({c.rollNumber})</span>
                          </div>
                        </div>

                        {/* Assigned Tech Info */}
                        {c.assignedTo && (
                          <div className="text-2xs text-slate-600 flex items-center justify-between py-1 border-t border-slate-100">
                            <span>Assigned Tech: <strong>{c.assignedTo}</strong></span>
                            {c.assignedAt && <span className="text-3xs text-slate-400 font-mono">{c.assignedAt}</span>}
                          </div>
                        )}

                        {/* Resolved Inspection Details */}
                        {isResolved && (
                          <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-2xs text-emerald-900 space-y-1">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="flex items-center gap-1 text-emerald-800">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Work Completed by {c.resolvedBy || c.assignedTo || 'Technician'}
                              </span>
                              <span className="font-mono text-3xs text-emerald-600">{c.resolvedAt}</span>
                            </div>
                            {c.resolutionNotes && (
                              <p className="text-emerald-800 bg-white/70 p-2 rounded border border-emerald-100">
                                <strong>Work & Parts:</strong> {c.resolutionNotes}
                              </p>
                            )}
                            <div className="text-3xs text-emerald-700 font-semibold pt-0.5">
                              âœ“ Verified by Warden Operations Desk
                            </div>
                          </div>
                        )}

                        {/* Rejected Inspection Details & Re-open trigger */}
                        {isRejected && (
                          <div className="p-3 bg-rose-50 rounded-lg border border-rose-200 text-2xs text-rose-900 space-y-2">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="flex items-center gap-1 text-rose-800">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                Flagged/Rejected by {c.rejectedBy || c.assignedTo || 'Technician'}
                              </span>
                              <span className="font-mono text-3xs text-rose-600">{c.rejectedAt}</span>
                            </div>
                            {c.rejectionReason && (
                              <p className="text-rose-800 bg-white/70 p-2 rounded border border-rose-100">
                                <strong>Technician Reason:</strong> {c.rejectionReason}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-3xs text-rose-600 font-medium">Awaiting Warden decision</span>
                              <button
                                onClick={() => handleOpenReopenModal(c)}
                                className="px-2.5 py-1 text-2xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded cursor-pointer transition-colors shadow-xs flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Re-open & Re-assign</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SUB-VIEW 3: DUTY TECHNICIAN ROSTER & LIVE WORKLOAD */}
          {taskSubView === 'roster' && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Hostel Maintenance Duty Technician Roster & Live Status
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time field workload, active site assignments, and direct emergency dispatch channels.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dutyTechniciansList.map((tech) => {
                  const techOpen = hostelComplaints.filter(
                    (c) =>
                      c.assignedTo?.toLowerCase().includes(tech.name.toLowerCase()) &&
                      c.status !== 'resolved' &&
                      c.status !== 'rejected',
                  ).length;
                  const techResolved = hostelComplaints.filter(
                    (c) =>
                      (c.resolvedBy?.toLowerCase().includes(tech.name.toLowerCase()) ||
                        c.assignedTo?.toLowerCase().includes(tech.name.toLowerCase())) &&
                      c.status === 'resolved',
                  ).length;
                  const techRejected = hostelComplaints.filter(
                    (c) =>
                      (c.rejectedBy?.toLowerCase().includes(tech.name.toLowerCase()) ||
                        c.assignedTo?.toLowerCase().includes(tech.name.toLowerCase())) &&
                      c.status === 'rejected',
                  ).length;

                  return (
                    <div
                      key={tech.id}
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-slate-900">{tech.name}</div>
                          <span className="text-2xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                            {tech.tradeLabel}
                          </span>
                        </div>
                        <span className="text-2xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200">
                          {tech.status}
                        </span>
                      </div>

                      <div className="text-2xs text-slate-500 space-y-1">
                        <div>Station / Desk: <strong>{tech.roomOrDesk}</strong></div>
                        <div>Contact Phone: <strong className="font-mono text-slate-700">{tech.phone}</strong></div>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 p-2 bg-white rounded-lg border border-slate-200 text-center font-mono">
                        <div>
                          <div className="text-3xs text-slate-400">Open</div>
                          <div className="text-sm font-bold text-amber-700">{techOpen}</div>
                        </div>
                        <div>
                          <div className="text-3xs text-slate-400">Resolved</div>
                          <div className="text-sm font-bold text-emerald-700">{techResolved}</div>
                        </div>
                        <div>
                          <div className="text-3xs text-slate-400">Rejected</div>
                          <div className="text-sm font-bold text-rose-700">{techRejected}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setTaskCategoryFilter(tech.trade);
                          setTaskSubView('review');
                        }}
                        className="w-full py-1.5 text-2xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer text-center"
                      >
                        Inspect {tech.tradeLabel} Queue â†’
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WARDEN ASSIGNMENT MODAL */}
          {assigningComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Dispatch Task to Technician</h3>
                      <div className="text-2xs text-slate-500">
                        {assigningComplaint.ticketNumber} Â· Room {assigningComplaint.roomNumber} ({assigningComplaint.hostelBlock})
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setAssigningComplaint(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1 rounded"
                  >
                    âœ•
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-900">{assigningComplaint.title}</div>
                  <div className="text-2xs text-slate-600">{assigningComplaint.description}</div>
                  <div className="text-3xs text-slate-400 pt-1">
                    Student: {assigningComplaint.studentName} ({assigningComplaint.rollNumber})
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Confirm / Reassign Category Trade</label>
                    <select
                      value={assignCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as ComplaintCategory;
                        setAssignCategory(newCat);
                        const techMatch = dutyTechniciansList.find((t) => t.trade === newCat);
                        if (techMatch) setAssignTech(`${techMatch.name} (${techMatch.tradeLabel})`);
                      }}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none"
                    >
                      <option value="wifi">Network & Wi-Fi</option>
                      <option value="electrical">Electrical Systems</option>
                      <option value="plumbing">Plumbing & Water</option>
                      <option value="carpentry">Carpentry & Furniture</option>
                      <option value="ac">HVAC & Cooling</option>
                      <option value="cleaning">Housekeeping & Sanitation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Select Duty Technician</label>
                    <select
                      value={assignTech}
                      onChange={(e) => setAssignTech(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none"
                    >
                      {dutyTechniciansList.map((tech) => (
                        <option key={tech.id} value={`${tech.name} (${tech.tradeLabel})`}>
                          {tech.name} â€” {tech.tradeLabel} ({tech.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Priority Classification</label>
                    <select
                      value={assignPriority}
                      onChange={(e) => setAssignPriority(e.target.value as ComplaintPriority)}
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none"
                    >
                      <option value="low">Low (Standard SLA 24h)</option>
                      <option value="medium">Medium (Priority SLA 12h)</option>
                      <option value="high">High (Urgent SLA 4h)</option>
                      <option value="critical">Critical (Immediate SLA 1h - Safety/Power)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Warden Operational Directive / Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={wardenInstruction}
                      onChange={(e) => setWardenInstruction(e.target.value)}
                      placeholder="e.g. Inspect breaker panel before turning on; student has upcoming online exam..."
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAssigningComplaint(null)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAssignment}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded cursor-pointer transition-colors shadow-xs"
                  >
                    Dispatch to Technician
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WARDEN RE-OPEN MODAL */}
          {reopeningComplaint && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                      <RotateCcw className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Re-Open & Re-Dispatch Issue</h3>
                      <div className="text-2xs text-slate-500">
                        {reopeningComplaint.ticketNumber} Â· Room {reopeningComplaint.roomNumber}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setReopeningComplaint(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1 rounded"
                  >
                    âœ•
                  </button>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
                  <div className="font-semibold">Technician's Rejection Justification:</div>
                  <p className="text-2xs italic">"{reopeningComplaint.rejectionReason}"</p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Warden Directive / Reason for Overriding & Re-Opening
                  </label>
                  <textarea
                    rows={3}
                    value={reopenNotes}
                    onChange={(e) => setReopenNotes(e.target.value)}
                    placeholder="Enter instructions for the reassigned technician..."
                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-none text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setReopeningComplaint(null)}
                    className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReopen}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded cursor-pointer transition-colors shadow-xs"
                  >
                    Re-Open Ticket
                  </button>
                </div>
              </div>
            </div>
          )}
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

