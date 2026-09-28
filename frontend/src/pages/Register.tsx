import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const roleOptions = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'WARDEN', label: 'Hostel Warden' },
  { value: 'TECHNICIAN', label: 'Maintenance Technician' },
  { value: 'SECURITY', label: 'Gate Security Guard' },
  { value: 'MESS', label: 'Mess & Cafeteria Staff' },
  { value: 'KIOSK', label: 'Self-Service Kiosk' },
  { value: 'ADMIN', label: 'Super Admin' },
];

const Register: React.FC = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    password: '',
    role: 'STUDENT',
    hostel: 'Hostel A',
    roomNumber: '101',
    batch: '2024',
    technicianTrade: 'ELECTRICAL',
    agreeTerms: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!formData.agreeTerms) {
      setError('Please accept the terms and conditions.');
      return;
    }

    setLoading(true);
    try {
      const userData: any = {
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === 'STUDENT') {
        if (formData.hostel) userData.hostel = formData.hostel;
        if (formData.roomNumber) userData.roomNumber = formData.roomNumber.trim();
        if (formData.batch) userData.batch = formData.batch;
      } else if (formData.role === 'WARDEN') {
        if (formData.hostel) userData.hostel = formData.hostel;
      } else if (formData.role === 'TECHNICIAN') {
        userData.shifts = [
          {
            category: formData.technicianTrade || 'ELECTRICAL',
            startMinute: 480,
            endMinute: 1080,
          },
        ];
      }

      await register(userData);
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            FretOps Central
          </span>
          <h2 className="mt-4 text-center text-3xl font-extrabold tracking-tight text-slate-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Sign up to access your role-specific campus operations dashboard
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:outline-none"
              placeholder="e.g. Aarav Sharma"
              value={formData.fullName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number (10 digits)
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              required
              className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:outline-none"
              placeholder="e.g. 9876543210"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password (min. 6 characters)
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:outline-none"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Account Role
            </label>
            <select
              id="role"
              name="role"
              className="block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 shadow-2xs focus:border-indigo-600 focus:outline-none cursor-pointer bg-white"
              value={formData.role}
              onChange={handleChange}
              required
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Role specific inputs */}
          {formData.role === 'STUDENT' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <span className="text-xs font-bold text-slate-600 uppercase">Student Details</span>
              <div>
                <label htmlFor="hostel" className="block text-xs font-medium text-slate-700 mb-1">
                  Hostel
                </label>
                <select
                  id="hostel"
                  name="hostel"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  value={formData.hostel}
                  onChange={handleChange}
                >
                  <option value="Hostel A">Hostel A (Boys)</option>
                  <option value="Hostel B">Hostel B (Boys)</option>
                  <option value="Hostel C">Hostel C (Girls)</option>
                </select>
              </div>

              <div>
                <label htmlFor="roomNumber" className="block text-xs font-medium text-slate-700 mb-1">
                  Room Number
                </label>
                <input
                  id="roomNumber"
                  name="roomNumber"
                  type="text"
                  placeholder="e.g. 101, 204"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  value={formData.roomNumber}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="batch" className="block text-xs font-medium text-slate-700 mb-1">
                  Batch Year
                </label>
                <input
                  id="batch"
                  name="batch"
                  type="text"
                  placeholder="2024"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  value={formData.batch}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          {formData.role === 'WARDEN' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <span className="text-xs font-bold text-slate-600 uppercase">Warden Jurisdiction</span>
              <div>
                <label htmlFor="hostel" className="block text-xs font-medium text-slate-700 mb-1">
                  Hostel Block
                </label>
                <select
                  id="hostel"
                  name="hostel"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  value={formData.hostel}
                  onChange={handleChange}
                >
                  <option value="Hostel A">Hostel A</option>
                  <option value="Hostel B">Hostel B</option>
                  <option value="Hostel C">Hostel C</option>
                </select>
              </div>
            </div>
          )}

          {formData.role === 'TECHNICIAN' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
              <span className="text-xs font-bold text-slate-600 uppercase">Technician Trade</span>
              <div>
                <label htmlFor="technicianTrade" className="block text-xs font-medium text-slate-700 mb-1">
                  Primary Trade
                </label>
                <select
                  id="technicianTrade"
                  name="technicianTrade"
                  className="block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  value={formData.technicianTrade}
                  onChange={handleChange}
                >
                  <option value="ELECTRICAL">Electrical</option>
                  <option value="PLUMBING">Plumbing</option>
                  <option value="IT">IT & Network</option>
                  <option value="CARPENTRY">Carpentry</option>
                  <option value="HVAC">HVAC & AC</option>
                  <option value="OTHER">General Housekeeping</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <input
              id="agreeTerms"
              name="agreeTerms"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
              checked={formData.agreeTerms}
              onChange={handleChange}
            />
            <label htmlFor="agreeTerms" className="ml-2 block text-xs text-slate-600 cursor-pointer">
              I agree to the university campus conduct policy and terms of service
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-sm transition-all"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
            {success}
          </div>
        )}

        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;