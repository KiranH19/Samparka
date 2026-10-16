import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchEmployerJobs,
  fetchBusinessByOwner,
  saveBusinessProfile,
  fetchJobApplicationsForEmployer,
  updateApplicationStatus,
  updateJobListing
} from '../lib/api';
import { Job, Business, Application, ApplicationStatus, JobStatus } from '../types/database';
import {
  Building2,
  Briefcase,
  Users,
  PlusCircle,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Edit3,
  Eye,
  PauseCircle,
  PlayCircle,
  XCircle,
  Phone,
  Mail,
  ChevronDown
} from 'lucide-react';

export const EmployerDashboard: React.FC = () => {
  const { user, profile, switchDemoRole } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants' | 'business'>('jobs');
  const [business, setBusiness] = useState<Business | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJobForApplicants, setSelectedJobForApplicants] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Business form state
  const [bizName, setBizName] = useState('');
  const [bizCategory, setBizCategory] = useState('Retail & Shops');
  const [bizCity, setBizCity] = useState('Hubli');
  const [bizLocality, setBizLocality] = useState('Chennamma Circle');
  const [bizAddress, setBizAddress] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizDesc, setBizDesc] = useState('');
  const [savingBiz, setSavingBiz] = useState(false);
  const [bizSuccess, setBizSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    fetchBusinessByOwner(user.id)
      .then((biz) => {
        setBusiness(biz);
        if (biz) {
          setBizName(biz.business_name);
          setBizCategory(biz.category);
          setBizCity(biz.city);
          setBizLocality(biz.locality);
          setBizAddress(biz.address || '');
          setBizPhone(biz.contact_phone || '');
          setBizEmail(biz.contact_email || '');
          setBizDesc(biz.description || '');
        }
      })
      .catch((err) => console.error(err));

    fetchEmployerJobs(user.id)
      .then(async (empJobs) => {
        setJobs(empJobs);
        // Load applications for these jobs
        const appsPromises = empJobs.map((j) => fetchJobApplicationsForEmployer(j.id));
        const nested = await Promise.all(appsPromises);
        setApplications(nested.flat());
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingBiz(true);

    try {
      const saved = await saveBusinessProfile(user.id, {
        business_name: bizName,
        category: bizCategory,
        city: bizCity,
        locality: bizLocality,
        address: bizAddress,
        contact_phone: bizPhone,
        contact_email: bizEmail,
        description: bizDesc,
      });
      setBusiness(saved);
      setBizSuccess(true);
      setTimeout(() => setBizSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingBiz(false);
    }
  };

  const handleToggleJobStatus = async (jobId: string, currentStatus: JobStatus) => {
    const nextStatus: JobStatus = currentStatus === 'published' ? 'paused' : 'published';
    await updateJobListing(jobId, { status: nextStatus });
    setJobs(jobs.map((j) => (j.id === jobId ? { ...j, status: nextStatus } : j)));
  };

  const handleCloseJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to mark this position as Closed/Filled?')) return;
    await updateJobListing(jobId, { status: 'closed' });
    setJobs(jobs.map((j) => (j.id === jobId ? { ...j, status: 'closed' } : j)));
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    await updateApplicationStatus(appId, newStatus);
    setApplications(
      applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
    );
  };

  const filteredApplications = selectedJobForApplicants === 'all'
    ? applications
    : applications.filter((a) => a.job_id === selectedJobForApplicants);

  const activeJobsCount = jobs.filter((j) => j.status === 'published').length;
  const totalApplicantsCount = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted' || a.status === 'hired').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#102B4E]">
              {business?.business_name || 'Employer Dashboard'}
            </h1>
            {business?.verification_status === 'verified' && (
              <span className="inline-flex items-center gap-1 text-[#0BAA70] text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {business?.locality || 'Hubli'}, {business?.city || 'Karnataka'} · {business?.category || 'Local Business'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/employer/jobs/new"
            className="px-4 py-2.5 bg-[#0BAA70] hover:bg-[#098557] text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post a New Job</span>
          </Link>
        </div>
      </div>

      {/* KPI Performance Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Published Jobs</span>
          <div className="text-2xl font-extrabold text-[#102B4E]">{activeJobsCount}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Received Applicants</span>
          <div className="text-2xl font-extrabold text-[#0BAA70]">{totalApplicantsCount}</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shortlisted / Hired</span>
          <div className="text-2xl font-extrabold text-[#102B4E]">{shortlistedCount}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200 text-xs font-semibold text-slate-600">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'jobs' ? 'border-[#0BAA70] text-[#0BAA70] font-bold' : 'border-transparent hover:text-[#102B4E]'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>My Job Postings ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applicants')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'applicants' ? 'border-[#0BAA70] text-[#0BAA70] font-bold' : 'border-transparent hover:text-[#102B4E]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Applicants ({applications.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`pb-3 px-2 border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'business' ? 'border-[#0BAA70] text-[#0BAA70] font-bold' : 'border-transparent hover:text-[#102B4E]'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Business Profile</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: JOB POSTINGS MANAGEMENT                           */}
      {/* ======================================================== */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {jobs.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {jobs.map((job) => (
                <div key={job.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                        job.status === 'published' ? 'bg-emerald-50 text-[#0BAA70]' :
                        job.status === 'paused' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {job.status}
                      </span>
                      <span>·</span>
                      <span>{job.locality}, {job.city}</span>
                      <span>·</span>
                      <span className="capitalize">{job.employment_type.replace('_', ' ')}</span>
                    </div>

                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-base font-bold text-[#102B4E] hover:text-[#0BAA70] transition-colors block"
                    >
                      {job.title}
                    </Link>

                    <div className="text-xs text-slate-500 flex items-center gap-2 pt-1">
                      <span>Posted: {new Date(job.created_at).toLocaleDateString()}</span>
                      <span>·</span>
                      <span>{job.applications_count || 0} applications received</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600"
                      title="View public listing"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {job.status !== 'closed' && (
                      <button
                        onClick={() => handleToggleJobStatus(job.id, job.status)}
                        className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 font-medium"
                      >
                        {job.status === 'published' ? 'Pause' : 'Resume'}
                      </button>
                    )}

                    {job.status !== 'closed' && (
                      <button
                        onClick={() => handleCloseJob(job.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                      >
                        Mark Filled
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-3">
              <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-[#102B4E]">You haven't posted any jobs yet</h3>
              <p className="text-xs text-slate-500">
                Create a vacancy listing in Hubli–Dharwad to begin receiving candidate applications.
              </p>
              <Link
                to="/employer/jobs/new"
                className="inline-block px-4 py-2 bg-[#0BAA70] text-white text-xs font-bold rounded-lg"
              >
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: APPLICANTS VIEWER                                 */}
      {/* ======================================================== */}
      {activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Job Filter selector */}
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700">Filter Applicants by Job:</span>
            <select
              value={selectedJobForApplicants}
              onChange={(e) => setSelectedJobForApplicants(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none"
            >
              <option value="all">All Jobs ({applications.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
          </div>

          {filteredApplications.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              {filteredApplications.map((app) => (
                <div key={app.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#102B4E]">{app.applicant_name}</h4>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">
                        Applied {new Date(app.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                      {app.applicant_phone && (
                        <span className="flex items-center gap-1 font-medium">
                          <Phone className="w-3.5 h-3.5 text-[#0BAA70]" />
                          {app.applicant_phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {app.applicant_email}
                      </span>
                    </div>

                    {app.cover_letter && (
                      <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 max-w-xl">
                        "{app.cover_letter}"
                      </p>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div className="flex items-center gap-3 self-end md:self-auto text-xs">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-xs focus:ring-2 focus:ring-[#0BAA70] text-slate-800 cursor-pointer"
                    >
                      <option value="applied">Applied</option>
                      <option value="under_review">Under Review</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Not Selected</option>
                      <option value="hired">Hired 🎉</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-2">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-[#102B4E]">No applicants received yet</h3>
              <p className="text-xs text-slate-500">
                Applicants who apply to your active job listings will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: BUSINESS PROFILE SETUP & EDIT                     */}
      {/* ======================================================== */}
      {activeTab === 'business' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs max-w-2xl">
          <form onSubmit={handleSaveBusiness} className="space-y-5 text-xs">
            {bizSuccess && (
              <div className="p-3 bg-emerald-50 text-[#0BAA70] rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Business profile saved successfully!</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Business / Enterprise Name
              </label>
              <input
                type="text"
                required
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="e.g. Kamat Retail, Chai & Charcha Cafe"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={bizCategory}
                  onChange={(e) => setBizCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
                >
                  <option value="Retail & Shops">Retail & Shops</option>
                  <option value="Restaurants & Cafes">Restaurants & Cafes</option>
                  <option value="Manufacturing & Industrial">Manufacturing & Industrial</option>
                  <option value="IT & Office">IT & Office</option>
                  <option value="Logistics & Delivery">Logistics & Delivery</option>
                  <option value="Healthcare & Clinic">Healthcare & Clinic</option>
                  <option value="Teaching & Tutoring">Teaching & Tutoring</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">City</label>
                <select
                  value={bizCity}
                  onChange={(e) => setBizCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
                >
                  <option value="Hubli">Hubli (ಹುಬ್ಬಳ್ಳಿ)</option>
                  <option value="Dharwad">Dharwad (ಧಾರವಾಡ)</option>
                  <option value="Belagavi">Belagavi</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Locality</label>
                <input
                  type="text"
                  required
                  value={bizLocality}
                  onChange={(e) => setBizLocality(e.target.value)}
                  placeholder="e.g. Chennamma Circle, Vidyanagar, Gokul Road"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={bizPhone}
                  onChange={(e) => setBizPhone(e.target.value)}
                  placeholder="+91 98800..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Business Description</label>
              <textarea
                rows={3}
                value={bizDesc}
                onChange={(e) => setBizDesc(e.target.value)}
                placeholder="Describe your store, products, or working culture..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={savingBiz}
                className="px-6 py-2.5 bg-[#0BAA70] hover:bg-[#098557] text-white font-bold rounded-xl transition-colors shadow-xs"
              >
                {savingBiz ? 'Saving...' : 'Save Business Profile'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
