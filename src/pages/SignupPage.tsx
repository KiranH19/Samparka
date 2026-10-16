import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from '../components/common/Logo';
import { UserRole } from '../types/database';
import { Mail, Lock, User, ArrowRight, AlertCircle, Briefcase, GraduationCap, Store } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState<UserRole>(
    (searchParams.get('role') as UserRole) || 'job_seeker'
  );
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setError(null);
    setLoading(true);

    const res = await signUp(email, password, fullName, role);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      if (role === 'employer') {
        navigate('/employer');
      } else {
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link to="/" className="inline-block">
          <Logo size="lg" />
        </Link>
        <h2 className="text-2xl font-extrabold text-[#102B4E]">
          Join Samparka
        </h2>
        <p className="text-xs text-slate-500">
          Discover opportunities or hire local workers in Hubli–Dharwad.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-slate-200 sm:rounded-2xl sm:px-10 space-y-6">
          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              I want to:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('job_seeker')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  role === 'job_seeker'
                    ? 'border-[#0BAA70] bg-emerald-50/60 ring-2 ring-[#0BAA70]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B4E]">
                  <GraduationCap className="w-4 h-4 text-[#0BAA70]" />
                  <span>Find Jobs</span>
                </div>
                <span className="text-[11px] text-slate-500">Job Seeker / Student</span>
              </button>

              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                  role === 'employer'
                    ? 'border-[#0BAA70] bg-emerald-50/60 ring-2 ring-[#0BAA70]/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B4E]">
                  <Store className="w-4 h-4 text-[#0BAA70]" />
                  <span>Hire Staff</span>
                </div>
                <span className="text-[11px] text-slate-500">Shop, Cafe, Office</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name {role === 'employer' ? 'or Business Contact' : ''}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'employer' ? 'Rajesh Kamat' : 'Ananya Patil'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0BAA70]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0BAA70]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0BAA70]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0BAA70] hover:bg-[#098557] text-white text-xs font-bold rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Creating account...' : 'Create Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#0BAA70] hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
