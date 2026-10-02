import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCampusOps } from '../context/CampusOpsContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  Layers,
  Calculator,
  FileCheck2,
  Building2,
  UtensilsCrossed,
  Wrench,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  EyeOff,
  RotateCw,
  X,
  Lock,
  Mail,
  Phone,
  User,
  BadgeAlert,
} from 'lucide-react';

interface StaffRoleOption {
  id: string;
  roleKey: string;
  title: string;
  subtitle: string;
  defaultDesignation: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgLight: string;
  borderHover: string;
}

const STAFF_ROLES: StaffRoleOption[] = [
  {
    id: 'faculty',
    roleKey: 'FACULTY',
    title: 'Faculty / Staff',
    subtitle: 'Academic professors, teaching staff & lab directors',
    defaultDesignation: 'Assistant Professor / Faculty Member',
    icon: Briefcase,
    color: 'text-indigo-600',
    bgLight: 'bg-indigo-50/70',
    borderHover: 'hover:border-indigo-400 hover:shadow-indigo-100',
  },
  {
    id: 'hod',
    roleKey: 'HOD',
    title: 'HOD',
    subtitle: 'Head of Academic & Engineering Departments',
    defaultDesignation: 'Head of Department (HOD)',
    icon: Layers,
    color: 'text-purple-600',
    bgLight: 'bg-purple-50/70',
    borderHover: 'hover:border-purple-400 hover:shadow-purple-100',
  },
  {
    id: 'accounts',
    roleKey: 'ACCOUNTS',
    title: 'Accounts / Finance Cell',
    subtitle: 'Institutional billing, payroll & fee accounts',
    defaultDesignation: 'Accounts & Finance Officer',
    icon: Calculator,
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50/70',
    borderHover: 'hover:border-emerald-400 hover:shadow-emerald-100',
  },
  {
    id: 'examination',
    roleKey: 'EXAM_CELL',
    title: 'Examination Cell',
    subtitle: 'Exams controller, marks recording & grading superintendent',
    defaultDesignation: 'Controller of Examinations / Superintendent',
    icon: FileCheck2,
    color: 'text-blue-600',
    bgLight: 'bg-blue-50/70',
    borderHover: 'hover:border-blue-400 hover:shadow-blue-100',
  },
  {
    id: 'warden',
    roleKey: 'WARDEN',
    title: 'Hostel Warden',
    subtitle: 'Hostel blocks, room allotments & gate permissions',
    defaultDesignation: 'Chief Hostel Warden',
    icon: Building2,
    color: 'text-amber-600',
    bgLight: 'bg-amber-50/70',
    borderHover: 'hover:border-amber-400 hover:shadow-amber-100',
  },
  {
    id: 'mess',
    roleKey: 'MESS',
    title: 'Mess and Catering Management',
    subtitle: 'Dining halls, nutrition inventory & meal tokens',
    defaultDesignation: 'Mess & Catering Operations Manager',
    icon: UtensilsCrossed,
    color: 'text-rose-600',
    bgLight: 'bg-rose-50/70',
    borderHover: 'hover:border-rose-400 hover:shadow-rose-100',
  },
  {
    id: 'maintenance',
    roleKey: 'TECHNICIAN',
    title: 'Maintenance',
    subtitle: 'Campus electrical, plumbing, carpentry & HVAC engineers',
    defaultDesignation: 'Campus Maintenance & Facilities Engineer',
    icon: Wrench,
    color: 'text-cyan-600',
    bgLight: 'bg-cyan-50/70',
    borderHover: 'hover:border-cyan-400 hover:shadow-cyan-100',
  },
  {
    id: 'security',
    roleKey: 'SECURITY',
    title: 'Campus Gate Security Guard',
    subtitle: 'Gate checkpoints, QR pass scanners & perimeter security',
    defaultDesignation: 'Campus Gate Security Officer',
    icon: ShieldCheck,
    color: 'text-teal-600',
    bgLight: 'bg-teal-50/70',
    borderHover: 'hover:border-teal-400 hover:shadow-teal-100',
  },
];

const generateEmployeeId = (year?: number): string => {
  const joiningYear = year || new Date().getFullYear();
  const random3Digits = Math.floor(100 + Math.random() * 900);
  return `EMP-${joiningYear}-${random3Digits}`;
};

const Register: React.FC = () => {
  const { register, user } = useAuth();
  const { addStaffRequest } = useCampusOps();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Current Slide Step: 1 (Role Selection), 2 (Details), 3 (Offer Letter), 4 (Preview), 5 (Success)
  const [currentSlide, setCurrentSlide] = useState<number>(1);

  // Form State
  const [selectedRole, setSelectedRole] = useState<StaffRoleOption | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [designation, setDesignation] = useState('');
  const [joiningYear, setJoiningYear] = useState<number>(new Date().getFullYear());
  const [employeeId, setEmployeeId] = useState<string>(generateEmployeeId());

  // Offer Letter Attachment State
  const [offerLetterFile, setOfferLetterFile] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  } | null>(null);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [declaredAuthentic, setDeclaredAuthentic] = useState(true);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When a role is picked, autofill designation and regenerate employeeId
  const handleSelectRole = (roleOption: StaffRoleOption) => {
    setSelectedRole(roleOption);
    setDesignation(roleOption.defaultDesignation);
    setEmployeeId(generateEmployeeId(joiningYear));
    setError(null);
    setCurrentSlide(2);
  };

  const handleRegenerateEmpId = () => {
    setEmployeeId(generateEmployeeId(joiningYear));
  };

  const handleYearChange = (year: number) => {
    setJoiningYear(year);
    const random3Digits = Math.floor(100 + Math.random() * 900);
    setEmployeeId(`EMP-${year}-${random3Digits}`);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setError('File size exceeds 8MB. Please attach a smaller file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeKb = Math.round(file.size / 1024);
      const sizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      setOfferLetterFile({
        name: file.name,
        size: sizeStr,
        type: file.type || 'application/pdf',
        dataUrl,
      });
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  // Slide 2 -> Slide 3 validation
  const handleProceedToAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please provide a valid official email address.');
      return;
    }

    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || !/^\d{10}$/.test(cleanPhone)) {
      setError('Phone number must be exactly 10 digits.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password confirmation does not match.');
      return;
    }

    if (!designation.trim()) {
      setError('Please provide your official designation.');
      return;
    }

    setCurrentSlide(3);
  };

  // Slide 3 -> Slide 4 validation
  const handleProceedToPreview = () => {
    setError(null);
    if (!offerLetterFile) {
      setError('Please upload or attach your official offer letter / appointment contract.');
      return;
    }
    setCurrentSlide(4);
  };

  // Final Submit to Super Admin
  const handleFinalSubmit = async () => {
    if (!selectedRole) return;
    setError(null);

    if (!declaredAuthentic) {
      setError('Please certify that your details and offer letter are authentic.');
      return;
    }

    setLoading(true);
    try {
      const staffRegistrationPayload = {
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: selectedRole.roleKey,
        designation: designation.trim(),
        employeeId: employeeId.trim(),
        offerLetter: offerLetterFile?.dataUrl || '',
        offerLetterName: offerLetterFile?.name || 'Offer_Letter.pdf',
      };

      // Register via backend/context
      const regResult = await register(staffRegistrationPayload);
      const serverUser = (regResult as any)?.user || (regResult as any)?.data?.user;

      // Add to Super Admin local request list for immediate review & synchronization
      addStaffRequest({
        id: serverUser?.id ? serverUser.id.toString() : `sr-${Date.now()}`,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        role: selectedRole.roleKey,
        roleLabel: selectedRole.title,
        designation: designation.trim(),
        employeeId: employeeId.trim(),
        offerLetterName: serverUser?.offerLetterName || offerLetterFile?.name || 'Offer_Letter.pdf',
        offerLetterUrl: serverUser?.offerLetterUrl || serverUser?.offerLetter || offerLetterFile?.dataUrl,
        offerLetter: serverUser?.offerLetter || serverUser?.offerLetterUrl || offerLetterFile?.dataUrl,
        status: 'PENDING',
        createdAt: 'Just now',
      });

      setCurrentSlide(5);
    } catch (err: any) {
      setError(err.message || 'Staff registration submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-indigo-50/40 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl space-y-6">
        {/* Top Header Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  FretOps Campus Onboarding
                </span>
                <span className="text-2xs font-bold text-slate-400">·</span>
                <span className="text-2xs font-semibold text-slate-500">Staff & Faculty Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 tracking-tight">
                {currentSlide === 1 && 'Select Your Official Role'}
                {currentSlide === 2 && 'Personal & Designation Details'}
                {currentSlide === 3 && 'Attach Appointment Offer Letter'}
                {currentSlide === 4 && 'Preview & Submit for Verification'}
                {currentSlide === 5 && 'Application Submitted'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {currentSlide === 1 && 'Choose your campus department or cell to begin onboarding'}
                {currentSlide === 2 && 'Provide employee credentials and verify auto-filled official details'}
                {currentSlide === 3 && 'Upload your signed institutional offer letter for Super Admin approval'}
                {currentSlide === 4 && 'Review all entered information before dispatching to Super Admin'}
                {currentSlide === 5 && 'Your registration is in queue for Super Admin authentication'}
              </p>
            </div>

            {/* Step Wizard Indicator */}
            {currentSlide <= 4 && (
              <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 p-2 rounded-xl border border-slate-200/70">
                {[1, 2, 3, 4].map((stepNum) => (
                  <div
                    key={stepNum}
                    className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                      currentSlide === stepNum
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : currentSlide > stepNum
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200/80 text-slate-400'
                    }`}
                  >
                    {currentSlide > stepNum ? '✓' : stepNum}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student Admission Info Callout Banner */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/70 rounded-xl flex items-start gap-3 text-xs text-amber-900">
            <GraduationCap className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Are you a Student?</span>
              <p className="text-amber-800 text-[11.5px] leading-relaxed">
                Student accounts cannot register here. Your unique portal credentials and roll numbers are provisioned
                automatically by the University Registrar upon admission.{' '}
                <Link to="/login" className="font-bold text-amber-900 underline hover:text-amber-950">
                  Log in directly here
                </Link>
                .
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* =========================================================
              SLIDE 1: ROLE SELECTION (BOXES, NOT IN DROPDOWN)
          ========================================================= */}
          {currentSlide === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select Staff Role / Department
                </span>
                <span className="text-2xs text-slate-400">Click a box to proceed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {STAFF_ROLES.map((role) => {
                  const RoleIcon = role.icon;
                  const isSelected = selectedRole?.id === role.id;

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleSelectRole(role)}
                      className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer group flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/60 shadow-md ring-2 ring-indigo-200'
                          : `border-slate-200/90 bg-white hover:bg-slate-50/80 ${role.borderHover} shadow-xs`
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${role.bgLight} ${role.color} shrink-0 group-hover:scale-105 transition-transform`}>
                        <RoleIcon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {role.title}
                          </h3>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-snug line-clamp-2">
                          {role.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================================
              SLIDE 2: DETAILS SLIDE (NAME, EMAIL, PHONE, DESIGNATION, EMP ID)
          ========================================================= */}
          {currentSlide === 2 && selectedRole && (
            <form onSubmit={handleProceedToAttachment} className="space-y-4">
              {/* Selected Role Pill */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">Selected Role:</span>
                  <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {selectedRole.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentSlide(1)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                >
                  Change Role
                </button>
              </div>

              {/* Employee ID Generation Card */}
              <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-slate-50 to-indigo-50 border border-indigo-200/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-indigo-800">
                    Auto-Generated Employee ID
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-slate-500">Joining Year:</span>
                    <select
                      value={joiningYear}
                      onChange={(e) => handleYearChange(Number(e.target.value))}
                      className="text-xs font-semibold bg-white border border-slate-300 rounded px-2 py-0.5 focus:outline-none"
                    >
                      {[2026, 2025, 2024, 2023, 2022].map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-extrabold text-indigo-950 tracking-wider bg-white px-3 py-1.5 rounded-lg border border-indigo-200 shadow-2xs">
                      {employeeId}
                    </span>
                    <span className="text-2xs text-slate-500 font-medium">Format: EMP-Year-Random3</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateEmpId}
                    title="Generate another 3-digit random token"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg cursor-pointer shadow-2xs transition-colors"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. rajesh.sharma@campus.edu.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    10-Digit Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="e.g. 9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>

                {/* Official Designation (Autofilled according to role) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Official Designation <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-indigo-600 font-semibold">Autofilled</span>
                  </div>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="Official Designation"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm font-medium border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Account Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentSlide(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Role Selection</span>
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Continue to Offer Letter</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* =========================================================
              SLIDE 3: ATTACH OFFER LETTER SLIDE
          ========================================================= */}
          {currentSlide === 3 && (
            <div className="space-y-5">
              <div className="text-center max-w-lg mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">Upload Your Institutional Appointment Letter</h3>
                <p className="text-xs text-slate-500">
                  Super Admin requires your official offer letter or appointment contract to authenticate and activate your account.
                </p>
              </div>

              {/* Upload Dropzone */}
              {!offerLetterFile ? (
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/70 hover:bg-indigo-50/20 rounded-2xl p-8 text-center transition-all cursor-pointer relative group">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Click to browse or drag & drop offer letter
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, PNG, JPG (up to 8 MB)</p>
                  <span className="inline-block mt-3 px-3 py-1 bg-white border border-slate-200 rounded-lg text-2xs font-semibold text-slate-600 shadow-2xs">
                    Choose Document File
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Document Ready for Verification
                    </span>
                    <button
                      type="button"
                      onClick={() => setOfferLetterFile(null)}
                      className="text-2xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Remove & Re-upload
                    </button>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{offerLetterFile.name}</p>
                      <p className="text-2xs text-slate-500">
                        {offerLetterFile.size} · {offerLetterFile.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </button>
                  </div>
                </div>
              )}

              {/* Sample Document Quick Helper */}
              {!offerLetterFile && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Testing on mobile or don’t have a PDF right now?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setOfferLetterFile({
                        name: `${fullName ? fullName.replace(/\s+/g, '_') : 'Faculty'}_Official_Offer_Letter.pdf`,
                        size: '420 KB',
                        type: 'application/pdf',
                        dataUrl:
                          'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
                      });
                    }}
                    className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
                  >
                    Attach Demo Offer Letter
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentSlide(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Details</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToPreview}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer"
                >
                  <span>Continue to Preview</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              SLIDE 4: PREVIEW DETAILS BEFORE SUBMITTING TO SUPER ADMIN
          ========================================================= */}
          {currentSlide === 4 && selectedRole && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">Registration Summary</span>
                    <span className="font-mono text-2xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {employeeId}
                    </span>
                  </div>
                  <span className="text-2xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Awaiting Verification
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-2xs">Applicant Name</span>
                    <strong className="text-slate-900 text-sm">{fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-2xs">Department / Role</span>
                    <span className="font-semibold text-indigo-700">{selectedRole.title}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-2xs">Official Designation</span>
                    <span className="text-slate-800 font-medium">{designation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-2xs">Email Address</span>
                    <span className="text-slate-800 font-medium">{email}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-2xs">10-Digit Mobile</span>
                    <span className="text-slate-800 font-medium">{phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-2xs">Password Security</span>
                    <span className="text-slate-500 font-mono">••••••••••••</span>
                  </div>
                </div>

                {/* Offer Letter Card in Preview */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div className="truncate">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {offerLetterFile?.name || 'Offer_Letter.pdf'}
                      </p>
                      <p className="text-2xs text-slate-400">Attached Offer Letter for Super Admin</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded cursor-pointer shrink-0"
                  >
                    View
                  </button>
                </div>
              </div>

              {/* Authenticity Declaration Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={declaredAuthentic}
                  onChange={(e) => setDeclaredAuthentic(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span className="text-xs text-slate-600 leading-normal">
                  I solemnly declare that the employment details, designation, and attached offer letter are valid and
                  authentic. I understand that my account will remain pending until verified by the Super Admin.
                </span>
              </label>

              {/* Navigation Buttons */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentSlide(3)}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Offer Letter</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Application...</span>
                  ) : (
                    <>
                      <span>Submit for Super Admin Verification</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* =========================================================
              SLIDE 5: CONFIRMATION / VERIFICATION PENDING
          ========================================================= */}
          {/* =========================================================
              SLIDE 5: CONFIRMATION / VERIFICATION OR ACTIVE
          ========================================================= */}
          {currentSlide === 5 && (
            <div className="py-8 text-center space-y-5">
              {selectedRole?.roleKey === 'FACULTY' || selectedRole?.roleKey === 'HOD' ? (
                <>
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto shadow-sm animate-pulse">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <span className="inline-block px-3.5 py-1 bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-full">
                      ✓ Status: Account Active & Verified
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900">Welcome to Faculty Portal!</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your faculty account (<strong className="text-indigo-600">{employeeId}</strong>) has been verified. You can now manage student attendance, upload marks, share study notes, and publish circulars.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 mx-auto shadow-sm animate-bounce">
                    <Clock className="w-8 h-8" />
                  </div>

                  <div className="space-y-2 max-w-md mx-auto">
                    <span className="inline-block px-3 py-1 bg-amber-100/70 border border-amber-300 text-amber-800 text-xs font-bold rounded-full">
                      Status: Pending Super Admin Verification
                    </span>
                    <h2 className="text-xl font-extrabold text-slate-900">Application Transmitted Successfully!</h2>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your staff registration with Employee ID <strong className="text-indigo-600">{employeeId}</strong> and
                      attached offer letter have been submitted to the Super Admin for security verification.
                    </p>
                  </div>
                </>
              )}

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-sm mx-auto text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <strong className="text-slate-800">{fullName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Designation:</span>
                  <span className="text-slate-800 font-medium">{designation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Role:</span>
                  <span className="text-indigo-600 font-semibold">{selectedRole?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Offer Letter:</span>
                  <span className="text-emerald-700 font-medium">Uploaded & Attached</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                {selectedRole?.roleKey === 'FACULTY' || selectedRole?.roleKey === 'HOD' ? (
                  <button
                    type="button"
                    onClick={() => navigate('/')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    <span>Enter Faculty Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    <span>Return to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bottom link back to login */}
          {currentSlide < 5 && (
            <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
              Already have an active verified account?{' '}
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
                Sign in to Portal
              </Link>
            </p>
          )}
        </div>
      </div>

      {/* Offer Letter Document Preview Dialog */}
      {previewModalOpen && offerLetterFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-5 space-y-4 border border-slate-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{offerLetterFile.name}</h3>
                  <p className="text-2xs text-slate-400">{offerLetterFile.size} · {offerLetterFile.type || 'Document'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-2 flex flex-col items-center justify-center min-h-[350px] max-h-[540px] overflow-hidden border border-slate-200">
              {(() => {
                const dataUrl = offerLetterFile.dataUrl || '';
                const isPdf = offerLetterFile.type === 'application/pdf' || dataUrl.startsWith('data:application/pdf') || offerLetterFile.name.toLowerCase().endsWith('.pdf');
                const isImg = offerLetterFile.type.startsWith('image/') || dataUrl.startsWith('data:image/');

                if (isPdf && dataUrl) {
                  return (
                    <iframe
                      src={dataUrl}
                      title={offerLetterFile.name}
                      className="w-full h-[500px] rounded-lg border border-slate-200 bg-white"
                    />
                  );
                }

                if (isImg && dataUrl) {
                  return (
                    <div className="w-full h-full flex items-center justify-center p-2 overflow-auto">
                      <img
                        src={dataUrl}
                        alt={offerLetterFile.name}
                        className="max-h-[480px] w-auto max-w-full rounded-lg object-contain shadow-xs border border-slate-200"
                      />
                    </div>
                  );
                }

                return (
                  <div className="text-center p-6 space-y-2">
                    <FileText className="w-12 h-12 text-indigo-600 mx-auto" />
                    <h4 className="text-sm font-bold text-slate-800">{offerLetterFile.name}</h4>
                    <p className="text-xs text-slate-500">Official Document Attachment</p>
                    <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                      File attached & ready for Super Admin verification
                    </span>
                  </div>
                );
              })()}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;