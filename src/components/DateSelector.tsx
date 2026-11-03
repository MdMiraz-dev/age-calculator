import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronDown, Check } from 'lucide-react';
import { Language } from '../types';
import { MONTHS_BN, MONTHS_EN, toBnNum, getDaysInMonth } from '../utils/ageCalculator';
import { formatFullDate } from '../utils/dateFormatter';

interface DateSelectorProps {
  lang: Language;
  birthDate: string; // YYYY-MM-DD
  targetDate: string; // YYYY-MM-DD
  onBirthDateChange: (date: string) => void;
  onTargetDateChange: (date: string) => void;
  onResetToToday: () => void;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  lang,
  birthDate,
  targetDate,
  onBirthDateChange,
  onTargetDateChange,
  onResetToToday,
}) => {
  const [showTargetDate, setShowTargetDate] = useState(false);
  const [inputMode, setInputMode] = useState<'dropdown' | 'calendar'>('dropdown');

  // Parse birth date parts
  const [birthYear, birthMonth, birthDay] = birthDate
    ? birthDate.split('-').map(Number)
    : [2000, 1, 1];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 110 }, (_, i) => currentYear - i);
  const daysInSelectedMonth = getDaysInMonth(birthYear, birthMonth - 1);
  const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  const handleDropdownChange = (field: 'day' | 'month' | 'year', value: number) => {
    let newYear = birthYear;
    let newMonth = birthMonth;
    let newDay = birthDay;

    if (field === 'year') newYear = value;
    if (field === 'month') newMonth = value;
    if (field === 'day') newDay = value;

    const maxDays = getDaysInMonth(newYear, newMonth - 1);
    if (newDay > maxDays) {
      newDay = maxDays;
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    onBirthDateChange(`${newYear}-${pad(newMonth)}-${pad(newDay)}`);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const formattedBirthDisplay = formatFullDate(birthDate, lang, true);
  const formattedTargetDisplay = formatFullDate(targetDate, lang, true);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-4 transition-colors">
      {/* Header & Mode Switcher */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <label className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
          <span>{lang === 'bn' ? 'জন্ম তারিখ নির্বাচন' : 'Select Date of Birth'}</span>
        </label>

        {/* Input style selector */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs font-medium">
          <button
            type="button"
            onClick={() => setInputMode('dropdown')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              inputMode === 'dropdown'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-semibold shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'বাছাই করুন' : 'Dropdown'}
          </button>
          <button
            type="button"
            onClick={() => setInputMode('calendar')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              inputMode === 'calendar'
                ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-semibold shadow-xs'
                : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'ক্যালেন্ডার' : 'Calendar'}
          </button>
        </div>
      </div>

      {/* Prominent Date Banner ("তারিখ যেন সু করে") */}
      <div className="px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/70 border border-neutral-200/80 dark:border-neutral-700 rounded-xl flex items-center justify-between">
        <div className="text-xs">
          <span className="text-neutral-500 dark:text-neutral-400 block text-[11px]">
            {lang === 'bn' ? 'নির্বাচিত জন্মতারিখ:' : 'Selected Birth Date:'}
          </span>
          <span className="font-bold text-neutral-900 dark:text-white text-sm sm:text-base">
            {formattedBirthDisplay}
          </span>
        </div>
        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Check className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Primary Birth Date Inputs */}
      {inputMode === 'dropdown' ? (
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Day */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              {lang === 'bn' ? 'দিন' : 'Day'}
            </span>
            <div className="relative">
              <select
                value={birthDay}
                onChange={(e) => handleDropdownChange('day', Number(e.target.value))}
                className="w-full appearance-none bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold text-sm rounded-xl py-3 pl-3 pr-7 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all cursor-pointer"
              >
                {days.map((d) => (
                  <option key={d} value={d} className="dark:bg-neutral-800 dark:text-white">
                    {lang === 'bn' ? toBnNum(d) : d}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Month */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              {lang === 'bn' ? 'মাস' : 'Month'}
            </span>
            <div className="relative">
              <select
                value={birthMonth}
                onChange={(e) => handleDropdownChange('month', Number(e.target.value))}
                className="w-full appearance-none bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold text-sm rounded-xl py-3 pl-3 pr-7 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m} className="dark:bg-neutral-800 dark:text-white">
                    {lang === 'bn' ? MONTHS_BN[m - 1] : MONTHS_EN[m - 1]}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Year */}
          <div className="space-y-1">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              {lang === 'bn' ? 'বছর' : 'Year'}
            </span>
            <div className="relative">
              <select
                value={birthYear}
                onChange={(e) => handleDropdownChange('year', Number(e.target.value))}
                className="w-full appearance-none bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-semibold text-sm rounded-xl py-3 pl-3 pr-7 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y} className="dark:bg-neutral-800 dark:text-white">
                    {lang === 'bn' ? toBnNum(y) : y}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative">
          <input
            type="date"
            value={birthDate}
            max={todayStr}
            onChange={(e) => onBirthDateChange(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium text-base rounded-xl py-3 px-3.5 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all cursor-pointer"
          />
        </div>
      )}

      {/* Target Date Section (Optional / Collapsible) */}
      <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowTargetDate(!showTargetDate)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors py-1"
          >
            <Clock className="w-3.5 h-3.5 text-neutral-500" />
            <span>
              {lang === 'bn'
                ? 'অন্য কোনো নির্দিষ্ট তারিখে বয়স দেখতে চান?'
                : 'Calculate age on a specific date?'}
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                showTargetDate ? 'rotate-180 text-neutral-900 dark:text-white' : 'text-neutral-400'
              }`}
            />
          </button>

          {showTargetDate && targetDate !== todayStr && (
            <button
              type="button"
              onClick={onResetToToday}
              className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors"
            >
              {lang === 'bn' ? 'আজকের তারিখ সেট করুন' : 'Reset to Today'}
            </button>
          )}
        </div>

        {showTargetDate && (
          <div className="mt-3 p-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-300">
              <span className="font-medium">
                {lang === 'bn' ? 'হিসাবের তারিখ (যেমন চাকরির সার্কুলার তারিখ):' : 'Calculate age as of:'}
              </span>
            </div>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => onTargetDateChange(e.target.value)}
              className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium text-sm rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all cursor-pointer"
            />
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              {lang === 'bn' ? 'হিসাবকৃত তারিখ: ' : 'Calculated on: '}
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{formattedTargetDisplay}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
