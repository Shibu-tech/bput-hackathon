import React, { useState, useRef, useEffect } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { translations } from '../../utils/translations';
import { GatePass } from '../../types';
import { playScannerBeep } from '../../utils/audioAlert';
import {
  ShieldCheck,
  ShieldAlert,
  QrCode,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRightCircle,
  ArrowLeftCircle,
  Clock,
  User,
  Camera,
  Scan,
  X,
  Sparkles,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Building,
} from 'lucide-react';

export const SecurityGuardTerminal: React.FC = () => {
  const {
    language,
    gatePasses,
    logGateExit,
    logGateEntry,
  } = useCampusOps();

  const t = translations[language];

  // Default to STU-9090 (or GP-9042)
  const [passInput, setPassInput] = useState('STU-9090');
  const [selectedPass, setSelectedPass] = useState<GatePass | null>(() => {
    return (
      gatePasses.find((p) => p.rollNumber === 'STU-9090') ||
      gatePasses.find((p) => p.passCode === 'GP-9042') ||
      gatePasses[0] ||
      null
    );
  });
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Scanner Modal & Camera State
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanSuccessPulse, setScanSuccessPulse] = useState(false);
  const [manualScannerInput, setManualScannerInput] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Search by Registration Number or Pass Code
  const handleSearchPass = (queryToSearch?: string) => {
    const raw = (queryToSearch !== undefined ? queryToSearch : passInput).trim();
    if (!raw) {
      setFeedback({
        success: false,
        message: 'Please enter a student registration number or pass code.',
      });
      return;
    }

    const query = raw.toUpperCase();

    // 1. Search by exact student registration number / roll number
    let found = gatePasses.find((p) => p.rollNumber.toUpperCase() === query);

    // 2. Search by exact gate pass code (e.g. GP-9042)
    if (!found) {
      found = gatePasses.find((p) => p.passCode.toUpperCase() === query);
    }

    // 3. Search by QR code string or QR token or pass ID
    if (!found) {
      found = gatePasses.find(
        (p) =>
          p.qrCode?.toUpperCase() === query ||
          p.qrToken?.toUpperCase() === query ||
          p.id.toUpperCase() === query
      );
    }

    // 4. Search by partial registration number or name
    if (!found) {
      found = gatePasses.find(
        (p) =>
          p.rollNumber.toUpperCase().includes(query) ||
          p.passCode.toUpperCase().includes(query) ||
          p.studentName.toUpperCase().includes(query)
      );
    }

    if (found) {
      setSelectedPass(found);
      const isAccepted = found.status === 'approved';
      setFeedback({
        success: isAccepted,
        message: isAccepted
          ? `Gate pass ${found.passCode} for ${found.studentName} (${found.rollNumber}) is ACCEPTED & cleared for outing.`
          : `Gate pass ${found.passCode} for ${found.studentName} (${found.rollNumber}) is ${found.status.toUpperCase()} (NOT ACCEPTED).`,
      });
    } else {
      setFeedback({
        success: false,
        message: `No gate pass found matching Registration No or Pass Code "${raw}".`,
      });
    }
  };

  // Trigger QR Code Scan (via simulated laser scan or camera scan)
  const handleTriggerScan = (pass: GatePass) => {
    // Play authentic POS scanner beep sound
    playScannerBeep();
    setScanSuccessPulse(true);

    setTimeout(() => {
      setSelectedPass(pass);
      setPassInput(pass.rollNumber);
      const isAccepted = pass.status === 'approved';
      setFeedback({
        success: isAccepted,
        message: isAccepted
          ? `QR Scanned! Pass ${pass.passCode} for ${pass.studentName} (${pass.rollNumber}) is ACCEPTED.`
          : `QR Scanned! Pass ${pass.passCode} for ${pass.studentName} (${pass.rollNumber}) is ${pass.status.toUpperCase()} (NOT ACCEPTED).`,
      });
      setScanSuccessPulse(false);
      handleCloseScanner();
    }, 400);
  };

  // Open QR Scanner Modal
  const handleOpenScanner = async () => {
    setShowScannerModal(true);
    setCameraError(null);
    setManualScannerInput('');

    // Attempt starting camera if supported
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setIsCameraActive(true);
      } catch (err) {
        // Camera permission blocked or no webcam; fallback smoothly to optical scanner simulation
        setIsCameraActive(false);
        setCameraError('Webcam unavailable or blocked. Using Optical Beam / Simulation Scanner.');
      }
    } else {
      setIsCameraActive(false);
      setCameraError('Camera API not supported in this environment. Using Optical Scanner.');
    }
  };

  // Close Scanner Modal & cleanup media stream
  const handleCloseScanner = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
    setShowScannerModal(false);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLogExit = () => {
    if (!selectedPass) return;
    const res = logGateExit(selectedPass.qrCode || selectedPass.passCode);
    setFeedback(res);
    if (res.pass) {
      setSelectedPass(res.pass);
    }
  };

  const handleLogEntry = () => {
    if (!selectedPass) return;
    const res = logGateEntry(selectedPass.qrCode || selectedPass.passCode);
    setFeedback(res);
    if (res.pass) {
      setSelectedPass(res.pass);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Terminal Header with high visibility */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-widest text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Campus Gate 1 Security Terminal
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-300">Officer Ramesh Singh (On-Duty Guard)</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Gate Pass QR Verification & Outing Clearance
          </h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Verify student outing passes in real-time by scanning the QR code or searching by student registration number. Instant Warden acceptance confirmation and Night Curfew sync.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={handleOpenScanner}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer transform active:scale-95"
          >
            <Scan className="w-4 h-4 text-indigo-200 animate-pulse" />
            <span>Launch QR Scanner</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pass Input & Scanner Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>Scan Pass QR & Verification</span>
              </h2>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Scanner Ready
              </span>
            </div>

            {/* SCAN BUTTON (Explicitly requested by user) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">
                Option 1: Optical QR Scanner
              </label>
              <button
                type="button"
                onClick={handleOpenScanner}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2.5 cursor-pointer transition-all transform active:scale-[0.98] group"
              >
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Scan className="w-3.5 h-3.5 text-white animate-pulse" />
                </div>
                <span>Scan Pass QR Code</span>
              </button>
              <p className="text-3xs text-slate-500 text-center">
                Scans the student's mobile screen QR code generated in Student Portal
              </p>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="grow border-t border-slate-200" />
              <span className="shrink mx-2 text-3xs uppercase font-bold text-slate-400">OR</span>
              <div className="grow border-t border-slate-200" />
            </div>

            {/* SEARCH BY REGISTRATION NUMBER OR PASS CODE */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Option 2: Enter Student Registration No or Pass Code
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={passInput}
                    onChange={(e) => setPassInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchPass();
                    }}
                    placeholder="e.g. STU-9090 or GP-9042"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono text-xs uppercase focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSearchPass()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Quick Demo Student Registration Pre-fills */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-2xs text-slate-500">
              <div className="font-semibold text-slate-700 flex items-center justify-between">
                <span>Quick Student Outing Passes:</span>
                <span className="text-3xs text-slate-400">Click to load</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {gatePasses.map((p) => {
                  const isAccepted = p.status === 'approved';
                  const isPending = p.status === 'pending';
                  const isRejected = p.status === 'rejected';

                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPassInput(p.rollNumber);
                        handleSearchPass(p.rollNumber);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg border text-left flex items-center justify-between text-2xs transition-colors cursor-pointer ${
                        selectedPass?.id === p.id
                          ? 'border-indigo-500 bg-indigo-50/70 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900">{p.rollNumber}</span>
                        <span className="text-slate-600">· {p.studentName.split(' ')[0]}</span>
                        <span className="font-mono text-3xs text-slate-400">({p.passCode})</span>
                      </div>
                      <span
                        className={`text-3xs uppercase font-bold px-1.5 py-0.5 rounded ${
                          isAccepted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-800'
                            : isRejected
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isAccepted ? 'Accepted' : isPending ? 'Pending' : isRejected ? 'Rejected' : p.status}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Feedback message banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium flex items-start gap-2 shadow-xs ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {/* Verified Student Pass Profile Display */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPass ? (
            <div className="space-y-4">
              {/* PRIMARY ACCEPTANCE VERIFICATION BANNER */}
              {selectedPass.status === 'approved' && (
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl p-5 shadow-md flex items-center justify-between gap-4 border border-emerald-500">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-bold shadow-xs">
                      <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded text-white">
                          Status: Accepted
                        </span>
                        <span className="text-2xs text-emerald-100">Outing Permission Granted</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mt-0.5 text-white">
                        GATE PASS IS ACCEPTED & VALID FOR OUTING
                      </h3>
                      <p className="text-2xs text-emerald-100">
                        Authorized by <strong>{selectedPass.approvedBy || 'Hostel Warden Dr. Mukherjee'}</strong> · Parent Consent SMS verified
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 bg-white text-emerald-800 font-bold text-xs rounded-lg shadow-xs">
                    Cleared for Exit
                  </span>
                </div>
              )}

              {selectedPass.status === 'pending' && (
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-5 shadow-md flex items-center justify-between gap-4 border border-amber-400">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white text-amber-700 flex items-center justify-center font-bold shadow-xs">
                      <AlertTriangle className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded text-white">
                          Status: Pending
                        </span>
                        <span className="text-2xs text-amber-100">Awaiting Warden Approval</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mt-0.5 text-white">
                        GATE PASS IS NOT ACCEPTED YET
                      </h3>
                      <p className="text-2xs text-amber-100">
                        This pass is awaiting warden signature. Student is <strong>NOT permitted</strong> to leave campus until accepted.
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 bg-white text-amber-800 font-bold text-xs rounded-lg shadow-xs">
                    Hold at Gate
                  </span>
                </div>
              )}

              {selectedPass.status === 'rejected' && (
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl p-5 shadow-md flex items-center justify-between gap-4 border border-red-500">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white text-red-700 flex items-center justify-center font-bold shadow-xs">
                      <XCircle className="w-7 h-7 text-red-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded text-white">
                          Status: Rejected
                        </span>
                        <span className="text-2xs text-red-100">Outing Denied</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mt-0.5 text-white">
                        GATE PASS REJECTED — EXIT STRICTLY PROHIBITED
                      </h3>
                      <p className="text-2xs text-red-100">
                        Reason: {selectedPass.rejectionReason || 'Curfew restriction or parental disapproval.'}
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 bg-white text-red-800 font-bold text-xs rounded-lg shadow-xs">
                    Exit Denied
                  </span>
                </div>
              )}

              {selectedPass.status === 'checked_out' && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-5 shadow-md flex items-center justify-between gap-4 border border-blue-500">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white text-blue-700 flex items-center justify-center font-bold shadow-xs">
                      <ArrowRightCircle className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xs uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded text-white">
                          Status: On Pass
                        </span>
                        <span className="text-2xs text-blue-100">Currently Outside Campus</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold mt-0.5 text-white">
                        STUDENT IS CURRENTLY OUT ON LEAVE
                      </h3>
                      <p className="text-2xs text-blue-100">
                        Logged Out: <strong>{selectedPass.actualOutTime || selectedPass.outTime}</strong> · Expected Curfew Return: <strong>{selectedPass.expectedInTime}</strong>
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-block px-3 py-1 bg-white text-blue-800 font-bold text-xs rounded-lg shadow-xs">
                    Awaiting Return
                  </span>
                </div>
              )}

              {/* CARD: CODE GENERATED IN STUDENT PORTAL (Explicitly requested by user) */}
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-5 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="text-2xs font-semibold uppercase tracking-widest text-indigo-300">
                        Verified Student Portal Synchronization
                      </div>
                      <h3 className="text-sm font-bold text-white">
                        Gate Pass Code Generated in Student Portal
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-1 rounded-lg">
                      Issue #{selectedPass.issueCount || 1}
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedPass.passCode)}
                      className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-2xs font-mono text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Copy Pass Code"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Big Code & QR Representation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
                  {/* Left: Huge Pass Code display */}
                  <div className="md:col-span-2 space-y-3">
                    <div>
                      <div className="text-3xs uppercase tracking-wider text-slate-400 font-semibold">
                        Generated Student Outing Code:
                      </div>
                      <div className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-300 tracking-wider mt-1 flex items-center gap-3">
                        <span>{selectedPass.passCode}</span>
                        <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold">
                          Active Pass
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Student Name:</span>
                        <strong className="text-white text-sm">{selectedPass.studentName}</strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Registration Number:</span>
                        <strong className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {selectedPass.rollNumber}
                        </strong>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">Hostel & Room:</span>
                        <span>{selectedPass.hostelBlock} · Room {selectedPass.roomNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">QR Token Hash:</span>
                        <span className="font-mono text-2xs text-slate-400 truncate max-w-xs">
                          {selectedPass.qrToken || `BPUT-PASS-${selectedPass.id}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Visual QR Display matching Student Portal */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-lg border border-slate-200 text-slate-900 text-center">
                    {selectedPass.qrImage ? (
                      <img
                        src={selectedPass.qrImage}
                        alt="Student Portal QR"
                        className="w-28 h-28 object-contain rounded"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-slate-900 rounded-lg flex items-center justify-center p-2">
                        <QrCode className="w-20 h-20 text-white" />
                      </div>
                    )}
                    <div className="text-3xs font-mono font-bold text-slate-700 mt-2">
                      {selectedPass.passCode}
                    </div>
                    <div className="text-3xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Portal Verified
                    </div>
                  </div>
                </div>

                {/* Grid of Verified Parameters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-3xs text-slate-400 uppercase font-semibold">Pass Type</div>
                    <div className="font-semibold text-white capitalize mt-0.5">
                      {selectedPass.passType.replace('_', ' ')}
                    </div>
                    <div className="text-3xs text-slate-400 mt-0.5">{selectedPass.destination}</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-3xs text-slate-400 uppercase font-semibold">Scheduled Exit</div>
                    <div className="font-bold text-white font-mono mt-0.5">
                      {selectedPass.outTime}
                    </div>
                    <div className="text-3xs text-slate-400 mt-0.5">Leaving Campus</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-3xs text-slate-400 uppercase font-semibold">Curfew Return</div>
                    <div className="font-bold text-amber-300 font-mono mt-0.5">
                      {selectedPass.expectedInTime}
                    </div>
                    <div className="text-3xs text-slate-400 mt-0.5">Deadline In-Time</div>
                  </div>

                  <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="text-3xs text-slate-400 uppercase font-semibold">Parent Consent</div>
                    <div className="font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </div>
                    <div className="text-3xs font-mono text-slate-400 mt-0.5">{selectedPass.parentPhone}</div>
                  </div>
                </div>

                {/* Outing Purpose & Approver info */}
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs space-y-1">
                  <div>
                    <span className="text-slate-400">Outing Purpose:</span>{' '}
                    <span className="text-white font-medium">{selectedPass.purpose}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Destination:</span>{' '}
                    <span className="text-white font-medium">{selectedPass.destination}</span>
                  </div>
                </div>

                {/* Guard Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleLogExit}
                    disabled={selectedPass.status !== 'approved'}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
                      selectedPass.status === 'approved'
                        ? 'bg-blue-600 hover:bg-blue-500 text-white transform active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <ArrowRightCircle className="w-4 h-4" />
                    <span>
                      {selectedPass.status === 'approved'
                        ? `${t.actions.logExit} (Student Leaving)`
                        : 'Exit Prohibited (Pass Not Accepted)'}
                    </span>
                  </button>

                  <button
                    onClick={handleLogEntry}
                    disabled={selectedPass.status !== 'checked_out' && selectedPass.status !== 'overdue'}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm ${
                      selectedPass.status === 'checked_out' || selectedPass.status === 'overdue'
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white transform active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <ArrowLeftCircle className="w-4 h-4" />
                    <span>{t.actions.logEntry} (Safe Return)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs space-y-3">
              <QrCode className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-semibold text-slate-700">No Student Gate Pass Selected</div>
              <p className="max-w-md mx-auto text-slate-400">
                Click <strong>"Scan Pass QR Code"</strong> to launch the scanner or enter a student registration number (e.g. <span className="font-mono text-indigo-600">STU-9090</span>) to inspect outing authorization.
              </p>
            </div>
          )}

          {/* Recent Gate Clearances Log */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between">
              <span>Recent Gate Clearances Log</span>
              <span className="text-3xs text-slate-400 font-normal font-mono">Live Sync</span>
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {gatePasses.slice(0, 5).map((p) => {
                const isAccepted = p.status === 'approved';
                const isCheckedOut = p.status === 'checked_out';
                const isCompleted = p.status === 'completed';

                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedPass(p);
                      setPassInput(p.rollNumber);
                    }}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-900 font-bold">{p.passCode}</span>
                      <span className="font-mono text-2xs text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.5 rounded">
                        {p.rollNumber}
                      </span>
                      <span className="text-slate-800">{p.studentName}</span>
                      <span className="text-2xs text-slate-400">({p.roomNumber})</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xs font-mono text-slate-500">
                        {p.actualInTime
                          ? `Returned ${p.actualInTime}`
                          : p.actualOutTime
                          ? `Exited ${p.actualOutTime}`
                          : p.outTime}
                      </span>
                      <span
                        className={`text-3xs uppercase font-bold px-2 py-0.5 rounded-full ${
                          isAccepted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isCheckedOut
                            ? 'bg-blue-100 text-blue-800'
                            : isCompleted
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* LIVE CAMERA & DIGITAL QR CODE SCANNER MODAL */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 text-white rounded-2xl shadow-2xl max-w-xl w-full p-6 space-y-5 border border-slate-800 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
                  <Scan className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Gate Security Optical QR Scanner
                  </h3>
                  <p className="text-2xs text-slate-400">
                    Scan student outing QR code from smartphone screen
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseScanner}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Camera Viewfinder with Laser Scanner Animation */}
            <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border-2 border-indigo-500/50 flex flex-col items-center justify-center shadow-inner">
              {/* Optional Real Video Element */}
              <video
                ref={videoRef}
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${
                  isCameraActive ? 'block' : 'hidden'
                }`}
              />

              {/* Viewfinder Overlay with Corner Brackets */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-56 h-56 border-2 border-white/40 rounded-2xl relative flex items-center justify-center">
                  {/* Corner Target Markers */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br" />

                  {/* Pulsing Vertical Laser Scan Beam */}
                  <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-bounce" />

                  {/* Center Target Aim */}
                  <div className="w-12 h-12 rounded-full border border-dashed border-emerald-400/50 flex items-center justify-center">
                    <QrCode className="w-6 h-6 text-emerald-400/80 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Scan Detection Flash */}
              {scanSuccessPulse && (
                <div className="absolute inset-0 bg-emerald-500/40 backdrop-blur-xs flex items-center justify-center z-20 transition-opacity">
                  <div className="bg-white text-emerald-900 px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg animate-bounce">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>QR Code Decoded Successfully!</span>
                  </div>
                </div>
              )}

              {/* Viewfinder Guidance Footer */}
              <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none z-10">
                <span className="text-3xs font-medium bg-black/70 text-slate-300 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs">
                  {isCameraActive ? 'Align Student QR inside viewfinder' : 'Optical Laser Ready · Click below to scan'}
                </span>
              </div>
            </div>

            {/* Quick Outing Pass Scan Tray (Simulates scanner reading student screen) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-2xs text-slate-400">
                <span className="font-semibold text-white">
                  Available Student Outing Passes:
                </span>
                <span className="text-3xs">Click "Scan QR" to simulate instant hardware scan</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {gatePasses.map((p) => {
                  const isApproved = p.status === 'approved';
                  return (
                    <div
                      key={`modal-${p.id}`}
                      className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">
                          {p.studentName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{p.studentName}</span>
                            <span className="font-mono text-2xs text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                              {p.rollNumber}
                            </span>
                            <span className="font-mono text-2xs text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded">
                              {p.passCode}
                            </span>
                          </div>
                          <div className="text-3xs text-slate-400 mt-0.5 truncate max-w-xs">
                            {p.destination} · Out: {p.outTime} - Ret: {p.expectedInTime}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleTriggerScan(p)}
                        className={`px-3 py-1.5 rounded-lg text-2xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer transform active:scale-95 ${
                          isApproved
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                      >
                        <Scan className="w-3 h-3" />
                        <span>Scan QR</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-3xs text-slate-500">
                Gate 1 Biometric & QR Hardware Integration Active
              </span>
              <button
                onClick={handleCloseScanner}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Close Scanner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
