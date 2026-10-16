import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { SupabaseStatusModal } from './SupabaseStatusModal';
import { Menu, X, Globe, User, LogOut, PlusCircle, Database, ShieldCheck } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, profile, role, signOut, switchDemoRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const supabaseReady = isSupabaseConfigured();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-16">
            {/* ZONE 1: Single text/logo wordmark */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <Logo size="md" />
            </Link>

            {/* ZONE 2: 4-5 Clean single-line text links */}
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-700">
              <Link
                to="/jobs"
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  isActive('/jobs') ? 'text-[#0BAA70] font-semibold' : 'hover:text-[#102B4E]'
                }`}
              >
                {t.nav.jobs}
              </Link>
              <Link
                to="/jobs?employmentType=part_time"
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  location.search.includes('part_time') ? 'text-[#0BAA70] font-semibold' : 'hover:text-[#102B4E]'
                }`}
              >
                {t.nav.students}
              </Link>
              <Link
                to="/employer"
                className={`whitespace-nowrap shrink-0 transition-colors ${
                  isActive('/employer') ? 'text-[#0BAA70] font-semibold' : 'hover:text-[#102B4E]'
                }`}
              >
                {t.nav.employers}
              </Link>
              <Link
                to="/#how-it-works"
                className="whitespace-nowrap shrink-0 hover:text-[#102B4E] transition-colors"
              >
                {t.nav.howItWorks}
              </Link>
            </nav>

            {/* ZONE 3: 1 Primary action & Controls */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Language toggle: English / ಕನ್ನಡ */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-[#102B4E] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                title="Switch Language / ಭಾಷೆಯನ್ನು ಬದಲಿಸಿ"
                aria-label="Toggle language between English and Kannada"
              >
                <Globe className="w-3.5 h-3.5 text-[#0BAA70]" />
                <span>{language === 'en' ? 'ಕನ್ನಡ' : 'EN'}</span>
              </button>

              {/* Supabase backend status pill */}
              <button
                onClick={() => setStatusModalOpen(true)}
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
                  supabaseReady
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
                title="View Supabase Backend & RLS Status"
              >
                <Database className="w-3.5 h-3.5" />
                <span>{supabaseReady ? 'Supabase Live' : 'Backend Setup'}</span>
              </button>

              {/* Quick Role Tester (for easy demo reviewer evaluation) */}
              <div className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
                <span className="text-[10px] text-slate-500 font-medium px-1">Role:</span>
                <button
                  onClick={() => switchDemoRole('job_seeker')}
                  className={`px-2 py-0.5 rounded transition-all text-xs font-medium ${
                    role === 'job_seeker' ? 'bg-white shadow-xs text-[#0BAA70] font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Seeker
                </button>
                <button
                  onClick={() => switchDemoRole('employer')}
                  className={`px-2 py-0.5 rounded transition-all text-xs font-medium ${
                    role === 'employer' ? 'bg-white shadow-xs text-[#102B4E] font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Employer
                </button>
                <button
                  onClick={() => switchDemoRole('admin')}
                  className={`px-2 py-0.5 rounded transition-all text-xs font-medium ${
                    role === 'admin' ? 'bg-white shadow-xs text-purple-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Admin
                </button>
              </div>

              {/* Authenticated user menu vs guest CTA */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to={role === 'employer' ? '/employer' : role === 'admin' ? '/admin' : '/dashboard'}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#102B4E] hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <User className="w-4 h-4 text-[#0BAA70]" />
                    <span className="max-w-[120px] truncate">{profile?.full_name?.split(' ')[0] || 'My Account'}</span>
                  </Link>

                  {role === 'employer' ? (
                    <Link
                      to="/employer/jobs/new"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0BAA70] hover:bg-[#098557] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{t.postAJob}</span>
                    </Link>
                  ) : null}

                  <button
                    onClick={handleSignOut}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    title="Log Out"
                    aria-label="Log out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-[#102B4E] transition-colors whitespace-nowrap"
                  >
                    {t.nav.login}
                  </Link>
                  <Link
                    to="/signup"
                    className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0BAA70] hover:bg-[#098557] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-xs"
                  >
                    {t.nav.signup}
                  </Link>
                </div>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-[#102B4E] rounded-lg focus:outline-none"
                aria-label="Open main menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-800">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                {t.nav.home}
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50 text-[#0BAA70] font-semibold"
              >
                {t.nav.jobs}
              </Link>
              <Link
                to="/jobs?employmentType=part_time"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                {t.nav.students} (Part-Time)
              </Link>
              <Link
                to="/employer"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-50"
              >
                {t.nav.employers}
              </Link>
              {role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg hover:bg-purple-50 text-purple-700 font-semibold flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Admin Console
                </Link>
              )}
            </nav>

            {/* Mobile Role Switcher for Testing */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500 mb-1.5 font-medium">Switch Test Role:</p>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg text-xs text-center font-medium">
                <button
                  onClick={() => { switchDemoRole('job_seeker'); setMobileMenuOpen(false); }}
                  className={`py-1 rounded ${role === 'job_seeker' ? 'bg-white text-[#0BAA70] font-bold shadow-xs' : 'text-slate-600'}`}
                >
                  Seeker
                </button>
                <button
                  onClick={() => { switchDemoRole('employer'); setMobileMenuOpen(false); }}
                  className={`py-1 rounded ${role === 'employer' ? 'bg-white text-[#102B4E] font-bold shadow-xs' : 'text-slate-600'}`}
                >
                  Employer
                </button>
                <button
                  onClick={() => { switchDemoRole('admin'); setMobileMenuOpen(false); }}
                  className={`py-1 rounded ${role === 'admin' ? 'bg-white text-purple-700 font-bold shadow-xs' : 'text-slate-600'}`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => { setStatusModalOpen(true); setMobileMenuOpen(false); }}
                className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5 text-[#0BAA70]" />
                <span>Supabase Status</span>
              </button>
              {user && (
                <button
                  onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  {t.nav.logout}
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Supabase Status Modal */}
      <SupabaseStatusModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
      />
    </>
  );
};
