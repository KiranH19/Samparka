import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchJobById, submitApplication, submitJobReport, toggleSaveJob, checkIsJobSaved } from '../lib/api';
import { Job } from '../types/database';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Bookmark,
  Share2,
  Flag,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  Send,
  X
} from 'lucide-react';

export const JobDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { t } = useLanguage();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [appSuccess, setAppSuccess] = useState(false);

  // Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Suspicious or Scam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchJobById(id)
      .then((data) => {
        setJob(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    if (user && id) {
      checkIsJobSaved(user.id, id).then(setIsSaved);
    }
  }, [id, user]);

  // Pre-fill profile info when opening apply modal
  useEffect(() => {
    if (user && profile) {
      setApplicantName(profile.full_name || '');
      setApplicantEmail(user.email || '');
      setApplicantPhone(profile.phone || '');
    }
  }, [user, profile, isApplyModalOpen]);

  const handleApplyClick = () => {
    if (!user) {
      // Store redirect target to return user back after login
      navigate(`/login?redirect=/jobs/${id}`);
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !user) return;
    setSubmittingApp(true);
    setAppError(null);

    try {
      await submitApplication(job.id, user.id, {
        applicant_name: applicantName,
        applicant_email: applicantEmail,
        applicant_phone: applicantPhone,
        cover_letter: coverLetter,
        resume_path: resumeFile ? `resumes/${user.id}/${Date.now()}_${resumeFile.name}` : undefined,
      });

      setAppSuccess(true);
      setHasApplied(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0BAA70', '#102B4E', '#10B981'],
      });
      setTimeout(() => {
        setIsApplyModalOpen(false);
        setAppSuccess(false);
      }, 2200);
    } catch (err: any) {
      setAppError(err.message || 'Failed to submit application. Please check your network.');
    } finally {
      setSubmittingApp(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    try {
      await submitJobReport(job.id, reportReason, reportDetails, user?.id);
      setReportSubmitted(true);
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSubmitted(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  };

  const handleSaveToggle = async () => {
    if (!user || !job) {
      alert('Please sign in to save jobs.');
      return;
    }
    const state = await toggleSaveJob(user.id, job.id);
    setIsSaved(state);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title || 'Job on Samparka',
        text: `Check out this job opening in Hubli-Dharwad: ${job?.title}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Job link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="h-10 w-3/4 bg-slate-200 rounded" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-[#102B4E]">Job listing not found</h2>
        <p className="text-xs text-slate-500">This job may have expired, closed, or been removed by the employer.</p>
        <Link to="/jobs" className="inline-block px-4 py-2 bg-[#0BAA70] text-white text-xs font-semibold rounded-lg">
          Browse Active Jobs
        </Link>
      </div>
    );
  }

  const formatSalary = () => {
    if (job.salary_min && job.salary_max) {
      return `₹${job.salary_min.toLocaleString()} – ₹${job.salary_max.toLocaleString()} per ${job.salary_period}`;
    }
    if (job.salary_min) {
      return `From ₹${job.salary_min.toLocaleString()} per ${job.salary_period}`;
    }
    return 'Salary Negotiable';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#102B4E] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to listings</span>
      </button>

      {/* Main Job Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="text-slate-800 font-semibold">{job.business?.business_name || 'Local Employer'}</span>
              {job.business?.verification_status === 'verified' && (
                <span className="inline-flex items-center gap-1 text-[#0BAA70] font-semibold text-[11px]" title="Verified by Samparka Team">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Business</span>
                </span>
              )}
              <span aria-hidden="true">·</span>
              <span>{job.category}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#102B4E] mt-1 leading-tight">
              {job.title}
            </h1>
          </div>

          {/* Action cluster: Bookmark & Share */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={handleSaveToggle}
              className={`p-2.5 rounded-xl border transition-colors ${
                isSaved ? 'bg-emerald-50 border-emerald-200 text-[#0BAA70]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Job Saved' : 'Save Job'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#0BAA70]' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
              title="Share job"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-slate-50 transition-colors"
              title="Report suspicious listing"
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Highlighted Meta Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-500 block">Location</span>
            <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#0BAA70]" />
              {job.locality}, {job.city}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Offered Compensation</span>
            <span className="font-bold text-[#102B4E] block mt-0.5">
              {formatSalary()}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Employment Type</span>
            <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5 capitalize">
              <Briefcase className="w-3.5 h-3.5 text-[#0BAA70]" />
              {t.jobTypes[job.employment_type as keyof typeof t.jobTypes] || job.employment_type.replace('_', ' ')}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block">Openings</span>
            <span className="font-bold text-slate-900 block mt-0.5">
              {job.openings} {job.openings === 1 ? 'position' : 'positions'}
            </span>
          </div>
        </div>

        {/* Apply CTA Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            {job.work_schedule && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0BAA70]" />
                Schedule: <strong className="text-slate-700">{job.work_schedule}</strong>
              </span>
            )}
          </div>

          <button
            onClick={handleApplyClick}
            disabled={hasApplied}
            className={`w-full sm:w-auto px-8 py-3 text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 ${
              hasApplied
                ? 'bg-emerald-100 text-emerald-800 cursor-default'
                : 'bg-[#0BAA70] hover:bg-[#098557] text-white hover:shadow-md'
            }`}
          >
            {hasApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Application Submitted</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t.actions.applyNow}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Job Details Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-[#102B4E]">Role Description</h2>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </div>

            {/* Skills unboxed list */}
            {job.skills && job.skills.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Required / Preferred Skills
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600 font-medium">
                  {job.skills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-[#102B4E]">About the Employer</h3>
            <p className="text-slate-600 leading-relaxed">
              {job.business?.description || 'A verified local business operating in the Hubli-Dharwad region.'}
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2 text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0BAA70]" />
                <span>{job.business?.address || `${job.locality}, ${job.city}`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#0BAA70]" />
                <span>Posted {new Date(job.published_at || job.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* APPLY APPLICATION MODAL                                  */}
      {/* ======================================================== */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 text-[#172B4D] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-[#102B4E]">Apply for {job.title}</h3>
                <p className="text-xs text-slate-500">{job.business?.business_name} · {job.locality}</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {appSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#0BAA70] mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-[#102B4E]">Application Submitted Successfully!</h4>
                <p className="text-xs text-slate-600">
                  The employer has received your profile and will contact you directly. You can monitor your application status in your Seeker Dashboard.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="mt-4 space-y-4 text-xs">
                {appError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{appError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="+91 98800..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Cover Note / Availability (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly mention your schedule, college timetable, or why you're interested..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Upload Resume (PDF / DOCX, Optional)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-[#0BAA70] hover:file:bg-emerald-100"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsApplyModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingApp}
                    className="px-5 py-2 bg-[#0BAA70] hover:bg-[#098557] text-white font-bold rounded-lg transition-colors shadow-xs"
                  >
                    {submittingApp ? 'Submitting...' : 'Submit Application'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REPORT JOB MODAL                                         */}
      {/* ======================================================== */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 text-[#172B4D]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#102B4E]">Report Job Listing</h3>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="py-6 text-center text-xs text-slate-600 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-[#0BAA70] mx-auto" />
                <p className="font-bold text-slate-800">Report Submitted</p>
                <p>Thank you for keeping Samparka safe. Our moderation team will investigate this listing.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Suspicious or Scam">Suspicious or Scam / Fake Employer</option>
                    <option value="Asks for Upfront Money">Asks for Upfront Money / Deposit</option>
                    <option value="Incorrect Locality or Salary">Incorrect Locality or False Salary Details</option>
                    <option value="Inappropriate Content">Inappropriate Content</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Additional details (Optional)</label>
                  <textarea
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide details for our moderation team..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-3 py-1.5 text-slate-500 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                  >
                    Send Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
