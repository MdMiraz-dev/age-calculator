import React, { useState } from 'react';
import { Award, ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { Language } from '../types';
import { calculateMilestones } from '../utils/milestones';
import { formatFullDate } from '../utils/dateFormatter';
import { toBnNum } from '../utils/ageCalculator';

interface MilestonesTrackerProps {
  lang: Language;
  birthDate: string;
  targetDate: string;
}

export const MilestonesTracker: React.FC<MilestonesTrackerProps> = ({
  lang,
  birthDate,
  targetDate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [bY, bM, bD] = birthDate.split('-').map(Number);
  const [tY, tM, tD] = targetDate.split('-').map(Number);
  const bDateObj = new Date(bY, bM - 1, bD);
  const tDateObj = new Date(tY, tM - 1, tD);

  const milestones = calculateMilestones(bDateObj, tDateObj, lang);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/70 dark:hover:bg-neutral-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-none">
              {lang === 'bn' ? 'জীবনের বিশেষ মাইলস্টোন ও দিন' : 'Life Milestones & Highlights'}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1">
              {lang === 'bn' ? '১০,০০০ দিন, রূপালী বা সুবর্ণ জয়ন্তী পূর্তি' : '10,000 Days, Silver & Golden Jubilees'}
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
        <div className="p-4 pt-1 border-t border-neutral-100 dark:border-neutral-800 space-y-2.5 bg-neutral-50/50 dark:bg-neutral-800/40">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {milestones.map((m) => {
              const formattedDate = formatFullDate(m.date, lang, false);
              return (
                <div
                  key={m.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
                    m.isPassed
                      ? 'bg-neutral-100/60 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400'
                      : 'bg-white dark:bg-neutral-800 border-amber-200 dark:border-amber-800/60 text-neutral-900 dark:text-white shadow-2xs'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {m.isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold">
                        {lang === 'bn' ? m.titleBn : m.titleEn}
                      </div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400">
                        {formattedDate}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-medium text-[11px] shrink-0">
                    {m.isPassed ? (
                      <span className="text-neutral-400 dark:text-neutral-500">
                        {lang === 'bn'
                          ? `${toBnNum(m.daysRemainingOrPassed)} দিন আগে পার হয়েছে`
                          : `${m.daysRemainingOrPassed} days ago`}
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 font-bold">
                        {lang === 'bn'
                          ? `আর ${toBnNum(m.daysRemainingOrPassed)} দিন বাকি`
                          : `in ${m.daysRemainingOrPassed} days`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
