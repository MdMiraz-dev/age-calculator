import React, { useState } from 'react';
import { Briefcase, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { CalculationResult, Language } from '../types';
import { toBnNum } from '../utils/ageCalculator';

interface JobAgeCheckerProps {
  lang: Language;
  result: CalculationResult;
}

export const JobAgeChecker: React.FC<JobAgeCheckerProps> = ({ lang, result }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [ageLimit, setAgeLimit] = useState<number>(30); // default 30 years

  const isEligible =
    result.years < ageLimit ||
    (result.years === ageLimit && result.months === 0 && result.days === 0);

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xs overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between text-left hover:bg-neutral-50/70 dark:hover:bg-neutral-800/60 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-none">
              {lang === 'bn' ? 'চাকরির বয়স সীমা যাচাই' : 'Job Age Eligibility Check'}
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1">
              {lang === 'bn' ? '৩০ বা ৩২ বছর সীমার মধ্যে আছেন কিনা দেখুন' : 'Check for 30 or 32-year age limit'}
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
          {/* Preset Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
              {lang === 'bn' ? 'সর্বোচ্চ বয়সসীমা:' : 'Max limit:'}
            </span>
            <div className="flex items-center gap-1.5">
              {[30, 32, 35].map((lim) => (
                <button
                  key={lim}
                  type="button"
                  onClick={() => setAgeLimit(lim)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    ageLimit === lim
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                      : 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  {lang === 'bn' ? `${toBnNum(lim)} বছর` : `${lim} Yrs`}
                </button>
              ))}
            </div>
          </div>

          {/* Eligibility Result Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-start gap-3 ${
              isEligible
                ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
            }`}
          >
            {isEligible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-bold text-sm">
                {isEligible
                  ? lang === 'bn'
                    ? `আপনি ${toBnNum(ageLimit)} বছর বয়সসীমার জন্য যোগ্য!`
                    : `Eligible for ${ageLimit} years limit!`
                  : lang === 'bn'
                  ? `বয়স ${toBnNum(ageLimit)} বছর অতিক্রম করেছে`
                  : `Age exceeds ${ageLimit} years limit`}
              </div>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {isEligible
                  ? lang === 'bn'
                    ? `আপনার বয়স এখন ${toBnNum(result.years)} বছর ${toBnNum(result.months)} মাস ${toBnNum(result.days)} দিন। এই বয়সসীমার মধ্যে আবেদন করা যাবে।`
                    : `Your current age is ${result.years}y ${result.months}m ${result.days}d. You are within the limit.`
                  : lang === 'bn'
                  ? `আপনার বয়স ${toBnNum(result.years)} বছর ${toBnNum(result.months)} মাস ${toBnNum(result.days)} দিন। সার্কুলারের কাট-অফ তারিখ অনুযায়ী যাচাই করে নিন।`
                    : `Your current age is ${result.years}y ${result.months}m ${result.days}d. Check the cutoff date on the job notice.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
