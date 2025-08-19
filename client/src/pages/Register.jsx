// src/pages/Register.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { patientRegister } from '../slices/authPatientSlice';
import { useNavigate, Link } from 'react-router-dom';
import { Stethoscope, User, Mail, Lock, Eye, EyeOff, Loader2, UserPlus, LogIn, ArrowLeft } from 'lucide-react';

export default function Register() {
  const [user_name, setUserName] = useState('demo_patient');
  const [email, setEmail] = useState('newpatient@example.com');
  const [password, setPassword] = useState('password');
  const [showPwd, setShowPwd] = useState(false);

  const { status, error } = useSelector((s) => s.authPatient);
  const loading = status === 'loading';

  const dispatch = useDispatch();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(patientRegister({ user_name, email, password })).unwrap();
      // keep your original behavior:
      nav('/dashboard/patient');
      // (Optional UX: redirect to /login instead if your API doesn't auto-login after register)
    } catch {
      /* error is shown from store */
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-4 py-8">
      <div className="w-full flex flex-col max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-black/5 p-6 sm:p-8">
      <Link
        to="/"
        aria-label="Back to home"
        className="inline-flex items-center gap-2 mb-5
                   text-tree-blue font-medium hover:underline"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </Link>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#246AFE] text-white grid place-items-center">
            <Stethoscope size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B0A0A]">Create Patient Account</h1>
            <p className="text-xs text-gray-500">Register to book and manage your appointments</p>
          </div>
        </div>

        {/* Error callout */}
        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            {String(error)}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-[#0B0A0A] mb-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                id="username"
                required
                className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                placeholder="e.g. hasna_b"
                value={user_name}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#0B0A0A] mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#0B0A0A] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="w-full rounded-lg border border-black/10 bg-white pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#246AFE]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-gray-100"
                aria-label={showPwd ? 'Hide password' : 'Show password'}
              >
                {showPwd ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">Use at least 8 characters for a stronger password.</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#246AFE] text-white py-2.5 text-sm font-medium hover:opacity-90 active:opacity-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                <UserPlus size={16} />
                Register
              </>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="mt-5 space-y-2 text-sm">
          <div>
            Already have an account?{' '}
            <Link to="/login" className="inline-flex items-center gap-1 text-[#246AFE] hover:underline">
              <LogIn size={14} />
              Login
            </Link>
          </div>
          <div>
            Doctor?{' '}
            <Link to="/doctor/register" className="text-[#246AFE] hover:underline">
              Register as Doctor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
