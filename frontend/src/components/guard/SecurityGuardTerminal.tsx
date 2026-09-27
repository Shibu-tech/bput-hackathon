import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { translations } from '../../utils/translations';
import { GatePass } from '../../types';
import {
  ShieldCheck,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRightCircle,
  ArrowLeftCircle,
  Clock,
  User,
} from 'lucide-react';

export const SecurityGuardTerminal: React.FC = () => {
  const {
    language,
    gatePasses,
    logGateExit,
    logGateEntry,
  } = useCampusOps();

  const t = translations[language];

  const [passInput, setPassInput] = useState('GP-9042');
  const [selectedPass, setSelectedPass] = useState<GatePass | null>(() => {
    return gatePasses.find((p) => p.passCode === 'GP-9042') || gatePasses[0] || null;
  });
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleSearchPass = (codeToSearch?: string) => {
    const code = (codeToSearch || passInput).trim().toUpperCase();
    const found = gatePasses.find((p) => p.passCode.toUpperCase() === code);
    if (found) {
      setSelectedPass(found);
      setFeedback(null);
    } else {
      setFeedback({ success: false, message: `Pass code ${code} not found in database.` });
    }
  };

  const handleLogExit = () => {
    if (!selectedPass) return;
    const res = logGateExit(selectedPass.passCode);
    setFeedback(res);
    if (res.pass) {
      setSelectedPass(res.pass);
    }
  };

  const handleLogEntry = () => {
    if (!selectedPass) return;
    const res = logGateEntry(selectedPass.passCode);
    setFeedback(res);
    if (res.pass) {
      setSelectedPass(res.pass);
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Terminal Header with high visibility */}
      <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs uppercase tracking-widest text-emerald-400 font-semibold">
              Main Campus Gate 1 Terminal
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-300">Ramesh Singh (Head Guard On-Duty)</span>
          </div>
          <h1 className="text-xl font-bold text-white mt-1">
            {t.labels.activePass} & Gate Verification Terminal
          </h1>
          <p className="text-xs text-slate-300">
            Real-time biometric & QR pass check · Instant synchronization with Warden Night Curfew Roll Call.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            RFID & QR Scanner Active
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pass Input & Scanner Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-indigo-600" />
                <span>{t.actions.scanQR} / Pass Code</span>
              </h2>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
                placeholder="e.g. GP-9042"
                className="w-full px-3 py-2 border border-slate-300 rounded-md font-mono text-xs uppercase focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                onClick={() => handleSearchPass()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-md cursor-pointer transition-colors"
              >
                Search
              </button>
            </div>

            {/* Quick Demo Pre-fills */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 text-2xs text-slate-500">
              <div className="font-semibold text-slate-700">Quick Test Scanner Codes:</div>
              <div className="flex flex-wrap gap-1.5">
                {gatePasses.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPassInput(p.passCode);
                      handleSearchPass(p.passCode);
                    }}
                    className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 font-mono rounded cursor-pointer transition-colors"
                  >
                    {p.passCode} ({p.studentName.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback message banner */}
          {feedback && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium ${
                feedback.success
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-red-50 text-red-900 border-red-200'
              }`}
            >
              {feedback.message}
            </div>
          )}
        </div>

        {/* Verified Student Pass Profile Display */}
        <div className="lg:col-span-2 space-y-4">
          {selectedPass ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400">
                    Student Gate Authorization
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h2 className="text-lg font-bold text-slate-900">{selectedPass.studentName}</h2>
                    <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {selectedPass.rollNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase px-2.5 py-1 rounded ${
                      selectedPass.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedPass.status === 'checked_out'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedPass.status === 'overdue'
                        ? 'bg-red-600 text-white animate-pulse'
                        : selectedPass.status === 'completed'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedPass.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Grid of verified parameters */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-2xs text-slate-400 font-medium">Room & Block</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    Room {selectedPass.roomNumber}
                  </div>
                  <div className="text-3xs text-slate-500">{selectedPass.hostelBlock}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-2xs text-slate-400 font-medium">Pass Type</div>
                  <div className="font-semibold text-slate-900 capitalize mt-0.5">
                    {selectedPass.passType.replace('_', ' ')}
                  </div>
                  <div className="text-3xs text-slate-500">{selectedPass.passCode}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="text-2xs text-slate-400 font-medium">Curfew Expected Return</div>
                  <div className="font-bold text-slate-900 font-mono mt-0.5">
                    {selectedPass.expectedInTime}
                  </div>
                  <div className="text-3xs text-slate-500">Scheduled Out: {selectedPass.outTime}</div>
                </div>
              </div>

              {/* Destination & Parent status */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-1.5">
                <div>
                  <span className="font-semibold text-slate-700">Destination:</span>{' '}
                  <span className="text-slate-900">{selectedPass.destination}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Purpose:</span>{' '}
                  <span className="text-slate-600">{selectedPass.purpose}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-2xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Parent Consent Verified ({selectedPass.parentPhone})
                  </span>
                  {selectedPass.approvedBy && (
                    <span className="text-slate-500">Approved by: {selectedPass.approvedBy}</span>
                  )}
                </div>
              </div>

              {/* Guard Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleLogExit}
                  disabled={selectedPass.status !== 'approved'}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs ${
                    selectedPass.status === 'approved'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowRightCircle className="w-4 h-4" />
                  {t.actions.logExit}
                </button>

                <button
                  onClick={handleLogEntry}
                  disabled={selectedPass.status !== 'checked_out' && selectedPass.status !== 'overdue'}
                  className={`flex-1 py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs ${
                    selectedPass.status === 'checked_out' || selectedPass.status === 'overdue'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <ArrowLeftCircle className="w-4 h-4" />
                  {t.actions.logEntry} (Safe Return)
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs shadow-xs">
              Scan or enter a pass code on the left to review student credentials.
            </div>
          )}

          {/* Live Gate Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Recent Gate Clearances Log
            </h3>
            <div className="divide-y divide-slate-100 text-xs">
              {gatePasses.slice(0, 4).map((p) => (
                <div key={p.id} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-900 font-bold">{p.passCode}</span>
                    <span className="text-slate-800">{p.studentName}</span>
                    <span className="text-2xs text-slate-400">({p.roomNumber})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-mono text-slate-500">
                      {p.actualInTime ? `Returned ${p.actualInTime}` : p.actualOutTime ? `Exited ${p.actualOutTime}` : 'Approved'}
                    </span>
                    <span
                      className={`text-3xs uppercase font-bold px-1.5 py-0.5 rounded ${
                        p.status === 'completed'
                          ? 'bg-slate-100 text-slate-700'
                          : p.status === 'checked_out'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {p.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
