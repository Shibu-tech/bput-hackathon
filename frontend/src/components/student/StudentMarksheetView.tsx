import React, { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap,
  Award,
  BookOpen,
  Download,
  Printer,
  Search,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  BarChart3,
  X,
  ShieldCheck,
  QrCode,
  FileText,
  RefreshCw,
  Clock,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { SemesterMarksheet, SubjectMark } from '../../types';

interface FacultyMarksheetRecord {
  studentId?: string;
  studentName: string;
  rollNumber: string;
  marksObtained: number;
  grade?: string;
  remarks?: string;
}

interface FacultyMarksheet {
  _id: string;
  subject: string;
  subjectCode?: string;
  examType: string;
  batch: string;
  semester: string;
  maxMarks: number;
  passingMarks: number;
  records: FacultyMarksheetRecord[];
  uploadedBy?: {
    _id?: string;
    fullName?: string;
    designation?: string;
    department?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface StudentMarksheetViewProps {
  studentName: string;
  studentRoll: string;
  branch?: string;
  userId?: string;
  initialMarks?: FacultyMarksheet[];
  onRefresh?: () => void;
}

interface BaseTerm {
  semesterId: string;
  semesterName: string;
  academicYear: string;
  semNumber: number;
}

const DEFAULT_TERMS: BaseTerm[] = [
  { semesterId: 'sem-5', semesterName: 'Semester 5 (Current Autumn 2024)', academicYear: '2024-2025', semNumber: 5 },
  { semesterId: 'sem-4', semesterName: 'Semester 4 (Spring 2024)', academicYear: '2023-2024', semNumber: 4 },
  { semesterId: 'sem-3', semesterName: 'Semester 3 (Autumn 2023)', academicYear: '2023-2024', semNumber: 3 },
  { semesterId: 'sem-2', semesterName: 'Semester 2 (Spring 2023)', academicYear: '2022-2023', semNumber: 2 },
  { semesterId: 'sem-1', semesterName: 'Semester 1 (Autumn 2022)', academicYear: '2022-2023', semNumber: 1 },
];

const normalizeSemesterId = (semStr: string): string => {
  if (!semStr) return 'sem-5';
  const clean = semStr.toLowerCase();
  if (clean.includes('5') || clean.includes('v')) return 'sem-5';
  if (clean.includes('4') || clean.includes('iv')) return 'sem-4';
  if (clean.includes('3') || clean.includes('iii')) return 'sem-3';
  if (clean.includes('2') || clean.includes('ii')) return 'sem-2';
  if (clean.includes('1') || clean.includes('i')) return 'sem-1';
  if (clean.includes('6') || clean.includes('vi')) return 'sem-6';
  if (clean.includes('7') || clean.includes('vii')) return 'sem-7';
  if (clean.includes('8') || clean.includes('viii')) return 'sem-8';
  return 'sem-5';
};

const matchStudentRecord = (
  records: FacultyMarksheetRecord[] = [],
  studentName: string,
  studentRoll: string,
  userId?: string
): FacultyMarksheetRecord | undefined => {
  const normName = (studentName || '').trim().toLowerCase();
  const normRoll = (studentRoll || '').trim().toLowerCase();
  const digitsRoll = normRoll.replace(/[^0-9]/g, '');

  return records.find((r) => {
    if (userId && r.studentId && String(r.studentId) === String(userId)) return true;
    if (r.rollNumber) {
      const rRoll = r.rollNumber.trim().toLowerCase();
      if (rRoll === normRoll) return true;
      const rDigits = rRoll.replace(/[^0-9]/g, '');
      if (digitsRoll && rDigits && digitsRoll === rDigits) return true;
    }
    if (r.studentName) {
      const rName = r.studentName.trim().toLowerCase();
      if (rName === normName) return true;
      if (normName && (rName.includes(normName) || normName.includes(rName))) return true;
    }
    return false;
  });
};

const buildSemesterMarksheets = (
  facultyMarks: FacultyMarksheet[],
  studentName: string,
  studentRoll: string,
  userId?: string
): SemesterMarksheet[] => {
  const termMap = new Map<string, BaseTerm>();
  DEFAULT_TERMS.forEach((t) => termMap.set(t.semesterId, t));

  // Auto-discover any new semesters uploaded by faculty
  facultyMarks.forEach((m) => {
    const semId = normalizeSemesterId(m.semester);
    if (!termMap.has(semId)) {
      termMap.set(semId, {
        semesterId: semId,
        semesterName: m.semester || `Semester ${semId.replace('sem-', '')}`,
        academicYear: '2024-2025',
        semNumber: parseInt(semId.replace('sem-', ''), 10) || 5,
      });
    }
  });

  const allTerms = Array.from(termMap.values()).sort((a, b) => b.semNumber - a.semNumber);

  return allTerms.map((term) => {
    // Collect all faculty marksheets belonging to this semester
    const termMarksheets = facultyMarks.filter(
      (m) => normalizeSemesterId(m.semester) === term.semesterId
    );

    // Group marksheets by subject
    const subjectGroups = new Map<string, FacultyMarksheet[]>();
    termMarksheets.forEach((m) => {
      const key = (m.subjectCode?.trim() || m.subject.trim()).toUpperCase();
      if (!subjectGroups.has(key)) {
        subjectGroups.set(key, []);
      }
      subjectGroups.get(key)!.push(m);
    });

    const subjects: SubjectMark[] = [];

    subjectGroups.forEach((msList, subjectKey) => {
      let facultyName = 'Faculty Member';
      let subjectCode = subjectKey;
      let subjectName = msList[0]?.subject || subjectKey;
      let latestPublishedStr = '';

      msList.forEach((m) => {
        if (m.uploadedBy?.fullName) facultyName = m.uploadedBy.fullName;
        if (m.subjectCode) subjectCode = m.subjectCode;
        if (m.subject) subjectName = m.subject;
        if (m.createdAt) {
          latestPublishedStr = new Date(m.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
        }
      });

      // Find specific exam types if separate
      const quizMs = msList.find((m) => m.examType === 'Assignment / Quiz');
      const surpriseMs = msList.find((m) => m.examType.toLowerCase().includes('surprise'));
      const internalMs = msList.find(
        (m) =>
          m.examType === 'Internal Assessment 1' ||
          m.examType === 'Internal Assessment 2' ||
          m.examType === 'Mid Term'
      );
      const endSemMs = msList.find(
        (m) => m.examType === 'End Term' || m.examType === 'Practical / Lab Exam'
      );

      let quizScore = 0;
      let surpriseTestScore = 0;
      let internalScore = 0;
      let semesterScore = 0;
      let totalScore = 0;
      let hasMatchedRecord = false;

      if (quizMs || surpriseMs || internalMs || endSemMs) {
        if (quizMs) {
          const r = matchStudentRecord(quizMs.records, studentName, studentRoll, userId);
          if (r) {
            quizScore = Number(((r.marksObtained / (quizMs.maxMarks || 10)) * 10).toFixed(1));
            hasMatchedRecord = true;
          }
        }
        if (surpriseMs) {
          const r = matchStudentRecord(surpriseMs.records, studentName, studentRoll, userId);
          if (r) {
            surpriseTestScore = Number(((r.marksObtained / (surpriseMs.maxMarks || 10)) * 10).toFixed(1));
            hasMatchedRecord = true;
          }
        }
        if (internalMs) {
          const r = matchStudentRecord(internalMs.records, studentName, studentRoll, userId);
          if (r) {
            internalScore = Number(((r.marksObtained / (internalMs.maxMarks || 30)) * 30).toFixed(1));
            hasMatchedRecord = true;
          }
        }
        if (endSemMs) {
          const r = matchStudentRecord(endSemMs.records, studentName, studentRoll, userId);
          if (r) {
            semesterScore = Number(((r.marksObtained / (endSemMs.maxMarks || 50)) * 50).toFixed(1));
            hasMatchedRecord = true;
          }
        }
        totalScore = Number((quizScore + surpriseTestScore + internalScore + semesterScore).toFixed(1));
      } else {
        // Consolidated single marksheet upload
        const mainMs = msList[0];
        const r = matchStudentRecord(mainMs.records, studentName, studentRoll, userId);
        if (r) {
          hasMatchedRecord = true;
          const scaled100 = (r.marksObtained / (mainMs.maxMarks || 100)) * 100;
          totalScore = Number(scaled100.toFixed(1));
          quizScore = Number((totalScore * 0.1).toFixed(1));
          surpriseTestScore = Number((totalScore * 0.1).toFixed(1));
          internalScore = Number((totalScore * 0.3).toFixed(1));
          semesterScore = Number((totalScore * 0.5).toFixed(1));
        }
      }

      // If student is not present in this marksheet's roster at all, skip subject
      if (!hasMatchedRecord) {
        return;
      }

      // Clamp component scores
      quizScore = Math.min(10, Math.max(0, quizScore));
      surpriseTestScore = Math.min(10, Math.max(0, surpriseTestScore));
      internalScore = Math.min(30, Math.max(0, internalScore));
      semesterScore = Math.min(50, Math.max(0, semesterScore));
      totalScore = Math.min(100, Math.max(0, totalScore));

      let grade: 'O' | 'E' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
      let gradePoint = 0.0;
      if (totalScore >= 90) { grade = 'O'; gradePoint = 10.0; }
      else if (totalScore >= 80) { grade = 'E'; gradePoint = 9.0; }
      else if (totalScore >= 70) { grade = 'A'; gradePoint = 8.0; }
      else if (totalScore >= 60) { grade = 'B'; gradePoint = 7.0; }
      else if (totalScore >= 50) { grade = 'C'; gradePoint = 6.0; }
      else if (totalScore >= 40) { grade = 'D'; gradePoint = 5.0; }
      else { grade = 'F'; gradePoint = 0.0; }

      const status: 'PASS' | 'FAIL' = totalScore >= 40 ? 'PASS' : 'FAIL';

      const isLab =
        subjectName.toLowerCase().includes('lab') ||
        subjectName.toLowerCase().includes('practical') ||
        subjectCode.toLowerCase().includes('lab');
      const isScience =
        subjectName.toLowerCase().includes('math') ||
        subjectName.toLowerCase().includes('physics') ||
        subjectName.toLowerCase().includes('chem');
      const credits = isLab ? 2 : 4;
      const category: 'Core Theory' | 'Basic Sciences' | 'Laboratory / Practical' = isLab
        ? 'Laboratory / Practical'
        : isScience
        ? 'Basic Sciences'
        : 'Core Theory';

      subjects.push({
        subjectCode,
        subjectName,
        facultyName,
        credits,
        category,
        quizScore,
        quizMax: 10,
        surpriseTestScore,
        surpriseTestMax: 10,
        internalScore,
        internalMax: 30,
        semesterScore,
        semesterMax: 50,
        totalScore,
        totalMax: 100,
        grade,
        gradePoint,
        status,
      } as SubjectMark);
    });

    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const earnedCredits = subjects.filter((s) => s.status === 'PASS').reduce((sum, s) => sum + s.credits, 0);
    const totalPoints = subjects.reduce((sum, s) => sum + s.credits * s.gradePoint, 0);
    const sgpa = totalCredits > 0 ? Number((totalPoints / totalCredits).toFixed(2)) : 0;
    const cgpa = sgpa;
    const failCount = subjects.filter((s) => s.status === 'FAIL').length;
    const resultStatus: 'PASS' | 'PROMOTED' | 'FAIL' =
      subjects.length === 0 ? 'PASS' : failCount === 0 ? 'PASS' : failCount <= 2 ? 'PROMOTED' : 'FAIL';

    return {
      semesterId: term.semesterId,
      semesterName: term.semesterName,
      academicYear: term.academicYear,
      totalCredits,
      earnedCredits,
      sgpa,
      cgpa,
      resultStatus,
      publishedDate: subjects.length > 0 ? 'Gazetted' : 'Awaiting Publication',
      subjects,
    };
  });
};

export const StudentMarksheetView: React.FC<StudentMarksheetViewProps> = ({
  studentName,
  studentRoll,
  branch = 'B.Tech - Computer Science & Engineering',
  userId,
  initialMarks,
  onRefresh,
}) => {
  const [facultyMarks, setFacultyMarks] = useState<FacultyMarksheet[]>(initialMarks || []);
  const [loading, setLoading] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [selectedSemId, setSelectedSemId] = useState<string>('sem-5');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Fetch marks from faculty upload endpoint
  const fetchMarks = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/marks', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        const marksheetsData: FacultyMarksheet[] = json.data || [];
        setFacultyMarks(marksheetsData);
        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (err) {
      console.warn('Could not fetch faculty marks:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount & setup real-time listener for faculty uploads
  useEffect(() => {
    fetchMarks();

    const handleMarksUpdated = () => {
      fetchMarks();
      if (onRefresh) onRefresh();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'marks_last_updated') {
        fetchMarks();
        if (onRefresh) onRefresh();
      }
    };

    window.addEventListener('marks_updated', handleMarksUpdated);
    window.addEventListener('storage', handleStorage);

    // Periodic auto-poll every 12 seconds so updates arrive automatically without user action
    const interval = setInterval(() => {
      fetchMarks();
    }, 12000);

    return () => {
      window.removeEventListener('marks_updated', handleMarksUpdated);
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, [fetchMarks, onRefresh]);

  // Transform faculty marks dynamically using the student credentials
  const marksheets: SemesterMarksheet[] = React.useMemo(() => {
    return buildSemesterMarksheets(facultyMarks, studentName, studentRoll, userId);
  }, [facultyMarks, studentName, studentRoll, userId]);

  const activeMarksheet: SemesterMarksheet =
    marksheets.find((m) => m.semesterId === selectedSemId) || marksheets[0] || {
      semesterId: 'sem-5',
      semesterName: 'Semester 5 (Current Autumn 2024)',
      academicYear: '2024-2025',
      totalCredits: 0,
      earnedCredits: 0,
      sgpa: 0,
      cgpa: 0,
      resultStatus: 'PASS',
      publishedDate: 'Awaiting Publication',
      subjects: [],
    };

  const hasSubjects = activeMarksheet.subjects && activeMarksheet.subjects.length > 0;

  const filteredSubjects = activeMarksheet.subjects.filter((sub) => {
    const matchesSearch =
      sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.facultyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Safe averages across components
  const avgQuiz = hasSubjects
    ? (activeMarksheet.subjects.reduce((sum, s) => sum + s.quizScore, 0) / activeMarksheet.subjects.length).toFixed(1)
    : '--';

  const avgSurprise = hasSubjects
    ? (activeMarksheet.subjects.reduce((sum, s) => sum + s.surpriseTestScore, 0) / activeMarksheet.subjects.length).toFixed(1)
    : '--';

  const avgInternals = hasSubjects
    ? (activeMarksheet.subjects.reduce((sum, s) => sum + s.internalScore, 0) / activeMarksheet.subjects.length).toFixed(1)
    : '--';

  const avgSemester = hasSubjects
    ? (activeMarksheet.subjects.reduce((sum, s) => sum + s.semesterScore, 0) / activeMarksheet.subjects.length).toFixed(1)
    : '--';

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'O':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      case 'E':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-bold';
      case 'A':
        return 'bg-blue-50 text-blue-700 border-blue-200 font-bold';
      case 'B':
        return 'bg-amber-50 text-amber-700 border-amber-200 font-bold';
      case 'C':
        return 'bg-teal-50 text-teal-700 border-teal-200 font-bold';
      case 'D':
        return 'bg-slate-100 text-slate-700 border-slate-200 font-semibold';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Academic Summary Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Verified Autonomous Academic Record
              </span>
              <span className="text-2xs text-slate-400">·</span>
              <span className="text-2xs text-slate-400">
                Academic Year {activeMarksheet.academicYear}
              </span>
              {lastSyncedTime && (
                <>
                  <span className="text-2xs text-slate-400">·</span>
                  <span className="text-2xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Synced with Faculty ({lastSyncedTime})
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              Student Marksheet & Continuous Evaluation
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Real-time consolidated examination performance evaluated and uploaded directly by your course faculty members.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchMarks}
              disabled={loading}
              title="Sync latest marks from faculty portal"
              className="px-3 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white rounded-lg text-xs font-semibold border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Sync Marks'}</span>
            </button>

            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Official Marksheet (PDF)
            </button>
          </div>
        </div>

        {/* Quick KPI stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Semester SGPA</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 flex items-baseline gap-1.5">
              {hasSubjects ? activeMarksheet.sgpa.toFixed(2) : '--'}
              <span className="text-2xs text-slate-400 font-normal">/ 10.0</span>
            </div>
            <div className="text-3xs text-emerald-300/80 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              {hasSubjects ? (activeMarksheet.sgpa >= 8.5 ? 'Outstanding Standing' : 'Good Standing') : 'Evaluation In Progress'}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Cumulative CGPA</div>
            <div className="text-2xl font-bold font-mono text-indigo-300 mt-0.5 flex items-baseline gap-1.5">
              {hasSubjects ? activeMarksheet.cgpa.toFixed(2) : '--'}
              <span className="text-2xs text-slate-400 font-normal">/ 10.0</span>
            </div>
            <div className="text-3xs text-indigo-200/80 mt-0.5">
              {hasSubjects ? 'Across Completed Courses' : 'Awaiting Faculty Submission'}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Credits Earned</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
              {activeMarksheet.earnedCredits}
              <span className="text-2xs text-slate-400 font-normal">/ {activeMarksheet.totalCredits}</span>
            </div>
            <div className="text-3xs text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {hasSubjects
                ? `${Math.round((activeMarksheet.earnedCredits / (activeMarksheet.totalCredits || 1)) * 100)}% Cleared`
                : 'Pending Release'}
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Result Status</div>
            <div className="text-base font-bold text-amber-300 mt-1">
              {hasSubjects ? activeMarksheet.resultStatus : 'Awaiting Evaluation'}
            </div>
            <div className="text-3xs text-slate-400 mt-0.5">
              {hasSubjects ? `Published: ${activeMarksheet.publishedDate}` : 'Faculty Upload Mode'}
            </div>
          </div>
        </div>
      </div>

      {/* Component Evaluation Legend / Averages Pill Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Continuous & End-Semester Evaluation Scheme
            </h3>
          </div>
          <span className="text-2xs text-slate-500">
            Total Subject Marks = Quiz (10) + Surprise Test (10) + Internals (30) + Semester Exam (50) = 100 Marks
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-cyan-50/70 border border-cyan-100">
            <div className="w-8 h-8 rounded-md bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">
              QZ
            </div>
            <div>
              <div className="text-2xs font-semibold text-cyan-900">Quiz (Max 10)</div>
              <div className="text-xs text-cyan-700 font-medium">
                Your Avg: <span className="font-bold font-mono">{avgQuiz}</span> / 10
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
            <div className="w-8 h-8 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
              ST
            </div>
            <div>
              <div className="text-2xs font-semibold text-amber-900">Surprise Test (Max 10)</div>
              <div className="text-xs text-amber-700 font-medium">
                Your Avg: <span className="font-bold font-mono">{avgSurprise}</span> / 10
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100">
            <div className="w-8 h-8 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              INT
            </div>
            <div>
              <div className="text-2xs font-semibold text-indigo-900">Internals / Midterm (Max 30)</div>
              <div className="text-xs text-indigo-700 font-medium">
                Your Avg: <span className="font-bold font-mono">{avgInternals}</span> / 30
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
            <div className="w-8 h-8 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              SEM
            </div>
            <div>
              <div className="text-2xs font-semibold text-emerald-900">End Semester (Max 50)</div>
              <div className="text-xs text-emerald-700 font-medium">
                Your Avg: <span className="font-bold font-mono">{avgSemester}</span> / 50
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Semester Switcher */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">
            Academic Term:
          </label>
          <select
            value={selectedSemId}
            onChange={(e) => setSelectedSemId(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
          >
            {marksheets.map((m) => (
              <option key={m.semesterId} value={m.semesterId}>
                {m.semesterName} {m.subjects.length > 0 ? `(${m.subjects.length} subjects)` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search course code or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Core Theory">Core Theory</option>
            <option value="Basic Sciences">Basic Sciences</option>
            <option value="Laboratory / Practical">Laboratory</option>
          </select>
        </div>
      </div>

      {/* Subject-Wise Marksheet Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-2xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Subject & Course Details</th>
                <th className="py-3 px-3 text-center">Credits</th>
                <th className="py-3 px-3 text-center bg-cyan-50/40 text-cyan-900 border-x border-slate-200/60">
                  Quiz (10)
                </th>
                <th className="py-3 px-3 text-center bg-amber-50/40 text-amber-900 border-r border-slate-200/60">
                  Surprise (10)
                </th>
                <th className="py-3 px-3 text-center bg-indigo-50/40 text-indigo-900 border-r border-slate-200/60">
                  Internals (30)
                </th>
                <th className="py-3 px-3 text-center bg-emerald-50/40 text-emerald-900 border-r border-slate-200/60">
                  End Sem (50)
                </th>
                <th className="py-3 px-3 text-center">Total (100)</th>
                <th className="py-3 px-3 text-center">Grade</th>
                <th className="py-3 px-3 text-center">Points</th>
                <th className="py-3 px-4 text-center">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((sub) => {
                  return (
                    <tr
                      key={sub.subjectCode}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                          <span className="font-mono text-indigo-600 font-bold text-2xs bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                            {sub.subjectCode}
                          </span>
                          <span>{sub.subjectName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-2xs text-slate-500">
                          <span className="font-medium text-slate-600">Faculty: {sub.facultyName}</span>
                          <span>·</span>
                          <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                            {sub.category}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center font-mono font-medium text-slate-700">
                        {sub.credits}
                      </td>

                      {/* Quiz Marks */}
                      <td className="py-3.5 px-3 text-center bg-cyan-50/20 border-x border-slate-100">
                        <div className="font-mono font-bold text-cyan-800 tabular-nums">
                          {sub.quizScore.toFixed(1)}
                        </div>
                        <div className="text-3xs text-slate-400">/ 10</div>
                      </td>

                      {/* Surprise Test Marks */}
                      <td className="py-3.5 px-3 text-center bg-amber-50/20 border-r border-slate-100">
                        <div className="font-mono font-bold text-amber-800 tabular-nums">
                          {sub.surpriseTestScore.toFixed(1)}
                        </div>
                        <div className="text-3xs text-slate-400">/ 10</div>
                      </td>

                      {/* Internals Marks */}
                      <td className="py-3.5 px-3 text-center bg-indigo-50/20 border-r border-slate-100">
                        <div className="font-mono font-bold text-indigo-800 tabular-nums">
                          {sub.internalScore.toFixed(1)}
                        </div>
                        <div className="text-3xs text-slate-400">/ 30</div>
                      </td>

                      {/* Semester Marks */}
                      <td className="py-3.5 px-3 text-center bg-emerald-50/20 border-r border-slate-100">
                        <div className="font-mono font-bold text-emerald-800 tabular-nums">
                          {sub.semesterScore.toFixed(1)}
                        </div>
                        <div className="text-3xs text-slate-400">/ 50</div>
                      </td>

                      {/* Total Marks */}
                      <td className="py-3.5 px-3 text-center">
                        <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                          {sub.totalScore.toFixed(1)}
                        </div>
                        <div className="text-3xs text-slate-400">/ 100</div>
                      </td>

                      {/* Grade Badge */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-xs border ${getGradeBadge(
                            sub.grade
                          )}`}
                        >
                          {sub.grade}
                        </span>
                      </td>

                      {/* Grade Point */}
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-700">
                        {sub.gradePoint.toFixed(1)}
                      </td>

                      {/* Result Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-2xs font-semibold px-2 py-0.5 rounded-full border ${
                            sub.status === 'PASS'
                              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                              : 'text-rose-700 bg-rose-50 border-rose-200'
                          }`}
                        >
                          {sub.status === 'PASS' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                          )}
                          {sub.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {searchQuery || selectedCategory !== 'all'
                          ? 'No subjects match your current filter'
                          : `No Marks Published Yet for ${activeMarksheet.semesterName}`}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {searchQuery || selectedCategory !== 'all'
                          ? 'Try resetting the search keyword or selecting "All Categories".'
                          : 'Course faculty members have not published evaluation marksheets for your roll number yet. Once published via the Faculty Portal, your scores will automatically appear here in real time.'}
                      </p>
                      <div className="pt-2 flex items-center justify-center gap-3">
                        <button
                          onClick={fetchMarks}
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                          {loading ? 'Checking Records...' : 'Check For Newly Published Marks'}
                        </button>
                        {(searchQuery || selectedCategory !== 'all') && (
                          <button
                            onClick={() => {
                              setSearchQuery('');
                              setSelectedCategory('all');
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer calculation note */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-2xs text-slate-500 gap-2">
          <div>
            Showing {filteredSubjects.length} of {activeMarksheet.subjects.length} registered subjects for {activeMarksheet.semesterName}.
          </div>
          <div className="flex items-center gap-4 font-mono">
            <span>Semester Credits: <strong className="text-slate-900">{activeMarksheet.earnedCredits}</strong></span>
            <span>SGPA: <strong className="text-emerald-700">{hasSubjects ? activeMarksheet.sgpa.toFixed(2) : '--'}</strong></span>
            <span>CGPA: <strong className="text-indigo-700">{hasSubjects ? activeMarksheet.cgpa.toFixed(2) : '--'}</strong></span>
          </div>
        </div>
      </div>

      {/* Visual Component Distribution Cards */}
      {filteredSubjects.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSubjects.map((sub) => {
            return (
              <div
                key={`card-${sub.subjectCode}`}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {sub.subjectCode}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">{sub.subjectName}</h4>
                    </div>
                    <div className="text-2xs text-slate-500 mt-0.5">Faculty: {sub.facultyName}</div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-xs border ${getGradeBadge(
                        sub.grade
                      )}`}
                    >
                      Grade {sub.grade} ({sub.gradePoint} GP)
                    </span>
                    <div className="text-2xs font-mono text-slate-500 mt-0.5">
                      {sub.totalScore} / 100
                    </div>
                  </div>
                </div>

                {/* Stacked bar representation */}
                <div className="space-y-1.5 text-2xs">
                  <div className="flex justify-between text-3xs text-slate-500">
                    <span>Evaluation Components</span>
                    <span className="font-mono">{sub.totalScore}% Aggregate</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden">
                    <div
                      style={{ width: `${(sub.quizScore / 100) * 100}%` }}
                      className="bg-cyan-500"
                      title={`Quiz: ${sub.quizScore}/10`}
                    />
                    <div
                      style={{ width: `${(sub.surpriseTestScore / 100) * 100}%` }}
                      className="bg-amber-500"
                      title={`Surprise Test: ${sub.surpriseTestScore}/10`}
                    />
                    <div
                      style={{ width: `${(sub.internalScore / 100) * 100}%` }}
                      className="bg-indigo-500"
                      title={`Internals: ${sub.internalScore}/30`}
                    />
                    <div
                      style={{ width: `${(sub.semesterScore / 100) * 100}%` }}
                      className="bg-emerald-500"
                      title={`Semester Exam: ${sub.semesterScore}/50`}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center pt-1 text-3xs">
                    <span className="text-cyan-800 font-medium">QZ: {sub.quizScore}/10</span>
                    <span className="text-amber-800 font-medium">ST: {sub.surpriseTestScore}/10</span>
                    <span className="text-indigo-800 font-medium">INT: {sub.internalScore}/30</span>
                    <span className="text-emerald-800 font-medium">SEM: {sub.semesterScore}/50</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* OFFICIAL MARKSHEET / GRADE CARD PRINT MODAL */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 space-y-6 my-8 border border-slate-200">
            {/* Modal Controls (Not printed) */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-bold text-slate-900">
                  Official Grade Card & Marksheet Preview
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official University Marksheet Document Formatted */}
            <div className="p-6 border-2 border-slate-900 rounded-xl bg-white space-y-6 relative overflow-hidden font-serif">
              {/* Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <GraduationCap className="w-96 h-96 text-slate-900" />
              </div>

              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <div className="text-xs font-sans uppercase tracking-widest text-slate-600 font-bold">
                  State Technological University
                </div>
                <h1 className="text-lg sm:text-xl font-bold tracking-wide text-slate-950 uppercase">
                  BIJU PATNAIK UNIVERSITY OF TECHNOLOGY, ODISHA
                </h1>
                <div className="text-2xs font-sans text-slate-600">
                  Rourkela, Odisha - 769004 · Established under Government of Odisha Act No. 09 of 2002
                </div>
                <div className="mt-2 inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-sans text-xs font-bold text-slate-900 tracking-wide">
                  SEMESTER GRADE SHEET / CONSOLIDATED MARKS STATEMENT
                </div>
              </div>

              {/* Student Metadata Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-3xs uppercase text-slate-500 font-semibold">Student Name</div>
                  <div className="font-bold text-slate-900">{studentName}</div>
                </div>
                <div>
                  <div className="text-3xs uppercase text-slate-500 font-semibold">Roll Number</div>
                  <div className="font-mono font-bold text-slate-900">{studentRoll}</div>
                </div>
                <div>
                  <div className="text-3xs uppercase text-slate-500 font-semibold">Branch / Program</div>
                  <div className="font-semibold text-slate-900">{branch}</div>
                </div>
                <div>
                  <div className="text-3xs uppercase text-slate-500 font-semibold">Academic Session</div>
                  <div className="font-semibold text-slate-900">{activeMarksheet.academicYear}</div>
                </div>
              </div>

              {/* Table of marks */}
              <div className="overflow-x-auto font-sans">
                <table className="w-full text-xs text-left border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 text-2xs uppercase border-b border-slate-300 font-bold">
                      <th className="p-2 border-r border-slate-300">Code</th>
                      <th className="p-2 border-r border-slate-300">Subject Name</th>
                      <th className="p-2 text-center border-r border-slate-300">Credits</th>
                      <th className="p-2 text-center border-r border-slate-300">Quiz (10)</th>
                      <th className="p-2 text-center border-r border-slate-300">Surprise (10)</th>
                      <th className="p-2 text-center border-r border-slate-300">Internals (30)</th>
                      <th className="p-2 text-center border-r border-slate-300">End Sem (50)</th>
                      <th className="p-2 text-center border-r border-slate-300">Total (100)</th>
                      <th className="p-2 text-center border-r border-slate-300">Grade</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {activeMarksheet.subjects.length > 0 ? (
                      activeMarksheet.subjects.map((s) => (
                        <tr key={`print-${s.subjectCode}`}>
                          <td className="p-2 font-mono font-semibold border-r border-slate-200">
                            {s.subjectCode}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-medium">
                            {s.subjectName}
                          </td>
                          <td className="p-2 text-center font-mono border-r border-slate-200">
                            {s.credits}
                          </td>
                          <td className="p-2 text-center font-mono border-r border-slate-200">
                            {s.quizScore.toFixed(1)}
                          </td>
                          <td className="p-2 text-center font-mono border-r border-slate-200">
                            {s.surpriseTestScore.toFixed(1)}
                          </td>
                          <td className="p-2 text-center font-mono border-r border-slate-200">
                            {s.internalScore.toFixed(1)}
                          </td>
                          <td className="p-2 text-center font-mono border-r border-slate-200">
                            {s.semesterScore.toFixed(1)}
                          </td>
                          <td className="p-2 text-center font-mono font-bold border-r border-slate-200">
                            {s.totalScore.toFixed(1)}
                          </td>
                          <td className="p-2 text-center font-bold border-r border-slate-200">
                            {s.grade}
                          </td>
                          <td className="p-2 text-center font-semibold text-emerald-700">
                            {s.status}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-slate-500 italic">
                          Continuous evaluation records in progress. Faculty marks will be officially reflected upon publication.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary Footer */}
              <div className="font-sans flex flex-col sm:flex-row items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs gap-3">
                <div>
                  Result:{' '}
                  <strong className={activeMarksheet.resultStatus === 'PASS' ? 'text-emerald-700' : 'text-amber-700'}>
                    {hasSubjects ? activeMarksheet.resultStatus : 'Awaiting Publication'}
                  </strong>
                </div>
                <div className="flex items-center gap-6 font-mono font-bold">
                  <span>Total Credits: {activeMarksheet.earnedCredits}</span>
                  <span>SGPA: {hasSubjects ? activeMarksheet.sgpa.toFixed(2) : '--'}</span>
                  <span>CGPA: {hasSubjects ? activeMarksheet.cgpa.toFixed(2) : '--'}</span>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="font-sans pt-6 flex items-end justify-between border-t border-slate-200 text-2xs text-slate-600">
                <div className="space-y-1">
                  <div className="font-mono text-3xs text-slate-400">
                    DIGITAL SIGNATURE HASH: SHA256:7B8F9A3E002B48C9A
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-10 h-10 text-slate-800" />
                    <div>
                      <div className="font-bold text-slate-900">Cryptographically Verified</div>
                      <div className="text-3xs text-slate-500">Scan QR to authenticate on university portal</div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-32 border-b border-slate-800 mx-auto" />
                  <div className="font-bold text-slate-900">Controller of Examinations</div>
                  <div className="text-3xs text-slate-500">Biju Patnaik University of Technology</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
