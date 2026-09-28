import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserRole } from '../types';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  UtensilsCrossed,
  Monitor,
  Lock,
  Phone,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface RoleConfig {
  id: UserRole;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}

const ROLE_OPTIONS: RoleConfig[] = [
  {
    id: 'student',
    label: 'Student',
    description: 'Gate pass requests, room services, and attendance',
    icon: GraduationCap,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'warden',
    label: 'Hostel Warden',
    description: 'Pass approvals, room allocations, and student oversight',
    icon: Building2,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'guard',
    label: 'Security Guard',
    description: 'Gate QR scanner terminal and perimeter checkpoint',
    icon: ShieldCheck,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'admin',
    label: 'Campus Admin',
    description: 'System master settings, role permissions, and metrics',
    icon: ShieldAlert,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    id: 'technician',
    label: 'Maintenance Tech',
    description: 'Facilities maintenance, work orders, and breakdown dispatch',
    icon: Wrench,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'mess',
    label: 'Mess Manager',
    description: 'Dining hall schedules, inventory, and meal tokens',
    icon: UtensilsCrossed,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'kiosk',
    label: 'Self-Service Kiosk',
    description: 'Student self-service terminal and express gate kiosk',
    icon: Monitor,
    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
  },
];

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const activeConfig = ROLE_OPTIONS.find((r) => r.id === selectedRole) || ROLE_OPTIONS[0];

  const handleRoleChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setError(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    // Allow users to see what they type, but clean up error state
    setPhoneNumber(rawVal);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPhone = phoneNumber.trim();

    // Strict 10-digit validation check
    if (!cleanPhone) {
      setError('Please enter your 10-digit phone number.');
      return;
    }

    if (cleanPhone.includes('@') || /[a-zA-Z]/.test(cleanPhone)) {
      setError('Email addresses and letters are not allowed. Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!/^\d{10}$/.test(cleanPhone)) {
      setError('Phone number must be exactly 10 digits (numbers only).');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      await login(cleanPhone, password, selectedRole);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const ActiveIcon = activeConfig.icon;

  // Phone input helper checks
  const isEmailOrLetter = phoneNumber.includes('@') || /[a-zA-Z]/.test(phoneNumber);
  const isLengthInvalid = phoneNumber.length > 0 && phoneNumber.length !== 10 && !isEmailOrLetter;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/30 py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white p-7 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-6 transition-all">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/50 px-2.5 py-1 rounded-full">
              FretOps Central
            </span>
            <h2 className="mt-3.5 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Sign in to Portal
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your 10-digit phone number and password
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* Role Dropdown Field */}
            <div>
              <label
                htmlFor="role-select"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Access Role
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <ActiveIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <select
                  id="role-select"
                  aria-label="Select role to login"
                  value={selectedRole}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="block w-full pl-9 pr-10 py-2.5 text-sm font-medium text-slate-900 bg-slate-50 hover:bg-slate-100/70 border border-slate-300 rounded-xl focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer shadow-xs"
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.id.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Role Quick Description & Badge */}
              <div className="mt-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-start gap-2 text-xs">
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${activeConfig.badgeColor}`}>
                  {activeConfig.label}
                </span>
                <span className="text-slate-600 leading-tight flex-1">
                  {activeConfig.description}
                </span>
              </div>
            </div>

            {/* Phone Number Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="phoneNumber"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Phone Number
                </label>
                <span className="text-[11px] text-slate-400 font-medium">Exactly 10 digits</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel"
                  className={`block w-full pl-9 pr-3.5 py-2.5 text-sm text-slate-900 bg-white border rounded-xl shadow-xs focus:outline-none focus:ring-2 transition-all ${
                    isEmailOrLetter
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                  placeholder="e.g. 9876543210"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  required
                />
              </div>

              {/* Inline Phone Validation Feedback */}
              {isEmailOrLetter && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Email addresses are not accepted. Please enter your 10-digit phone number.</span>
                </p>
              )}
              {isLengthInvalid && (
                <p className="mt-1.5 text-xs text-amber-600 font-medium">
                  Phone number must be exactly 10 digits ({phoneNumber.length}/10 entered)
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="block w-full pl-9 pr-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-300 rounded-xl shadow-xs focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md shadow-indigo-600/20 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-center text-xs text-slate-500">
            Don’t have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;