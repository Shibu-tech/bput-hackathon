import React, { useState, useEffect, useRef } from 'react';
import { getChatSocket } from '../../utils/chatSocket';
import { useCampusOps } from '../../context/CampusOpsContext';
import { useAuth } from '../../context/AuthContext';
import { ComplaintCategory, ComplaintPriority, Complaint } from '../../types';
import {
  ClipboardList,
  PlusCircle,
  MessageSquare,
  Coffee,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  ThumbsUp,
  Image as ImageIcon,
  AlertTriangle,
  Loader2,
  Search,
  User,
  Wrench,
  Trash2,
  ExternalLink,
  X
} from 'lucide-react';


interface ChatMessageItem {
  _id?: string;
  id?: string;
  complaintId?: string;
  complaintTitle?: string;
  studentId: string;
  studentName: string;
  studentRoll?: string;
  roomNumber?: string;
  senderRole: 'student' | 'warden';
  senderName?: string;
  text: string;
  createdAt?: string;
  time?: string;
}

export const HostelCareStudentComplaints: React.FC = () => {
  const { complaints, createComplaint, upvoteComplaint } = useCampusOps();
  const { user } = useAuth();

  // Active sub-tab inside Maintenance section
  const [subTab, setSubTab] = useState<'my_complaints' | 'submit' | 'chat'>('my_complaints');

  // Filter state for My Complaints: 'All' | 'Pending' | 'In Progress' | 'Resolved'
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');

  // Student info from auth
  const studentDisplayName = user?.fullName || 'Student';
  const studentRoll = user?.phoneNumber ? `STU-${user.phoneNumber.slice(-4)}` : 'STU-1001';
  const defaultRoom = user?.roomNumber || '204';
  const defaultHostel = user?.hostel || 'Hostel A';

  // Submit Complaint Form State
  const [roomNumber, setRoomNumber] = useState(defaultRoom);
  const [hostelBlock, setHostelBlock] = useState(defaultHostel);
  const [category, setCategory] = useState<ComplaintCategory>('electrical');
  const [priority, setPriority] = useState<ComplaintPriority>('medium');
  const [complaintText, setComplaintText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  // AI & Submission Status State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<any[] | null>(null);
  const [aiReviewNeeded, setAiReviewNeeded] = useState(false);
  const [aiData, setAiData] = useState<{
    summary: string;
    improvedComplaint: string;
    category: string;
    priority: string;
    confidence: number;
  } | null>(null);

  // Contextual Chat State
  const [selectedComplaintForChat, setSelectedComplaintForChat] = useState<{
    id: string;
    ticketNumber?: string;
    title: string;
    roomNumber: string;
  } | null>(null);

  // Live Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket & Chat History Lifecycle
  useEffect(() => {
    let isMounted = true;
    const socket = getChatSocket();

    // Join room for this student
    socket.emit('chat:join', {
      studentId: studentRoll,
      role: 'student',
      name: studentDisplayName,
      roomNumber: defaultRoom
    });

    const fetchHistory = async () => {
      setIsLoadingMessages(true);
      try {
        const res = await fetch(`http://localhost:5000/api/messages?studentId=${encodeURIComponent(studentRoll)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && isMounted) {
            setChatMessages(json.data || []);
          }
        }
      } catch (err) {
        console.error('[StudentChat] Failed to fetch messages:', err);
      } finally {
        if (isMounted) setIsLoadingMessages(false);
      }
    };

    fetchHistory();

    const handleReceive = (msg: ChatMessageItem) => {
      if (msg.studentId === studentRoll || msg.studentRoll === studentRoll) {
        setChatMessages((prev) => {
          const exists = prev.some((m) => (m._id && msg._id && m._id === msg._id) || (m.id && msg.id && m.id === msg.id));
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('chat:receive', handleReceive);

    return () => {
      isMounted = false;
      socket.off('chat:receive', handleReceive);
    };
  }, [studentRoll, studentDisplayName, defaultRoom]);

  // Auto-scroll chat feed
  useEffect(() => {
    if (subTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, subTab]);

  // Local state for deleted complaints
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  // Filter complaints for this student
  const myComplaints = complaints.filter(
    (c) =>
      !deletedIds.includes(c.id) &&
      (c.rollNumber === studentRoll ||
        c.studentName === studentDisplayName ||
        c.roomNumber === roomNumber)
  );

  // Calculate stats
  const stats = {
    total: myComplaints.length,
    pending: myComplaints.filter((c) => c.status === 'open' || c.status === 'assigned').length,
    progress: myComplaints.filter((c) => c.status === 'in_progress').length,
    resolved: myComplaints.filter((c) => c.status === 'resolved').length
  };

  // Filtered list
  const filteredComplaints = myComplaints.filter((c) => {
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending') return c.status === 'open' || c.status === 'assigned';
    if (statusFilter === 'In Progress') return c.status === 'in_progress';
    if (statusFilter === 'Resolved') return c.status === 'resolved';
    return true;
  });

  const handleDeleteComplaint = (id: string) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      setDeletedIds((prev) => [...prev, id]);
    }
  };

  // Submit Complaint with AI analysis
  const executeFinalSubmit = (finalDetails: {
    category: ComplaintCategory;
    priority: ComplaintPriority;
    description: string;
    summary?: string;
  }) => {
    createComplaint({
      title: finalDetails.summary || `${finalDetails.category.toUpperCase()} Maintenance in Room ${roomNumber}`,
      category: finalDetails.category,
      description: finalDetails.description,
      studentName: studentDisplayName,
      rollNumber: studentRoll,
      roomNumber,
      hostelBlock,
      priority: finalDetails.priority,
      photoUrl: photoUrl || undefined
    });

    // Reset form
    setComplaintText('');
    setPhotoUrl('');
    setAiData(null);
    setDuplicateWarning(null);
    setAiReviewNeeded(false);
    setSubTab('my_complaints');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    setIsAnalyzing(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint: complaintText,
          roomNumber,
          category: category.toUpperCase()
        })
      });

      if (res.ok) {
        const data = await res.json();
        const catMap: Record<string, ComplaintCategory> = {
          WIFI: 'wifi',
          INTERNET: 'wifi',
          ELECTRICAL: 'electrical',
          ELECTRICITY: 'electrical',
          PLUMBING: 'plumbing',
          WATER: 'plumbing',
          CARPENTRY: 'carpentry',
          FURNITURE: 'carpentry',
          HVAC: 'ac',
          AC: 'ac',
          CLEANING: 'cleaning',
          MESS: 'cleaning',
          OTHER: 'electrical'
        };

        const resolvedCat = catMap[data.category?.toUpperCase()] || category;
        const resolvedPriority: ComplaintPriority =
          data.priority?.toLowerCase() === 'high' || data.priority?.toLowerCase() === 'critical'
            ? 'high'
            : data.priority?.toLowerCase() === 'low'
            ? 'low'
            : 'medium';

        setAiData({
          summary: data.summary || '',
          improvedComplaint: data.improvedComplaint || complaintText,
          category: resolvedCat,
          priority: resolvedPriority,
          confidence: data.confidence || 90
        });

        // Check if duplicate was detected in the exact room
        if (data.duplicate && data.similarComplaints?.length > 0) {
          setDuplicateWarning(data.similarComplaints);
          setIsAnalyzing(false);
          return;
        }

        // Check if confidence is low
        if (data.confidence < 70) {
          setAiReviewNeeded(true);
          setIsAnalyzing(false);
          return;
        }

        // Auto submit
        executeFinalSubmit({
          category: resolvedCat,
          priority: resolvedPriority,
          description: data.improvedComplaint || complaintText,
          summary: data.summary
        });
      } else {
        throw new Error('Fallback');
      }
    } catch {
      // Local fallback
      executeFinalSubmit({
        category,
        priority,
        description: complaintText,
        summary: complaintText.length > 50 ? complaintText.substring(0, 47) + '...' : complaintText
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMessage.trim() || isSendingMessage) return;

    const textToSend = currentMessage.trim();
    setCurrentMessage('');
    setIsSendingMessage(true);

    const payload = {
      studentId: studentRoll,
      studentName: studentDisplayName,
      studentRoll: studentRoll,
      roomNumber: roomNumber,
      senderRole: 'student' as const,
      senderName: studentDisplayName,
      text: textToSend,
      complaintId: selectedComplaintForChat?.id || '',
      complaintTitle: selectedComplaintForChat?.title || ''
    };

    try {
      const res = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setChatMessages((prev) => {
            const exists = prev.some((m) => m._id === json.data._id);
            return exists ? prev : [...prev, json.data];
          });
          const socket = getChatSocket();
          socket.emit('chat:send', json.data);
        }
      }
    } catch (err) {
      console.error('[StudentChat] Error sending message:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Tone helpers matching HostelCare-AI
  const getCategoryTone = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'plumbing':
      case 'cleaning':
        return 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200';
      case 'electrical':
      case 'ac':
        return 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200';
      case 'wifi':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      default:
        return 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200';
    }
  };

  const getPriorityTone = (pri: string) => {
    switch (pri.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200';
      case 'low':
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
      default:
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
    }
  };

  const getStatusTone = (st: string) => {
    switch (st.toLowerCase()) {
      case 'resolved':
        return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200';
      default:
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP SUB-NAVIGATION TABS (MATCHING USER SCREENSHOT EXACTLY) */}
      <div className="flex items-center gap-8 border-b border-slate-200 pb-3">
        <button
          onClick={() => setSubTab('my_complaints')}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer pb-2 -mb-3 border-b-2 ${
            subTab === 'my_complaints'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          My Complaints
        </button>

        <button
          onClick={() => setSubTab('submit')}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer pb-2 -mb-3 border-b-2 ${
            subTab === 'submit'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          Submit
        </button>

        <button
          onClick={() => setSubTab('chat')}
          className={`flex items-center gap-2 text-sm font-semibold transition-colors cursor-pointer pb-2 -mb-3 border-b-2 ${
            subTab === 'chat'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>
      </div>

      {/* 2. SUB-VIEW: MY COMPLAINTS (MATCHES SCREENSHOT 1 & COMPLAINS.JSX) */}
      {subTab === 'my_complaints' && (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-700">
              MY DASHBOARD
            </span>
            <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Track your submitted complaints
            </h1>
            <p className="mt-2 text-base text-slate-600">
              Filter by status, review AI summaries, inspect attachments, and track progress over time.
            </p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Filed</span>
              <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{stats.total}</div>
              <p className="mt-1 text-xs text-slate-500">All time</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                Needs Action
              </span>
              <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{stats.pending}</div>
              <p className="mt-1 text-xs text-slate-500">Waiting in queue</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                Working On It
              </span>
              <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{stats.progress}</div>
              <p className="mt-1 text-xs text-slate-500">Currently assigned</p>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Resolved
              </span>
              <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{stats.resolved}</div>
              <p className="mt-1 text-xs text-slate-500">Successfully closed</p>
            </div>
          </div>

          {/* Status Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((filter) => {
              const count =
                filter === 'All'
                  ? stats.total
                  : filter === 'Pending'
                  ? stats.pending
                  : filter === 'In Progress'
                  ? stats.progress
                  : stats.resolved;
              const isActive = statusFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {filter} ({count})
                </button>
              );
            })}
          </div>

          {/* Timeline Complaint Cards / Empty State */}
          {filteredComplaints.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-4"><Coffee className="w-7 h-7" /></div>
              <h3 className="text-lg font-bold text-slate-900">No complaints found</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
                No complaints match the selected filter. Submit a new complaint to report room maintenance issues.
              </p>
              <button
                onClick={() => setSubTab('submit')}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                Submit New Complaint
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((c) => {
                const currentStatus =
                  c.status === 'resolved'
                    ? 'Resolved'
                    : c.status === 'in_progress'
                    ? 'In Progress'
                    : 'Pending';
                const isResolved = currentStatus === 'Resolved';
                const isInProgress = currentStatus === 'In Progress';

                return (
                  <div key={c.id} className="relative pl-6 sm:pl-28 py-4 group">
                    {/* Timeline Line & Dot */}
                    <div className="absolute left-3 sm:left-24 top-0 bottom-0 w-0.5 bg-slate-200 group-last:bottom-auto group-last:h-full"></div>
                    <div
                      className={`absolute left-[0.45rem] sm:left-[5.7rem] top-8 h-3.5 w-3.5 rounded-full border-4 border-white shadow-sm ${
                        isResolved ? 'bg-emerald-500' : isInProgress ? 'bg-blue-500' : 'bg-amber-400'
                      }`}
                    ></div>

                    {/* Date label on Desktop */}
                    <div className="hidden sm:block absolute left-0 top-7 w-20 text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{c.createdAt}</div>
                    </div>

                    {/* Card */}
                    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all">
                      <div className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                          <div className="flex flex-wrap items-center gap-2">
                            {(() => {
                              const displayCat = /wifi|internet|router|lan/i.test(c.title + ' ' + c.description) ? 'wifi' : c.category;
                              return (
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getCategoryTone(displayCat)}`}>
                                  {displayCat.toUpperCase()}
                                </span>
                              );
                            })()}
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getPriorityTone(c.priority)}`}>
                              {c.priority.toUpperCase()} Priority
                            </span>
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusTone(c.status)}`}>
                              {currentStatus}
                            </span>
                          </div>
                          <div className="sm:hidden text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {c.createdAt}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h2 className="text-xl font-bold text-slate-900">{c.title || c.studentName}</h2>
                          <p className="text-sm font-medium text-slate-500">
                            Roll {c.rollNumber} &bull; Room {c.roomNumber} ({c.hostelBlock})
                          </p>
                        </div>

                        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-3 text-sm">
                          {c.aiSummary && (
                            <div>
                              <span className="font-bold text-indigo-900 flex items-center gap-1.5 mb-1">
                                <span className="text-2xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">
                                  AI Summary
                                </span>
                              </span>
                              <p className="text-slate-800 font-medium leading-relaxed">{c.aiSummary}</p>
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-slate-700 text-xs uppercase tracking-wider mb-1 block">
                              Full Description
                            </span>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{c.description}</p>
                          </div>
                        </div>

                        {/* Image preview */}
                        {c.photoUrl && (
                          <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 max-w-xs">
                            <img src={c.photoUrl} alt="Complaint Attachment" className="w-full h-40 object-cover" />
                          </div>
                        )}

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => handleDeleteComplaint(c.id)}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg border border-transparent transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>

                          <button
                            onClick={() => {
                              setSelectedComplaintForChat({
                                id: c.id,
                                ticketNumber: c.ticketNumber,
                                title: c.title,
                                roomNumber: c.roomNumber
                              });
                              setSubTab('chat');
                            }}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                            Chat with Warden
                          </button>
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. SUB-VIEW: SUBMIT COMPLAINT (MATCHES SUBMIT.JSX) */}
      {subTab === 'submit' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm max-w-2xl mx-auto space-y-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-700">
              NEW REQUISITION
            </span>
            <h2 className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight">
              Submit a Complaint
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Fill in the details below. Our Gemini AI engine will verify urgency and check for existing issues in your room.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Hostel Block
                </label>
                <select
                  value={hostelBlock}
                  onChange={(e) => setHostelBlock(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="Hostel A">Hostel A (Ramanujan)</option>
                  <option value="Hostel B">Hostel B (Aryabhata)</option>
                  <option value="Hostel C">Hostel C (Kalam)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="electrical">Electricity (Fan, Light, Plug)</option>
                  <option value="plumbing">Water / Plumbing (Tap, Leak)</option>
                  <option value="wifi">Internet / Wi-Fi</option>
                  <option value="carpentry">Furniture (Bed, Table, Door)</option>
                  <option value="ac">Cooling / AC</option>
                  <option value="cleaning">Cleanliness / Washroom</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Detailed Complaint
              </label>
              <textarea
                rows={4}
                placeholder="Explain the problem clearly with as much detail as possible..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Attach Photo URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !complaintText.trim()}
              className="w-full mt-2 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing with Gemini AI & Submitting...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Submit Complaint
                </>
              )}
            </button>
          </form>

          {/* DUPLICATE WARNING MODAL (MATCHES SUBMIT.JSX) */}
          {duplicateWarning && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-100">
                <div className="flex items-center gap-3 text-rose-600">
                  <div className="p-2 bg-rose-50 rounded-xl">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Duplicate Complaint Detected</h3>
                    <p className="text-2xs text-slate-500">A similar issue is already active in Room {roomNumber}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 text-xs">
                  {duplicateWarning.map((item: any, idx: number) => (
                    <div key={idx} className="text-slate-700">
                      <span className="font-semibold text-slate-900">Active Ticket: </span>
                      {item.summary || item.complaint || 'Pending maintenance inspection'}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-slate-500">
                  Submitting duplicate reports may slow down resolution. Would you like to proceed anyway?
                </p>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDuplicateWarning(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      executeFinalSubmit({
                        category,
                        priority,
                        description: aiData?.improvedComplaint || complaintText,
                        summary: aiData?.summary
                      });
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
                  >
                    Submit Anyway
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI REVIEW NEEDED MODAL (MATCHES SUBMIT.JSX) */}
          {aiReviewNeeded && aiData && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-indigo-100">
                <div className="flex items-center gap-3 text-indigo-600">
                  <div className="p-2 bg-indigo-50 rounded-xl">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">AI Assistant Review</h3>
                    <p className="text-2xs text-slate-500">Confirm the AI category and priority suggestions</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">Suggested Summary:</span>
                    <p className="text-slate-900 mt-0.5">{aiData.summary || complaintText}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                    <div>
                      <span className="font-bold text-slate-700">Category:</span>
                      <p className="text-slate-900 capitalize">{aiData.category}</p>
                    </div>
                    <div>
                      <span className="font-bold text-slate-700">Priority:</span>
                      <p className="text-slate-900 capitalize">{aiData.priority}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAiReviewNeeded(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Edit Form
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      executeFinalSubmit({
                        category: aiData.category as ComplaintCategory,
                        priority: aiData.priority as ComplaintPriority,
                        description: aiData.improvedComplaint || complaintText,
                        summary: aiData.summary
                      });
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
                  >
                    Confirm & Submit
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SUB-VIEW: CHAT (REAL-TIME TWO-WAY MESSAGING) */}
      {subTab === 'chat' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm max-w-3xl mx-auto overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Hostel Warden Maintenance Desk</h4>
                <p className="text-2xs text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Support &bull; Room {roomNumber}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300 font-mono">
                {studentRoll}
              </span>
              <button
                onClick={() => setSubTab('my_complaints')}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition"
              >
                Back
              </button>
            </div>
          </div>

          {/* Context Banner if linked to a specific problem */}
          {selectedComplaintForChat && (
            <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-indigo-900 min-w-0">
                <span className="shrink-0 font-bold uppercase tracking-wider bg-indigo-200 text-indigo-800 px-1.5 py-0.5 rounded text-2xs">
                  Problem Context
                </span>
                <span className="font-semibold truncate">
                  {selectedComplaintForChat.ticketNumber ? `#${selectedComplaintForChat.ticketNumber} - ` : ''}
                  {selectedComplaintForChat.title} (Room {selectedComplaintForChat.roomNumber})
                </span>
              </div>
              <button
                onClick={() => setSelectedComplaintForChat(null)}
                className="shrink-0 text-2xs text-indigo-600 hover:text-indigo-800 font-semibold underline cursor-pointer ml-2"
              >
                Clear Context
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/50">
            {isLoadingMessages ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span>Loading conversation history...</span>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-500">
                <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-2">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-700 text-sm">No messages yet</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  {selectedComplaintForChat
                    ? `Send a message below to inquire directly about "${selectedComplaintForChat.title}".`
                    : 'Send a message below to connect live with the Hostel Warden Maintenance Desk.'}
                </p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => {
                const isStudent = msg.senderRole === 'student';
                const timeString = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : msg.time || '';

                return (
                  <div
                    key={msg._id || msg.id || idx}
                    className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-2xs text-slate-400 mb-1 px-1 font-medium">
                      {isStudent ? 'You' : (msg.senderName || 'Hostel Warden')}
                    </div>
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                        isStudent
                          ? 'bg-indigo-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.complaintTitle && (
                        <div
                          className={`mb-1.5 pb-1 border-b text-2xs font-semibold flex items-center gap-1.5 ${
                            isStudent
                              ? 'border-indigo-500 text-indigo-100'
                              : 'border-slate-100 text-indigo-600'
                          }`}
                        >
                          <span>📌 Regarding: {msg.complaintTitle}</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-2xs text-slate-400 mt-1 px-1">{timeString}</span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              placeholder={
                selectedComplaintForChat
                  ? `Message warden about: ${selectedComplaintForChat.title}...`
                  : 'Type your message to the Hostel Warden...'
              }
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              disabled={isSendingMessage}
              className="flex-1 text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!currentMessage.trim() || isSendingMessage}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center min-w-[42px]"
            >
              {isSendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
