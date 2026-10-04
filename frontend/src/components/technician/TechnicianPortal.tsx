import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { useAuth } from '../../context/AuthContext';
import { ComplaintCategory, Complaint, ComplaintStatus } from '../../types';
import { dutyTechniciansList } from '../../data/mockData';
import {
  Wrench,
  Sparkles,
  CheckCircle2,
  Clock,
  Zap,
  AlertCircle,
  Check,
  XCircle,
  X,
  Wifi,
  Droplets,
  Hammer,
  Wind,
  Layers,
  Search,
  UserCheck,
  FileText,
  RotateCcw,
  ShieldAlert,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { formatTaskTime } from '../../utils/timeFormat';

interface CategoryConfig {
  id: ComplaintCategory;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeBg: string;
  defaultTech: string;
}

const CATEGORY_CONFIGS: Record<ComplaintCategory, CategoryConfig> = {
  wifi: {
    id: 'wifi',
    label: 'Network & Wi-Fi Operations',
    shortLabel: 'Wi-Fi & Network',
    icon: Wifi,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50/50',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    defaultTech: 'Suresh Menon (Network Admin)',
  },
  electrical: {
    id: 'electrical',
    label: 'Electrical Systems & Power',
    shortLabel: 'Electrical',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50/50',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    defaultTech: 'Rajesh Kumar (Senior Electrician)',
  },
  plumbing: {
    id: 'plumbing',
    label: 'Plumbing & Hydraulic Lines',
    shortLabel: 'Plumbing',
    icon: Droplets,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50/50',
    borderColor: 'border-cyan-200',
    badgeBg: 'bg-cyan-100 text-cyan-800',
    defaultTech: 'Mohammed Arif (Plumber)',
  },
  carpentry: {
    id: 'carpentry',
    label: 'Carpentry, Doors & Furniture',
    shortLabel: 'Carpentry',
    icon: Hammer,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50/50',
    borderColor: 'border-orange-200',
    badgeBg: 'bg-orange-100 text-orange-800',
    defaultTech: 'Hari Om (Carpenter)',
  },
  ac: {
    id: 'ac',
    label: 'HVAC & Climate Control',
    shortLabel: 'HVAC / AC',
    icon: Wind,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50/50',
    borderColor: 'border-teal-200',
    badgeBg: 'bg-teal-100 text-teal-800',
    defaultTech: 'Manoj Verma (HVAC Tech)',
  },
  cleaning: {
    id: 'cleaning',
    label: 'Housekeeping & Sanitation',
    shortLabel: 'Sanitation',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50/50',
    borderColor: 'border-purple-200',
    badgeBg: 'bg-purple-100 text-purple-800',
    defaultTech: 'Radha Bai (Housekeeping Supervisor)',
  },
  academic_lab: {
    id: 'academic_lab',
    label: 'Lab Workstations & Systems',
    shortLabel: 'Lab Systems',
    icon: Wrench,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50/50',
    borderColor: 'border-indigo-200',
    badgeBg: 'bg-indigo-100 text-indigo-800',
    defaultTech: 'Systems Lab Administrator',
  },
  academic_exam: {
    id: 'academic_exam',
    label: 'Examination & Marksheet Verification',
    shortLabel: 'Exam Cell',
    icon: GraduationCap,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50/50',
    borderColor: 'border-emerald-200',
    badgeBg: 'bg-emerald-100 text-emerald-800',
    defaultTech: 'Controller of Examinations Rep',
  },
  academic_faculty: {
    id: 'academic_faculty',
    label: 'Faculty & Timetable Consultation',
    shortLabel: 'Timetable',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50/50',
    borderColor: 'border-blue-200',
    badgeBg: 'bg-blue-100 text-blue-800',
    defaultTech: 'Subject Course Faculty Lead',
  },
  academic_notes: {
    id: 'academic_notes',
    label: 'LMS Study Materials & Notes',
    shortLabel: 'Course Notes',
    icon: BookOpen,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50/50',
    borderColor: 'border-amber-200',
    badgeBg: 'bg-amber-100 text-amber-800',
    defaultTech: 'Department Academic Lead',
  },
  academic_attendance: {
    id: 'academic_attendance',
    label: 'Attendance & Biometric Discrepancy',
    shortLabel: 'Attendance',
    icon: CheckCircle2,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50/50',
    borderColor: 'border-cyan-200',
    badgeBg: 'bg-cyan-100 text-cyan-800',
    defaultTech: 'Academic Attendance Counselor',
  },
  academic_library: {
    id: 'academic_library',
    label: 'Library & Digital Portal Access',
    shortLabel: 'Digital Library',
    icon: BookOpen,
    color: 'text-rose-600',
    bgColor: 'bg-rose-50/50',
    borderColor: 'border-rose-200',
    badgeBg: 'bg-rose-100 text-rose-800',
    defaultTech: 'Digital Library Lead',
  },
};

const COMMON_RESOLUTION_PRESETS: Record<ComplaintCategory, string[]> = {
  wifi: [
    'Replaced core PoE switch patch cable and verified DHCP lease renewal on AP.',
    'Reprogrammed AP channel width to reduce 2.4GHz co-channel interference.',
    'Terminated new RJ45 keystone jack and verified 1000Mbps link with cable tester.',
  ],
  electrical: [
    'Replaced faulty 5A modular socket and tightened loose neutral terminal screw.',
    'Replaced burnt ceiling fan regulator with new 100W stepped unit.',
    'Reset tripped 16A MCB at distribution board and checked insulation resistance.',
  ],
  plumbing: [
    'Replaced worn rubber washer and braided inlet hose on geyser line.',
    'Augered primary sink trap and cleared foreign obstruction; tested flow.',
    'Replaced defective quarter-turn ceramic disc spindle on wall mixer.',
  ],
  carpentry: [
    'Replaced sheared drawer ball-bearing runner slider and aligned fascia.',
    'Tightened loose hydraulic door closer and lubricated hinge pins.',
    'Repaired wardrobe latch alignment and secured strike plate screws.',
  ],
  ac: [
    'Deep-cleaned dust filtration mesh and cleared condensate drain pan.',
    'Replaced 35uF dual-run compressor capacitor and checked operating current draw.',
    'Inspected suction pressure and tightened flare nut on refrigerant piping.',
  ],
  cleaning: [
    'Completed chemical descaling and high-pressure steam sanitization of washroom.',
    'Disinfected common touchpoints and replenished washroom supplies.',
    'Cleared floor drain trap and applied biological odor neutralizer.',
  ],
  academic_lab: [
    'Reinstalled GPU drivers and verified student IDE environment on workstation.',
    'Restored laboratory server network mount and checked student permissions.',
  ],
  academic_exam: [
    'Re-evaluated script with subject professor; updated marks register in exam portal.',
    'Corrected tabulation discrepancy in university examination database.',
  ],
  academic_faculty: [
    'Rescheduled tutorial session to resolve timetable overlap for batch.',
    'Arranged special faculty consultation office hour for student.',
  ],
  academic_notes: [
    'Uploaded revised lecture presentation slides and laboratory manuals to portal.',
    'Restored student access to departmental cloud LMS drive.',
  ],
  academic_attendance: [
    'Reconciled medical leave certificate and adjusted biometric attendance records.',
    'Verified professor attendance register and credited missing attendance count.',
  ],
  academic_library: [
    'Renewed IEEE/ACM digital library credentials for student account.',
    'Issued requested reference volume from central library reserved stack.',
  ],
};

const COMMON_REJECTION_PRESETS: string[] = [
  'Duplicate issue: A maintenance ticket for this exact room/issue was already resolved.',
  'On-site inspection: Verified nominally functioning; no physical defect detected.',
  'Student unavailable: Room locked and student unreachable after multiple field visits.',
  'Misclassified trade: Category was wrongly selected; escalated to Warden for correct trade dispatch.',
  'Safety violation: Defect caused by unauthorized high-wattage appliance (heater/induction).',
  'Capital works needed: Requires infrastructure procurement and external civil contractor.',
];

export const TechnicianPortal: React.FC = () => {
  const { user } = useAuth();
  const techDisplayName = user?.fullName || 'Duty Operations Lead';
  const {
    complaints,
    deduplicatedTickets,
    resolveComplaint,
    rejectComplaint,
    resolveDeduplicatedTicket,
    rejectDeduplicatedTicket,
    simulateOutageSurge,
  } = useCampusOps();

  // Filters & State
  const [selectedTrade, setSelectedTrade] = useState<ComplaintCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');
  const [showClusters, setShowClusters] = useState<boolean>(false);

  // Simulation handler with auto cluster reveal
  const handleSimulateSurge = () => {
    simulateOutageSurge();
    setShowClusters(true);
  };

  // Resolution Modal State
  const [resolvingTicket, setResolvingTicket] = useState<{ id: string; isMaster: boolean; complaint?: Complaint } | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolverName, setResolverName] = useState(techDisplayName);

  // Rejection Modal State
  const [rejectingTicket, setRejectingTicket] = useState<{ id: string; isMaster: boolean; complaint?: Complaint } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionPreset, setRejectionPreset] = useState('');
  const [rejectorName, setRejectorName] = useState(techDisplayName);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    const matchesTrade = selectedTrade === 'all' || c.category === selectedTrade;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? c.status === 'open' || c.status === 'assigned' || c.status === 'in_progress'
        : c.status === statusFilter;
    const matchesSearch =
      searchTerm.trim() === '' ||
      c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hostelBlock.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTrade && matchesStatus && matchesSearch;
  });

  // Master Deduplicated Tickets
  const activeMasterTickets = deduplicatedTickets.filter(
    (dt) => (selectedTrade === 'all' || dt.category === selectedTrade) && dt.status !== 'resolved',
  );

  // Grouped complaints by category
  const categoriesList: ComplaintCategory[] = ['wifi', 'electrical', 'plumbing', 'carpentry', 'ac', 'cleaning'];

  // Counts
  const totalAssigned = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'open' || c.status === 'assigned' || c.status === 'in_progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'resolved').length;
  const rejectedCount = complaints.filter((c) => c.status === 'rejected').length;

  // Handlers for Resolution
  const handleOpenResolve = (complaint: Complaint) => {
    setResolvingTicket({ id: complaint.id, isMaster: false, complaint });
    const presets = COMMON_RESOLUTION_PRESETS[complaint.category] || [];
    setResolutionNotes(presets[0] || 'Inspected on site, completed repair, and validated functional operation.');
    setResolverName(techDisplayName);
  };

  const handleOpenMasterResolve = (masterId: string) => {
    setResolvingTicket({ id: masterId, isMaster: true });
    setResolutionNotes('Replaced rack core switch fiber transceiver and power cycled PoE injector. All student room connections restored.');
    setResolverName(techDisplayName);
  };

  const handleConfirmResolution = async () => {
    if (!resolvingTicket || !resolutionNotes.trim()) return;

    if (resolvingTicket.isMaster) {
      resolveDeduplicatedTicket(resolvingTicket.id, resolutionNotes.trim(), resolverName);
    } else {
      await resolveComplaint(resolvingTicket.id, resolutionNotes.trim(), resolverName);
    }

    setResolvingTicket(null);
    setResolutionNotes('');
  };

  // Handlers for Rejection
  const handleOpenReject = (complaint: Complaint) => {
    setRejectingTicket({ id: complaint.id, isMaster: false, complaint });
    setRejectionPreset(COMMON_REJECTION_PRESETS[0]);
    setRejectionReason(COMMON_REJECTION_PRESETS[0]);
    setRejectorName(techDisplayName);
  };

  const handleOpenMasterReject = (masterId: string) => {
    setRejectingTicket({ id: masterId, isMaster: true });
    setRejectionPreset(COMMON_REJECTION_PRESETS[1]);
    setRejectionReason('Power grid transient fluctuation resolved automatically by campus backup DG synchronization.');
    setRejectorName(techDisplayName);
  };

  const handleConfirmRejection = async () => {
    if (!rejectingTicket || !rejectionReason.trim()) return;

    if (rejectingTicket.isMaster) {
      rejectDeduplicatedTicket(rejectingTicket.id, rejectionReason.trim(), rejectorName);
    } else {
      await rejectComplaint(rejectingTicket.id, rejectionReason.trim(), rejectorName);
    }

    setRejectingTicket(null);
    setRejectionReason('');
    setRejectionPreset('');
  };

  return (
    <div className="space-y-6">
      {/* Technician Portal Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-widest text-indigo-600 font-semibold">
              Field Operations & Maintenance Desk
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">{techDisplayName}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">
            Category-Grouped Maintenance Queue & Direct Resolution Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tasks assigned by Hostel Warden categorized by technical trade · Directly resolve or reject issues with audit justification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Outage Cluster Toggle Button */}
          <button
            onClick={() => setShowClusters(!showClusters)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all border ${
              showClusters
                ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-white text-purple-700 border-purple-300 hover:bg-purple-50 shadow-2xs'
            }`}
            title="Toggle grouped outage complaints cluster"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>{showClusters ? 'Hide Outage Clusters' : '⚡ View Complaints Cluster'}</span>
            <span
              className={`text-2xs px-1.5 py-0.2 rounded-full font-mono font-bold ${
                showClusters ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 text-purple-800'
              }`}
            >
              {activeMasterTickets.length}
            </span>
          </button>

          {/* Live Simulation Button for Hackathon Evaluators */}
          <button
            onClick={handleSimulateSurge}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-xs cursor-pointer transition-colors"
            title="Simulate Wi-Fi cluster outage to evaluate auto-deduplication"
          >
            <Zap className="w-4 h-4" />
            Simulate Wi-Fi Surge (+6)
          </button>
        </div>
      </div>

      {/* KPI Metric Summary HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="text-2xs uppercase tracking-wider text-slate-500 font-medium">Total Assigned Queue</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalAssigned}
          </div>
          <div className="text-2xs text-slate-400 mt-0.5">Across all 6 campus trades</div>
        </div>

        <div className="bg-white border border-amber-200 bg-amber-50/30 rounded-xl p-4 shadow-xs">
          <div className="text-2xs uppercase tracking-wider text-amber-700 font-semibold">Pending Action</div>
          <div className="text-2xl font-bold font-mono text-amber-800 mt-1 tabular-nums">
            {pendingCount}
          </div>
          <div className="text-2xs text-amber-600 mt-0.5">Assigned by Warden & Open</div>
        </div>

        <div className="bg-white border border-emerald-200 bg-emerald-50/30 rounded-xl p-4 shadow-xs">
          <div className="text-2xs uppercase tracking-wider text-emerald-700 font-semibold">Resolved Today</div>
          <div className="text-2xl font-bold font-mono text-emerald-800 mt-1 tabular-nums">
            {resolvedCount}
          </div>
          <div className="text-2xs text-emerald-600 mt-0.5">With technician work notes</div>
        </div>

        <div className="bg-white border border-rose-200 bg-rose-50/30 rounded-xl p-4 shadow-xs">
          <div className="text-2xs uppercase tracking-wider text-rose-700 font-semibold">Rejected / Flagged</div>
          <div className="text-2xl font-bold font-mono text-rose-800 mt-1 tabular-nums">
            {rejectedCount}
          </div>
          <div className="text-2xs text-rose-600 mt-0.5">Audited with reason to Warden</div>
        </div>
      </div>

      {/* TOP CARD: ALL CATEGORIES & STATUS FILTERS */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        {/* Trade Category Filter Tabs & View Mode */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedTrade('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                selectedTrade === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Categories ({complaints.length})
            </button>
            {categoriesList.map((catKey) => {
              const conf = CATEGORY_CONFIGS[catKey];
              const Icon = conf.icon;
              const catCount = complaints.filter((c) => c.category === catKey).length;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedTrade(catKey)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                    selectedTrade === catKey
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${conf.color}`} />
                  <span>{conf.shortLabel}</span>
                  <span className="text-2xs px-1.5 py-0.2 rounded-full bg-slate-200/80 text-slate-700 font-mono">
                    {catCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              onClick={() => setViewMode('grouped')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grouped' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Category Cards
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flat Queue
            </button>
          </div>
        </div>

        {/* Status Filters, Complaints Cluster Toggle Button & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto text-xs flex-wrap">
            <span className="text-2xs uppercase tracking-wider text-slate-400 font-semibold mr-0.5">Status:</span>
            {[
              { id: 'all', label: 'All Tasks', count: complaints.length },
              { id: 'pending', label: 'Actionable (Open/Assigned)', count: pendingCount },
              { id: 'resolved', label: 'Resolved', count: resolvedCount },
              { id: 'rejected', label: 'Rejected', count: rejectedCount },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label} ({st.count})
              </button>
            ))}

            {/* In-Card Cluster Toggle Button */}
            <button
              onClick={() => setShowClusters(!showClusters)}
              className={`ml-1 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                showClusters
                  ? 'bg-purple-700 text-white border-purple-700 shadow-xs ring-2 ring-purple-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>{showClusters ? 'Hide Outage Cluster' : '⚡ View Complaints Cluster'}</span>
              <span
                className={`text-2xs px-1.5 py-0.2 rounded-full font-mono font-bold ${
                  showClusters ? 'bg-purple-900 text-purple-100' : 'bg-purple-200 text-purple-800'
                }`}
              >
                {activeMasterTickets.length}
              </span>
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search room, ticket #, student..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* CLUSTER OF COMPLAINTS: APPEARS WHEN THE BUTTON IS PRESSED */}
      {showClusters && (
        <div className="border-2 border-purple-400 bg-purple-50/50 rounded-xl p-4 space-y-3.5 shadow-sm animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-200 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-600 text-white rounded-lg shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Cluster of Complaints (Master Deduplicated Tickets)</span>
                  <span className="text-2xs bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full font-mono font-semibold">
                    {activeMasterTickets.length} Active
                  </span>
                </h2>
                <p className="text-2xs text-slate-600 mt-0.5">
                  AI auto-groups duplicate outage reports across wings/rooms. Single action resolves or rejects all grouped student complaints simultaneously.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowClusters(false)}
              className="self-end sm:self-center px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-purple-200 hover:bg-purple-100 rounded-md cursor-pointer flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Close Cluster View</span>
            </button>
          </div>

          {activeMasterTickets.length === 0 ? (
            <div className="bg-white border border-purple-200 rounded-xl p-6 text-center space-y-2.5">
              <AlertCircle className="w-7 h-7 text-purple-400 mx-auto" />
              <div className="text-sm font-bold text-slate-800">No active outage clusters at the moment</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                All clustered tickets have been handled. Test the intelligent deduplication engine by simulating an instant Wi-Fi outage surge.
              </p>
              <button
                onClick={handleSimulateSurge}
                className="mt-1 inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                Simulate Wi-Fi Surge (+6 Complaints)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {activeMasterTickets.map((dt) => (
                <div
                  key={dt.id}
                  className="border border-purple-300 bg-white rounded-xl p-4 space-y-3 shadow-xs hover:border-purple-400 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-purple-900 bg-purple-100 border border-purple-200 px-2.5 py-0.5 rounded">
                        {dt.masterCode}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{dt.title}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold bg-purple-600 text-white px-2.5 py-0.5 rounded-full">
                        {dt.affectedCount} Complaints Grouped
                      </span>
                      <button
                        onClick={() => handleOpenMasterReject(dt.id)}
                        className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-md cursor-pointer flex items-center gap-1 transition-colors"
                        title="Flag/reject cluster with reason"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject Cluster
                      </button>
                      <button
                        onClick={() => handleOpenMasterResolve(dt.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md cursor-pointer flex items-center gap-1 shadow-xs transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Resolve All {dt.affectedCount} Students
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-purple-50/40 p-3 rounded-lg border border-purple-100 space-y-1.5">
                    <div className="font-medium text-slate-900">
                      Suspected Root Cause: <span className="font-normal text-slate-700">{dt.rootCauseCandidate}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 items-center pt-1 text-2xs text-slate-500">
                      <span className="font-semibold text-slate-700">Affected Rooms in Cluster:</span>
                      {dt.reportedRooms.map((rm, i) => (
                        <span key={i} className="bg-white border border-slate-200 font-mono px-1.5 py-0.5 rounded text-slate-700 font-medium">
                          {rm}
                        </span>
                      ))}
                      <span className="ml-auto font-mono text-3xs text-purple-800 bg-purple-100 border border-purple-200 px-2 py-0.5 rounded font-semibold">
                        Cluster Logged: {formatTaskTime(dt.detectedAt) || dt.detectedAt}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* COMPLAINTS SECTION (Directly following the Category & Status Card) */}
      {viewMode === 'grouped' ? (
        <div className="space-y-6">
          {(selectedTrade === 'all' ? categoriesList : [selectedTrade]).map((catKey) => {
            const conf = CATEGORY_CONFIGS[catKey];
            const Icon = conf.icon;
            const catTickets = filteredComplaints.filter((c) => c.category === catKey);
            const catDutyTech = dutyTechniciansList.find((t) => t.trade === catKey);

            if (selectedTrade === 'all' && catTickets.length === 0) return null;

            return (
              <div
                key={catKey}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0"
              >
                {/* Category Header Banner */}
                <div className={`p-4 ${conf.bgColor} border-b ${conf.borderColor} flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg bg-white shadow-xs border ${conf.borderColor}`}>
                      <Icon className={`w-5 h-5 ${conf.color}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-900">{conf.label}</h2>
                        <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full ${conf.badgeBg}`}>
                          {catTickets.length} {catTickets.length === 1 ? 'Issue' : 'Issues'}
                        </span>
                      </div>
                      <div className="text-2xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span>Assigned Duty Lead: <strong>{catDutyTech?.name || conf.defaultTech}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{catDutyTech?.roomOrDesk || 'Maintenance Center'}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-600">{catDutyTech?.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-2xs font-mono">
                    <span className="bg-white/80 px-2 py-1 rounded border border-slate-200 text-amber-700">
                      Open: {catTickets.filter((c) => c.status !== 'resolved' && c.status !== 'rejected').length}
                    </span>
                    <span className="bg-white/80 px-2 py-1 rounded border border-slate-200 text-emerald-700">
                      Resolved: {catTickets.filter((c) => c.status === 'resolved').length}
                    </span>
                    <span className="bg-white/80 px-2 py-1 rounded border border-slate-200 text-rose-700">
                      Rejected: {catTickets.filter((c) => c.status === 'rejected').length}
                    </span>
                  </div>
                </div>

                {/* Tickets within this category */}
                <div className="p-4">
                  {catTickets.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400">
                      No issues matching current status filter in this category.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {catTickets.map((c) => (
                        <TicketCard
                          key={c.id}
                          complaint={c}
                          categoryConfig={conf}
                          onResolve={() => handleOpenResolve(c)}
                          onReject={() => handleOpenReject(c)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Flat Queue View */
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Flat Direct Ticket Queue ({filteredComplaints.length} tickets)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredComplaints.map((c) => (
              <TicketCard
                key={c.id}
                complaint={c}
                categoryConfig={CATEGORY_CONFIGS[c.category] || CATEGORY_CONFIGS.electrical}
                onResolve={() => handleOpenResolve(c)}
                onReject={() => handleOpenReject(c)}
              />
            ))}
          </div>
        </div>
      )}

      {/* RESOLUTION WORK LOG MODAL */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {resolvingTicket.isMaster ? 'Master Group Ticket Resolution' : 'Technician Resolution Sign-Off'}
                  </h3>
                  <div className="text-2xs text-slate-500">
                    {resolvingTicket.complaint ? `${resolvingTicket.complaint.ticketNumber} · Room ${resolvingTicket.complaint.roomNumber} (${resolvingTicket.complaint.hostelBlock})` : 'Multi-Room Cluster Outage'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setResolvingTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            {resolvingTicket.complaint && (
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-900">{resolvingTicket.complaint.title}</div>
                <div className="text-2xs text-slate-600">{resolvingTicket.complaint.description}</div>
                {resolvingTicket.complaint.wardenNotes && (
                  <div className="text-2xs text-indigo-700 font-medium pt-1 border-t border-slate-200">
                    <strong>Warden Instruction:</strong> {resolvingTicket.complaint.wardenNotes}
                  </div>
                )}
              </div>
            )}

            {/* Quick Presets */}
            {resolvingTicket.complaint && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-2xs uppercase tracking-wider">
                  Quick Standard Repair Presets:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(COMMON_RESOLUTION_PRESETS[resolvingTicket.complaint.category] || []).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setResolutionNotes(preset)}
                      className="text-2xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-left transition-colors cursor-pointer"
                    >
                      {preset.slice(0, 48)}...
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Repair Details, Work Done & Materials Used <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Document exact action taken, replacement parts installed, and verification test performed..."
                className="w-full p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Technician / Duty Operator Name</label>
              <input
                type="text"
                value={resolverName}
                onChange={(e) => setResolverName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolvingTicket(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!resolutionNotes.trim()}
                onClick={handleConfirmResolution}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded cursor-pointer transition-colors shadow-xs"
              >
                Complete & Submit Resolution
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION / FLAGGING MODAL */}
      {rejectingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Reject or Flag Maintenance Issue
                  </h3>
                  <div className="text-2xs text-slate-500">
                    {rejectingTicket.complaint ? `${rejectingTicket.complaint.ticketNumber} · Room ${rejectingTicket.complaint.roomNumber}` : 'Cluster Outage'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setRejectingTicket(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 space-y-1">
              <div className="font-semibold">Rejection Audit Log Note</div>
              <p className="text-2xs text-rose-800">
                This reason will be logged in the permanent audit trail, visible to the Hostel Warden in their review desk, and recorded on the student's ticket history.
              </p>
            </div>

            {/* Common Rejection Reasons */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Select Primary Reason:</label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {COMMON_REJECTION_PRESETS.map((preset, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2 p-2 rounded-lg border text-2xs cursor-pointer transition-colors ${
                      rejectionPreset === preset
                        ? 'border-rose-400 bg-rose-50/50 text-slate-900'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionPreset"
                      checked={rejectionPreset === preset}
                      onChange={() => {
                        setRejectionPreset(preset);
                        setRejectionReason(preset);
                      }}
                      className="mt-0.5 text-rose-600 focus:ring-rose-500"
                    />
                    <span>{preset}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detailed Justification & Technical Explanation <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this request is rejected or flagged for warden intervention..."
                className="w-full p-2.5 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-rose-500 text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Technician / Inspector Name</label>
              <input
                type="text"
                value={rejectorName}
                onChange={(e) => setRejectorName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-xs focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingTicket(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!rejectionReason.trim()}
                onClick={handleConfirmRejection}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded cursor-pointer transition-colors shadow-xs"
              >
                Confirm Rejection & Notify Warden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Individual Ticket Card
interface TicketCardProps {
  complaint: Complaint;
  categoryConfig: CategoryConfig;
  onResolve: () => void;
  onReject: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({
  complaint: c,
  categoryConfig: conf,
  onResolve,
  onReject,
}) => {
  const Icon = conf.icon;
  const isResolved = c.status === 'resolved';
  const isRejected = c.status === 'rejected';
  const isActionable = !isResolved && !isRejected;

  const priorityStyles: Record<string, string> = {
    critical: 'bg-rose-600 text-white font-bold',
    high: 'bg-amber-500 text-white font-bold',
    medium: 'bg-blue-500 text-white',
    low: 'bg-slate-400 text-white',
  };

  const createdTime = formatTaskTime(c.createdAt) || 'Recent';
  const assignedTime = c.assignedAt ? formatTaskTime(c.assignedAt) : null;
  const resolvedTime = c.resolvedAt ? formatTaskTime(c.resolvedAt) : null;
  const rejectedTime = c.rejectedAt ? formatTaskTime(c.rejectedAt) : null;

  return (
    <div
      className={`border rounded-xl p-4 space-y-3 shadow-xs transition-all ${
        isResolved
          ? 'border-emerald-200 bg-emerald-50/20'
          : isRejected
          ? 'border-rose-200 bg-rose-50/20'
          : 'border-slate-200 bg-white hover:border-slate-300'
      }`}
    >
      {/* Top row: Ticket #, Category, Priority, Status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {c.ticketNumber}
          </span>
          <span className={`text-3xs uppercase font-semibold px-2 py-0.5 rounded-full ${conf.badgeBg}`}>
            {conf.shortLabel}
          </span>
          {c.priority && (
            <span className={`text-3xs uppercase px-1.5 py-0.2 rounded ${priorityStyles[c.priority] || 'bg-slate-500 text-white'}`}>
              {c.priority}
            </span>
          )}
        </div>

        <span
          className={`text-2xs font-semibold uppercase px-2 py-0.5 rounded ${
            isResolved
              ? 'bg-emerald-100 text-emerald-800'
              : isRejected
              ? 'bg-rose-100 text-rose-800'
              : c.status === 'in_progress'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {c.status.replace('_', ' ')}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-xs font-bold text-slate-900">{c.title}</h3>
        <p className="text-2xs text-slate-500 mt-0.5 line-clamp-2">{c.description}</p>
      </div>

      {/* Location & Student Info */}
      <div className="grid grid-cols-2 gap-2 text-2xs p-2.5 bg-slate-50/80 rounded-lg border border-slate-100">
        <div>
          <span className="text-slate-400 block">Location:</span>
          <span className="font-semibold text-slate-800">
            Room {c.roomNumber} · {c.hostelBlock}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Reported By:</span>
          <span className="font-medium text-slate-700">
            {c.studentName} ({c.rollNumber})
          </span>
        </div>
      </div>

      {/* Task Lifecycle Timestamps Grid (Created, Assigned, Resolved/Rejected) */}
      <div className="bg-slate-50/90 rounded-lg p-2.5 border border-slate-200/90 space-y-2">
        <div className="flex items-center justify-between text-3xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/70 pb-1">
          <span className="flex items-center gap-1 text-slate-600">
            <Clock className="w-3 h-3 text-slate-500" />
            Task Activity Timestamps
          </span>
          <span className="font-mono text-3xs text-slate-400">
            {isResolved
              ? 'Resolved'
              : isRejected
              ? 'Rejected'
              : c.status === 'in_progress'
              ? 'In Progress'
              : c.status === 'assigned'
              ? 'Assigned'
              : 'Open Requisition'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* 1. Created Time */}
          <div className="bg-white p-2 rounded border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1 text-3xs font-semibold text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
              <span>Task Created</span>
            </div>
            <div className="font-mono text-2xs font-bold text-slate-800 mt-1">
              {createdTime}
            </div>
            <div className="text-3xs text-slate-400 mt-0.5 truncate">
              By {c.studentName}
            </div>
          </div>

          {/* 2. Assigned Time */}
          <div className="bg-white p-2 rounded border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1 text-3xs font-semibold text-slate-500">
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  assignedTime ? 'bg-indigo-500' : 'bg-amber-400'
                }`}
              ></span>
              <span>Task Assigned</span>
            </div>
            <div className="font-mono text-2xs font-bold mt-1">
              {assignedTime ? (
                <span className="text-indigo-900">{assignedTime}</span>
              ) : (
                <span className="text-amber-600 font-normal italic">Pending Assignment</span>
              )}
            </div>
            <div className="text-3xs text-slate-400 mt-0.5 truncate">
              {c.assignedTo ? c.assignedTo : 'Awaiting Warden'}
            </div>
          </div>

          {/* 3. Resolved / Rejected Time */}
          <div className="bg-white p-2 rounded border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1 text-3xs font-semibold text-slate-500">
              <span
                className={`w-1.5 h-1.5 rounded-full inline-block ${
                  isResolved
                    ? 'bg-emerald-500'
                    : isRejected
                    ? 'bg-rose-500'
                    : 'bg-slate-300'
                }`}
              ></span>
              <span>
                {isResolved
                  ? 'Task Resolved'
                  : isRejected
                  ? 'Task Rejected'
                  : 'Resolution'}
              </span>
            </div>
            <div className="font-mono text-2xs font-bold mt-1">
              {isResolved && resolvedTime ? (
                <span className="text-emerald-700">{resolvedTime}</span>
              ) : isRejected && rejectedTime ? (
                <span className="text-rose-700">{rejectedTime}</span>
              ) : (
                <span className="text-slate-400 font-normal italic">
                  {c.status === 'in_progress' ? 'In Progress' : 'Pending Resolution'}
                </span>
              )}
            </div>
            <div className="text-3xs text-slate-400 mt-0.5 truncate">
              {isResolved
                ? c.resolvedBy || c.assignedTo || 'Duty Tech'
                : isRejected
                ? c.rejectedBy || c.assignedTo || 'Duty Tech'
                : 'Awaiting Action'}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Warden Dispatch Banner */}
      {!c.assignedTo && !c.assignedBy && c.status === 'open' && (
        <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-lg text-2xs text-amber-900 space-y-0.5">
          <div className="flex items-center justify-between font-semibold text-amber-800">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Registered by Student · Pending Warden Dispatch
            </span>
            <span className="font-mono text-3xs text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">
              Needs Warden Action
            </span>
          </div>
          <p className="text-3xs text-amber-700">
            Direct student requisition logged. Awaiting Hostel Warden to dispatch duty technician according to technical trade.
          </p>
        </div>
      )}

      {/* Warden Assignment Directive (if present) */}
      {(c.assignedBy || c.wardenNotes || c.assignedTo) && (
        <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-lg text-2xs text-indigo-900 space-y-0.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-1 text-indigo-800">
              <UserCheck className="w-3 h-3 text-indigo-600" />
              {c.assignedBy ? `Assigned by Warden: ${c.assignedBy}` : `Assigned Tech: ${c.assignedTo}`}
            </span>
            {assignedTime && (
              <span className="font-mono text-3xs text-indigo-700 bg-indigo-100 border border-indigo-200 px-1.5 py-0.2 rounded font-semibold">
                Assigned: {assignedTime}
              </span>
            )}
          </div>
          {c.assignedTo && c.assignedBy && (
            <div className="text-3xs text-indigo-700">
              Duty Technician: <strong>{c.assignedTo}</strong>
            </div>
          )}
          {c.wardenNotes && (
            <p className="text-indigo-800 text-2xs italic pt-0.5">
              "{c.wardenNotes}"
            </p>
          )}
        </div>
      )}

      {/* Resolved Banner */}
      {isResolved && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-2xs text-emerald-900 space-y-1">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Resolved by {c.resolvedBy || c.assignedTo || 'Technician'}
            </span>
            <span className="font-mono text-3xs text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
              Resolved: {resolvedTime || 'Completed'}
            </span>
          </div>
          {c.resolutionNotes && (
            <p className="text-emerald-800 text-2xs bg-white/70 p-1.5 rounded border border-emerald-100">
              {c.resolutionNotes}
            </p>
          )}
        </div>
      )}

      {/* Rejected Banner */}
      {isRejected && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-2xs text-rose-900 space-y-1">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1 text-rose-800">
              <XCircle className="w-3.5 h-3.5 text-rose-600" />
              Flagged/Rejected by {c.rejectedBy || c.assignedTo || 'Technician'}
            </span>
            <span className="font-mono text-3xs text-rose-700 bg-rose-100 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">
              Rejected: {rejectedTime || 'Rejected'}
            </span>
          </div>
          {c.rejectionReason && (
            <p className="text-rose-800 text-2xs bg-white/70 p-1.5 rounded border border-rose-100">
              <strong>Reason:</strong> {c.rejectionReason}
            </p>
          )}
          <span className="block text-3xs text-rose-600">Visible on Warden Review Desk for audit / re-opening.</span>
        </div>
      )}

      {/* Actions */}
      {isActionable && (
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <div className="text-3xs text-slate-500 font-mono">
            Created: {createdTime}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReject}
              className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-md cursor-pointer transition-colors flex items-center gap-1"
              title="Reject or flag with reason"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
            <button
              onClick={onResolve}
              className="px-3.5 py-1 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-md cursor-pointer transition-colors shadow-xs flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              Resolve Issue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
