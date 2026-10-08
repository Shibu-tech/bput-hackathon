import React, { useState, useEffect, useRef } from 'react';
import { getChatSocket } from '../../utils/chatSocket';
import { useCampusOps } from '../../context/CampusOpsContext';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Coffee,
  Clock,
  ArrowRight,
  Power,
  Wrench,
  Search,
  Filter,
  User,
  MessageSquare,
  ThumbsUp,
  RefreshCw,
  Trash2,
  Send,
  Loader2,
  X
} from 'lucide-react';


interface ConversationSummary {
  studentId: string;
  studentName: string;
  studentRoll?: string;
  roomNumber: string;
  lastMessage: string;
  lastSenderRole: 'student' | 'warden';
  lastMessageTime?: string;
  complaintId?: string;
  complaintTitle?: string;
}

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

interface ActiveChatStudent {
  studentId: string;
  studentName: string;
  studentRoll?: string;
  roomNumber: string;
  complaintId?: string;
  complaintTitle?: string;
}

interface AIInsights {
  mostCommonCategory: string;
  highPriority: number;
  pendingComplaints: number;
  totalActive: number;
  trendSummary: string;
  recommendation: string;
}

export const HostelCareWardenPortal: React.FC = () => {
  const { complaints, assignComplaint, resolveComplaint } = useCampusOps();
  const { user, logout } = useAuth();

  const wardenDisplayName = user?.fullName || 'sibu';

  // Live AI Insights state
  const [insights, setInsights] = useState<AIInsights>({
    mostCommonCategory: 'None',
    highPriority: 0,
    pendingComplaints: 0,
    totalActive: 0,
    trendSummary: 'No unresolved complaints at the moment.',
    recommendation: 'All clear! Keep up the good work.'
  });
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Status Filter for Operations Board: 'All' | 'Pending' | 'In Progress' | 'Resolved'
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Active view: 'overview' | 'operations' | 'chat'
  const [activeView, setActiveView] = useState<'overview' | 'operations' | 'chat'>('overview');

  // Real-time two-way chat state
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeStudent, setActiveStudent] = useState<ActiveChatStudent | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([]);
  const [newChatText, setNewChatText] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSendingWardenMsg, setIsSendingWardenMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch active conversations from backend
  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const res = await fetch('http://localhost:5000/api/messages/conversations');
      if (res.ok) {
        const json = await res.json();
        const convList: ConversationSummary[] = json.data || [];
        setConversations(convList);

        // If no active student is selected yet and we have conversations, select the first
        setActiveStudent((curr) => {
          if (curr) return curr;
          if (convList.length > 0) {
            return {
              studentId: convList[0].studentId,
              studentName: convList[0].studentName,
              studentRoll: convList[0].studentRoll,
              roomNumber: convList[0].roomNumber,
              complaintId: convList[0].complaintId,
              complaintTitle: convList[0].complaintTitle
            };
          }
          return null;
        });
      }
    } catch (err) {
      console.error('[WardenChat] Failed to fetch conversations:', err);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  // Load message history for a student
  const loadMessagesForStudent = async (studentId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`http://localhost:5000/api/messages?studentId=${encodeURIComponent(studentId)}`);
      if (res.ok) {
        const json = await res.json();
        setChatMessages(json.data || []);
      }
    } catch (err) {
      console.error('[WardenChat] Failed to load messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Open chat with a specific student
  const openChatWithStudent = (student: ActiveChatStudent) => {
    setActiveStudent(student);
    setActiveView('chat');
    loadMessagesForStudent(student.studentId);
  };

  // Socket.IO lifecycle for Warden
  useEffect(() => {
    const socket = getChatSocket();

    // Join warden desk room
    socket.emit('chat:join', {
      role: 'warden',
      name: wardenDisplayName
    });

    fetchConversations();

    const handleReceive = (msg: ChatMessageItem) => {
      // 1. If currently viewing this student's conversation, append live message
      setActiveStudent((currentActive) => {
        if (
          currentActive &&
          (msg.studentId === currentActive.studentId ||
            (currentActive.studentRoll && msg.studentRoll === currentActive.studentRoll))
        ) {
          setChatMessages((prev) => {
            const exists = prev.some((m) => (m._id && msg._id && m._id === msg._id) || (m.id && msg.id && m.id === msg.id));
            if (exists) return prev;
            return [...prev, msg];
          });
        }
        return currentActive;
      });

      // 2. Refresh conversation list so latest preview and timestamp update
      fetchConversations();
    };

    socket.on('chat:receive', handleReceive);

    return () => {
      socket.off('chat:receive', handleReceive);
    };
  }, [wardenDisplayName]);

  // When activeStudent changes, load their messages
  useEffect(() => {
    if (activeStudent?.studentId) {
      loadMessagesForStudent(activeStudent.studentId);
    }
  }, [activeStudent?.studentId]);

  // Auto-scroll chat feed to bottom
  useEffect(() => {
    if (activeView === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeView]);

  // Fetch live AI insights from server
  const fetchInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch('http://localhost:5000/api/ai/insights');
      if (res.ok) {
        const data = await res.json();
        setInsights({
          mostCommonCategory: data.mostCommonCategory || 'None',
          highPriority: data.highPriority || 0,
          pendingComplaints: data.pendingComplaints || 0,
          totalActive: data.totalActive || 0,
          trendSummary: data.trendSummary || 'No unresolved complaints at the moment.',
          recommendation: data.recommendation || 'All clear! Keep up the good work.'
        });
      } else {
        throw new Error('Fallback to local calculation');
      }
    } catch {
      // Local fallback calculation based on current complaints in context
      const open = complaints.filter((c) => c.status !== 'resolved');
      const high = open.filter((c) => c.priority === 'critical' || c.priority === 'high').length;
      const catCount: Record<string, number> = {};
      open.forEach((c) => {
        catCount[c.category] = (catCount[c.category] || 0) + 1;
      });
      let topCat = 'None';
      let max = 0;
      for (const [k, v] of Object.entries(catCount)) {
        if (v > max) {
          topCat = k.toUpperCase();
          max = v;
        }
      }
      setInsights({
        mostCommonCategory: topCat,
        highPriority: high,
        pendingComplaints: open.length,
        totalActive: open.length,
        trendSummary:
          open.length > 0
            ? `Highest complaints are in ${topCat} category (${open.length} pending).`
            : 'No unresolved complaints at the moment.',
        recommendation:
          open.length > 0
            ? `Prioritize addressing ${topCat} issues and ${high} high priority complaints.`
            : 'All clear! Keep up the good work.'
      });
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [complaints.length]);

  // Metric counts matching adminPage.jsx
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'open' || c.status === 'assigned').length;
  const inProgress = complaints.filter((c) => c.status === 'in_progress').length;
  const resolved = complaints.filter((c) => c.status === 'resolved').length;

  // Filtered complaints for operations view
  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter === 'Pending' && !(c.status === 'open' || c.status === 'assigned')) return false;
    if (statusFilter === 'In Progress' && c.status !== 'in_progress') return false;
    if (statusFilter === 'Resolved' && c.status !== 'resolved') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q) ||
        c.roomNumber.toLowerCase().includes(q) ||
        c.ticketNumber.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = (id: string, newStatus: 'in_progress' | 'resolved') => {
    if (newStatus === 'resolved') {
      resolveComplaint(id, 'Resolved by Warden Maintenance Desk', wardenDisplayName);
    } else {
      assignComplaint(id, 'Duty Technician', undefined, 'Marked In Progress by Warden', undefined, wardenDisplayName);
    }
  };

  const handleSendWardenMsg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim() || !activeStudent || isSendingWardenMsg) return;

    const textToSend = newChatText.trim();
    setNewChatText('');
    setIsSendingWardenMsg(true);

    const payload = {
      studentId: activeStudent.studentId,
      studentName: activeStudent.studentName,
      studentRoll: activeStudent.studentRoll || activeStudent.studentId,
      roomNumber: activeStudent.roomNumber || '101',
      senderRole: 'warden' as const,
      senderName: wardenDisplayName || 'Hostel Warden',
      text: textToSend,
      complaintId: activeStudent.complaintId || '',
      complaintTitle: activeStudent.complaintTitle || ''
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
          fetchConversations();
        }
      }
    } catch (err) {
      console.error('[WardenChat] Error sending message:', err);
    } finally {
      setIsSendingWardenMsg(false);
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
    <div className="space-y-8">
      {/* 1. TOP ADMIN PORTAL HEADER (MATCHES SCREENSHOT 2 EXACTLY) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-emerald-700">
            ADMIN PORTAL
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome, {wardenDisplayName}.
          </h1>
          <p className="mt-2 text-base text-slate-600 max-w-2xl">
            Review hostel complaint volume, monitor AI-driven insights, and manage resolution queues.
          </p>
        </div>

        <button
          onClick={logout}
          title="Logout"
          className="self-start sm:self-auto p-2.5 text-slate-400 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer"
        >
          <Power className="w-5 h-5" />
        </button>
      </div>

      {/* 2. AI INSIGHTS & TRENDS CARD (MATCHES SCREENSHOT 2 EXACTLY) */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-indigo-50/30 p-6 sm:p-7 shadow-xl shadow-indigo-900/5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="flex items-center gap-2 text-xl font-bold text-indigo-950">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
              ✨
            </span>
            AI Insights & Trends
          </h2>

          <button
            onClick={fetchInsights}
            disabled={loadingInsights}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Top Issue */}
          <div className="rounded-xl border border-white bg-white/70 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 text-indigo-600 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Top Issue</span>
            </div>
            <span className="block text-2xl font-black text-slate-900 capitalize">
              {insights.mostCommonCategory || 'None'}
            </span>
          </div>

          {/* High Priority */}
          <div className="rounded-xl border border-white bg-white/70 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">High Priority</span>
            </div>
            <span className="block text-2xl font-black text-slate-900">{insights.highPriority || 0}</span>
          </div>

          {/* AI Recommendation */}
          <div className="sm:col-span-2 rounded-xl border border-white bg-white/70 p-5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Recommendation</span>
            </div>
            <span className="block text-sm font-semibold text-slate-800 mb-1">{insights.trendSummary}</span>
            <span className="block text-sm text-slate-600 italic">"{insights.recommendation}"</span>
          </div>
        </div>
      </div>

      {/* 3. METRIC STAT CARDS (MATCHES SCREENSHOT 2 EXACTLY) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">All Complaints</span>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{total}</div>
          <p className="mt-1 text-xs text-slate-500">Total requests in system</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
            Pending
          </span>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{pending}</div>
          <p className="mt-1 text-xs text-slate-500">Needs review</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            In Progress
          </span>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{inProgress}</div>
          <p className="mt-1 text-xs text-slate-500">Currently working</p>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Resolved
          </span>
          <div className="mt-3 text-3xl font-extrabold text-slate-900 tracking-tight">{resolved}</div>
          <p className="mt-1 text-xs text-slate-500">Closed by team</p>
        </div>
      </div>

      {/* 4. TWO MAIN ACTION CARDS (MATCHES SCREENSHOT 2 EXACTLY) */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Card 1: Complaint Operations */}
        <button
          onClick={() => setActiveView('operations')}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-900/5 cursor-pointer"
        >
          <div className="absolute top-0 right-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-indigo-50 transition group-hover:scale-150"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-slate-900">Complaint Operations</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Open the full complaint board to filter requests, update status, review AI summaries and attachments, and manage completed items.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:text-indigo-700">
              View all queues &rarr;
            </span>
          </div>
        </button>

        {/* Card 2: Student Conversations */}
        <button
          onClick={() => setActiveView('chat')}
          className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 text-left shadow-sm transition hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/5 cursor-pointer"
        >
          <div className="absolute top-0 right-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-emerald-50 transition group-hover:scale-150"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-slate-900">Student Conversations</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Continue real-time support with students through the existing Socket.IO chat experience. Address complex issues directly.
            </p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-600 group-hover:text-emerald-700">
              Open chat dashboard &rarr;
            </span>
          </div>
        </button>
      </div>

      {/* 5. INTERACTIVE COMPLAINT OPERATIONS BOARD (MATCHES COMPLAINS.JSX ADMIN VIEW) */}
      {activeView === 'operations' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">RESOLUTION QUEUE</span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">Hostel Complaint Operations Board</h3>
            </div>
            <button
              onClick={() => setActiveView('overview')}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Back to Overview
            </button>
          </div>

          {/* Status Filters + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((filter) => {
                const count =
                  filter === 'All'
                    ? total
                    : filter === 'Pending'
                    ? pending
                    : filter === 'In Progress'
                    ? inProgress
                    : resolved;
                const isActive = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {filter} ({count})
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by room, roll, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Complaints Feed */}
          {filteredComplaints.length === 0 ? (
            <div className="p-12 text-center">
              <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No complaints found under this filter.</p>
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
                  <article
                    key={c.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all p-6"
                  >
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
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {c.createdAt}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-slate-900">{c.title || c.studentName}</h3>
                      <p className="text-sm font-medium text-slate-500">
                        Student: {c.studentName} &bull; Roll {c.rollNumber} &bull; Room {c.roomNumber} ({c.hostelBlock})
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

                    {c.photoUrl && (
                      <div className="mt-4 rounded-lg overflow-hidden border border-slate-200 max-w-xs">
                        <img src={c.photoUrl} alt="Complaint Attachment" className="w-full h-36 object-cover" />
                      </div>
                    )}

                    {/* Warden Action Buttons matching complains.jsx */}
                    <div className="mt-6 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
                      {!isResolved && (
                        <>
                          {!isInProgress && (
                            <button
                              onClick={() => handleUpdateStatus(c.id, 'in_progress')}
                              className="px-4 py-2 text-sm font-semibold rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-pointer"
                            >
                              Mark In Progress
                            </button>
                          )}
                          <button
                            onClick={() => handleUpdateStatus(c.id, 'resolved')}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-colors cursor-pointer"
                          >
                            Resolve
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          openChatWithStudent({
                            studentId: c.rollNumber || `STU-${c.roomNumber}`,
                            studentName: c.studentName,
                            studentRoll: c.rollNumber,
                            roomNumber: c.roomNumber,
                            complaintId: c.id,
                            complaintTitle: c.title
                          });
                        }}
                        className="px-4 py-2 text-sm font-semibold rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" />
                        Chat with Student
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 6. REAL-TIME TWO-WAY WARDEN ↔ STUDENT CHAT DASHBOARD */}
      {activeView === 'chat' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[680px]">
          {/* Top Bar */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Warden Real-Time Support Central</h4>
                <p className="text-2xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Socket.IO Two-Way Channel Active
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveView('operations')}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition"
              >
                Complaint Operations Board
              </button>
              <button
                onClick={() => setActiveView('overview')}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg cursor-pointer transition"
              >
                Overview
              </button>
            </div>
          </div>

          {/* Split Pane: Conversations List (Left) + Message Thread (Right) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* LEFT SIDEBAR: Active Conversations & Queue */}
            <div className="w-full md:w-80 border-r border-slate-200 flex flex-col bg-slate-50/60">
              {/* Search in conversations */}
              <div className="p-3 border-b border-slate-200 bg-white">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search student or room..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {isLoadingConversations && conversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    Loading conversations...
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    <p className="font-semibold">No messages yet</p>
                    <p className="mt-1 text-slate-400">
                      Students messaging from their complaints will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  conversations
                    .filter((conv) => {
                      if (!chatSearchQuery) return true;
                      const q = chatSearchQuery.toLowerCase();
                      return (
                        conv.studentName?.toLowerCase().includes(q) ||
                        conv.roomNumber?.toLowerCase().includes(q) ||
                        conv.studentRoll?.toLowerCase().includes(q) ||
                        conv.complaintTitle?.toLowerCase().includes(q)
                      );
                    })
                    .map((conv) => {
                      const isSelected = activeStudent?.studentId === conv.studentId;
                      const timeString = conv.lastMessageTime
                        ? new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '';

                      return (
                        <div
                          key={conv.studentId}
                          onClick={() => {
                            setActiveStudent({
                              studentId: conv.studentId,
                              studentName: conv.studentName,
                              studentRoll: conv.studentRoll,
                              roomNumber: conv.roomNumber,
                              complaintId: conv.complaintId,
                              complaintTitle: conv.complaintTitle
                            });
                          }}
                          className={`p-3.5 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-50/80 border-l-4 border-indigo-600'
                              : 'hover:bg-slate-100/70 border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {conv.studentName}
                            </span>
                            <span className="text-2xs text-slate-400 shrink-0 ml-1">
                              {timeString}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-2xs text-slate-500 mb-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200/70 font-mono text-slate-700 font-semibold">
                              Room {conv.roomNumber}
                            </span>
                            {conv.studentRoll && (
                              <span className="font-mono text-slate-500">
                                {conv.studentRoll}
                              </span>
                            )}
                          </div>

                          {conv.complaintTitle && (
                            <div className="text-2xs text-indigo-700 bg-indigo-100/70 rounded px-1.5 py-0.5 mb-1.5 truncate font-medium">
                              🏷️ {conv.complaintTitle}
                            </div>
                          )}

                          <p className="text-xs text-slate-600 truncate">
                            <span className="font-medium text-slate-500">
                              {conv.lastSenderRole === 'warden' ? 'You: ' : ''}
                            </span>
                            {conv.lastMessage}
                          </p>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* RIGHT MAIN PANEL: Active Conversation */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden">
              {activeStudent ? (
                <>
                  {/* Active Chat Header */}
                  <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-xs">
                        {activeStudent.studentName?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{activeStudent.studentName}</h4>
                          <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 font-semibold font-mono">
                            Room {activeStudent.roomNumber}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-500 font-mono mt-0.5">
                          ID: {activeStudent.studentRoll || activeStudent.studentId}
                        </p>
                      </div>
                    </div>

                    {activeStudent.complaintTitle && (
                      <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 rounded-lg px-2.5 py-1 text-2xs text-indigo-900 max-w-xs">
                        <span className="font-bold shrink-0">Issue:</span>
                        <span className="truncate">{activeStudent.complaintTitle}</span>
                      </div>
                    )}
                  </div>

                  {/* Context Banner on Mobile/Compact */}
                  {activeStudent.complaintTitle && (
                    <div className="sm:hidden bg-indigo-50 border-b border-indigo-100 px-3 py-1.5 text-2xs text-indigo-900 font-medium truncate">
                      🏷️ Regarding Issue: {activeStudent.complaintTitle}
                    </div>
                  )}

                  {/* Messages Feed */}
                  <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/40">
                    {isLoadingMessages ? (
                      <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        Loading conversation history...
                      </div>
                    ) : chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
                        <MessageSquare className="w-8 h-8 text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700 text-sm">No messages yet with {activeStudent.studentName}</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                          Send a message below to assist this student with their hostel query.
                        </p>
                      </div>
                    ) : (
                      chatMessages.map((msg, idx) => {
                        const isWarden = msg.senderRole === 'warden';
                        const timeString = msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : msg.time || '';

                        return (
                          <div
                            key={msg._id || msg.id || idx}
                            className={`flex flex-col ${isWarden ? 'items-end' : 'items-start'}`}
                          >
                            <div className="text-2xs text-slate-400 mb-1 px-1 font-medium">
                              {isWarden ? 'Hostel Warden Desk' : (msg.senderName || activeStudent.studentName)}
                            </div>
                            <div
                              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm shadow-xs ${
                                isWarden
                                  ? 'bg-slate-900 text-white rounded-br-xs'
                                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                              }`}
                            >
                              {msg.complaintTitle && (
                                <div
                                  className={`mb-1.5 pb-1 border-b text-2xs font-semibold flex items-center gap-1 ${
                                    isWarden
                                      ? 'border-slate-700 text-emerald-300'
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

                  {/* Input Form */}
                  <form onSubmit={handleSendWardenMsg} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder={`Type your response to ${activeStudent.studentName} (Room ${activeStudent.roomNumber})...`}
                      value={newChatText}
                      onChange={(e) => setNewChatText(e.target.value)}
                      disabled={isSendingWardenMsg}
                      className="flex-1 text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={!newChatText.trim() || isSendingWardenMsg}
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-50 shadow-xs flex items-center justify-center min-w-[42px]"
                    >
                      {isSendingWardenMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h5 className="font-bold text-slate-700 text-base">Select a Student Conversation</h5>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Choose an active conversation from the list on the left, or click "Chat with Student" on any complaint in the operations board.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
