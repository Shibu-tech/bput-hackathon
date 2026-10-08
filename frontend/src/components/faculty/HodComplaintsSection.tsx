import React, { useState, useMemo } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { useAuth } from '../../context/AuthContext';
import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus, isAcademicComplaint } from '../../types';
import { dutyTechniciansList } from '../../data/mockData';
import {
  AlertOctagon,
  CheckCircle2,
  XCircle,
  RotateCw,
  Search,
  Filter,
  Wrench,
  Clock,
  User,
  Building,
  Phone,
  ThumbsUp,
  Flame,
  Send,
  FileText,
  ShieldAlert,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Layers,
  HelpCircle,
  GraduationCap,
  BookOpen,
} from 'lucide-react';

interface HodComplaintsSectionProps {
  onBroadcastNotice?: (complaint: Complaint) => void;
}

export const HodComplaintsSection: React.FC<HodComplaintsSectionProps> = ({ onBroadcastNotice }) => {
  const { complaints, assignComplaint, resolveComplaint, rejectComplaint, reopenComplaint } = useCampusOps();
  const { user } = useAuth();

  const hodName = user?.fullName ? `Prof. ${user.fullName}` : 'Head of Department (HOD)';

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [onlyCritical, setOnlyCritical] = useState(false);

  // Modal States
  const [assigningComplaint, setAssigningComplaint] = useState<Complaint | null>(null);
  const [assignTech, setAssignTech] = useState('');
  const [assignCategory, setAssignCategory] = useState<ComplaintCategory>('academic_lab');
  const [assignPriority, setAssignPriority] = useState<ComplaintPriority>('high');
  const [hodDirectives, setHodDirectives] = useState('');

  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [rejectingComplaint, setRejectingComplaint] = useState<Complaint | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [reopeningComplaint, setReopeningComplaint] = useState<Complaint | null>(null);
  const [reopenNotes, setReopenNotes] = useState('');

  const [viewingDetailComplaint, setViewingDetailComplaint] = useState<Complaint | null>(null);

  // Success / Feedback notification
  const [actionNotice, setActionNotice] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setActionNotice({ message, type });
    setTimeout(() => setActionNotice(null), 4500);
  };

  // Strictly filter for Academic Complaints only for HOD
  const academicComplaints = useMemo(() => {
    return complaints.filter(isAcademicComplaint);
  }, [complaints]);

  // KPIs
  const totalComplaints = academicComplaints.length;
  const openComplaints = academicComplaints.filter((c) => c.status === 'open');
  const assignedComplaints = academicComplaints.filter((c) => c.status === 'assigned' || c.status === 'in_progress');
  const resolvedComplaints = academicComplaints.filter((c) => c.status === 'resolved');
  const criticalComplaints = academicComplaints.filter((c) => c.priority === 'critical' || c.priority === 'high');

  // Filtered List
  const filteredComplaints = useMemo(() => {
    return academicComplaints.filter((c) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.studentName.toLowerCase().includes(q) ||
          c.rollNumber.toLowerCase().includes(q) ||
          c.ticketNumber.toLowerCase().includes(q) ||
          c.roomNumber.toLowerCase().includes(q) ||
          c.hostelBlock.toLowerCase().includes(q) ||
          (c.assignedTo && c.assignedTo.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      // Status
      if (selectedStatus !== 'all' && c.status !== selectedStatus) {
        return false;
      }

      // Category
      if (selectedCategory !== 'all' && c.category !== selectedCategory) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'all' && c.priority !== selectedPriority) {
        return false;
      }

      // Only Critical Toggle
      if (onlyCritical && c.priority !== 'critical' && c.priority !== 'high') {
        return false;
      }

      return true;
    });
  }, [academicComplaints, searchQuery, selectedStatus, selectedCategory, selectedPriority, onlyCritical]);

  // Handlers for Opening Modals
  const handleOpenAssignModal = (complaint: Complaint) => {
    setAssigningComplaint(complaint);
    setAssignCategory(complaint.category);
    let defaultAssignee = 'Systems Lab Administrator';
    if (complaint.category === 'academic_exam') defaultAssignee = 'Controller of Examinations (COE) Cell';
    else if (complaint.category === 'academic_faculty') defaultAssignee = 'Subject Course Faculty';
    else if (complaint.category === 'academic_notes') defaultAssignee = 'Subject Course Faculty';
    else if (complaint.category === 'academic_attendance') defaultAssignee = 'Department Academic Counselor';
    else if (complaint.category === 'academic_library') defaultAssignee = 'Digital Library & Computing Lead';
    else if (complaint.category === 'academic_lab') defaultAssignee = 'Systems Lab Administrator';
    else {
      const defaultTechObj = dutyTechniciansList.find((t) => t.trade === complaint.category);
      defaultAssignee = defaultTechObj ? `${defaultTechObj.name} (${defaultTechObj.tradeLabel})` : 'Systems Lab Administrator';
    }
    setAssignTech(defaultAssignee);
    setAssignPriority(complaint.priority || 'high');
    setHodDirectives(complaint.wardenNotes || 'HOD Directive: Immediate review and student follow-up requested.');
  };

  const handleConfirmAssignment = async () => {
    if (!assigningComplaint) return;
    try {
      await assignComplaint(
        assigningComplaint.id,
        assignTech,
        assignCategory,
        `[HOD Directive] ${hodDirectives.trim()}`,
        assignPriority,
        `${hodName} (Head of Department)`
      );
      showNotification(`Ticket ${assigningComplaint.ticketNumber} successfully assigned to ${assignTech} with HOD directives.`);
      setAssigningComplaint(null);
    } catch {
      showNotification('Failed to assign complaint. Please try again.', 'warning');
    }
  };

  const handleOpenResolveModal = (complaint: Complaint) => {
    setResolvingComplaint(complaint);
    setResolutionNotes(`Verified and signed off by ${hodName}: Complaint resolved in department records.`);
  };

  const handleConfirmResolve = async () => {
    if (!resolvingComplaint) return;
    try {
      await resolveComplaint(resolvingComplaint.id, resolutionNotes.trim(), `${hodName} (Head of Department)`);
      showNotification(`Ticket ${resolvingComplaint.ticketNumber} marked as RESOLVED by HOD.`);
      setResolvingComplaint(null);
      if (viewingDetailComplaint?.id === resolvingComplaint.id) {
        setViewingDetailComplaint(null);
      }
    } catch {
      showNotification('Failed to resolve complaint.', 'warning');
    }
  };

  const handleOpenRejectModal = (complaint: Complaint) => {
    setRejectingComplaint(complaint);
    setRejectionReason('Reviewed by HOD: Non-compliant / resolved via alternative lab facility.');
  };

  const handleConfirmReject = async () => {
    if (!rejectingComplaint) return;
    try {
      await rejectComplaint(rejectingComplaint.id, rejectionReason.trim(), `${hodName} (Head of Department)`);
      showNotification(`Ticket ${rejectingComplaint.ticketNumber} marked as REJECTED with HOD remarks.`, 'info');
      setRejectingComplaint(null);
      if (viewingDetailComplaint?.id === rejectingComplaint.id) {
        setViewingDetailComplaint(null);
      }
    } catch {
      showNotification('Failed to reject complaint.', 'warning');
    }
  };

  const handleOpenReopenModal = (complaint: Complaint) => {
    setReopeningComplaint(complaint);
    setReopenNotes('Re-opened by HOD: Student reported recurring issue during practical lab.');
  };

  const handleConfirmReopen = async () => {
    if (!reopeningComplaint) return;
    try {
      await reopenComplaint(reopeningComplaint.id, reopenNotes.trim());
      showNotification(`Ticket ${reopeningComplaint.ticketNumber} re-opened for department investigation.`);
      setReopeningComplaint(null);
      if (viewingDetailComplaint?.id === reopeningComplaint.id) {
        setViewingDetailComplaint(null);
      }
    } catch {
      showNotification('Failed to re-open complaint.', 'warning');
    }
  };

  const getCategoryBadge = (cat: ComplaintCategory) => {
    switch (cat) {
      case 'academic_lab':
        return { label: 'Lab & Workstations', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'academic_exam':
        return { label: 'Exam & Evaluation', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'academic_faculty':
        return { label: 'Timetable & Faculty', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'academic_notes':
        return { label: 'Study Materials', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'academic_attendance':
        return { label: 'Attendance Discrepancy', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' };
      case 'academic_library':
        return { label: 'Library & Department', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'wifi':
        return { label: 'Lab Wi-Fi / IT', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { label: cat, color: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const getPriorityBadge = (p: ComplaintPriority) => {
    switch (p) {
      case 'critical':
        return {
          label: 'Critical / Urgent',
          color: 'bg-rose-100 text-rose-800 border-rose-300 font-extrabold animate-pulse',
        };
      case 'high':
        return { label: 'High Priority', color: 'bg-orange-100 text-orange-800 border-orange-300 font-bold' };
      case 'medium':
        return { label: 'Medium', color: 'bg-amber-50 text-amber-800 border-amber-200 font-medium' };
      case 'low':
        return { label: 'Low', color: 'bg-slate-100 text-slate-700 border-slate-200 font-normal' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-xs animate-in fade-in duration-200 ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : actionNotice.type === 'warning'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-xs font-bold px-2 py-0.5 hover:opacity-75 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header Info Card */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-lg border border-purple-800/40 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center gap-1.5 backdrop-blur-xs">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Department Head Authority
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-white/10 text-slate-200 border border-white/15 flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-purple-300" />
                Academic Grievance Desk
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Student Academic Grievances & Complaints
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed">
              Review and oversee academic-related student issues: laboratory computing, mid-term evaluation marks,
              elective clashes, syllabus materials, and attendance corrections. Assign department faculty leads or sign off official resolutions.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => {
                setOnlyCritical(!onlyCritical);
                if (!onlyCritical) setSelectedPriority('all');
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                onlyCritical
                  ? 'bg-rose-600 text-white shadow-rose-500/30 ring-2 ring-rose-400'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Flame className={`w-4 h-4 ${onlyCritical ? 'text-amber-200' : 'text-rose-400'}`} />
              <span>{onlyCritical ? 'Showing Critical Issues' : 'Show Critical Only'}</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics / KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div
          onClick={() => {
            setSelectedStatus('all');
            setOnlyCritical(false);
          }}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">Total Grievances</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 transition-colors">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalComplaints}</p>
          <span className="text-2xs text-slate-500 font-medium">Logged in campus database</span>
        </div>

        {/* Action Required / Open */}
        <div
          onClick={() => {
            setSelectedStatus('open');
            setOnlyCritical(false);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer group ${
            selectedStatus === 'open'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200'
              : 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-amber-800">Action Required</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{openComplaints.length}</p>
          <span className="text-2xs text-amber-800 font-medium">Pending HOD or Tech assignment</span>
        </div>

        {/* In Progress / Assigned */}
        <div
          onClick={() => {
            setSelectedStatus('assigned');
            setOnlyCritical(false);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer group ${
            selectedStatus === 'assigned'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-200'
              : 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-blue-800">Under Investigation</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-700 mt-2">{assignedComplaints.length}</p>
          <span className="text-2xs text-blue-800 font-medium">Technicians deployed on-site</span>
        </div>

        {/* Resolved */}
        <div
          onClick={() => {
            setSelectedStatus('resolved');
            setOnlyCritical(false);
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer group ${
            selectedStatus === 'resolved'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200'
              : 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800">Resolved & Signed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{resolvedComplaints.length}</p>
          <span className="text-2xs text-emerald-800 font-medium">Grievance verified closed</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student name, roll number, ticket ID, room, or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Clear Filters */}
          {(searchQuery || selectedStatus !== 'all' || selectedCategory !== 'all' || selectedPriority !== 'all' || onlyCritical) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedStatus('all');
                setSelectedCategory('all');
                setSelectedPriority('all');
                setOnlyCritical(false);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 text-2xs font-bold uppercase">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open (Action Required)</option>
              <option value="assigned">Assigned / In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 text-2xs font-bold uppercase">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Academic Categories</option>
              <option value="academic_lab">Lab & Computing Workstations</option>
              <option value="academic_exam">Exam & Marks Discrepancies</option>
              <option value="academic_faculty">Timetable & Class Schedules</option>
              <option value="academic_notes">Study Materials & Notes</option>
              <option value="academic_attendance">Attendance Discrepancies</option>
              <option value="academic_library">Library & Department Facilities</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
            <span className="text-slate-400 text-2xs font-bold uppercase">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical / Emergency</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <span className="text-2xs text-slate-400 ml-auto font-medium">
            Showing <strong className="text-slate-800">{filteredComplaints.length}</strong> of {totalComplaints} complaints
          </span>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length === 0 ? (
          <div className="p-12 bg-white rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Student Complaints Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No complaints match your current search or filters. Adjust your criteria or clear the filters to view all logged grievances.
            </p>
          </div>
        ) : (
          filteredComplaints.map((complaint) => {
            const catBadge = getCategoryBadge(complaint.category);
            const prioBadge = getPriorityBadge(complaint.priority);

            return (
              <div
                key={complaint.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs hover:shadow-md space-y-4 ${
                  complaint.priority === 'critical'
                    ? 'border-rose-300 ring-1 ring-rose-200/70 bg-gradient-to-r from-rose-50/20 via-white to-white'
                    : 'border-slate-200/90 hover:border-purple-300'
                }`}
              >
                {/* Top Row: Ticket ID, Badges, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-slate-900 text-white shadow-2xs tracking-wider">
                      {complaint.ticketNumber}
                    </span>

                    <span className={`text-2xs font-semibold px-2.5 py-0.5 rounded-full border ${catBadge.color}`}>
                      {catBadge.label}
                    </span>

                    <span className={`text-2xs px-2.5 py-0.5 rounded-full border ${prioBadge.color}`}>
                      {prioBadge.label}
                    </span>

                    {complaint.upvotes > 0 && (
                      <span className="inline-flex items-center gap-1 text-2xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                        <ThumbsUp className="w-3 h-3" />
                        {complaint.upvotes} {complaint.upvotes === 1 ? 'student affected' : 'students affected'}
                      </span>
                    )}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {complaint.status === 'open' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                        <AlertOctagon className="w-3 h-3 text-amber-600" />
                        Open · Needs Action
                      </span>
                    )}

                    {(complaint.status === 'assigned' || complaint.status === 'in_progress') && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-300">
                        <Wrench className="w-3 h-3 text-blue-600" />
                        Assigned on Site
                      </span>
                    )}

                    {complaint.status === 'resolved' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Resolved & Closed
                      </span>
                    )}

                    {complaint.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-300">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        Dismissed
                      </span>
                    )}

                    <span className="text-2xs text-slate-400 font-medium ml-1">
                      {complaint.createdAt}
                    </span>
                  </div>
                </div>

                {/* Complaint Title & Body */}
                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900 flex items-start gap-2">
                    <span>{complaint.title}</span>
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    {complaint.description}
                  </p>
                </div>

                {/* Student & Location Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-purple-600 shrink-0" />
                    <div className="truncate">
                      <span className="text-2xs text-slate-400 block font-semibold uppercase">Student</span>
                      <strong className="text-slate-800 font-semibold">{complaint.studentName}</strong>
                      <span className="text-2xs text-slate-500 font-mono ml-1">({complaint.rollNumber})</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div className="truncate">
                      <span className="text-2xs text-slate-400 block font-semibold uppercase">Hostel & Block</span>
                      <span className="text-slate-800 font-medium">{complaint.hostelBlock}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-2xs text-slate-400 block font-semibold uppercase">Room / Lab No.</span>
                      <strong className="text-slate-900 font-bold">Room {complaint.roomNumber}</strong>
                    </div>
                  </div>
                </div>

                {/* Audit Trail: Assignment / Directives / Notes */}
                {(complaint.assignedTo || complaint.wardenNotes || complaint.resolutionNotes || complaint.rejectionReason) && (
                  <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-200/60 space-y-1.5 text-xs">
                    {complaint.assignedTo && (
                      <div className="flex items-center gap-1.5 text-purple-950">
                        <Wrench className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                        <span>
                          <strong>Assigned Technician:</strong> {complaint.assignedTo}
                          {complaint.assignedBy && <span className="text-purple-700"> (by {complaint.assignedBy})</span>}
                          {complaint.assignedAt && <span className="text-slate-400 text-2xs ml-1">at {complaint.assignedAt}</span>}
                        </span>
                      </div>
                    )}

                    {complaint.wardenNotes && (
                      <p className="text-2xs text-purple-900 bg-white p-2 rounded-lg border border-purple-200">
                        <strong className="text-purple-950">Directive / Notes:</strong> {complaint.wardenNotes}
                      </p>
                    )}

                    {complaint.resolutionNotes && (
                      <p className="text-2xs text-emerald-900 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                        <strong>Resolution Remarks:</strong> {complaint.resolutionNotes}
                        {complaint.resolvedAt && <span className="text-emerald-700 ml-1">({complaint.resolvedAt})</span>}
                      </p>
                    )}

                    {complaint.rejectionReason && (
                      <p className="text-2xs text-rose-900 bg-rose-50/80 p-2 rounded-lg border border-rose-200">
                        <strong>Dismissal Reason:</strong> {complaint.rejectionReason}
                      </p>
                    )}
                  </div>
                )}

                {/* HOD Action Toolbar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Action 1: Assign to Technician */}
                    <button
                      onClick={() => handleOpenAssignModal(complaint)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-white bg-purple-600 hover:bg-purple-700 shadow-xs cursor-pointer transition-colors"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>{complaint.assignedTo ? 'Re-assign / Update Directive' : 'Dispatch Technician'}</span>
                    </button>

                    {/* Action 2: Direct HOD Resolve */}
                    {complaint.status !== 'resolved' && (
                      <button
                        onClick={() => handleOpenResolveModal(complaint)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-2xs cursor-pointer transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Sign-off & Resolve</span>
                      </button>
                    )}

                    {/* Action 3: Dismiss / Reject */}
                    {complaint.status !== 'rejected' && complaint.status !== 'resolved' && (
                      <button
                        onClick={() => handleOpenRejectModal(complaint)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-2xs cursor-pointer transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5 text-rose-500" />
                        <span>Dismiss</span>
                      </button>
                    )}

                    {/* Action 4: Re-open */}
                    {(complaint.status === 'resolved' || complaint.status === 'rejected') && (
                      <button
                        onClick={() => handleOpenReopenModal(complaint)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 shadow-2xs cursor-pointer transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-amber-600" />
                        <span>Re-open for Review</span>
                      </button>
                    )}

                    {/* Action 5: Broadcast Notice to Students */}
                    {onBroadcastNotice && (
                      <button
                        onClick={() => onBroadcastNotice(complaint)}
                        title="Broadcast department notice to students regarding this issue"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Issue Circular</span>
                      </button>
                    )}
                  </div>

                  {/* Detail View Button */}
                  <button
                    onClick={() => setViewingDetailComplaint(complaint)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Full Details</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: HOD DISPATCH / ASSIGN TECHNICIAN */}
      {/* ========================================================================= */}
      {assigningComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Dispatch Duty Technician
                  </h3>
                  <span className="text-2xs font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    {assigningComplaint.ticketNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setAssigningComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Complaint Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-900">{assigningComplaint.title}</p>
              <p className="text-slate-500 text-2xs line-clamp-2">{assigningComplaint.description}</p>
              <div className="flex items-center gap-3 pt-1 text-slate-600 text-2xs">
                <span>Student: {assigningComplaint.studentName}</span>
                <span>·</span>
                <span>Room: {assigningComplaint.roomNumber} ({assigningComplaint.hostelBlock})</span>
              </div>
            </div>

            {/* Select Faculty / Lead / Technician */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Assign Faculty Lead / Department Specialist <span className="text-red-500">*</span>
              </label>
              <select
                value={assignTech}
                onChange={(e) => setAssignTech(e.target.value)}
                className="w-full text-xs font-medium border border-slate-300 rounded-xl p-2.5 bg-white focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 cursor-pointer"
              >
                <option value="Systems Lab Administrator">Systems Lab Administrator (Lab Servers & GPU Setup)</option>
                <option value="Subject Course Faculty">Subject Course Professor / Teacher</option>
                <option value="Academic Timetable Committee">Academic Timetable & Schedule Committee</option>
                <option value="Controller of Examinations (COE) Cell">Controller of Examinations (COE) Representative</option>
                <option value="Department Academic Counselor">Department Academic Counselor</option>
                <option value="Digital Library & Computing Lead">Digital Library & Computing Lead</option>
                <option value="Senior Campus Network Engineer">Senior Campus Network Engineer</option>
                {dutyTechniciansList.map((t) => (
                  <option key={t.id} value={`${t.name} (${t.tradeLabel})`}>
                    {t.name} · {t.tradeLabel} ({t.status}) · {t.phone}
                  </option>
                ))}
              </select>
            </div>

            {/* Set Priority */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Escalate / Set Priority
              </label>
              <div className="grid grid-cols-4 gap-2 text-xs">
                {(['low', 'medium', 'high', 'critical'] as ComplaintPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAssignPriority(p)}
                    className={`py-1.5 rounded-lg font-bold capitalize transition-all cursor-pointer border ${
                      assignPriority === p
                        ? p === 'critical'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : p === 'high'
                          ? 'bg-orange-500 text-white border-orange-500 shadow-xs'
                          : p === 'medium'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Official HOD Directive Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Official HOD Directives & Action Notes <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={hodDirectives}
                onChange={(e) => setHodDirectives(e.target.value)}
                placeholder="Specify priority instructions for the technician..."
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              />
              <div className="flex flex-wrap gap-1.5 text-3xs text-purple-700">
                <span className="text-slate-400 font-semibold">Quick Directives:</span>
                <button
                  type="button"
                  onClick={() => setHodDirectives('Priority: Repair required before university exam shift.')}
                  className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 cursor-pointer"
                >
                  Exam Shift Priority
                </button>
                <button
                  type="button"
                  onClick={() => setHodDirectives('Safety Warning: Isolate main circuit breaker before inspection.')}
                  className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 cursor-pointer"
                >
                  Electrical Safety Check
                </button>
                <button
                  type="button"
                  onClick={() => setHodDirectives('Inspect switch PoE and coordinate directly with student.')}
                  className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 rounded border border-purple-200 cursor-pointer"
                >
                  Contact Student
                </button>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssigningComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>Dispatch Directive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: HOD RESOLVE SIGN-OFF */}
      {/* ========================================================================= */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Sign-off & Resolve Grievance
                  </h3>
                  <span className="text-2xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {resolvingComplaint.ticketNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setResolvingComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{resolvingComplaint.title}</p>
              <p className="text-slate-500 text-2xs mt-0.5">{resolvingComplaint.studentName} · Room {resolvingComplaint.roomNumber}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Official HOD Resolution Remarks <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter completion remarks and verification details..."
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResolvingComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>Confirm Resolution</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: HOD REJECT / DISMISS */}
      {/* ========================================================================= */}
      {rejectingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Dismiss Grievance
                  </h3>
                  <span className="text-2xs font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {rejectingComplaint.ticketNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setRejectingComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{rejectingComplaint.title}</p>
              <p className="text-slate-500 text-2xs mt-0.5">{rejectingComplaint.studentName} · Room {rejectingComplaint.roomNumber}</p>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Reason for Dismissal <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State why this complaint cannot be serviced..."
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-rose-600 focus:ring-1 focus:ring-rose-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>Confirm Dismissal</span>
                <XCircle className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: HOD RE-OPEN */}
      {/* ========================================================================= */}
      {reopeningComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <RotateCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Re-open for Investigation
                  </h3>
                  <span className="text-2xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {reopeningComplaint.ticketNumber}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setReopeningComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Reason for Re-opening
              </label>
              <textarea
                rows={3}
                value={reopenNotes}
                onChange={(e) => setReopenNotes(e.target.value)}
                placeholder="Notes for re-inspection..."
                className="w-full text-xs border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReopeningComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReopen}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-1.5"
              >
                <span>Re-open Complaint</span>
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: FULL COMPLAINT INVESTIGATION DETAIL MODAL */}
      {/* ========================================================================= */}
      {viewingDetailComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm font-extrabold px-3 py-1 rounded-lg bg-slate-900 text-white">
                  {viewingDetailComplaint.ticketNumber}
                </span>
                <h3 className="text-base font-bold text-slate-900">Complaint Dossier</h3>
              </div>
              <button
                onClick={() => setViewingDetailComplaint(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Issue Title</span>
                <h4 className="text-base font-bold text-slate-900 mt-0.5">{viewingDetailComplaint.title}</h4>
              </div>

              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Full Description</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 mt-1 leading-relaxed">
                  {viewingDetailComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xs text-slate-400 block font-semibold">Student Name</span>
                  <strong className="text-slate-900 font-bold">{viewingDetailComplaint.studentName}</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xs text-slate-400 block font-semibold">Roll Number</span>
                  <span className="font-mono font-bold text-slate-900">{viewingDetailComplaint.rollNumber}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xs text-slate-400 block font-semibold">Hostel & Room</span>
                  <span className="font-medium text-slate-800">
                    {viewingDetailComplaint.hostelBlock} · {viewingDetailComplaint.roomNumber}
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-2xs text-slate-400 block font-semibold">Reported At</span>
                  <span className="font-medium text-slate-800">{viewingDetailComplaint.createdAt}</span>
                </div>
              </div>

              {/* Status & Tech Assignment Card */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-purple-900">
                    Current Dispatch Status
                  </span>
                  <span className="font-bold text-purple-700 uppercase tracking-wider text-2xs">
                    {viewingDetailComplaint.status}
                  </span>
                </div>
                <p className="text-purple-950 font-medium">
                  {viewingDetailComplaint.assignedTo
                    ? `Assigned to ${viewingDetailComplaint.assignedTo} by ${viewingDetailComplaint.assignedBy || 'Warden'}`
                    : 'Unassigned · Waiting for HOD / Warden Dispatch'}
                </p>
                {viewingDetailComplaint.wardenNotes && (
                  <p className="text-2xs text-purple-800 bg-white p-2 rounded-lg border border-purple-200">
                    <strong>Directives:</strong> {viewingDetailComplaint.wardenNotes}
                  </p>
                )}
                {viewingDetailComplaint.resolutionNotes && (
                  <p className="text-2xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                    <strong>Resolution Sign-off:</strong> {viewingDetailComplaint.resolutionNotes}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingDetailComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Close Dossier
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenAssignModal(viewingDetailComplaint);
                  }}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Dispatch Technician</span>
                </button>

                {viewingDetailComplaint.status !== 'resolved' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenResolveModal(viewingDetailComplaint);
                    }}
                    className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
