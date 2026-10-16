import { supabase, isSupabaseConfigured, DEMO_JOBS, DEMO_BUSINESSES } from './supabase';
import { Job, Business, Application, SavedJob, JobReport, Profile, ApplicationStatus, VerificationStatus, ReportStatus, JobStatus } from '../types/database';

// Local storage fallback cache keys for development before Supabase keys are entered
const STORAGE_JOBS_KEY = 'samparka_local_jobs';
const STORAGE_BIZ_KEY = 'samparka_local_biz';
const STORAGE_APPS_KEY = 'samparka_local_apps';
const STORAGE_SAVED_KEY = 'samparka_local_saved';
const STORAGE_REPORTS_KEY = 'samparka_local_reports';
const STORAGE_PROFILES_KEY = 'samparka_local_profiles';

const getInitialJobs = (): Job[] => {
  const saved = localStorage.getItem(STORAGE_JOBS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return DEMO_JOBS;
};

const getInitialBusinesses = (): Business[] => {
  const saved = localStorage.getItem(STORAGE_BIZ_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return DEMO_BUSINESSES;
};

// =========================================================================
// JOB QUERIES & MUTATIONS
// =========================================================================

export interface JobFilterParams {
  search?: string;
  city?: string;
  locality?: string;
  category?: string;
  employmentType?: string;
  minSalary?: number;
  maxSalary?: number;
  isRemote?: boolean;
  sortBy?: 'newest' | 'salary_high';
}

export const fetchJobs = async (filters: JobFilterParams = {}): Promise<Job[]> => {
  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('jobs')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('status', 'published');

      if (filters.city && filters.city !== 'all') {
        query = query.eq('city', filters.city);
      }
      if (filters.locality && filters.locality !== 'all') {
        query = query.eq('locality', filters.locality);
      }
      if (filters.category && filters.category !== 'all') {
        query = query.eq('category', filters.category);
      }
      if (filters.employmentType && filters.employmentType !== 'all') {
        query = query.eq('employment_type', filters.employmentType);
      }
      if (filters.isRemote) {
        query = query.eq('is_remote', true);
      }
      if (filters.minSalary) {
        query = query.gte('salary_min', filters.minSalary);
      }
      if (filters.maxSalary) {
        query = query.lte('salary_max', filters.maxSalary);
      }
      if (filters.search && filters.search.trim()) {
        const term = `%${filters.search.trim()}%`;
        query = query.or(`title.ilike.${term},description.ilike.${term},locality.ilike.${term}`);
      }

      if (filters.sortBy === 'salary_high') {
        query = query.order('salary_max', { ascending: false, nullsFirst: false });
      } else {
        query = query.order('published_at', { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as Job[]) || [];
    } catch (err) {
      console.warn('Supabase query error, falling back to local dataset:', err);
    }
  }

  // Fallback to local store
  let jobs = getInitialJobs().filter(j => j.status === 'published');

  if (filters.search && filters.search.trim()) {
    const s = filters.search.toLowerCase();
    jobs = jobs.filter(j =>
      j.title.toLowerCase().includes(s) ||
      j.description.toLowerCase().includes(s) ||
      j.locality.toLowerCase().includes(s) ||
      j.skills.some(skill => skill.toLowerCase().includes(s))
    );
  }
  if (filters.city && filters.city !== 'all') {
    jobs = jobs.filter(j => j.city.toLowerCase() === filters.city!.toLowerCase());
  }
  if (filters.locality && filters.locality !== 'all') {
    jobs = jobs.filter(j => j.locality.toLowerCase().includes(filters.locality!.toLowerCase()));
  }
  if (filters.category && filters.category !== 'all') {
    jobs = jobs.filter(j => j.category === filters.category);
  }
  if (filters.employmentType && filters.employmentType !== 'all') {
    jobs = jobs.filter(j => j.employment_type === filters.employmentType);
  }
  if (filters.isRemote) {
    jobs = jobs.filter(j => j.is_remote);
  }
  if (filters.minSalary) {
    jobs = jobs.filter(j => (j.salary_max || j.salary_min || 0) >= filters.minSalary!);
  }
  if (filters.maxSalary) {
    jobs = jobs.filter(j => (j.salary_min || 0) <= filters.maxSalary!);
  }

  if (filters.sortBy === 'salary_high') {
    jobs.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
  } else {
    jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return jobs;
};

export const fetchJobById = async (id: string): Promise<Job | null> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          business:businesses(*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Job;
    } catch (err) {
      console.warn('Supabase fetchJobById error:', err);
    }
  }

  const jobs = getInitialJobs();
  const job = jobs.find(j => j.id === id);
  if (!job) return null;

  const businesses = getInitialBusinesses();
  const biz = businesses.find(b => b.id === job.business_id);
  return { ...job, business: biz };
};

export const createJobListing = async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'business'>): Promise<Job> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([jobData])
      .select()
      .single();
    if (error) throw error;
    return data as Job;
  }

  const newJob: Job = {
    ...jobData,
    id: `job-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    published_at: jobData.status === 'published' ? new Date().toISOString() : null,
    applications_count: 0,
  };

  const current = getInitialJobs();
  const updated = [newJob, ...current];
  localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(updated));
  return newJob;
};

export const updateJobListing = async (id: string, updates: Partial<Job>): Promise<Job> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('jobs')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Job;
  }

  const jobs = getInitialJobs();
  const index = jobs.findIndex(j => j.id === id);
  if (index === -1) throw new Error('Job not found');

  jobs[index] = { ...jobs[index], ...updates, updated_at: new Date().toISOString() };
  localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(jobs));
  return jobs[index];
};

export const deleteJobListing = async (id: string): Promise<void> => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('jobs').delete().eq('id', id);
    if (error) throw error;
    return;
  }

  const jobs = getInitialJobs().filter(j => j.id !== id);
  localStorage.setItem(STORAGE_JOBS_KEY, JSON.stringify(jobs));
};

export const fetchEmployerJobs = async (userId: string): Promise<Job[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Job[]) || [];
  }

  const allJobs = getInitialJobs();
  const businesses = getInitialBusinesses();
  return allJobs
    .filter(j => j.created_by === userId || j.created_by.startsWith('owner-'))
    .map(j => ({
      ...j,
      business: businesses.find(b => b.id === j.business_id),
    }));
};

// =========================================================================
// APPLICATIONS QUERIES & MUTATIONS
// =========================================================================

export const submitApplication = async (
  jobId: string,
  applicantId: string,
  payload: {
    applicant_name: string;
    applicant_email: string;
    applicant_phone?: string;
    cover_letter?: string;
    resume_path?: string;
  }
): Promise<Application> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        job_id: jobId,
        applicant_id: applicantId,
        ...payload,
        status: 'applied',
      }])
      .select()
      .single();
    if (error) {
      if (error.code === '23505') {
        throw new Error('You have already applied for this job.');
      }
      throw error;
    }
    return data as Application;
  }

  // Local fallback
  const rawApps = localStorage.getItem(STORAGE_APPS_KEY);
  const apps: Application[] = rawApps ? JSON.parse(rawApps) : [];

  // Check unique application
  const existing = apps.find(a => a.job_id === jobId && a.applicant_id === applicantId);
  if (existing) {
    throw new Error('You have already applied for this job.');
  }

  const newApp: Application = {
    id: `app-${Date.now()}`,
    job_id: jobId,
    applicant_id: applicantId,
    applicant_name: payload.applicant_name,
    applicant_email: payload.applicant_email,
    applicant_phone: payload.applicant_phone,
    cover_letter: payload.cover_letter,
    resume_path: payload.resume_path,
    status: 'applied',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  apps.push(newApp);
  localStorage.setItem(STORAGE_APPS_KEY, JSON.stringify(apps));
  return newApp;
};

export const fetchUserApplications = async (userId: string): Promise<Application[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs(*, business:businesses(*))
      `)
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Application[]) || [];
  }

  const rawApps = localStorage.getItem(STORAGE_APPS_KEY);
  const apps: Application[] = rawApps ? JSON.parse(rawApps) : [];
  const jobs = getInitialJobs();
  const businesses = getInitialBusinesses();

  return apps
    .filter(a => a.applicant_id === userId)
    .map(a => {
      const job = jobs.find(j => j.id === a.job_id);
      const biz = job ? businesses.find(b => b.id === job.business_id) : undefined;
      return {
        ...a,
        job: job ? { ...job, business: biz } : undefined,
      };
    });
};

export const fetchJobApplicationsForEmployer = async (jobId: string): Promise<Application[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        applicant_profile:profiles(*)
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Application[]) || [];
  }

  const rawApps = localStorage.getItem(STORAGE_APPS_KEY);
  const apps: Application[] = rawApps ? JSON.parse(rawApps) : [];
  return apps.filter(a => a.job_id === jobId);
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: ApplicationStatus
): Promise<Application> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();
    if (error) throw error;
    return data as Application;
  }

  const rawApps = localStorage.getItem(STORAGE_APPS_KEY);
  const apps: Application[] = rawApps ? JSON.parse(rawApps) : [];
  const idx = apps.findIndex(a => a.id === applicationId);
  if (idx === -1) throw new Error('Application not found');

  apps[idx].status = status;
  apps[idx].updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_APPS_KEY, JSON.stringify(apps));
  return apps[idx];
};

// =========================================================================
// SAVED JOBS
// =========================================================================

export const fetchSavedJobs = async (userId: string): Promise<Job[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('saved_jobs')
      .select(`
        job_id,
        job:jobs(*, business:businesses(*))
      `)
      .eq('user_id', userId);
    if (error) throw error;
    return data?.map((d: any) => d.job).filter(Boolean) || [];
  }

  const raw = localStorage.getItem(STORAGE_SAVED_KEY);
  const saved: SavedJob[] = raw ? JSON.parse(raw) : [];
  const userSavedJobIds = saved.filter(s => s.user_id === userId).map(s => s.job_id);

  const jobs = getInitialJobs();
  const businesses = getInitialBusinesses();
  return jobs
    .filter(j => userSavedJobIds.includes(j.id))
    .map(j => ({ ...j, business: businesses.find(b => b.id === j.business_id) }));
};

export const toggleSaveJob = async (userId: string, jobId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    // Check if exists
    const { data } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();

    if (data) {
      await supabase.from('saved_jobs').delete().eq('id', data.id);
      return false;
    } else {
      await supabase.from('saved_jobs').insert([{ user_id: userId, job_id: jobId }]);
      return true;
    }
  }

  const raw = localStorage.getItem(STORAGE_SAVED_KEY);
  let saved: SavedJob[] = raw ? JSON.parse(raw) : [];
  const idx = saved.findIndex(s => s.user_id === userId && s.job_id === jobId);

  if (idx >= 0) {
    saved.splice(idx, 1);
    localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(saved));
    return false;
  } else {
    saved.push({
      id: `saved-${Date.now()}`,
      user_id: userId,
      job_id: jobId,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(saved));
    return true;
  }
};

export const checkIsJobSaved = async (userId: string, jobId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .maybeSingle();
    return !!data;
  }

  const raw = localStorage.getItem(STORAGE_SAVED_KEY);
  const saved: SavedJob[] = raw ? JSON.parse(raw) : [];
  return saved.some(s => s.user_id === userId && s.job_id === jobId);
};

// =========================================================================
// BUSINESS PROFILE QUERIES & MUTATIONS
// =========================================================================

export const fetchBusinessByOwner = async (ownerId: string): Promise<Business | null> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .maybeSingle();
    if (error) throw error;
    return data as Business | null;
  }

  const businesses = getInitialBusinesses();
  return businesses.find(b => b.owner_id === ownerId || b.owner_id === 'owner-1') || null;
};

export const saveBusinessProfile = async (
  ownerId: string,
  businessData: Partial<Business>
): Promise<Business> => {
  if (isSupabaseConfigured()) {
    // Check if business exists
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', ownerId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('businesses')
        .update({
          business_name: businessData.business_name,
          description: businessData.description,
          category: businessData.category,
          city: businessData.city,
          locality: businessData.locality,
          address: businessData.address,
          contact_phone: businessData.contact_phone,
          contact_email: businessData.contact_email,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data as Business;
    } else {
      const { data, error } = await supabase
        .from('businesses')
        .insert([{
          owner_id: ownerId,
          business_name: businessData.business_name!,
          description: businessData.description,
          category: businessData.category || 'Retail & Shops',
          city: businessData.city || 'Hubli',
          locality: businessData.locality || 'Vidyanagar',
          address: businessData.address,
          contact_phone: businessData.contact_phone,
          contact_email: businessData.contact_email,
          verification_status: 'pending',
        }])
        .select()
        .single();
      if (error) throw error;
      return data as Business;
    }
  }

  const businesses = getInitialBusinesses();
  const idx = businesses.findIndex(b => b.owner_id === ownerId);

  if (idx >= 0) {
    businesses[idx] = { ...businesses[idx], ...businessData, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_BIZ_KEY, JSON.stringify(businesses));
    return businesses[idx];
  } else {
    const newBiz: Business = {
      id: `biz-${Date.now()}`,
      owner_id: ownerId,
      business_name: businessData.business_name || 'My Local Business',
      description: businessData.description || '',
      category: businessData.category || 'Retail & Shops',
      logo_url: businessData.logo_url || null,
      city: businessData.city || 'Hubli',
      locality: businessData.locality || 'Vidyanagar',
      address: businessData.address || '',
      contact_phone: businessData.contact_phone || '',
      contact_email: businessData.contact_email || '',
      verification_status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    businesses.push(newBiz);
    localStorage.setItem(STORAGE_BIZ_KEY, JSON.stringify(businesses));
    return newBiz;
  }
};

// =========================================================================
// REPORTING & MODERATION (ADMIN)
// =========================================================================

export const submitJobReport = async (
  jobId: string,
  reason: string,
  details?: string,
  reporterId?: string
): Promise<JobReport> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('job_reports')
      .insert([{
        job_id: jobId,
        reporter_id: reporterId || null,
        reason,
        details,
        status: 'pending',
      }])
      .select()
      .single();
    if (error) throw error;
    return data as JobReport;
  }

  const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
  const reports: JobReport[] = raw ? JSON.parse(raw) : [];
  const newReport: JobReport = {
    id: `rep-${Date.now()}`,
    job_id: jobId,
    reporter_id: reporterId || null,
    reason,
    details,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  reports.push(newReport);
  localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
  return newReport;
};

export const fetchAllJobReports = async (): Promise<JobReport[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('job_reports')
      .select(`
        *,
        job:jobs(*, business:businesses(*))
      `)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as JobReport[]) || [];
  }

  const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
  const reports: JobReport[] = raw ? JSON.parse(raw) : [];
  const jobs = getInitialJobs();
  return reports.map(r => ({ ...r, job: jobs.find(j => j.id === r.job_id) }));
};

export const fetchAllBusinessesForAdmin = async (): Promise<Business[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as Business[]) || [];
  }

  return getInitialBusinesses();
};

export const updateBusinessVerification = async (
  id: string,
  verification_status: VerificationStatus
): Promise<Business> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('businesses')
      .update({ verification_status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Business;
  }

  const businesses = getInitialBusinesses();
  const idx = businesses.findIndex(b => b.id === id);
  if (idx === -1) throw new Error('Business not found');
  businesses[idx].verification_status = verification_status;
  businesses[idx].updated_at = new Date().toISOString();
  localStorage.setItem(STORAGE_BIZ_KEY, JSON.stringify(businesses));
  return businesses[idx];
};

export const updateJobModerationStatus = async (
  jobId: string,
  status: JobStatus
): Promise<Job> => {
  return updateJobListing(jobId, { status });
};
