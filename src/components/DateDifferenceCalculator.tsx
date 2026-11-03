import React, { useState } from 'react';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';
import { Language } from '../types';
import { calculateAge, formatNum, toBnNum } from '../utils/ageCalculator';
import { formatFullDate } from '../utils/dateFormatter';

interface DateDifferenceCalculatorProps {
  lang: Language;
}

export const DateDifferenceCalculator: React.FC<DateDifferenceCalculatorProps> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const diffResult = React.useMemo(() => {
    if (!startDate || !endDate) return null;
    const [sY, sM, sD] = startDate.split('-').map(Number);
    const [eY, eM, eD] = endDate.split('-').map(Number);

    const sObj = new Date(sY, sM - 1, sD);
    const eObj = new Date(eY, eM - 1, eD);

    if (sObj.getTime() > eObj.getTime()) {
      return null;
    }
    return calculateAge(sObj, eObj);
  }, [startDate, endDate]);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/70 dark:hover:bg-neutral-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-none">
              {lang === 'bn' ? 'যেকোনো দুটি তারিখের ব্যবধান বের করুন' : 'Difference Between 2 Dates'}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1">
              {lang === 'bn' ? 'চাকরি, বিবাহবার্ষিকী বা ইভেন্টের মোট সময়' : 'Calculate tenure, event or relationship gap'}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-neutral-900 dark:text-white' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-3.5 bg-neutral-50/50 dark:bg-neutral-800/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                {lang === 'bn' ? 'শুরুর তারিখ (From Date):' : 'From Date:'}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                {formatFullDate(startDate, lang, true)}
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-300 block mb-1">
                {lang === 'bn' ? 'শেষের তারিখ (To Date):' : 'To Date:'}
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-400 mt-0.5 block">
                {formatFullDate(endDate, lang, true)}
              </span>
            </div>
          </div>

          {diffResult ? (
            <div className="p-3 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs">
              <div className="text-center py-1">
                <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">
                  {lang === 'bn' ? 'মোট ব্যবধান' : 'Total Difference'}
                </span>
                <span className="text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white">
                  {lang === 'bn'
                    ? `${toBnNum(diffResult.years)} বছর, ${toBnNum(diffResult.months)} মাস, ${toBnNum(diffResult.days)} দিন`
                    : `${diffResult.years} Years, ${diffResult.months} Months, ${diffResult.days} Days`}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-neutral-100 dark:border-neutral-700 text-[11px]">
                <div className="p-1.5 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <span className="text-neutral-500 block">{lang === 'bn' ? 'মোট দিন' : 'Total Days'}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {formatNum(diffResult.totalDays, lang)}
                  </span>
                </div>
                <div className="p-1.5 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <span className="text-neutral-500 block">{lang === 'bn' ? 'মোট সপ্তাহ' : 'Total Weeks'}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {formatNum(diffResult.totalWeeks, lang)}
                  </span>
                </div>
                <div className="p-1.5 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <span className="text-neutral-500 block">{lang === 'bn' ? 'মোট ঘণ্টা' : 'Total Hours'}</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {formatNum(diffResult.totalHours, lang)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-rose-500 text-center py-2">
              {lang === 'bn'
                ? 'শুরুর তারিখ শেষের তারিখের চেয়ে আগের হতে হবে।'
                : 'Start date must be earlier than the end date.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
