import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { HeroIllustration } from '../components/common/HeroIllustration';
import { JobCard } from '../components/jobs/JobCard';
import { fetchJobs } from '../lib/api';
import { Job } from '../types/database';
import {
  MapPin,
  Search,
  Briefcase,
  GraduationCap,
  Store,
  Building2,
  Clock,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Users,
  Compass,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroSearch, setHeroSearch] = useState('');
  const [heroLocality, setHeroLocality] = useState('');

  useEffect(() => {
    fetchJobs({ sortBy: 'newest' })
      .then((jobs) => setRecentJobs(jobs.slice(0, 4)))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (heroSearch.trim()) params.set('search', heroSearch.trim());
    if (heroLocality) params.set('locality', heroLocality);
    navigate(`/jobs?${params.toString()}`);
  };

  const keyLocalities = [
    { name: 'Chennamma Circle', count: 'Retail & Electronics' },
    { name: 'Vidyanagar', count: 'Cafes & Student Roles' },
    { name: 'Gokul Road', count: 'Industrial & Tech' },
    { name: 'Line Bazar', count: 'Dharwad Route & Delivery' },
    { name: 'Navanagar', count: 'Office & IT Parks' },
    { name: 'Keshwapur', count: 'Billing & Commercial' },
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ======================================================== */}
      {/* 1. HERO SECTION (Faithful to the Samparka Launch Poster) */}
      {/* ======================================================== */}
      <section className="relative pt-6 sm:pt-12 pb-8 sm:pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Headlines & Call to Actions */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Regional launch tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[#0BAA70] text-xs font-semibold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{t.startingIn}</span>
              </div>

              {/* Small Heading: Introducing Samparka */}
              <div className="text-sm font-bold uppercase tracking-wider text-[#0BAA70]">
                {t.introHeading}
              </div>

              {/* Main Headline (Kannada & English prominent) */}
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102B4E] leading-[1.18] tracking-tight">
                {t.mainHeadline}
              </h1>

              {/* Secondary Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed">
                {t.heroSupport}
              </p>

              {/* Hero Search Box */}
              <form
                onSubmit={handleHeroSearchSubmit}
                className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200 max-w-xl flex flex-col sm:flex-row gap-2"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    placeholder="Search roles (e.g. Sales, Barista, Billing)..."
                    className="w-full pl-10 pr-3 py-2 text-sm text-slate-900 bg-transparent focus:outline-none"
                  />
                </div>
                <div className="sm:w-44 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-2">
                  <select
                    value={heroLocality}
                    onChange={(e) => setHeroLocality(e.target.value)}
                    className="w-full py-2 bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="">All Localities</option>
                    <option value="Vidyanagar">Vidyanagar</option>
                    <option value="Chennamma Circle">Chennamma Circle</option>
                    <option value="Gokul Road">Gokul Road</option>
                    <option value="Line Bazar">Line Bazar (Dharwad)</option>
                    <option value="Navanagar">Navanagar</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0BAA70] hover:bg-[#098557] text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shadow-xs"
                >
                  {t.findJobsNearMe}
                </button>
              </form>

              {/* CTAs & Opportunities Around You */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/jobs"
                  className="px-6 py-3 bg-[#102B4E] hover:bg-[#0a1c34] text-white text-sm font-bold rounded-xl transition-colors whitespace-nowrap shadow-xs flex items-center gap-2"
                >
                  <span>{t.findJobsNearMe}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/employer/jobs/new"
                  className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-[#102B4E] text-sm font-bold rounded-xl transition-colors whitespace-nowrap"
                >
                  {t.postAJob}
                </Link>

                <div className="flex items-center gap-2 text-xs font-semibold text-[#0BAA70]">
                  <span>Opportunities Around You.</span>
                  <span role="img" aria-label="handshake">🤝</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Graphic matching uploaded flyer */}
            <div className="lg:col-span-5 flex justify-center">
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. HUBLI-DHARWAD LOCALITY HUBS STRIP                     */}
      {/* ======================================================== */}
      <section className="bg-white border-y border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#102B4E]">
                Explore Opportunities Across Hubli–Dharwad
              </h2>
              <p className="text-xs text-slate-500">
                Jobs within your walking or commute distance.
              </p>
            </div>
            <Link to="/jobs" className="text-xs font-semibold text-[#0BAA70] hover:underline flex items-center gap-1">
              View All Locations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {keyLocalities.map((loc) => (
              <button
                key={loc.name}
                onClick={() => navigate(`/jobs?locality=${encodeURIComponent(loc.name)}`)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0BAA70] hover:bg-emerald-50/40 text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#102B4E] group-hover:text-[#0BAA70]">
                  <MapPin className="w-3 h-3 text-[#0BAA70]" />
                  <span>{loc.name}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {loc.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. RECENT LOCAL JOBS FROM REAL SUPABASE DATA             */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#0BAA70]">
              Verified Listings
            </span>
            <h2 className="text-2xl font-bold text-[#102B4E] mt-1">
              Recently Posted Jobs in Hubli–Dharwad
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Local retail, hospitality, industrial, and IT positions hiring right now.
            </p>
          </div>
          <Link
            to="/jobs"
            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-[#102B4E] hover:text-[#0BAA70] transition-colors"
          >
            <span>{t.nav.jobs}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl p-5 border border-slate-200 animate-pulse h-40" />
            ))}
          </div>
        ) : recentJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
            <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-[#102B4E]">No published jobs found</h3>
            <p className="text-xs text-slate-500">Be the first local employer to post an opportunity in Hubli-Dharwad!</p>
            <Link
              to="/employer/jobs/new"
              className="inline-block px-4 py-2 bg-[#0BAA70] text-white text-xs font-bold rounded-lg"
            >
              Post a Job Now
            </Link>
          </div>
        )}

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-[#102B4E] text-xs font-bold rounded-xl"
          >
            <span>Browse All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. STUDENT OPPORTUNITIES (Vidyanagar & Dharwad Colleges) */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 to-[#102B4E] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold">
              <GraduationCap className="w-4 h-4" />
              <span>For College Students · ಕಾಲೇಜು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
              Earn while you learn. Part-time shifts around your class timetable.
            </h2>
            <p className="text-sm text-emerald-100 leading-relaxed">
              Find flexible 3–4 hour evening shifts, weekend roles, and internships near KLE Tech, Karnatak University Dharwad, KCD, and BVB college hubs. No prior experience required for most student positions.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/jobs?employmentType=part_time"
                className="px-5 py-2.5 bg-[#0BAA70] hover:bg-[#098557] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                Browse Student Part-Time Jobs
              </Link>
              <Link
                to="/signup?role=job_seeker"
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors"
              >
                Create Student Profile
              </Link>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
            <GraduationCap className="w-80 h-80 text-white" />
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. HOW SAMPARKA WORKS                                    */}
      {/* ======================================================== */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0BAA70]">
            Simple Local Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B4E] mt-1">
            How Samparka Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Connecting candidates directly with nearby shopkeepers, cafes, and companies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0BAA70] flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-[#102B4E]">
              1. Discover Nearby
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Filter jobs by your exact locality in Hubli or Dharwad. Check salary ranges, work schedules, and bus/commute convenience.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0284C7] flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-[#102B4E]">
              2. Apply in 1 Minute
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit your basic contact details and resume or profile summary. No long bureaucratic forms or third-party spam.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-[#102B4E]">
              3. Connect & Join
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Employers review your application directly and update your status: Under Review, Shortlisted, or Hired.
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. FOR LOCAL BUSINESSES / EMPLOYERS BANNER               */}
      {/* ======================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              <Store className="w-3.5 h-3.5 text-[#0BAA70]" />
              <span>For Shops, Cafes, Clinics & Local Businesses</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#102B4E]">
              Need reliable staff for your local business in Hubli–Dharwad?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Post your job openings in under 2 minutes. Reach dependable local candidates living nearby who can start promptly. Manage applications and applicant statuses with ease.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/employer/jobs/new"
                className="px-6 py-3 bg-[#0BAA70] hover:bg-[#098557] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
              >
                {t.postAJob}
              </Link>
              <Link
                to="/employer"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-[#102B4E] text-xs font-bold rounded-xl transition-colors"
              >
                Go to Employer Hub
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 bg-[#FAFAF5] p-6 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-bold text-[#102B4E] text-sm">Why Local Businesses Choose Samparka:</h4>
            <ul className="space-y-2 text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0BAA70] shrink-0 mt-0.5" />
                <span>Zero middlemen or placement agency commissions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0BAA70] shrink-0 mt-0.5" />
                <span>Candidates from nearby localities with lower commute attrition</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0BAA70] shrink-0 mt-0.5" />
                <span>Full application management & candidate tracker</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ)                      */}
      {/* ======================================================== */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0BAA70]">Questions?</span>
          <h2 className="text-2xl font-bold text-[#102B4E] mt-1">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-sm text-[#102B4E]">Is Samparka free for job seekers?</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Yes, 100% free for all job seekers, college students, and applicants. You can search, save, and apply to unlimited verified jobs in Hubli–Dharwad.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-sm text-[#102B4E]">Can college students work part-time?</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Absolutely! We have a dedicated section for student opportunities with evening shifts (e.g. 4 PM – 9 PM) and weekend schedules, particularly in retail showrooms, cafes, and computer billing.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200">
            <h3 className="font-bold text-sm text-[#102B4E]">Which locations are currently supported?</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              We are actively focused on the twin cities of <strong>Hubli and Dharwad</strong>, including Vidyanagar, Chennamma Circle, Gokul Road, Line Bazar, Keshwapur, and Navanagar, expanding rapidly to Belagavi and other Karnataka districts.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
