import React, { useState } from 'react';
import { useCampusOps } from '../../context/CampusOpsContext';
import { translations } from '../../utils/translations';
import {
  Monitor,
  Printer,
  QrCode,
  Utensils,
  Wrench,
  AlertOctagon,
  LogOut,
  CheckCircle2,
  Barcode,
} from 'lucide-react';
import kioskImg from '../../assets/images/campus_kiosk_terminal_1790190029128.jpg';

export const SelfServiceKiosk: React.FC = () => {
  const {
    language,
    gatePasses,
    complaints,
    messCheckIn,
  } = useCampusOps();

  const t = translations[language];

  const [inputRoll, setInputRoll] = useState('2024CS0842');
  const [authenticatedStudent, setAuthenticatedStudent] = useState<{
    name: string;
    roll: string;
    room: string;
    block: string;
  } | null>(null);

  const [printedSlip, setPrintedSlip] = useState<{
    type: string;
    title: string;
    tokenCode: string;
    details: string;
    timestamp: string;
  } | null>(null);

  const handleKeypadPress = (val: string) => {
    if (val === 'CLEAR') {
      setInputRoll('');
    } else if (val === 'BACK') {
      setInputRoll((prev) => prev.slice(0, -1));
    } else {
      setInputRoll((prev) => (prev.length < 12 ? prev + val : prev));
    }
  };

  const handleKioskLogin = () => {
    if (!inputRoll.trim()) return;
    const cleanRoll = inputRoll.trim().toUpperCase();
    const existingPass = gatePasses.find((p) => p.rollNumber.toUpperCase() === cleanRoll);
    setAuthenticatedStudent({
      name: existingPass?.studentName || `Student (${cleanRoll})`,
      roll: cleanRoll,
      room: existingPass?.roomNumber || 'Hostel Room',
      block: existingPass?.hostelBlock || 'Hostel A',
    });
  };

  const handlePrintPassSlip = () => {
    if (!authenticatedStudent) return;
    const activePass = gatePasses.find(
      (p) => p.rollNumber === authenticatedStudent.roll && (p.status === 'approved' || p.status === 'checked_out'),
    );

    setPrintedSlip({
      type: 'PHYSICAL GATE CLEARANCE SLIP',
      title: activePass ? `AUTHORIZED OUTING: ${activePass.passCode}` : 'PROVISIONAL DAY PASS',
      tokenCode: activePass ? activePass.passCode : 'GP-KIOSK-01',
      details: `Roll: ${authenticatedStudent.roll} · Room: ${authenticatedStudent.room} · Expected In: ${
        activePass ? activePass.expectedInTime : '22:30'
      }`,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  const handlePrintMessSlip = () => {
    if (!authenticatedStudent) return;
    messCheckIn(authenticatedStudent.roll);
    setPrintedSlip({
      type: 'DINING HALL MEAL TOKEN',
      title: 'DINNER SERVICE (PURE GHEE ROTI + DAL TADKA)',
      tokenCode: `MESS-${Math.floor(1000 + Math.random() * 9000)}`,
      details: `Student: ${authenticatedStudent.name} (${authenticatedStudent.roll}) · Ramanujan Mess Hall A`,
      timestamp: new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Airport Kiosk Outer Shell Container */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-2xl border-4 border-slate-700">
        
        {/* Kiosk Top HUD */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xs uppercase tracking-widest text-indigo-400 font-bold">
                CAMPUS HARDWARE FALLBACK TERMINAL
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Ramanujan Hostel Lobby Self-Service Kiosk
              </h1>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xs font-mono text-slate-400">TOUCHSCREEN TERMINAL #04</div>
            <div className="text-xs font-semibold text-emerald-400 flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Thermal Printer Ready
            </div>
          </div>
        </div>

        {/* Body View: Login or Operations */}
        {!authenticatedStudent ? (
          <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-base font-bold text-white">
                Zero-Smartphone Fallback Access
              </h2>
              <div className="flex items-center gap-3 p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <img
                  src={kioskImg}
                  alt="Physical Campus Kiosk"
                  className="w-16 h-16 rounded-lg object-cover border border-slate-600 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <p className="text-2xs text-slate-300 leading-relaxed">
                  Forgot your phone or low battery? Tap your Student Roll Number on the numeric keypad or use RFID sensor to print physical gate slips and mess meal tokens instantly.
                </p>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
                <div className="text-2xs text-slate-400 uppercase font-semibold">Entered Roll Number:</div>
                <div className="text-2xl font-mono font-bold tracking-wider text-indigo-300 min-h-[36px]">
                  {inputRoll || <span className="text-slate-600">_ _ _ _ _ _ _ _</span>}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleKioskLogin}
                  disabled={!inputRoll}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl cursor-pointer shadow-md transition-colors"
                >
                  Confirm & Access Kiosk
                </button>
              </div>
            </div>

            {/* Large Touch Keypad (Airport Style) */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-2">
              <div className="grid grid-cols-3 gap-2 text-sm font-bold font-mono">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CS', '0', 'BACK'].map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeypadPress(key)}
                    className="h-12 bg-slate-700 hover:bg-slate-600 active:bg-indigo-600 text-white rounded-xl shadow-xs flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {key}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handleKeypadPress('CLEAR')}
                className="w-full py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold rounded-lg mt-1 cursor-pointer"
              >
                Clear Input
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 space-y-6">
            {/* Authenticated Student Banner */}
            <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-2xs uppercase tracking-wider text-emerald-400 font-bold">
                  STUDENT IDENTIFIED
                </div>
                <div className="text-lg font-bold text-white">
                  {authenticatedStudent.name}{' '}
                  <span className="font-mono text-slate-400 text-sm font-normal">
                    ({authenticatedStudent.roll})
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Room {authenticatedStudent.room} · {authenticatedStudent.block}
                </div>
              </div>

              <button
                onClick={() => {
                  setAuthenticatedStudent(null);
                  setPrintedSlip(null);
                }}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <LogOut className="w-3.5 h-3.5" />
                Exit Kiosk Session
              </button>
            </div>

            {/* Quick 1-Touch Action Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={handlePrintPassSlip}
                className="p-5 bg-indigo-900/40 hover:bg-indigo-900/60 border border-indigo-500/40 rounded-xl text-left space-y-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Printer className="w-6 h-6 text-indigo-400" />
                <div className="font-bold text-sm text-white">Print Gate Pass Slip</div>
                <div className="text-xs text-indigo-200">
                  Thermal ticket barcode for guard gate exit without smartphone.
                </div>
              </button>

              <button
                onClick={handlePrintMessSlip}
                className="p-5 bg-amber-900/40 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl text-left space-y-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Utensils className="w-6 h-6 text-amber-400" />
                <div className="font-bold text-sm text-white">Print Mess Meal Token</div>
                <div className="text-xs text-amber-200">
                  Claim today's dinner tray at dining hall counter.
                </div>
              </button>

              <button
                onClick={() =>
                  alert(
                    'Complaint status: Ticket TKT-3091 (Ceiling Fan Regulator) is Assigned to Rajesh Kumar (Senior Electrician). Expected visit: Within 2 hours.',
                  )
                }
                className="p-5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-xl text-left space-y-2 cursor-pointer transition-all hover:scale-[1.01]"
              >
                <Wrench className="w-6 h-6 text-slate-300" />
                <div className="font-bold text-sm text-white">Maintenance Status</div>
                <div className="text-xs text-slate-400">
                  Check repair status for Room {authenticatedStudent.room}.
                </div>
              </button>
            </div>

            {/* Simulated Thermal Printer Dispenser Slot */}
            {printedSlip && (
              <div className="p-5 bg-white text-slate-900 rounded-xl shadow-xl space-y-3 animate-in slide-in-from-top-4 duration-300 border-t-8 border-indigo-600">
                <div className="flex items-center justify-between border-b border-dashed border-slate-300 pb-2">
                  <div className="text-2xs uppercase tracking-widest font-mono font-bold text-indigo-700">
                    {printedSlip.type}
                  </div>
                  <div className="text-3xs font-mono text-slate-500">{printedSlip.timestamp}</div>
                </div>

                <div className="text-center space-y-1 py-1">
                  <div className="text-xs font-bold text-slate-800">{printedSlip.title}</div>
                  <div className="text-xl font-mono font-bold text-slate-900 tracking-wider">
                    {printedSlip.tokenCode}
                  </div>
                  <div className="text-2xs text-slate-600">{printedSlip.details}</div>
                </div>

                {/* Simulated Barcode */}
                <div className="py-2 text-center border-t border-dashed border-slate-300">
                  <div className="flex justify-center items-center gap-1 h-8 opacity-80">
                    {Array.from({ length: 32 }).map((_, i) => (
                      <div
                        key={i}
                        className={`bg-slate-900 h-full ${
                          (i * 3) % 2 === 0 ? 'w-1' : 'w-0.5'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-3xs font-mono text-slate-500 mt-1">
                    * {printedSlip.tokenCode} * (Valid for Campus Security Scanner)
                  </div>
                </div>

                <div className="text-center text-3xs text-emerald-700 font-semibold bg-emerald-50 py-1 rounded">
                  ✓ Thermal Slip Dispensed · Take from kiosk tray below
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
