import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCampusOps } from '../../context/CampusOpsContext';
import { translations } from '../../utils/translations';
import { Marksheet, StudyNote, StudentEnrolled, FacultyNoticeItem } from '../../types';
import {
  BookOpen,
  User,
  Bell,
  CheckCircle2,
  Calendar,
  FileText,
  Upload,
  Clock,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Download,
  AlertTriangle,
  GraduationCap,
  Award,
  Layers,
  Building,
  Mail,
  Phone,
  Edit3,
  Save,
  X,
  FileCheck2,
  BarChart3,
  TrendingUp,
  Users,
  ShieldCheck,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const FacultyDashboard: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { language, lowDataMode } = useCampusOps();
  const t = translations[language];

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'notices' | 'attendance' | 'marks' | 'notes'>('overview');

  // Loading and feedback states
  const [loading, setLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // --- DATA STATES ---
  const [students, setStudents] = useState<StudentEnrolled[]>([]);
  const [notices, setNotices] = useState<FacultyNoticeItem[]>([]);
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [notes, setNotes] = useState<StudyNote[]>([]);

  // --- PROFILE EDIT STATE ---
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    designation: user?.designation || 'Assistant Professor / Faculty',
    department: user?.department || 'Computer Science & Engineering',
    cabin: user?.cabin || 'Academic Block B, Room 304',
    officeHours: user?.officeHours || 'Mon-Fri 02:00 PM - 04:30 PM',
    bio: user?.bio || '',
  });

  // --- NOTICE FORM STATE ---
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [noticeEmergency, setNoticeEmergency] = useState(false);
  const [noticeHostel, setNoticeHostel] = useState('ALL');
  const [noticeBatch, setNoticeBatch] = useState('ALL');

  // --- ATTENDANCE STATE ---
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attendanceSubject, setAttendanceSubject] = useState('Data Structures & Algorithms');
  const [attendanceBatch, setAttendanceBatch] = useState('ALL');
  const [attendanceRoster, setAttendanceRoster] = useState<{ [studentId: string]: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' }>({});
  const [attendanceSearch, setAttendanceSearch] = useState('');

  // --- MARKS FORM STATE ---
  const [marksSubject, setMarksSubject] = useState('Database Management Systems');
  const [marksSubjectCode, setMarksSubjectCode] = useState('CS-402');
  const [marksExamType, setMarksExamType] = useState('Mid Term');
  const [marksBatch, setMarksBatch] = useState('2024');
  const [marksSemester, setMarksSemester] = useState('Semester 4');
  const [marksMax, setMarksMax] = useState<number>(100);
  const [marksPass, setMarksPass] = useState<number>(40);
  const [marksEntries, setMarksEntries] = useState<{
    studentId?: string;
    studentName: string;
    rollNumber: string;
    marksObtained: number;
    remarks: string;
  }[]>([]);
  const [selectedMarksheetDetail, setSelectedMarksheetDetail] = useState<Marksheet | null>(null);

  // --- NOTES FORM STATE ---
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('Computer Networks');
  const [noteCategory, setNoteCategory] = useState('Lecture Notes');
  const [noteBatch, setNoteBatch] = useState('ALL');
  const [noteSemester, setNoteSemester] = useState('Semester 4');
  const [noteDescription, setNoteDescription] = useState('');
  const [noteFile, setNoteFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  } | null>(null);
  const [notesFilterCategory, setNotesFilterCategory] = useState('ALL');
  const [notesSearch, setNotesSearch] = useState('');

  // Auto-dismiss banners
  useEffect(() => {
    if (actionSuccess || actionError) {
      const timer = setTimeout(() => {
        setActionSuccess(null);
        setActionError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess, actionError]);

  // Sync profile form when user changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || '',
        email: user.email || '',
        designation: user.designation || 'Assistant Professor / Faculty',
        department: user.department || 'Computer Science & Engineering',
        cabin: user.cabin || 'Academic Block B, Room 304',
        officeHours: user.officeHours || 'Mon-Fri 02:00 PM - 04:30 PM',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Fetch initial data
  const fetchData = async () => {
    const headers = getAuthHeaders();

    try {
      // 1. Fetch Students
      const stuRes = await fetch('/api/attendance/students', { headers });
      if (stuRes.ok) {
        const resData = await stuRes.json();
        const studentList: StudentEnrolled[] = resData.data || [];
        setStudents(studentList);

        // Pre-fill attendance roster with PRESENT
        const initialRoster: { [id: string]: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' } = {};
        studentList.forEach((s) => {
          initialRoster[s._id] = 'PRESENT';
        });
        setAttendanceRoster(initialRoster);

        // Prepare default marks entries from student list
        if (studentList.length > 0 && marksEntries.length === 0) {
          setMarksEntries(
            studentList.map((s, idx) => ({
              studentId: s._id,
              studentName: s.fullName,
              rollNumber: `STU-${s.phoneNumber ? s.phoneNumber.slice(-4) : (1001 + idx)}`,
              marksObtained: Math.floor(65 + Math.random() * 30),
              remarks: 'Good progress',
            }))
          );
        }
      }

      // 2. Fetch Notices
      const notRes = await fetch('/api/notices', { headers });
      if (notRes.ok) {
        const resData = await notRes.json();
        setNotices(resData.data || []);
      }

      // 3. Fetch Marksheets
      const marksRes = await fetch('/api/marks', { headers });
      if (marksRes.ok) {
        const resData = await marksRes.json();
        setMarksheets(resData.data || []);
      }

      // 4. Fetch Notes
      const notesRes = await fetch('/api/notes', { headers });
      if (notesRes.ok) {
        const resData = await notesRes.json();
        setNotes(resData.data || []);
      }
    } catch (err) {
      console.warn('Could not fetch faculty records from server:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLER: PROFILE UPDATE ---
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setActionError(null);
    try {
      await updateUserProfile(profileForm);
      setActionSuccess('Academic Profile updated successfully!');
      setShowEditProfile(false);
    } catch (err: any) {
      setActionError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: ADD NOTICE ---
  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeBody.trim()) {
      setActionError('Notice title and body cannot be empty.');
      return;
    }

    setLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: noticeTitle.trim(),
          body: noticeBody.trim(),
          isEmergency: noticeEmergency,
          targetAudience: {
            hostel: noticeHostel,
            batch: noticeBatch,
          },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to create notice');
      }

      const resData = await res.json();
      setNotices((prev) => [resData.data, ...prev]);
      setNoticeTitle('');
      setNoticeBody('');
      setNoticeEmergency(false);
      setActionSuccess('Notice published successfully to campus network!');
    } catch (err: any) {
      setActionError(err.message || 'Could not post notice.');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: DELETE NOTICE ---
  const handleDeleteNotice = async (noticeId: string) => {
    if (!confirm('Are you sure you want to remove this notice?')) return;
    try {
      const res = await fetch(`/api/notices/${noticeId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete notice');
      }

      setNotices((prev) => prev.filter((n) => n._id !== noticeId));
      setActionSuccess('Notice deleted.');
    } catch (err: any) {
      setActionError(err.message || 'Could not delete notice.');
    }
  };

  // --- HANDLER: ATTENDANCE SUBMIT ---
  const handleMarkAttendanceAll = (status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE') => {
    const updated: { [id: string]: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' } = {};
    students.forEach((s) => {
      updated[s._id] = status;
    });
    setAttendanceRoster(updated);
  };

  const handleToggleAttendance = (studentId: string, status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE') => {
    setAttendanceRoster((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem('token');
      const recordsToSubmit = Object.entries(attendanceRoster).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          attendanceRecords: recordsToSubmit,
          date: attendanceDate,
          subject: attendanceSubject,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to record attendance');
      }

      setActionSuccess(`Attendance for ${recordsToSubmit.length} students in "${attendanceSubject}" successfully recorded!`);
    } catch (err: any) {
      setActionError(err.message || 'Could not record attendance.');
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: MARKS FILE / ROSTER LOAD ---
  const handleLoadStudentsForMarks = () => {
    const filtered = students.filter((s) => marksBatch === 'ALL' || !s.batch || s.batch === marksBatch);
    const populated = filtered.map((s, idx) => ({
      studentId: s._id,
      studentName: s.fullName,
      rollNumber: `STU-${s.phoneNumber ? s.phoneNumber.slice(-4) : (1001 + idx)}`,
      marksObtained: Math.floor(marksMax * 0.75),
      remarks: 'Satisfactory',
    }));
    setMarksEntries(populated);
    setActionSuccess(`Loaded ${populated.length} enrolled students into marksheet grid.`);
  };

  const handleFillRandomMarks = () => {
    setMarksEntries((prev) =>
      prev.map((r) => {
        const randomScore = Math.floor(marksPass + Math.random() * (marksMax - marksPass + 1));
        return {
          ...r,
          marksObtained: randomScore,
          remarks: randomScore > marksMax * 0.85 ? 'Outstanding Performance' : randomScore > marksMax * 0.6 ? 'Good Effort' : 'Needs Practice',
        };
      })
    );
  };

  const handleUpdateMarkRecord = (idx: number, field: string, value: any) => {
    setMarksEntries((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSaveMarksheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (marksEntries.length === 0) {
      setActionError('Please add at least one student score before publishing marksheet.');
      return;
    }

    setLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/marks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          subject: marksSubject.trim(),
          subjectCode: marksSubjectCode.trim(),
          examType: marksExamType,
          batch: marksBatch,
          semester: marksSemester,
          maxMarks: marksMax,
          passingMarks: marksPass,
          records: marksEntries,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit marksheet');
      }

      const resData = await res.json();
      setMarksheets((prev) => [resData.data, ...prev]);
      setActionSuccess(`Marksheet for ${marksSubject} (${marksExamType}) successfully published!`);
    } catch (err: any) {
      setActionError(err.message || 'Could not upload marksheet.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMarksheet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this marksheet?')) return;
    try {
      const res = await fetch(`/api/marks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete marksheet');
      }

      setMarksheets((prev) => prev.filter((m) => m._id !== id));
      setActionSuccess('Marksheet removed.');
    } catch (err: any) {
      setActionError(err.message || 'Could not delete marksheet.');
    }
  };

  // --- HANDLER: NOTE UPLOAD ---
  const handleNoteFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setActionError('File size exceeds 20MB limit. Please upload a smaller document.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      setNoteFile({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/pdf',
        dataUrl,
      });
      setActionError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteSubject.trim()) {
      setActionError('Please provide a title and subject for this note.');
      return;
    }

    if (!noteFile) {
      setActionError('Please attach a document, PDF, slide, or notes file.');
      return;
    }

    setLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: noteTitle.trim(),
          subject: noteSubject.trim(),
          description: noteDescription.trim(),
          batch: noteBatch,
          semester: noteSemester,
          category: noteCategory,
          fileUrl: noteFile.dataUrl,
          fileName: noteFile.name,
          fileSize: noteFile.size,
          fileType: noteFile.type,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to upload note');
      }

      const resData = await res.json();
      setNotes((prev) => [resData.data, ...prev]);
      setNoteTitle('');
      setNoteDescription('');
      setNoteFile(null);
      setActionSuccess('Study material successfully uploaded and published to students!');
    } catch (err: any) {
      setActionError(err.message || 'Could not upload study material.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to remove this study note?')) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to delete study note');
      }

      setNotes((prev) => prev.filter((n) => n._id !== id));
      setActionSuccess('Study note deleted.');
    } catch (err: any) {
      setActionError(err.message || 'Could not delete study note.');
    }
  };

  // --- FILTERED COMPUTATIONS ---
  const filteredStudentsForAttendance = useMemo(() => {
    return students.filter((s) => {
      const matchesBatch = attendanceBatch === 'ALL' || !s.batch || s.batch === attendanceBatch;
      const matchesSearch = !attendanceSearch.trim() ||
        s.fullName.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        s.phoneNumber.includes(attendanceSearch) ||
        (s.roomNumber && s.roomNumber.includes(attendanceSearch));
      return matchesBatch && matchesSearch;
    });
  }, [students, attendanceBatch, attendanceSearch]);

  const attendanceStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    filteredStudentsForAttendance.forEach((s) => {
      const status = attendanceRoster[s._id] || 'PRESENT';
      if (status === 'PRESENT') present++;
      else if (status === 'ABSENT') absent++;
      else if (status === 'ON_LEAVE') leave++;
    });
    const total = filteredStudentsForAttendance.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    return { present, absent, leave, total, rate };
  }, [filteredStudentsForAttendance, attendanceRoster]);

  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchesCat = notesFilterCategory === 'ALL' || n.category === notesFilterCategory;
      const matchesSearch = !notesSearch.trim() ||
        n.title.toLowerCase().includes(notesSearch.toLowerCase()) ||
        n.subject.toLowerCase().includes(notesSearch.toLowerCase()) ||
        (n.description && n.description.toLowerCase().includes(notesSearch.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [notes, notesFilterCategory, notesSearch]);

  // Dynamic Grade Calculator Helper
  const getGradeBadge = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 90) return { label: 'O (Outstanding)', bg: 'bg-purple-100 text-purple-800' };
    if (pct >= 80) return { label: 'A+ (Excellent)', bg: 'bg-emerald-100 text-emerald-800' };
    if (pct >= 70) return { label: 'A (Very Good)', bg: 'bg-blue-100 text-blue-800' };
    if (pct >= 60) return { label: 'B+ (Good)', bg: 'bg-indigo-100 text-indigo-800' };
    if (pct >= 50) return { label: 'B (Average)', bg: 'bg-amber-100 text-amber-800' };
    if (pct >= 40) return { label: 'C (Pass)', bg: 'bg-orange-100 text-orange-800' };
    return { label: 'F (Fail)', bg: 'bg-rose-100 text-rose-800 font-bold' };
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* HERO BANNER & PERSONA STATS */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl p-6 sm:p-8 border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5 backdrop-blur-xs">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                Faculty Academic Portal
              </span>
              <span className="px-2.5 py-1 rounded-full text-2xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                Verified Teaching Staff
              </span>
              {user?.employeeId && (
                <span className="px-2.5 py-1 rounded-full text-2xs font-mono font-bold bg-slate-800/80 text-slate-300 border border-slate-700">
                  ID: {user.employeeId}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              Prof. {user?.fullName || 'Faculty Member'}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {user?.designation || 'Assistant Professor'} · {user?.department || 'Computer Science & Engineering'}
              <span className="hidden sm:inline"> · Cabin: {user?.cabin || 'Academic Block B, Room 304'}</span>
            </p>
          </div>

          {/* Quick shortcuts / buttons */}
          <div className="flex flex-wrap md:flex-col sm:flex-row items-stretch gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('notices')}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span>Broadcast Notice</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Take Roll Call</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-sm transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-amber-400" />
              <span>Upload Notes</span>
            </button>
          </div>
        </div>

        {/* Ambient subtle glow background */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* NOTIFICATIONS & ALERTS BANNER */}
      {/* ========================================================================= */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-900 text-xs font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NAVIGATION TABS */}
      {/* ========================================================================= */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-xs p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'profile', label: 'Faculty Profile', icon: User },
          { id: 'notices', label: 'Notices & Circulars', icon: Bell, badge: notices.length },
          { id: 'attendance', label: 'Student Attendance', icon: CheckCircle2 },
          { id: 'marks', label: 'Upload Marks', icon: Award, badge: marksheets.length },
          { id: 'notes', label: 'Study Notes & Files', icon: BookOpen, badge: notes.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {typeof tab.badge === 'number' && tab.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-3xs font-extrabold ${
                    isActive ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: OVERVIEW DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Enrolled Students</span>
                <Users className="w-5 h-5 text-indigo-600 bg-indigo-50 p-1 rounded-lg" />
              </div>
              <div className="text-2xl font-black text-slate-900">{students.length}</div>
              <p className="text-3xs text-slate-400">Total undergraduate students registered in batch database</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Class Attendance Rate</span>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 bg-emerald-50 p-1 rounded-lg" />
              </div>
              <div className="text-2xl font-black text-emerald-600">{attendanceStats.rate}%</div>
              <p className="text-3xs text-emerald-700 font-medium">{attendanceStats.present} present today</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Marksheets Published</span>
                <Award className="w-5 h-5 text-purple-600 bg-purple-50 p-1 rounded-lg" />
              </div>
              <div className="text-2xl font-black text-slate-900">{marksheets.length}</div>
              <p className="text-3xs text-slate-400">Mid-term, final & internal evaluations</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Study Notes & PDFs</span>
                <BookOpen className="w-5 h-5 text-amber-600 bg-amber-50 p-1 rounded-lg" />
              </div>
              <div className="text-2xl font-black text-slate-900">{notes.length}</div>
              <p className="text-3xs text-slate-400">Lectures, syllabi & revision materials</p>
            </div>
          </div>

          {/* Quick Hub Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Recent Notices & Fast Attendance */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Campus Notices */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-sm font-bold text-slate-900">Recent Campus & Academic Notices</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('notices')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    View All ({notices.length}) →
                  </button>
                </div>

                {notices.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No active notices published. Click "Broadcast Notice" to post an announcement.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notices.slice(0, 3).map((notice) => (
                      <div
                        key={notice._id}
                        className={`p-4 rounded-xl border transition-all ${
                          notice.isEmergency
                            ? 'bg-rose-50/70 border-rose-200'
                            : 'bg-slate-50/80 border-slate-200 hover:border-indigo-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              {notice.isEmergency && (
                                <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-red-600 text-white animate-pulse">
                                  Emergency Alert
                                </span>
                              )}
                              <h3 className="text-xs font-bold text-slate-900">{notice.title}</h3>
                            </div>
                            <p className="text-2xs text-slate-600 mt-1 line-clamp-2">{notice.body}</p>
                            <div className="flex items-center gap-3 mt-2 text-3xs text-slate-400">
                              <span>By: {notice.createdBy?.fullName || 'Faculty'}</span>
                              <span>·</span>
                              <span>Target: Batch {notice.targetAudience?.batch || 'ALL'}</span>
                              <span>·</span>
                              <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fast Attendance Card */}
              <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 rounded-2xl border border-indigo-100 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Today's Class Roll Call</h2>
                    <p className="text-2xs text-slate-500">Quickly verify presence for current lecture</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('attendance')}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Open Full Roll Call
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs">
                    <span className="text-xs font-bold text-slate-500 block">Class Total</span>
                    <span className="text-lg font-black text-slate-900">{attendanceStats.total}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
                    <span className="text-xs font-bold text-emerald-600 block">Present</span>
                    <span className="text-lg font-black text-emerald-600">{attendanceStats.present}</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs">
                    <span className="text-xs font-bold text-rose-600 block">Absent</span>
                    <span className="text-lg font-black text-rose-600">{attendanceStats.absent}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Faculty Profile Card & Quick Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Faculty Info Card
                  </h2>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowEditProfile(true);
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                      {user?.fullName?.slice(0, 2).toUpperCase() || 'FA'}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{user?.fullName}</div>
                      <div className="text-2xs text-indigo-600 font-semibold">{user?.designation || 'Faculty Member'}</div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user?.department || 'Computer Science & Engineering'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Cabin: {user?.cabin || 'Academic Block B, Room 304'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Hours: {user?.officeHours || 'Mon-Fri 02:00 PM - 04:30 PM'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user?.email || 'faculty.cs@fetbox.edu'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>+91 {user?.phoneNumber}</span>
                    </div>
                  </div>

                  {user?.bio && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-3xs font-bold text-slate-400 block mb-1">FACULTY BIO</span>
                      <p className="text-2xs text-slate-600 italic leading-relaxed">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick links to published materials */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Published Marksheets
                </h3>
                {marksheets.length === 0 ? (
                  <p className="text-2xs text-slate-400">No marksheets uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {marksheets.slice(0, 3).map((m) => (
                      <div
                        key={m._id}
                        onClick={() => {
                          setSelectedMarksheetDetail(m);
                          setActiveTab('marks');
                        }}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/60 rounded-xl border border-slate-200 transition-colors cursor-pointer text-xs"
                      >
                        <div className="font-bold text-slate-900">{m.subject}</div>
                        <div className="text-2xs text-slate-500 flex justify-between mt-1">
                          <span>{m.examType} · Batch {m.batch}</span>
                          <span className="font-semibold text-indigo-600">{m.records.length} students</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FACULTY PROFILE */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                  {user?.fullName?.slice(0, 2).toUpperCase() || 'FA'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Prof. {user?.fullName}</h2>
                  <p className="text-xs font-semibold text-indigo-600">{user?.designation || 'Faculty Member'}</p>
                  <p className="text-2xs text-slate-400 mt-0.5">Academic Staff Profile & Office Directory</p>
                </div>
              </div>

              <button
                onClick={() => setShowEditProfile((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{showEditProfile ? 'Close Editor' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Profile Edit Form */}
            {showEditProfile ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Official Email</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Academic Designation</label>
                    <input
                      type="text"
                      required
                      value={profileForm.designation}
                      onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Department</label>
                    <input
                      type="text"
                      required
                      value={profileForm.department}
                      onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Office / Cabin Location</label>
                    <input
                      type="text"
                      value={profileForm.cabin}
                      onChange={(e) => setProfileForm({ ...profileForm, cabin: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                      placeholder="e.g. Block B, Room 304"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Consulting Hours</label>
                    <input
                      type="text"
                      value={profileForm.officeHours}
                      onChange={(e) => setProfileForm({ ...profileForm, officeHours: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                      placeholder="e.g. Mon-Fri 2:00 PM - 4:30 PM"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 text-xs">Biography & Research Interests</label>
                  <textarea
                    rows={3}
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-xs font-medium"
                    placeholder="Brief bio, publications, research areas, or courses taught..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Profile Details View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4">
                  <div>
                    <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      Department & Specialization
                    </span>
                    <p className="text-sm font-bold text-slate-900">{user?.department || 'Computer Science & Engineering'}</p>
                  </div>

                  <div>
                    <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      Cabin & Office Hours
                    </span>
                    <p className="font-semibold text-slate-800">{user?.cabin || 'Academic Block B, Room 304'}</p>
                    <p className="text-2xs text-slate-500 mt-0.5">{user?.officeHours || 'Mon-Fri 02:00 PM - 04:30 PM'}</p>
                  </div>

                  <div>
                    <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      Faculty Bio & Courses
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {user?.bio || 'Professor of Computer Science with specialization in Distributed Systems, Database Management Systems, and Cloud Operating Systems.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-50/80 p-5 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      Employee ID / Badge
                    </span>
                    <span className="inline-block px-2.5 py-1 bg-white font-mono font-bold text-xs rounded border border-slate-200 text-slate-800">
                      {user?.employeeId || 'EMP-FAC-2024'}
                    </span>
                  </div>

                  <div>
                    <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      Official Contact Phone
                    </span>
                    <span className="font-mono font-semibold text-slate-800">+91 {user?.phoneNumber}</span>
                  </div>

                  <div>
                    <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      University Email
                    </span>
                    <span className="font-medium text-slate-800">{user?.email || 'faculty.cs@fetbox.edu'}</span>
                  </div>

                  <div>
                    <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400 block mb-1">
                      Verification Status
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-2xs rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approved Active Faculty
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NOTICES & CIRCULARS */}
      {/* ========================================================================= */}
      {activeTab === 'notices' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Post Notice Form */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 h-fit">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Plus className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Add Academic Notice</h2>
            </div>

            <form onSubmit={handleCreateNotice} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  placeholder="e.g. Mid-Term DBMS Exam Schedule & Seating"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Notice Body / Message</label>
                <textarea
                  rows={4}
                  required
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  placeholder="Detailed announcement for students..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Batch</label>
                  <select
                    value={noticeBatch}
                    onChange={(e) => setNoticeBatch(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none bg-white font-medium cursor-pointer"
                  >
                    <option value="ALL">All Batches</option>
                    <option value="2023">Batch 2023</option>
                    <option value="2024">Batch 2024</option>
                    <option value="2025">Batch 2025</option>
                    <option value="2026">Batch 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Hostel</label>
                  <select
                    value={noticeHostel}
                    onChange={(e) => setNoticeHostel(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none bg-white font-medium cursor-pointer"
                  >
                    <option value="ALL">All Hostels / Campus</option>
                    <option value="Hostel A">Hostel A</option>
                    <option value="Hostel B">Hostel B</option>
                    <option value="Hostel C">Hostel C</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                <input
                  type="checkbox"
                  id="emergencyNotice"
                  checked={noticeEmergency}
                  onChange={(e) => setNoticeEmergency(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded cursor-pointer"
                />
                <label htmlFor="emergencyNotice" className="text-2xs font-bold text-amber-900 cursor-pointer">
                  Mark as High-Priority Emergency Notice (Siren override)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                <span>{loading ? 'Posting...' : 'Broadcast Notice Now'}</span>
              </button>
            </form>
          </div>

          {/* Notices Feed List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Active Campus Circulars</h2>
                <p className="text-2xs text-slate-500">Live notices broadcasted across the campus</p>
              </div>
              <button
                onClick={fetchData}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
                title="Refresh notices"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {notices.length === 0 ? (
              <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No notices available. Broadcast the first notice from the form on the left.
              </div>
            ) : (
              <div className="space-y-3">
                {notices.map((n) => (
                  <div
                    key={n._id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all ${
                      n.isEmergency ? 'border-rose-300 ring-1 ring-rose-200' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          {n.isEmergency && (
                            <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold bg-red-600 text-white uppercase animate-pulse">
                              Emergency Notice
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Batch {n.targetAudience?.batch || 'ALL'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-3xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {n.targetAudience?.hostel || 'All Hostels'}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{n.title}</h3>
                        <p className="text-xs text-slate-600 whitespace-pre-line leading-relaxed">{n.body}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteNotice(n._id)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer"
                        title="Delete notice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-400">
                      <span>Published by: {n.createdBy?.fullName || 'Academic Office'}</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: STUDENT ATTENDANCE */}
      {/* ========================================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Student Attendance & Roll Call</h2>
                <p className="text-2xs text-slate-500">Record daily subject lecture attendance for enrolled students</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAttendanceAll('PRESENT')}
                  className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  ✓ Mark All Present
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAttendanceAll('ABSENT')}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  ✗ Mark All Absent
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={loading}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{loading ? 'Saving...' : 'Save & Sync Attendance'}</span>
                </button>
              </div>
            </div>

            {/* Filter controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-3 border-t border-slate-100">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Lecture Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none font-medium cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Subject / Course</label>
                <select
                  value={attendanceSubject}
                  onChange={(e) => setAttendanceSubject(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none bg-white font-medium cursor-pointer"
                >
                  <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                  <option value="Operating Systems">Operating Systems</option>
                  <option value="Computer Networks">Computer Networks</option>
                  <option value="Database Management Systems">Database Management Systems</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Web Technologies">Web Technologies</option>
                  <option value="General / Departmental">General / Departmental</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Filter Batch</label>
                <select
                  value={attendanceBatch}
                  onChange={(e) => setAttendanceBatch(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none bg-white font-medium cursor-pointer"
                >
                  <option value="ALL">All Batches</option>
                  <option value="2023">Batch 2023</option>
                  <option value="2024">Batch 2024</option>
                  <option value="2025">Batch 2025</option>
                  <option value="2026">Batch 2026</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Search Student</label>
                <div className="relative">
                  <input
                    type="text"
                    value={attendanceSearch}
                    onChange={(e) => setAttendanceSearch(e.target.value)}
                    placeholder="Search name, roll..."
                    className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none font-medium text-xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Attendance stats pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="font-bold text-slate-700">Roster Summary:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-2xs">
                Total: {attendanceStats.total}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-2xs">
                Present: {attendanceStats.present} ({attendanceStats.rate}%)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold text-2xs">
                Absent: {attendanceStats.absent}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-2xs">
                Leave: {attendanceStats.leave}
              </span>
            </div>
          </div>

          {/* Student Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            {filteredStudentsForAttendance.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No students match current filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-3xs tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Phone / Roll</th>
                      <th className="py-3 px-4">Hostel & Room</th>
                      <th className="py-3 px-4">Batch</th>
                      <th className="py-3 px-4 text-center">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredStudentsForAttendance.map((student, idx) => {
                      const currentStatus = attendanceRoster[student._id] || 'PRESENT';
                      const roll = `STU-${student.phoneNumber ? student.phoneNumber.slice(-4) : (1001 + idx)}`;

                      return (
                        <tr key={student._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-2xs shrink-0">
                              {student.fullName.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{student.fullName}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-2xs text-slate-600">
                            {roll}
                          </td>
                          <td className="py-3 px-4 text-2xs">
                            {student.hostel || 'Hostel A'} · Room {student.roomNumber || '101'}-{student.bedLabel || 'A'}
                          </td>
                          <td className="py-3 px-4 text-2xs font-semibold text-slate-600">
                            {student.batch || '2024'}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(student._id, 'PRESENT')}
                                className={`px-3 py-1 rounded-md text-2xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-emerald-50'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(student._id, 'ABSENT')}
                                className={`px-3 py-1 rounded-md text-2xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-rose-50'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleAttendance(student._id, 'ON_LEAVE')}
                                className={`px-3 py-1 rounded-md text-2xs font-bold transition-all cursor-pointer ${
                                  currentStatus === 'ON_LEAVE'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-amber-50'
                                }`}
                              >
                                Leave
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: UPLOAD MARKS & EVALUATION */}
      {/* ========================================================================= */}
      {activeTab === 'marks' && (
        <div className="space-y-6">
          {/* Top Form: Create & Upload Marksheet */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Upload & Publish Student Marksheet</h2>
                <p className="text-2xs text-slate-500">Record internal marks, midterm scores, and exam grades with automated grade allocation</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadStudentsForMarks}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Load Enrolled Students
                </button>
                <button
                  type="button"
                  onClick={handleFillRandomMarks}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Auto-fill sample realistic scores for fast testing"
                >
                  Quick Fill Scores
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveMarksheet} className="space-y-4">
              {/* Exam & Subject Parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Subject / Course Name</label>
                  <input
                    type="text"
                    required
                    value={marksSubject}
                    onChange={(e) => setMarksSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={marksSubjectCode}
                    onChange={(e) => setMarksSubjectCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Exam Type</label>
                  <select
                    value={marksExamType}
                    onChange={(e) => setMarksExamType(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white font-medium cursor-pointer focus:outline-none"
                  >
                    <option value="Internal Assessment 1">Internal 1</option>
                    <option value="Internal Assessment 2">Internal 2</option>
                    <option value="Mid Term">Mid Term</option>
                    <option value="End Term">End Term Exam</option>
                    <option value="Practical / Lab Exam">Lab / Practical</option>
                    <option value="Assignment / Quiz">Assignment / Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Max Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={marksMax}
                    onChange={(e) => setMarksMax(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={marksMax}
                    value={marksPass}
                    onChange={(e) => setMarksPass(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              {/* Marksheet Entries Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Student Marks Roster ({marksEntries.length} Candidates)</span>
                  <span className="text-2xs text-slate-500 font-normal">Scores auto-validate against Max: {marksMax}</span>
                </div>

                {marksEntries.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No student entries in this marksheet. Click "Load Enrolled Students" above to import your class roster.
                  </div>
                ) : (
                  <div className="max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-white border-b border-slate-200 text-slate-500 text-3xs uppercase font-extrabold sticky top-0">
                        <tr>
                          <th className="py-2.5 px-4">Student Name</th>
                          <th className="py-2.5 px-4">Roll Number</th>
                          <th className="py-2.5 px-4 w-32">Marks Obtained</th>
                          <th className="py-2.5 px-4 w-36">Calculated Grade</th>
                          <th className="py-2.5 px-4">Faculty Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {marksEntries.map((entry, idx) => {
                          const badge = getGradeBadge(entry.marksObtained, marksMax);
                          return (
                            <tr key={idx} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-4 font-bold text-slate-900">
                                {entry.studentName}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-2xs text-slate-600">
                                {entry.rollNumber}
                              </td>
                              <td className="py-2.5 px-4">
                                <input
                                  type="number"
                                  min={0}
                                  max={marksMax}
                                  value={entry.marksObtained}
                                  onChange={(e) =>
                                    handleUpdateMarkRecord(idx, 'marksObtained', Math.min(marksMax, Math.max(0, Number(e.target.value))))
                                  }
                                  className="w-24 px-2 py-1 border border-slate-300 rounded font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                                />
                              </td>
                              <td className="py-2.5 px-4">
                                <span className={`px-2 py-0.5 rounded text-3xs font-bold ${badge.bg}`}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                <input
                                  type="text"
                                  value={entry.remarks}
                                  onChange={(e) => handleUpdateMarkRecord(idx, 'remarks', e.target.value)}
                                  placeholder="e.g. Excellent work"
                                  className="w-full px-2 py-1 border border-slate-200 rounded text-2xs focus:outline-none"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading || marksEntries.length === 0}
                  className="px-6 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer flex items-center gap-2 text-xs"
                >
                  <Award className="w-4 h-4" />
                  <span>{loading ? 'Publishing...' : 'Save & Publish Marksheet'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Published Marksheets History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Published Marksheets History</h3>
                <p className="text-2xs text-slate-500">Archive of marks submitted for departmental audits and student grade reports</p>
              </div>
              <span className="text-xs font-bold text-slate-400">{marksheets.length} Published</span>
            </div>

            {marksheets.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No marksheets recorded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {marksheets.map((m) => {
                  const passCount = m.records.filter((r) => r.marksObtained >= m.passingMarks).length;
                  const total = m.records.length;
                  const passPct = total > 0 ? Math.round((passCount / total) * 100) : 0;

                  return (
                    <div
                      key={m._id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:border-indigo-300 transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded text-3xs font-extrabold uppercase bg-indigo-100 text-indigo-800">
                            {m.examType}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">{m.subject}</h4>
                          <span className="text-3xs text-slate-500">{m.subjectCode || 'ACAD'} · Batch {m.batch}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteMarksheet(m._id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Delete marksheet"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-2xs bg-white p-2.5 rounded-lg border border-slate-200">
                        <div>
                          <span className="text-slate-400 block text-3xs">Students</span>
                          <span className="font-bold text-slate-900">{total}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-3xs">Pass Rate</span>
                          <span className="font-bold text-emerald-600">{passPct}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-3xs">Max Score</span>
                          <span className="font-bold text-purple-600">{m.maxMarks}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-3xs text-slate-400 pt-1">
                        <span>{new Date(m.createdAt).toLocaleDateString()}</span>
                        <button
                          onClick={() => setSelectedMarksheetDetail(m)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                        >
                          View Roster Details →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Marksheet Detail Modal */}
          {selectedMarksheetDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{selectedMarksheetDetail.subject}</h3>
                    <p className="text-2xs text-slate-500">
                      {selectedMarksheetDetail.examType} · Batch {selectedMarksheetDetail.batch} · Max {selectedMarksheetDetail.maxMarks}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMarksheetDetail(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 text-3xs uppercase font-extrabold sticky top-0">
                      <tr>
                        <th className="py-2 px-3">Student Name</th>
                        <th className="py-2 px-3">Roll</th>
                        <th className="py-2 px-3">Marks</th>
                        <th className="py-2 px-3">Grade</th>
                        <th className="py-2 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {selectedMarksheetDetail.records.map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-semibold text-slate-900">{r.studentName}</td>
                          <td className="py-2 px-3 font-mono text-2xs text-slate-500">{r.rollNumber}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">
                            {r.marksObtained} / {selectedMarksheetDetail.maxMarks}
                          </td>
                          <td className="py-2 px-3 font-semibold text-2xs">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                              {r.grade || 'A'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-2xs text-slate-500 italic">{r.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedMarksheetDetail(null)}
                    className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs cursor-pointer hover:bg-slate-800"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: STUDY NOTES & MATERIALS */}
      {/* ========================================================================= */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Note Upload Form */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4 h-fit">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Upload className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Upload Study Material</h2>
            </div>

            <form onSubmit={handleUploadNote} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Unit 3: Graph Algorithms & Dynamic Programming"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={noteSubject}
                    onChange={(e) => setNoteSubject(e.target.value)}
                    placeholder="e.g. Algorithms"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white font-medium cursor-pointer focus:outline-none"
                  >
                    <option value="Lecture Notes">Lecture Notes</option>
                    <option value="Syllabus">Syllabus</option>
                    <option value="Question Bank">Question Bank</option>
                    <option value="Lab Manual">Lab Manual</option>
                    <option value="Reference Material">Reference Book</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Tutorial">Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Batch Access</label>
                  <select
                    value={noteBatch}
                    onChange={(e) => setNoteBatch(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg bg-white font-medium cursor-pointer focus:outline-none"
                  >
                    <option value="ALL">All Batches</option>
                    <option value="2023">Batch 2023</option>
                    <option value="2024">Batch 2024</option>
                    <option value="2025">Batch 2025</option>
                    <option value="2026">Batch 2026</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Semester</label>
                  <input
                    type="text"
                    value={noteSemester}
                    onChange={(e) => setNoteSemester(e.target.value)}
                    placeholder="e.g. Semester 4"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Brief Description</label>
                <textarea
                  rows={2}
                  value={noteDescription}
                  onChange={(e) => setNoteDescription(e.target.value)}
                  placeholder="Topics covered, syllabus pointers, or lab instructions..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 font-medium text-xs"
                />
              </div>

              {/* File Attachment Drag/Click */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Attach File (PDF, PPT, DOC, ZIP)</label>
                <div className="relative border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-xl p-4 text-center bg-slate-50/60 transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg"
                    onChange={handleNoteFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {noteFile ? (
                    <div className="flex items-center justify-between text-left">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileCheck2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-slate-900 block truncate">{noteFile.name}</span>
                          <span className="text-3xs text-slate-500">{noteFile.size}</span>
                        </div>
                      </div>
                      <span className="text-3xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                        Ready
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <span className="text-2xs font-bold text-indigo-600 block">Click or drag document here</span>
                      <span className="text-3xs text-slate-400">PDF, DOCX, PPTX up to 20MB</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !noteFile}
                className="w-full py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{loading ? 'Uploading...' : 'Publish Study Material'}</span>
              </button>
            </form>
          </div>

          {/* Notes Library List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={notesSearch}
                  onChange={(e) => setNotesSearch(e.target.value)}
                  placeholder="Search notes by title or subject..."
                  className="text-xs font-medium focus:outline-none w-full sm:w-64"
                />
              </div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-2xs">
                {['ALL', 'Lecture Notes', 'Lab Manual', 'Question Bank', 'Assignment'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNotesFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-colors ${
                      notesFilterCategory === cat
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="py-12 bg-white rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
                No study materials found matching criteria. Upload a note from the left form!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredNotes.map((note) => (
                  <div
                    key={note._id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-full text-3xs font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-200">
                          {note.category}
                        </span>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{note.title}</h4>
                      <p className="text-2xs font-semibold text-indigo-600">{note.subject} · {note.semester}</p>

                      {note.description && (
                        <p className="text-2xs text-slate-500 line-clamp-2">{note.description}</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-2xs">
                      <div className="flex items-center gap-1.5 text-slate-500 text-3xs">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="font-mono">{note.fileSize || '1.2 MB'}</span>
                      </div>

                      <a
                        href={note.fileUrl}
                        download={note.fileName}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-2xs transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
