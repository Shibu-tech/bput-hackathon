import React, { useState } from 'react';

import { Header } from './Header';
import { EmergencyAlertModal } from './EmergencyAlertModal';

import { StudentPortal } from './student/StudentPortal';
import { WardenDashboard } from './warden/WardenDashboard';
import { TechnicianPortal } from './technician/TechnicianPortal';
import { SecurityGuardTerminal } from './guard/SecurityGuardTerminal';
import { MessCafeteriaPortal } from './mess/MessCafeteriaPortal';
import { SelfServiceKiosk } from './kiosk/SelfServiceKiosk';
import { RolloutAdoptionPlaybook } from './adoption/RolloutAdoptionPlaybook';
import { AdminPortal } from './admin/AdminPortal';
import { StaffVerificationModal } from './admin/StaffVerificationModal';

import {
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

import { useCampusOps } from '../context/CampusOpsContext';
import { useAuth } from '../context/AuthContext';
import { useAutoTranslate } from '../utils/autoTranslate';
import { emergencySound } from '../utils/audioAlert';

const MainLayout: React.FC = () => {
  const {
    role: campusRole,
    activeEmergency,
    dismissEmergencyAlert,
    resetDemoData,
    lowDataMode,
    language,
  } = useCampusOps();

  useAutoTranslate(language);

  const {
    activeRole,
    setActiveRole,
    backendRole,
  } = useAuth();

  const isSuperAdmin = backendRole === 'ADMIN';

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] =
    useState(false);

  const [isStaffModalOpen, setIsStaffModalOpen] =
    useState(false);

  const [activeView, setActiveView] =
    useState<string>('main');

  return (
    <div
      id="dashboard-root"
      className={`min-h-screen flex flex-col ${lowDataMode
          ? 'bg-amber-50/30'
          : 'bg-slate-50'
        }`}
    >
      <Header
        onOpenEmergencyModal={() =>
          setIsEmergencyModalOpen(true)
        }
        onOpenAdoptionPlaybook={() =>
          setActiveView('adoption')
        }
        onOpenStaffVerification={() =>
          setIsStaffModalOpen(true)
        }
        activeView={activeView}
        setActiveView={setActiveView}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        isSuperAdmin={isSuperAdmin}
      />

      <StaffVerificationModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
      />

      {activeEmergency && (
        <div className="bg-red-600 text-white px-4 py-2.5 shadow-md sticky top-16 z-30 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold max-w-4xl">
            <ShieldAlert className="w-5 h-5 shrink-0" />

            <span>
              EMERGENCY SIREN BROADCAST ACTIVE:{' '}
              {activeEmergency.title} · Proceed to{' '}
              {activeEmergency.musterPoint}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() =>
                setIsEmergencyModalOpen(true)
              }
              className="px-3 py-1 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded cursor-pointer shrink-0 transition-colors"
            >
              Open Emergency HUD
            </button>
            <button
              onClick={() => {
                emergencySound.stop();
                dismissEmergencyAlert();
              }}
              title="Turn off emergency alert across campus"
              className="px-3 py-1 bg-red-950 hover:bg-black text-white text-xs font-bold rounded cursor-pointer shrink-0 transition-colors border border-red-400"
            >
              Turn Off Alert
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'adoption' ? (
          <RolloutAdoptionPlaybook />
        ) : (
          <>
            {activeRole === 'student' && <StudentPortal />}
            {activeRole === 'warden' && <WardenDashboard />}
            {activeRole === 'technician' && (
              <TechnicianPortal />
            )}
            {activeRole === 'guard' && (
              <SecurityGuardTerminal />
            )}
            {activeRole === 'mess' && (
              <MessCafeteriaPortal />
            )}
            {activeRole === 'kiosk' && (
              <SelfServiceKiosk />
            )}
            {activeRole === 'admin' && <AdminPortal />}
            {!['student', 'warden', 'technician', 'guard', 'mess', 'kiosk', 'admin'].includes(activeRole) && (
              <StudentPortal />
            )}
          </>
        )}
      </main>

      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              FretOps Central
            </span>

            <span aria-hidden="true">·</span>

            <span>
              Zero-Queue Campus & Hostel Operations Platform
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (
                  confirm(
                    'Reset demo data to initial mock state?'
                  )
                ) {
                  resetDemoData();
                }
              }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>

            <span aria-hidden="true">·</span>

            <span>
              Problem Statement 7 Implementation
            </span>
          </div>
        </div>
      </footer>

      <EmergencyAlertModal
        isOpen={isEmergencyModalOpen}
        onClose={() =>
          setIsEmergencyModalOpen(false)
        }
      />
    </div>
  );
};

export default MainLayout;