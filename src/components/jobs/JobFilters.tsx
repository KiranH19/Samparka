import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { JobFilterParams } from '../../lib/api';
import { Search, MapPin, Briefcase, Filter, X } from 'lucide-react';

interface JobFiltersProps {
  filters: JobFilterParams;
  onChange: (newFilters: JobFilterParams) => void;
  onClear: () => void;
  totalCount: number;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onChange,
  onClear,
  totalCount,
}) => {
  const { t } = useLanguage();

  const handleFieldChange = (key: keyof JobFilterParams, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = Boolean(
    filters.search ||
    (filters.city && filters.city !== 'all') ||
    (filters.locality && filters.locality !== 'all') ||
    (filters.category && filters.category !== 'all') ||
    (filters.employmentType && filters.employmentType !== 'all') ||
    filters.minSalary ||
    filters.isRemote
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
      {/* Row 1: Primary Search Bar & City Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-7 relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleFieldChange('search', e.target.value)}
            placeholder={t.filters.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0BAA70] focus:border-transparent transition-all"
          />
        </div>

        <div className="sm:col-span-3 relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            value={filters.city || 'all'}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0BAA70] appearance-none cursor-pointer"
          >
            <option value="all">{t.filters.allCities}</option>
            <option value="Hubli">Hubli (ಹುಬ್ಬಳ್ಳಿ)</option>
            <option value="Dharwad">Dharwad (ಧಾರವಾಡ)</option>
            <option value="Belagavi">Belagavi (ಬೆಳಗಾವಿ)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <select
            value={filters.locality || 'all'}
            onChange={(e) => handleFieldChange('locality', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0BAA70] appearance-none cursor-pointer"
          >
            <option value="all">{t.filters.allLocalities}</option>
            <optgroup label="Hubli Localities">
              {t.hubliLocalities.map((loc) => {
                const cleanLoc = loc.split(' (')[0];
                return <option key={loc} value={cleanLoc}>{loc}</option>;
              })}
            </optgroup>
            <optgroup label="Dharwad Localities">
              {t.dharwadLocalities.map((loc) => {
                const cleanLoc = loc.split(' (')[0];
                return <option key={loc} value={cleanLoc}>{loc}</option>;
              })}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Row 2: Secondary Category & Job Type Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Category
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleFieldChange('category', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
          >
            <option value="all">{t.filters.allCategories}</option>
            <option value="Retail & Shops">{t.categories.retail}</option>
            <option value="Restaurants & Cafes">{t.categories.restaurant}</option>
            <option value="Manufacturing & Industrial">{t.categories.manufacturing}</option>
            <option value="IT & Office">{t.categories.office}</option>
            <option value="Logistics & Delivery">{t.categories.logistics}</option>
            <option value="Healthcare & Clinic">{t.categories.healthcare}</option>
            <option value="Teaching & Tutoring">{t.categories.education}</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Employment Type
          </label>
          <select
            value={filters.employmentType || 'all'}
            onChange={(e) => handleFieldChange('employmentType', e.target.value)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
          >
            <option value="all">{t.filters.allTypes}</option>
            <option value="part_time">{t.jobTypes.part_time}</option>
            <option value="full_time">{t.jobTypes.full_time}</option>
            <option value="internship">{t.jobTypes.internship}</option>
            <option value="contract">{t.jobTypes.contract}</option>
            <option value="daily_wage">{t.jobTypes.daily_wage}</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Sort Order
          </label>
          <select
            value={filters.sortBy || 'newest'}
            onChange={(e) => handleFieldChange('sortBy', e.target.value as any)}
            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0BAA70]"
          >
            <option value="newest">{t.filters.newest}</option>
            <option value="salary_high">{t.filters.highestSalary}</option>
          </select>
        </div>

        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 select-none">
            <input
              type="checkbox"
              checked={Boolean(filters.isRemote)}
              onChange={(e) => handleFieldChange('isRemote', e.target.checked)}
              className="w-4 h-4 text-[#0BAA70] rounded border-slate-300 focus:ring-[#0BAA70]"
            />
            <span>{t.filters.remoteOnly}</span>
          </label>
        </div>
      </div>

      {/* Row 3: Results tally and clear filter action */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div>
          <span className="font-bold text-[#102B4E]">{totalCount}</span> {t.filters.resultsCount}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[#0BAA70] hover:text-[#098557] font-semibold transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>{t.filters.clearFilters}</span>
          </button>
        )}
      </div>
    </div>
  );
};
