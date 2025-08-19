/* eslint-disable no-empty */
// src/pages/Login.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { patientLogin, patientMe } from '../slices/authPatientSlice';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Lock, Eye, EyeOff, Loader2, LogIn, UserPlus, ArrowLeft } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('patient@example.com');
  const [password, setPassword] = useState('password');
  const [showPwd, setShowPwd] = useState(false);
  const { status, error } = useSelector((s) => s.authPatient);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(patientLogin({ email, password })).unwrap();
      await dispatch(patientMe()).unwrap();
      nav('/dashboard/patient');
    } catch {}
  };

  const loading = status === 'loading';

  return (
    <div className="relative min-h-screen grid place-items-center px-4 py-8">
      
      

      {/* Card */}
      <div className="w-full flex flex-col max-w-md bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-black/5 p-6 sm:p-8">
        {/* Header */}
        <Link
        to="/"
        aria-label="Back to home"
        className="inline-flex items-center gap-2 mb-5
                   text-tree-blue font-medium hover:underline"
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-[#246AFE] text-white grid place-items-center">
            <Stethoscope size={20} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0B0A0A]">Patient Login</h1>
            <p className="text-xs text-gray-500">Sign in to book and manage your appointments</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm">
            {String(error)}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#0B0A0A] mb-1">Email</label>
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#0B0A0A] mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                id="password"
                type={showPwd ? 'text' : 'password'}
                autoComplete="current-password"
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
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#246AFE] text-white py-2.5 text-sm font-medium hover:opacity-90 active:opacity-95 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                <LogIn size={16} />
                Login
              </>
            )}
          </button>
        </form>

        <div className="mt-5 space-y-2 text-sm">
          <div>
            No account?{" "}
            <Link to="/register" className="inline-flex items-center gap-1 text-[#246AFE] hover:underline">
              <UserPlus size={14} />
              Register
            </Link>
          </div>
          <div>
            Doctor?{" "}
            <Link to="/doctor/login" className="text-[#246AFE] hover:underline">
              Doctor Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
