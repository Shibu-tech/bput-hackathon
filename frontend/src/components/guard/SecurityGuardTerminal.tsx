import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { translations } from '../../utils/translations';
import { GatePass } from '../../types';
import { playScannerBeep } from '../../utils/audioAlert';
import {
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  Camera,
  QrCode,
  CheckCircle2,
  Clock,
  User,
  X,
  Search,
  Calendar,
  AlertCircle,
  Building,
  RefreshCw,
} from 'lucide-react';

export const SecurityGuardTerminal: React.FC = () => {
  const {
    language,
    gatePasses,
    logGateExit,
    logGateEntry,
  } = useCampusOps();

  const t = translations[language];

  // 1. Two Primary Modes: 'out' (Student Leaving Campus) vs 'in' (Student Entering Campus)
  const [scanMode, setScanMode] = useState<'out' | 'in'>('out');

  // 2. Scanner & Camera States
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [lastScannedResult, setLastScannedResult] = useState<{
    pass: GatePass;
    mode: 'out' | 'in';
    timestamp: string;
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Clock
  const [currentTimeStr, setCurrentTimeStr] = useState(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Start Camera Stream
  const startCamera = async () => {
    setCameraError(null);
    setErrorMessage(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser. Please use the quick manual input below.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setIsCameraActive(false);
      setCameraError('Camera permission blocked or webcam unavailable. You can use manual input or instant test scan.');
    }
  };

  // Stop Camera Stream
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Continuous Barcode / QR detection if BarcodeDetector is available
  useEffect(() => {
    if (!isCameraActive || !videoRef.current) return;

    let isScanning = true;

    if ('BarcodeDetector' in window) {
      const detector = new (window as any).BarcodeDetector({
        formats: ['qr_code', 'code_128', 'ean_13'],
      });

      const scanLoop = async () => {
        if (!isScanning || !videoRef.current || videoRef.current.readyState < 2) {
          if (isScanning) {
            animationFrameRef.current = requestAnimationFrame(scanLoop);
          }
          return;
        }

        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            const codeValue = barcodes[0].rawValue;
            if (codeValue) {
              handleProcessScan(codeValue);
              stopCamera();
              return;
            }
          }
        } catch (e) {
          // Frame scan error or unsupported frame
        }

        if (isScanning) {
          animationFrameRef.current = requestAnimationFrame(scanLoop);
        }
      };

      animationFrameRef.current = requestAnimationFrame(scanLoop);
    }

    return () => {
      isScanning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isCameraActive, scanMode]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Core Scan Processor: Applies selected mode ('out' or 'in') to the scanned student
  const handleProcessScan = (codeToProcess: string) => {
    const raw = (codeToProcess || '').trim();
    if (!raw) {
      setErrorMessage('Please enter or scan a student QR code or Registration Number.');
      return;
    }

    setErrorMessage(null);
    playScannerBeep();

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (scanMode === 'out') {
      // 1. Register OUT time of that student
      const result = logGateExit(raw);
      if (result.success && result.pass) {
        setLastScannedResult({
          pass: result.pass,
          mode: 'out',
          timestamp,
          message: result.message,
        });
        setManualInput('');
      } else {
        setErrorMessage(result.message || 'Could not verify student exit.');
      }
    } else {
      // 2. Register IN time of that student
      const result = logGateEntry(raw);
      if (result.success && result.pass) {
        setLastScannedResult({
          pass: result.pass,
          mode: 'in',
          timestamp,
          message: result.message,
        });
        setManualInput('');
      } else {
        setErrorMessage(result.message || 'Could not verify student entry.');
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      handleProcessScan(manualInput.trim());
    }
  };

  // Sort Recent Clearances by newest timestamp or clearedAt
  const recentClearances = [...gatePasses]
    .filter((p) => p.actualOutTime || p.actualInTime || p.status === 'checked_out' || p.status === 'completed')
    .sort((a, b) => {
      const aTime = typeof a.clearedAt === 'number' ? a.clearedAt : 0;
      const bTime = typeof b.clearedAt === 'number' ? b.clearedAt : 0;
      return bTime - aTime;
    });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* 1. Header with Live Clock */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
            <ShieldCheck className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900">
              Sahaj Gate Security Terminal
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <span>Main Gate 01</span>
              <span>·</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Shift Active
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl font-mono text-slate-800">
          <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
          <div className="text-right">
            <div className="text-xs font-bold">{currentTimeStr}</div>
            <div className="text-3xs text-slate-400">Campus Official Time</div>
          </div>
        </div>
      </div>

      {/* 2. Main Scanner Control Center */}
      <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Step 1: Two Clear Options: OUT vs IN */}
        <div>
          <div className="text-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 1: Select Movement Direction Before Scanning
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            {/* OUT OPTION */}
            <button
              type="button"
              onClick={() => setScanMode('out')}
              className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer text-left relative ${
                scanMode === 'out'
                  ? 'border-amber-500 bg-amber-500 text-white shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'border-slate-200 bg-white hover:border-amber-400 text-slate-800 hover:bg-amber-50/30'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  scanMode === 'out' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                }`}
              >
                <ArrowUpRight className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-black tracking-tight leading-none mb-1">
                  OUT
                </div>
                <div
                  className={`text-xs ${
                    scanMode === 'out' ? 'text-amber-100' : 'text-slate-500'
                  }`}
                >
                  Student Leaving Campus
                </div>
                <div
                  className={`text-3xs mt-1 font-semibold ${
                    scanMode === 'out' ? 'text-white' : 'text-amber-700'
                  }`}
                >
                  &rarr; Registers OUT Time
                </div>
              </div>
              {scanMode === 'out' && (
                <div className="w-6 h-6 rounded-full bg-white text-amber-600 flex items-center justify-center text-xs font-bold shadow-xs">
                  ✓
                </div>
              )}
            </button>

            {/* IN OPTION */}
            <button
              type="button"
              onClick={() => setScanMode('in')}
              className={`p-5 rounded-2xl border-2 transition-all flex items-center gap-4 cursor-pointer text-left relative ${
                scanMode === 'in'
                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 scale-[1.02]'
                  : 'border-slate-200 bg-white hover:border-emerald-400 text-slate-800 hover:bg-emerald-50/30'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  scanMode === 'in' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <ArrowDownLeft className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="text-lg font-black tracking-tight leading-none mb-1">
                  IN
                </div>
                <div
                  className={`text-xs ${
                    scanMode === 'in' ? 'text-emerald-100' : 'text-slate-500'
                  }`}
                >
                  Student Entering Campus
                </div>
                <div
                  className={`text-3xs mt-1 font-semibold ${
                    scanMode === 'in' ? 'text-white' : 'text-emerald-800'
                  }`}
                >
                  &rarr; Registers IN Time
                </div>
              </div>
              {scanMode === 'in' && (
                <div className="w-6 h-6 rounded-full bg-white text-emerald-700 flex items-center justify-center text-xs font-bold shadow-xs">
                  ✓
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Camera Scanner Trigger & Viewfinder */}
        <div className="border-t border-slate-100 pt-6 max-w-xl mx-auto space-y-4">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Step 2: Scan Student QR Pass
            </span>
          </div>

          {!isCameraActive ? (
            <button
              type="button"
              onClick={startCamera}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-white flex items-center justify-center gap-3 shadow-md transition-all cursor-pointer ${
                scanMode === 'out'
                  ? 'bg-slate-900 hover:bg-slate-800 active:scale-98'
                  : 'bg-emerald-700 hover:bg-emerald-800 active:scale-98'
              }`}
            >
              <Camera className="w-6 h-6 text-indigo-400" />
              <span className="text-base tracking-wide">
                Open Camera Scanner ({scanMode.toUpperCase()} Mode)
              </span>
            </button>
          ) : (
            <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3 relative overflow-hidden shadow-xl border-2 border-indigo-500/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  Live Camera Scanner Active · Mode: [
                  <strong className={scanMode === 'out' ? 'text-amber-400' : 'text-emerald-400'}>
                    {scanMode.toUpperCase()}
                  </strong>
                  ]
                </span>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Close Camera</span>
                </button>
              </div>

              {/* Video Feed & Reticle */}
              <div className="relative aspect-video sm:aspect-[4/3] bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Reticle / Viewfinder Frame */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-indigo-400/80 rounded-2xl relative">
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-white" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-white" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-white" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-white" />
                    {/* Laser scanning line */}
                    <div
                      className={`absolute left-0 right-0 h-0.5 animate-bounce ${
                        scanMode === 'out' ? 'bg-amber-400 shadow-lg shadow-amber-400' : 'bg-emerald-400 shadow-lg shadow-emerald-400'
                      }`}
                    />
                  </div>
                </div>

                <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
                  <span className="text-3xs bg-black/70 px-3 py-1 rounded-full text-slate-300 font-medium">
                    Point camera at Student's Permanent Day Pass QR or Long Leave QR
                  </span>
                </div>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Quick Manual Input / Barcode Scanner Gun Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Or enter Roll No / Scan Barcode (e.g. STU-9090, GP-9042)"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <button
                type="submit"
                className={`px-4 py-2.5 rounded-xl font-bold text-xs text-white cursor-pointer shadow-xs transition-colors ${
                  scanMode === 'out' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Log {scanMode.toUpperCase()}
              </button>
            </div>
          </form>

          {/* Quick Test Demo Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-3xs text-slate-500">
            <span className="font-semibold text-slate-600">Quick Test Pass:</span>
            {[
              { label: 'STU-9090 (Anish)', code: 'STU-9090' },
              { label: 'STU-4821 (Rahul)', code: 'STU-4821' },
              { label: 'STU-3312 (Siddharth - Long Leave)', code: 'STU-3312' },
              { label: 'GP-9042', code: 'GP-9042' },
            ].map((chip) => (
              <button
                key={chip.code}
                type="button"
                onClick={() => handleProcessScan(chip.code)}
                className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-md font-mono cursor-pointer transition-colors"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-600 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Confirmation Card: Displays registered OUT or IN time */}
        {lastScannedResult && (
          <div
            className={`p-5 rounded-2xl border-2 transition-all shadow-sm ${
              lastScannedResult.mode === 'out'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-black/10">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-6 h-6 shrink-0 ${
                    lastScannedResult.mode === 'out' ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                />
                <div>
                  <span
                    className={`text-2xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      lastScannedResult.mode === 'out'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    {lastScannedResult.mode === 'out'
                      ? 'OUT TIME REGISTERED'
                      : 'IN TIME REGISTERED (RETURNED SAFELY)'}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-0.5">
                    {lastScannedResult.pass.studentName}
                  </h3>
                </div>
              </div>

              <div className="text-right font-mono">
                <div className="text-sm font-black text-slate-900">
                  {lastScannedResult.mode === 'out'
                    ? lastScannedResult.pass.actualOutTime || lastScannedResult.timestamp
                    : lastScannedResult.pass.actualInTime || lastScannedResult.timestamp}
                </div>
                <div className="text-3xs text-slate-500">Registered Timestamp</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-3xs text-slate-500 block uppercase">Registration No</span>
                <span className="font-mono font-bold text-slate-900">
                  {lastScannedResult.pass.rollNumber}
                </span>
              </div>
              <div>
                <span className="text-3xs text-slate-500 block uppercase">Room & Hostel</span>
                <span className="font-semibold text-slate-900">
                  {lastScannedResult.pass.hostelBlock} · Room {lastScannedResult.pass.roomNumber}
                </span>
              </div>
              <div>
                <span className="text-3xs text-slate-500 block uppercase">Pass Category</span>
                <span className="font-semibold text-slate-900">
                  {lastScannedResult.pass.passType === 'long_leave' ||
                  lastScannedResult.pass.passType === 'weekend_leave'
                    ? 'Long Leave'
                    : 'Permanent Day Pass'}
                </span>
              </div>
              <div>
                <span className="text-3xs text-slate-500 block uppercase">Current Status</span>
                <span
                  className={`inline-block font-bold px-2 py-0.5 rounded text-2xs uppercase ${
                    lastScannedResult.pass.status === 'completed'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-200 text-amber-900'
                  }`}
                >
                  {lastScannedResult.pass.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {lastScannedResult.pass.leaveDate && (
              <div className="mt-3 p-2 bg-white/70 rounded-lg text-2xs font-semibold text-indigo-900 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>
                  Authorized Long Leave: {lastScannedResult.pass.leaveDate} &rarr;{' '}
                  {lastScannedResult.pass.returnDate || 'Return Date'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Recent Gate Clearance Logs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Recent Gate Clearance Logs
            </h2>
            <p className="text-xs text-slate-500">
              Live register of student campus exits and safe returns
            </p>
          </div>
          <span className="text-2xs font-semibold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600">
            {recentClearances.length} Active Records Today
          </span>
        </div>

        {recentClearances.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <QrCode className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            No gate movements logged yet today. Use the scanner above to record student exits and entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-2xs uppercase">
                  <th className="pb-2.5">Student Details</th>
                  <th className="pb-2.5">Pass Type</th>
                  <th className="pb-2.5">Out Time</th>
                  <th className="pb-2.5">In Time</th>
                  <th className="pb-2.5">Current State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentClearances.map((p) => {
                  const isLongLeave = p.passType === 'long_leave' || p.passType === 'weekend_leave';
                  const isCheckedOut = p.status === 'checked_out';
                  const isCompleted = p.status === 'completed';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-sans">
                        <div className="font-bold text-slate-900">{p.studentName}</div>
                        <div className="text-2xs text-slate-500 font-mono">
                          {p.rollNumber} · {p.roomNumber} ({p.hostelBlock})
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-2xs font-semibold ${
                            isLongLeave
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}
                        >
                          {isLongLeave ? 'Long Leave' : 'Day Pass'}
                        </span>
                        {p.leaveDate && (
                          <div className="text-3xs text-slate-400 font-mono mt-0.5">
                            {p.leaveDate} &rarr; {p.returnDate || 'Return'}
                          </div>
                        )}
                      </td>
                      <td className="py-3 font-mono">
                        {p.actualOutTime ? (
                          <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-2xs">
                            {p.actualOutTime}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-2xs">--</span>
                        )}
                      </td>
                      <td className="py-3 font-mono">
                        {p.actualInTime ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-2xs">
                            {p.actualInTime}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-2xs">Pending Return</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase ${
                            isCheckedOut
                              ? 'bg-amber-100 text-amber-800'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isCheckedOut && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                          {isCompleted && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                          {isCheckedOut ? 'On Outing (OUT)' : isCompleted ? 'Inside Campus (IN)' : p.status}
                        </span>
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
  );
};
