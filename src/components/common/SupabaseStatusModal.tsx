import React, { useState } from 'react';
import { isSupabaseConfigured, getSupabaseConfig } from '../../lib/supabase';
import { Database, CheckCircle2, AlertCircle, Copy, Check, X, Shield, Key } from 'lucide-react';

interface SupabaseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseStatusModal: React.FC<SupabaseStatusModalProps> = ({ isOpen, onClose }) => {
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const configured = isSupabaseConfigured();
  const config = getSupabaseConfig();

  if (!isOpen) return null;

  const envSample = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
APP_URL=https://samparka.in`;

  const copyToClipboard = (text: string, type: 'env' | 'sql') => {
    navigator.clipboard.writeText(text);
    if (type === 'env') {
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } else {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 text-[#172B4D] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-[#0BAA70] rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#102B4E]">Supabase Backend Status</h3>
              <p className="text-xs text-slate-500">PostgreSQL · Row Level Security · Supabase Auth</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-sm">
          {/* Status Alert */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            configured ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            {configured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-semibold">
                {configured ? 'Connected to Live Supabase Backend' : 'Awaiting Supabase Credentials'}
              </p>
              <p className="text-xs mt-1 text-slate-600">
                {configured
                  ? `Active project endpoint: ${config.url}. Queries, Auth, and RLS policies are live against your database.`
                  : 'Running in high-fidelity interactive local mode with Hubli-Dharwad demonstration listings. Add your Supabase project keys to .env to switch to your remote instance.'}
              </p>
            </div>
          </div>

          {/* Quick Setup Instructions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#0BAA70]" /> Step 1: Add Credentials to .env
            </h4>
            <div className="relative bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs">
              <pre>{envSample}</pre>
              <button
                onClick={() => copyToClipboard(envSample, 'env')}
                className="absolute top-2.5 right-2.5 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs flex items-center gap-1 transition-colors"
              >
                {copiedEnv ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedEnv ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#0BAA70]" /> Step 2: Run SQL Migrations
            </h4>
            <p className="text-xs text-slate-600">
              Complete migration file located at <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">supabase/migrations/20261016_init_schema.sql</code>. It creates all 7 tables (profiles, businesses, jobs, applications, saved_jobs, job_reports, admin_audit_logs), indexes, foreign keys, and RLS policies.
            </p>
            <p className="text-xs text-slate-600">
              Run it in your <strong>Supabase Dashboard → SQL Editor → Run</strong>.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Market focus: Hubli–Dharwad, Karnataka</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#102B4E] text-white rounded-lg font-medium hover:bg-[#0c223e] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
