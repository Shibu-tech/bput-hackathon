import React, { useState } from 'react';
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
} from 'lucide-react';
import { SemesterMarksheet, SubjectMark } from '../../types';
import { initialSemesterMarksheets } from '../../data/academicData';

interface StudentMarksheetViewProps {
  studentName: string;
  studentRoll: string;
  branch?: string;
}

export const StudentMarksheetView: React.FC<StudentMarksheetViewProps> = ({
  studentName,
  studentRoll,
  branch = 'B.Tech - Computer Science & Engineering',
}) => {
  const [marksheets] = useState<SemesterMarksheet[]>(() => {
    const saved = localStorage.getItem('bput_student_marksheets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialSemesterMarksheets;
      }
    }
    return initialSemesterMarksheets;
  });

  const [selectedSemId, setSelectedSemId] = useState<string>('sem-5');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showPrintModal, setShowPrintModal] = useState(false);

  const activeMarksheet =
    marksheets.find((m) => m.semesterId === selectedSemId) || marksheets[0];

  const filteredSubjects = activeMarksheet.subjects.filter((sub) => {
    const matchesSearch =
      sub.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.facultyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || sub.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate averages across components
  const avgQuiz = (
    activeMarksheet.subjects.reduce((sum, s) => sum + s.quizScore, 0) /
    activeMarksheet.subjects.length
  ).toFixed(1);

  const avgSurprise = (
    activeMarksheet.subjects.reduce((sum, s) => sum + s.surpriseTestScore, 0) /
    activeMarksheet.subjects.length
  ).toFixed(1);

  const avgInternals = (
    activeMarksheet.subjects.reduce((sum, s) => sum + s.internalScore, 0) /
    activeMarksheet.subjects.length
  ).toFixed(1);

  const avgSemester = (
    activeMarksheet.subjects.reduce((sum, s) => sum + s.semesterScore, 0) /
    activeMarksheet.subjects.length
  ).toFixed(1);

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
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              Student Marksheet & Continuous Evaluation
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Subject-wise consolidated performance covering Continuous Evaluation (Quizzes, Surprise Tests, Internal Assessments) and End-Semester University Examinations.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPrintModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
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
              {activeMarksheet.sgpa.toFixed(2)}
              <span className="text-2xs text-slate-400 font-normal">/ 10.0</span>
            </div>
            <div className="text-3xs text-emerald-300/80 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              Outstanding Standing
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Cumulative CGPA</div>
            <div className="text-2xl font-bold font-mono text-indigo-300 mt-0.5 flex items-baseline gap-1.5">
              {activeMarksheet.cgpa.toFixed(2)}
              <span className="text-2xs text-slate-400 font-normal">/ 10.0</span>
            </div>
            <div className="text-3xs text-indigo-200/80 mt-0.5">Across All Completed Semesters</div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Credits Earned</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5 flex items-baseline gap-1.5">
              {activeMarksheet.earnedCredits}
              <span className="text-2xs text-slate-400 font-normal">/ {activeMarksheet.totalCredits}</span>
            </div>
            <div className="text-3xs text-emerald-400 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              100% Credits Cleared
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Result Status</div>
            <div className="text-base font-bold text-amber-300 mt-1">
              {activeMarksheet.resultStatus}
            </div>
            <div className="text-3xs text-slate-400 mt-0.5">Gazette: {activeMarksheet.publishedDate}</div>
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
                {m.semesterName}
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
              {filteredSubjects.map((sub) => {
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
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
            <span>SGPA: <strong className="text-emerald-700">{activeMarksheet.sgpa.toFixed(2)}</strong></span>
            <span>CGPA: <strong className="text-indigo-700">{activeMarksheet.cgpa.toFixed(2)}</strong></span>
          </div>
        </div>
      </div>

      {/* Visual Component Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredSubjects.map((sub) => {
          const quizPct = (sub.quizScore / 10) * 100;
          const surprisePct = (sub.surpriseTestScore / 10) * 100;
          const internalPct = (sub.internalScore / 30) * 100;
          const semPct = (sub.semesterScore / 50) * 100;

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
                  <div className="font-semibold text-slate-900">CSE (B.Tech)</div>
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
                    {activeMarksheet.subjects.map((s) => (
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
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Calculation Summary Footer */}
              <div className="font-sans flex flex-col sm:flex-row items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs gap-3">
                <div>
                  Result: <strong className="text-emerald-700">{activeMarksheet.resultStatus}</strong>
                </div>
                <div className="flex items-center gap-6 font-mono font-bold">
                  <span>Total Credits: {activeMarksheet.earnedCredits}</span>
                  <span>SGPA: {activeMarksheet.sgpa.toFixed(2)}</span>
                  <span>CGPA: {activeMarksheet.cgpa.toFixed(2)}</span>
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
