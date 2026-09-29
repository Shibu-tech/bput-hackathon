import React from 'react';
import { useCampusOps } from '../context/CampusOpsContext';
import { useAuth } from '../context/AuthContext';
import { translations } from '../utils/translations';
import { UserRole, Language } from '../types';
import {
  ShieldAlert,
  WifiOff,
  Globe,
  ChevronDown,
  LogOut,
  User as UserIcon,
  UserCheck,
} from 'lucide-react';

interface HeaderProps {
  onOpenEmergencyModal: () => void;
  onOpenAdoptionPlaybook: () => void;
  onOpenStaffVerification?: () => void;
  activeView: string;
  setActiveView: (view: string) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  isSuperAdmin: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenEmergencyModal,
  onOpenAdoptionPlaybook,
  onOpenStaffVerification,
  activeView,
  setActiveView,
  activeRole,
  setActiveRole,
  isSuperAdmin,
}) => {
  const {
    role: campusRole,
    setRole,
    language,
    setLanguage,
    lowDataMode,
    setLowDataMode,
    activeEmergency,
    staffRequests,
  } = useCampusOps();

  const { user, logout } = useAuth();
  const t = translations[language];

  const roleOptions: { id: UserRole; label: string }[] = [
    { id: 'student', label: t.roles.student },
    { id: 'warden', label: t.roles.warden },
    { id: 'technician', label: t.roles.technician },
    { id: 'guard', label: t.roles.guard },
    { id: 'mess', label: t.roles.mess },
    { id: 'kiosk', label: t.roles.kiosk },
    { id: 'admin', label: t.roles.admin },
  ];

  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    setRole(newRole);
    setActiveView('main');
  };

  const activeRoleLabel = roleOptions.find((r) => r.id === activeRole)?.label || activeRole;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('main')}
              className="text-left group cursor-pointer focus-visible:outline-none"
            >
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                FretOps
              </span>
              <span className="text-xs font-semibold text-indigo-600 ml-1.5 tracking-wider uppercase">
                Central
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links / Role Dashboard Indicator */}
          <nav className="hidden lg:flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {isSuperAdmin ? (
              // Super admin: dropdown to switch and supervise any role dashboard
              <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                <span className="text-xs font-semibold text-slate-600 pl-2">
                  Admin Switcher:
                </span>
                <div className="relative">
                  <select
                    value={activeRole}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    aria-label="Switch active dashboard role"
                    className="appearance-none block pl-3 pr-8 py-1.5 text-xs font-semibold text-slate-900 bg-white border border-slate-300 rounded-md shadow-xs focus:border-indigo-600 focus:outline-none cursor-pointer"
                  >
                    {roleOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>
            ) : (
              // Non-super admin: show current role portal badge
              <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold rounded-lg shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Active Portal: {activeRoleLabel}</span>
              </div>
            )}

            {isSuperAdmin && onOpenStaffVerification && (
              <button
                onClick={onOpenStaffVerification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs transition-all cursor-pointer ml-1"
                title="Verify staff applications & offer letters"
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Verify Staff</span>
                {staffRequests.filter((r) => r.status === 'PENDING').length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-2xs font-extrabold bg-amber-500 text-white animate-pulse">
                    {staffRequests.filter((r) => r.status === 'PENDING').length}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={onOpenAdoptionPlaybook}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ml-1 border ${
                activeView === 'adoption'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              Rollout Playbook
            </button>
          </nav>

          {/* Zone 3: Primary Actions, User Info & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Regional Language Switcher */}
            <div className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 rounded-lg p-1">
              <Globe className="w-3.5 h-3.5 ml-1 text-slate-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                aria-label="Language selector"
                className="bg-transparent text-xs font-medium text-slate-800 pr-2 pl-1 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Low-Bandwidth / 2G Mode Toggle */}
            <button
              onClick={() => setLowDataMode((prev) => !prev)}
              title="Toggle low-bandwidth lightweight mode"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                lowDataMode
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {lowDataMode ? '2G Mode On' : '2G Mode'}
              </span>
            </button>

            {/* Emergency Siren Trigger Shortcut */}
            <button
              onClick={onOpenEmergencyModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                activeEmergency
                  ? 'bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-red-600" />
              <span className="hidden sm:inline">Emergency Siren</span>
            </button>

            {/* User Profile & Logout */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 max-w-[120px] truncate leading-tight">
                    {user.fullName}
                  </span>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  title="Sign out of your account"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-md transition-all cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile persona dropdown */}
            <div className="lg:hidden">
              <select
                value={activeView === 'adoption' ? 'adoption' : activeRole}
                onChange={(e) => {
                  if (e.target.value === 'adoption') {
                    onOpenAdoptionPlaybook();
                  } else {
                    handleRoleChange(e.target.value as UserRole);
                  }
                }}
                aria-label="Mobile Navigation"
                className="text-xs bg-slate-900 text-white font-medium rounded-md px-2.5 py-1.5 focus:outline-none"
              >
                {isSuperAdmin ? (
                  roleOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))
                ) : (
                  <option value={activeRole}>{activeRoleLabel}</option>
                )}
                <option value="adoption">Rollout Playbook</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2G Low Bandwidth Banner when active */}
      {lowDataMode && (
        <div className="bg-amber-500 text-amber-950 px-4 py-1 text-center text-xs font-medium border-t border-amber-600">
          Low-Bandwidth Mode Enabled: Images optimized, real-time background sync cached for patchy hostel network.
        </div>
      )}
    </header>
  );
};

export default Header;