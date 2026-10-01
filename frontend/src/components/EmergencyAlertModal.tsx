import React, { useState, useEffect } from 'react';
import { useCampusOps } from '../context/CampusOpsContext';
import { emergencySound } from '../utils/audioAlert';
import { ShieldAlert, Volume2, VolumeX, CheckCircle2, X, AlertTriangle, Users, MapPin, BellOff } from 'lucide-react';

interface EmergencyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyAlertModal: React.FC<EmergencyAlertModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    activeEmergency,
    triggerEmergencyAlert,
    dismissEmergencyAlert,
    checkInMuster,
    role,
  } = useCampusOps();

  const [selectedType, setSelectedType] = useState<
    'fire_drill' | 'severe_weather' | 'campus_lockdown' | 'medical_evacuation'
  >('fire_drill');
  const [customTitle, setCustomTitle] = useState('Campus-Wide Mandatory Fire Evacuation Drill');
  const [customMessage, setCustomMessage] = useState(
    'All hostel residents, staff, and faculty must immediately proceed to designated assembly areas via fire exit stairwells.',
  );
  const [musterPoint, setMusterPoint] = useState('Main Athletics Track & Football Field (Zone A)');
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTrigger = () => {
    triggerEmergencyAlert(selectedType, customTitle, customMessage, musterPoint);
  };

  const handlePlayTestSound = () => {
    emergencySound.playAmbulanceSiren(6);
  };

  const handleStudentCheckIn = () => {
    checkInMuster();
    setHasCheckedIn(true);
  };

  const handleTurnOffAlert = () => {
    emergencySound.stop();
    dismissEmergencyAlert();
    setHasCheckedIn(false);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border-2 border-red-500">

        {/* Header with High-Contrast Red Strobe/Alert Bar */}
        <div className="bg-red-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 animate-pulse text-white" />
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {activeEmergency ? 'CRITICAL CAMPUS EMERGENCY ALERT' : 'Emergency Siren & Evacuation Console'}
              </h2>
              <p className="text-xs text-red-100">
                Loud ambulance override siren (6s audio burst) · Mute bypass protocol
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeEmergency && (
              <button
                onClick={handleTurnOffAlert}
                title="Turn off this emergency alert broadcast"
                className="text-xs font-bold bg-white text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded cursor-pointer transition-colors shadow-xs"
              >
                Turn Off Alert
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close emergency modal"
              className="text-red-100 hover:text-white p-1 rounded-md cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Active Emergency Live State */}
          {activeEmergency ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-100 px-2 py-0.5 rounded">
                    {activeEmergency.type.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-red-800">
                    Triggered at {activeEmergency.triggeredAt}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-red-950">
                  {activeEmergency.title}
                </h3>
                <p className="text-sm text-red-900 leading-relaxed">
                  {activeEmergency.message}
                </p>

                <div className="flex items-center gap-2 pt-2 border-t border-red-200 text-xs text-red-800 font-medium">
                  <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                  <span>Designated Muster Assembly Point: <strong>{activeEmergency.musterPoint}</strong></span>
                </div>
              </div>

              {/* Muster Headcount & Safety Action */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-medium">Safe Check-In Headcount</div>
                    <div className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                      {activeEmergency.checkedInStudentsCount}{' '}
                      <span className="text-xs font-normal text-slate-500">/ 856 students verified</span>
                    </div>
                  </div>
                </div>

                {hasCheckedIn ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>You are registered SAFE at muster point</span>
                  </div>
                ) : (
                  <button
                    onClick={handleStudentCheckIn}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    I Am Safe (Muster Check-in)
                  </button>
                )}
              </div>

              {/* Emergency Alert Active Notice with Turn Off Button */}
              <div className="p-3.5 bg-red-100/90 border border-red-300 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs font-bold text-red-950">
                  <BellOff className="w-4 h-4 text-red-700 shrink-0" />
                  <span>
                    Emergency Alert is currently active across the campus.
                  </span>
                </div>
                <button
                  onClick={handleTurnOffAlert}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0"
                >
                  <BellOff className="w-4 h-4" />
                  Turn Off Alert Message
                </button>
              </div>

              {/* Siren Control and Close buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayTestSound}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 border border-amber-300 rounded-md cursor-pointer transition-colors"
                  >
                    <Volume2 className="w-4 h-4 text-amber-600" />
                    Replay Siren (6s)
                  </button>

                  <button
                    onClick={() => emergencySound.stop()}
                    className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-md cursor-pointer transition-colors"
                    title="Stop emergency siren audio immediately"
                  >
                    <VolumeX className="w-4 h-4 text-red-500" />
                    Stop Siren Audio
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                  >
                    Close Console
                  </button>

                  <button
                    onClick={handleTurnOffAlert}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <BellOff className="w-4 h-4" />
                    Turn Off Alert Message
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Emergency Broadcast Trigger Interface for Wardens/Admins */
            <div className="space-y-4">
              <div className="text-xs text-slate-600 leading-relaxed bg-amber-50 border border-amber-200 p-3 rounded-md">
                <strong>Protocol Note (Fretbox PRD Spec):</strong> Activating this alert sends a critical push notification that activates the device audio synthesizer to ring like an ambulance for 6 seconds, bypassing quiet hours.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Incident Type
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'fire_drill', label: 'Fire Drill' },
                    { id: 'severe_weather', label: 'Severe Storm' },
                    { id: 'campus_lockdown', label: 'Lockdown' },
                    { id: 'medical_evacuation', label: 'Medical Code' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setSelectedType(item.id as any);
                        if (item.id === 'fire_drill') {
                          setCustomTitle('Campus-Wide Mandatory Fire Evacuation Drill');
                          setMusterPoint('Main Athletics Track & Football Field');
                        } else if (item.id === 'severe_weather') {
                          setCustomTitle('Severe Thunderstorm & High-Wind Warning');
                          setMusterPoint('Remain inside hostel rooms; close balcony doors');
                        }
                      }}
                      className={`px-3 py-2 text-xs font-medium rounded-md border cursor-pointer text-center transition-colors ${selectedType === item.id
                          ? 'border-red-600 bg-red-50 text-red-700 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alert Headline
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Urgent Student Instructions
                </label>
                <textarea
                  rows={2}
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designated Muster Assembly Point
                </label>
                <input
                  type="text"
                  value={musterPoint}
                  onChange={(e) => setMusterPoint(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={handlePlayTestSound}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-3 py-2 border border-slate-200 rounded-md cursor-pointer transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-amber-600" />
                  Test Siren Audio (6s)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTrigger}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-md shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Broadcast Campus Siren
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
