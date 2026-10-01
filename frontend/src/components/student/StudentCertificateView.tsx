import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Plus,
  Download,
  Printer,
  QrCode,
  X,
  AlertCircle,
  Sparkles,
  Building,
  GraduationCap,
  ExternalLink,
  ChevronRight,
  Award,
} from 'lucide-react';
import { CertificateRequest, ClearanceItem, CertificateType } from '../../types';
import { initialCertificateRequests, initialClearanceNodes } from '../../data/academicData';

interface StudentCertificateViewProps {
  studentName: string;
  studentRoll: string;
  branch?: string;
}

export const StudentCertificateView: React.FC<StudentCertificateViewProps> = ({
  studentName,
  studentRoll,
  branch = 'B.Tech - Computer Science & Engineering',
}) => {
  // Certificate Requests State
  const [requests, setRequests] = useState<CertificateRequest[]>(() => {
    const saved = localStorage.getItem('bput_student_certificates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return initialCertificateRequests;
      }
    }
    return initialCertificateRequests;
  });

  const [clearances] = useState<ClearanceItem[]>(initialClearanceNodes);

  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [certType, setCertType] = useState<CertificateType>('no_due');
  const [purpose, setPurpose] = useState('Semester Examination Clearance & Grade Card Release');
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [semester, setSemester] = useState('Semester 5');
  const [isUrgent, setIsUrgent] = useState(false);
  const [customRemarks, setCustomRemarks] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');

  // Certificate Viewer Modal State
  const [selectedCert, setSelectedCert] = useState<CertificateRequest | null>(null);
  const [showQrModal, setShowQrModal] = useState<CertificateRequest | null>(null);

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = certType === 'no_due' ? 'ND' : 'BF';
    const certNumber = `BPUT/CERT/2024/${prefix}-${randomNum}`;
    const token = `BPUT-VERIFIED-${prefix}-${randomNum}-SHA256-${studentRoll}`;

    const newRequest: CertificateRequest = {
      id: `cert-req-${Date.now()}`,
      certificateNumber: certNumber,
      type: certType,
      studentName,
      rollNumber: studentRoll,
      branch,
      academicYear,
      semester,
      purpose,
      urgent: isUrgent,
      requestDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'approved', // Auto-approves since all 5 institutional departments are already cleared
      approvedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      approvedBy:
        certType === 'no_due'
          ? 'Dr. S. K. Mohapatra (Dean of Academic Affairs)'
          : 'Prof. R. C. Dash (Office of the Registrar)',
      qrCodeToken: token,
      clearanceDetails: certType === 'no_due' ? clearances : undefined,
      remarks:
        customRemarks ||
        (certType === 'no_due'
          ? 'All 5 institutional clearances verified. Digitally signed clearance issued.'
          : 'Verified against university active student roll register.'),
    };

    const updated = [newRequest, ...requests];
    setRequests(updated);
    localStorage.setItem('bput_student_certificates', JSON.stringify(updated));

    setRequestSuccess(
      `Your request for ${
        certType === 'no_due' ? 'No Due Certificate' : 'Bonafide Certificate'
      } has been verified & approved! Certificate No: ${certNumber}`
    );

    setTimeout(() => {
      setRequestSuccess('');
      setShowRequestModal(false);
      setSelectedCert(newRequest);
    }, 1500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Zero-Queue Digital Clearance System
              </span>
              <span className="text-2xs text-slate-400">·</span>
              <span className="text-2xs text-slate-400">University Certified</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              University Certificates & No-Dues Portal
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Apply for official university certificates including <strong>No Due Certificate</strong> and <strong>Bonafide Certificate</strong> with automated cross-departmental clearances and tamper-proof verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCertType('no_due');
                setShowRequestModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Request Certificate
            </button>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Department Clearances</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              5 / 5
            </div>
            <div className="text-3xs text-emerald-300 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              100% Cleared (Nil Dues)
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Active Requests</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">
              {requests.length}
            </div>
            <div className="text-3xs text-slate-400 mt-0.5">All Digitally Reconciled</div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Available Certificates</div>
            <div className="text-xs font-bold text-amber-300 mt-1">
              No Due & Bonafide
            </div>
            <div className="text-3xs text-slate-400 mt-0.5">Instant PDF Generation</div>
          </div>

          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="text-2xs text-slate-400 uppercase font-medium">Verification Seal</div>
            <div className="text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              BPUT Cryptographic Hash
            </div>
            <div className="text-3xs text-slate-400 mt-0.5">SHA-256 QR Authenticated</div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Department Clearances (No-Due Status) & Quick Request */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Department Clearance Status Matrix */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Institutional No-Dues Clearance Matrix
              </h3>
              <p className="text-2xs text-slate-500 mt-0.5">
                Automated multi-department verification for zero-queue digital no-due issuance.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-2xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              All Clear
            </span>
          </div>

          <div className="space-y-2.5">
            {clearances.map((c, i) => (
              <div
                key={i}
                className="p-3 bg-slate-50/70 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{c.department}</span>
                  </div>
                  <div className="text-2xs text-slate-500">
                    Verified by <span className="font-medium text-slate-700">{c.clearedBy}</span> · {c.clearedDate}
                  </div>
                  <div className="text-3xs text-slate-600 italic">
                    "{c.remarks}"
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-2xs font-medium rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => {
                const noDue = requests.find((r) => r.type === 'no_due');
                if (noDue) {
                  setSelectedCert(noDue);
                } else {
                  setCertType('no_due');
                  setShowRequestModal(true);
                }
              }}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              View / Download Official No-Dues Certificate
            </button>
            <button
              onClick={() => {
                setCertType('bonafide');
                setShowRequestModal(true);
              }}
              className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Request Bonafide Certificate
            </button>
          </div>
        </div>

        {/* Right: Certificate Types Guide & Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Available Certificate Types
          </h3>

          {/* No Due Card */}
          <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                No Due Certificate
              </span>
              <span className="text-3xs bg-emerald-200/60 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                Zero Queue
              </span>
            </div>
            <p className="text-2xs text-slate-600">
              Required for semester exam registration, hostel checkout, caution deposit refund, and graduation.
            </p>
            <ul className="text-3xs text-slate-600 space-y-1 list-disc list-inside">
              <li>Reconciles Library, Mess, Lab & Accounts</li>
              <li>Includes Department Seal & Registrar Sign</li>
              <li>Generated instantaneously</li>
            </ul>
            <button
              onClick={() => {
                setCertType('no_due');
                setShowRequestModal(true);
              }}
              className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-2xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              Request No-Due Clearance
            </button>
          </div>

          {/* Bonafide Card */}
          <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600" />
                Bonafide Certificate
              </span>
              <span className="text-3xs bg-indigo-200/60 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                Official Proof
              </span>
            </div>
            <p className="text-2xs text-slate-600">
              Official university certification of active enrollment, semester standing, and moral conduct.
            </p>
            <ul className="text-3xs text-slate-600 space-y-1 list-disc list-inside">
              <li>Valid for National Scholarships (NSP)</li>
              <li>Education loans, Passport & Visa</li>
              <li>Internship NOC & Concessions</li>
            </ul>
            <button
              onClick={() => {
                setCertType('bonafide');
                setShowRequestModal(true);
              }}
              className="w-full mt-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-2xs font-semibold rounded-md transition-colors cursor-pointer"
            >
              Request Bonafide Certificate
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Requests & Issued Certificates List */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              Certificate Requests & Digital Downloads
            </h3>
            <p className="text-2xs text-slate-500 mt-0.5">
              Access and download your verified university certificates with official seals anytime.
            </p>
          </div>

          <button
            onClick={() => setShowRequestModal(true)}
            className="self-start sm:self-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Request
          </button>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-2xs uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Certificate Type</th>
                <th className="py-3 px-4">Reference Number</th>
                <th className="py-3 px-4">Purpose / Reason</th>
                <th className="py-3 px-4">Request Date</th>
                <th className="py-3 px-4">Approved By</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {requests.map((req) => {
                const isNoDue = req.type === 'no_due';
                return (
                  <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isNoDue
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {isNoDue ? (
                            <ShieldCheck className="w-4 h-4" />
                          ) : (
                            <Award className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">
                            {isNoDue ? 'No Due Certificate' : 'Bonafide Certificate'}
                          </div>
                          <div className="text-2xs text-slate-500">
                            {req.academicYear} · {req.semester}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-2xs text-slate-800">
                      {req.certificateNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                      <div className="truncate font-medium">{req.purpose}</div>
                      {req.urgent && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-3xs font-semibold">
                          Urgent Processing
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 text-2xs">
                      <div>{req.requestDate}</div>
                      {req.approvedDate && (
                        <div className="text-3xs text-emerald-600 font-medium">
                          Approved: {req.approvedDate}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-2xs text-slate-600 max-w-xs truncate">
                      {req.approvedBy || 'Dean / Registrar Office'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 text-2xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved & Ready
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCert(req)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-2xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        View / PDF
                      </button>
                      <button
                        onClick={() => setShowQrModal(req)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-2xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                        title="Verify QR"
                      >
                        <QrCode className="w-3 h-3" />
                        Verify
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REQUEST CERTIFICATE MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Request Official University Certificate
                </h3>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {requestSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div>{requestSuccess}</div>
                <div className="text-2xs text-emerald-600">Opening certificate preview...</div>
              </div>
            ) : (
              <form onSubmit={handleCreateRequest} className="space-y-4 text-xs">
                {/* Select Type */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">Certificate Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCertType('no_due');
                        setPurpose('Semester Examination Clearance & Grade Card Release');
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        certType === 'no_due'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        No Due Certificate
                      </div>
                      <div className="text-2xs text-slate-500 mt-1">
                        Institutional multi-department clearance
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCertType('bonafide');
                        setPurpose('National Scholarship Portal (NSP) Grant Application');
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        certType === 'bonafide'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-600" />
                        Bonafide Certificate
                      </div>
                      <div className="text-2xs text-slate-500 mt-1">
                        Proof of enrollment & conduct
                      </div>
                    </button>
                  </div>
                </div>

                {/* Purpose / Reason */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-700">
                    Purpose / Reason for Certificate
                  </label>

                  {/* Quick Select Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {[
                      'Semester Registration & Exam',
                      'Scholarship Application (NSP)',
                      'Passport & Visa Verification',
                      'Bank Education Loan',
                      'Internship NOC & Training',
                      'Hostel Vacating & Caution Refund',
                    ].map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPurpose(p)}
                        className={`text-2xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                          purpose === p
                            ? 'bg-slate-900 text-white border-slate-900 font-medium'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    required
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Enter or select purpose..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Academic Year and Term */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Academic Session</label>
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="2024-2025">2024-2025</option>
                      <option value="2023-2024">2023-2024</option>
                      <option value="2022-2023">2022-2023</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700">Current Semester</label>
                    <select
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                      className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                    >
                      <option value="Semester 5">Semester 5</option>
                      <option value="Semester 6">Semester 6</option>
                      <option value="Semester 7">Semester 7</option>
                      <option value="Semester 8">Semester 8</option>
                    </select>
                  </div>
                </div>

                {/* Additional Remarks */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">
                    Additional Instructions / Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={customRemarks}
                    onChange={(e) => setCustomRemarks(e.target.value)}
                    placeholder="Any specific reference number or authority addressing details..."
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {/* Urgent Option */}
                <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <input
                    type="checkbox"
                    id="urgentCert"
                    checked={isUrgent}
                    onChange={(e) => setIsUrgent(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                  />
                  <label htmlFor="urgentCert" className="text-2xs text-slate-700 cursor-pointer">
                    <strong>Express Processing</strong> — Request immediate digital sign-off from Registrar
                  </label>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm cursor-pointer"
                  >
                    Submit Request & Generate Certificate
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* OFFICIAL CERTIFICATE PREVIEW & PRINT MODAL */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 space-y-6 my-8 border border-slate-200">
            {/* Modal Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold text-slate-900">
                  Official University Certificate Preview
                </span>
                <span className="text-2xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {selectedCert.certificateNumber}
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
                  onClick={() => setSelectedCert(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Official University Certificate Sheet */}
            <div className="p-8 border-4 border-double border-slate-900 rounded-xl bg-white space-y-6 relative overflow-hidden font-serif">
              {/* University Seal Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                <GraduationCap className="w-96 h-96 text-slate-900" />
              </div>

              {/* Certificate Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <div className="text-xs font-sans uppercase tracking-widest text-slate-600 font-bold">
                  State Technological University
                </div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-wide text-slate-950 uppercase">
                  BIJU PATNAIK UNIVERSITY OF TECHNOLOGY, ODISHA
                </h1>
                <div className="text-2xs font-sans text-slate-600">
                  Chhend Colony, Rourkela, Odisha - 769004 · Established under Govt of Odisha Act No. 09 of 2002
                </div>
                <div className="pt-3">
                  <span className="inline-block px-4 py-1.5 bg-slate-900 text-white font-sans text-xs font-bold uppercase tracking-wider rounded">
                    {selectedCert.type === 'no_due'
                      ? 'CONSOLIDATED NO-DUES & INSTITUTIONAL CLEARANCE CERTIFICATE'
                      : 'OFFICIAL BONAFIDE STUDENT & CHARACTER CERTIFICATE'}
                  </span>
                </div>
              </div>

              {/* Reference and Date Info */}
              <div className="flex items-center justify-between text-xs font-sans text-slate-700">
                <div>
                  Certificate Ref No: <strong className="font-mono text-slate-950">{selectedCert.certificateNumber}</strong>
                </div>
                <div>
                  Date of Issuance: <strong className="text-slate-950">{selectedCert.approvedDate || selectedCert.requestDate}</strong>
                </div>
              </div>

              {/* Student Metadata Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <div className="text-3xs uppercase text-slate-500 font-semibold">Student Name</div>
                  <div className="font-bold text-slate-950">{selectedCert.studentName}</div>
                </div>
                <div>
                  <div className="text-3xs uppercase text-slate-500 font-semibold">Roll Number</div>
                  <div className="font-mono font-bold text-slate-950">{selectedCert.rollNumber}</div>
                </div>
                <div>
                  <div className="text-3xs uppercase text-slate-500 font-semibold">Branch & Course</div>
                  <div className="font-semibold text-slate-950">B.Tech - Computer Science</div>
                </div>
                <div>
                  <div className="text-3xs uppercase text-slate-500 font-semibold">Academic Session</div>
                  <div className="font-semibold text-slate-950">{selectedCert.academicYear}</div>
                </div>
              </div>

              {/* Certificate Body Text Customized By Type */}
              {selectedCert.type === 'no_due' ? (
                <div className="space-y-4 text-xs leading-relaxed text-slate-800">
                  <p>
                    This is to formally certify that <strong>{selectedCert.studentName}</strong>, bearing University Roll Number <strong>{selectedCert.rollNumber}</strong>, student of <strong>{selectedCert.branch}</strong> ({selectedCert.semester}, Academic Year {selectedCert.academicYear}), has satisfactorily surrendered all university properties, instruments, and books, and has cleared all institutional dues across the departments indicated below.
                  </p>

                  <div className="overflow-x-auto font-sans">
                    <table className="w-full text-xs text-left border border-slate-300">
                      <thead>
                        <tr className="bg-slate-100 text-slate-800 text-2xs uppercase border-b border-slate-300 font-bold">
                          <th className="p-2 border-r border-slate-300">No.</th>
                          <th className="p-2 border-r border-slate-300">Department / Division</th>
                          <th className="p-2 border-r border-slate-300">Clearance Status</th>
                          <th className="p-2 border-r border-slate-300">Clearing Authority</th>
                          <th className="p-2">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {clearances.map((c, idx) => (
                          <tr key={`clearance-${idx}`}>
                            <td className="p-2 text-center font-mono border-r border-slate-200">
                              {idx + 1}
                            </td>
                            <td className="p-2 font-medium border-r border-slate-200">
                              {c.department}
                            </td>
                            <td className="p-2 font-semibold text-emerald-800 border-r border-slate-200">
                              {c.status}
                            </td>
                            <td className="p-2 text-2xs text-slate-700 border-r border-slate-200">
                              {c.clearedBy}
                            </td>
                            <td className="p-2 text-2xs text-slate-600">
                              {c.clearedDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="text-2xs text-slate-600 italic">
                    Purpose of Clearance: <strong>{selectedCert.purpose}</strong>. There are no outstanding academic, hostel, library, or laboratory dues pending against this student.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs leading-relaxed text-slate-800">
                  <div className="font-bold text-center uppercase tracking-wider text-slate-900 pt-2 pb-1">
                    TO WHOM IT MAY CONCERN
                  </div>
                  <p>
                    This is to certify that <strong>{selectedCert.studentName}</strong>, bearing University Roll Number <strong>{selectedCert.rollNumber}</strong>, is a bona fide, regular, and full-time student of this institution pursuing 4-Year Bachelor of Technology (B.Tech) in <strong>{selectedCert.branch}</strong> during the academic session <strong>{selectedCert.academicYear}</strong> ({selectedCert.semester}).
                  </p>
                  <p>
                    According to institutional academic registers, their conduct, character, and scholastic engagement have been consistently exemplary throughout their period of study.
                  </p>
                  <p>
                    This official certificate is issued upon the student’s specific request for the purpose of: <strong>{selectedCert.purpose}</strong>.
                  </p>
                  <p className="text-2xs text-slate-600">
                    The institution has no objection to the student utilizing this certificate for legitimate academic grants, scholarships, passport/visa verifications, or educational training applications.
                  </p>
                </div>
              )}

              {/* Official Signatures & Cryptographic Seal */}
              <div className="font-sans pt-6 flex items-end justify-between border-t-2 border-slate-900 text-2xs text-slate-700">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-12 h-12 text-slate-900" />
                    <div>
                      <div className="font-bold text-slate-950">University Cryptographic Seal</div>
                      <div className="font-mono text-3xs text-slate-500">
                        {selectedCert.qrCodeToken || `BPUT-VERIFY-${selectedCert.id}`}
                      </div>
                      <div className="text-3xs text-emerald-700 font-semibold">
                        Valid for Academic Session {selectedCert.academicYear}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-end gap-12 text-center">
                  <div className="space-y-1">
                    <div className="w-28 border-b border-slate-900 mx-auto" />
                    <div className="font-bold text-slate-900">Dean of Student Affairs</div>
                    <div className="text-3xs text-slate-500">BPUT Campus</div>
                  </div>

                  <div className="space-y-1">
                    <div className="w-28 border-b border-slate-900 mx-auto" />
                    <div className="font-bold text-slate-900">Office of the Registrar</div>
                    <div className="text-3xs text-slate-500">Biju Patnaik University</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR VERIFICATION MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900">Certificate Cryptographic QR</h3>
              <button
                onClick={() => setShowQrModal(null)}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 inline-block">
              <QrCode className="w-32 h-32 text-slate-900 mx-auto" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-900">
                {showQrModal.type === 'no_due' ? 'No Due Certificate' : 'Bonafide Certificate'}
              </div>
              <div className="font-mono text-2xs text-indigo-600 font-semibold">
                {showQrModal.certificateNumber}
              </div>
              <p className="text-2xs text-slate-500">
                Authorized by {showQrModal.approvedBy || 'Registrar Office'}.
              </p>
            </div>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
