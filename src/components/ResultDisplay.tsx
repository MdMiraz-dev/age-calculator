import React, { useState, useEffect } from 'react';
import {
  Gift,
  Copy,
  Check,
  Share2,
  Calendar,
  Hourglass,
  FileDown,
  Activity,
  Play,
  Pause,
  MapPin
} from 'lucide-react';
import { CalculationResult, Language, UserProfile } from '../types';
import { toBnNum, formatNum } from '../utils/ageCalculator';
import { formatFullDate } from '../utils/dateFormatter';

interface ResultDisplayProps {
  result: CalculationResult;
  lang: Language;
  birthDateStr: string;
  targetDateStr: string;
  activeProfile?: UserProfile | null;
  location?: string;
  onOpenPdfModal: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  lang,
  birthDateStr,
  targetDateStr,
  activeProfile,
  location,
  onOpenPdfModal,
}) => {
  const [copied, setCopied] = useState(false);
  const [liveSecondsEnabled, setLiveSecondsEnabled] = useState(false);
  const [liveSecondsOffset, setLiveSecondsOffset] = useState(0);

  useEffect(() => {
    if (!liveSecondsEnabled) return;
    const interval = setInterval(() => {
      setLiveSecondsOffset((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [liveSecondsEnabled]);

  const displaySeconds = result.totalSeconds + liveSecondsOffset;

  const formattedBirth = formatFullDate(birthDateStr, lang, true);
  const formattedTarget = formatFullDate(targetDateStr, lang, true);
  const formattedNextBday = formatFullDate(result.nextBirthday.targetDate, lang, true);

  const getSummaryText = () => {
    if (lang === 'bn') {
      return `আমার বয়স:\n${toBnNum(result.years)} বছর, ${toBnNum(result.months)} মাস, ${toBnNum(result.days)} দিন\nজন্ম তারিখ: ${formattedBirth}\nহিসাবের তারিখ: ${formattedTarget}\nপরবর্তী জন্মদিন: ${formattedNextBday} (আর ${toBnNum(result.nextBirthday.daysRemaining)} দিন বাকি)\nমোট দিন: ${formatNum(result.totalDays, 'bn')} দিন\nজন্মবার: ${result.dayOfWeekBornBn}`;
    }
    return `My Exact Age:\n${result.years} Years, ${result.months} Months, ${result.days} Days\nDate of Birth: ${formattedBirth}\nCalculated on: ${formattedTarget}\nNext Birthday: ${formattedNextBday} (${result.nextBirthday.daysRemaining} days left)\nTotal Days: ${formatNum(result.totalDays, 'en')} days\nBorn on: ${result.dayOfWeekBornEn}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getSummaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleShare = async () => {
    const text = getSummaryText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: lang === 'bn' ? 'আমার বয়স হিসাব' : 'My Age Calculation',
          text: text,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-4">
      {/* Prominent Full Date Status Banner ("তারিখ যেন সু করে") */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3.5 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="text-neutral-400 font-medium">{lang === 'bn' ? 'জন্ম তারিখ:' : 'Birth Date:'}</span>
            <span className="font-bold text-neutral-900 dark:text-white">{formattedBirth}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
            <span className="text-neutral-400 font-medium">{lang === 'bn' ? 'হিসাবকৃত তারিখ:' : 'Calculated on:'}</span>
            <span className="font-bold text-neutral-900 dark:text-white">{formattedTarget}</span>
          </div>
        </div>

        {/* Action Button: PDF Download */}
        <button
          type="button"
          onClick={onOpenPdfModal}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <FileDown className="w-4 h-4" />
          <span>{lang === 'bn' ? 'পিডিএফ ফাইল ডাউনলোড' : 'Download PDF'}</span>
        </button>
      </div>

      {/* Primary Hero Result Card */}
      <div className="bg-neutral-900 dark:bg-neutral-950 text-white rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden border border-neutral-800">
        {/* User Profile Banner if active */}
        {activeProfile && (
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-neutral-800/80">
            <div className="flex items-center gap-3 min-w-0">
              {activeProfile.photoUrl ? (
                <img
                  src={activeProfile.photoUrl}
                  alt={activeProfile.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {activeProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[11px] text-neutral-400 font-medium">
                  {lang === 'bn' ? 'ব্যবহারকারীর প্রোফাইল' : 'Profile'}
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {activeProfile.name}
                </div>
                {(location || activeProfile.location) && (
                  <div className="flex items-center gap-1 text-[11px] text-rose-300 font-medium truncate mt-0.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{location || activeProfile.location}</span>
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-full border border-neutral-700">
              {activeProfile.email}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-300" />
            {lang === 'bn' ? 'বর্তমান সঠিক বয়স' : 'Current Exact Age'}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
              title={lang === 'bn' ? 'কপি করুন' : 'Copy'}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'কপি' : 'Copy'}</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors"
              title={lang === 'bn' ? 'শেয়ার করুন' : 'Share'}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'শেয়ার' : 'Share'}</span>
            </button>
          </div>
        </div>

        {/* 3 Main Number Blocks */}
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4 text-center">
          <div className="bg-neutral-800/90 dark:bg-neutral-900/90 rounded-xl p-3 sm:p-4 border border-neutral-700/60">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {lang === 'bn' ? toBnNum(result.years) : result.years}
            </div>
            <div className="text-xs sm:text-sm font-medium text-neutral-300 mt-1">
              {lang === 'bn' ? 'বছর' : 'Years'}
            </div>
          </div>

          <div className="bg-neutral-800/90 dark:bg-neutral-900/90 rounded-xl p-3 sm:p-4 border border-neutral-700/60">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {lang === 'bn' ? toBnNum(result.months) : result.months}
            </div>
            <div className="text-xs sm:text-sm font-medium text-neutral-300 mt-1">
              {lang === 'bn' ? 'মাস' : 'Months'}
            </div>
          </div>

          <div className="bg-neutral-800/90 dark:bg-neutral-900/90 rounded-xl p-3 sm:p-4 border border-neutral-700/60">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
              {lang === 'bn' ? toBnNum(result.days) : result.days}
            </div>
            <div className="text-xs sm:text-sm font-medium text-neutral-300 mt-1">
              {lang === 'bn' ? 'দিন' : 'Days'}
            </div>
          </div>
        </div>

        {/* Birth weekday tag */}
        <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <span>{lang === 'bn' ? 'জন্মবার:' : 'Day of birth:'}</span>
          <span className="font-semibold text-neutral-200">
            {lang === 'bn' ? result.dayOfWeekBornBn : result.dayOfWeekBornEn}
          </span>
        </div>
      </div>

      {/* Next Birthday Card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <Gift className="w-4 h-4" />
            </div>
            <span>{lang === 'bn' ? 'পরবর্তী জন্মদিন' : 'Next Birthday'}</span>
          </div>

          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {result.nextBirthday.daysRemaining === 0
              ? lang === 'bn'
                ? '🎉 শুভ জন্মদিন আজ!'
                : '🎉 Happy Birthday Today!'
              : lang === 'bn'
              ? `আর ${toBnNum(result.nextBirthday.daysRemaining)} দিন বাকি`
              : `${result.nextBirthday.daysRemaining} days left`}
          </span>
        </div>

        {result.nextBirthday.daysRemaining > 0 && (
          <div className="bg-neutral-50 dark:bg-neutral-800/60 rounded-xl p-3 text-xs text-neutral-600 dark:text-neutral-300 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border border-neutral-100 dark:border-neutral-700">
            <div>
              <span className="text-neutral-500 dark:text-neutral-400">{lang === 'bn' ? 'বাকি সময়: ' : 'Time remaining: '}</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {lang === 'bn'
                  ? `${toBnNum(result.nextBirthday.monthsRemaining)} মাস ${toBnNum(result.nextBirthday.daysInMonthRemaining)} দিন`
                  : `${result.nextBirthday.monthsRemaining} months ${result.nextBirthday.daysInMonthRemaining} days`}
              </span>
            </div>
            <div className="text-neutral-700 dark:text-neutral-300 font-medium">
              <span>{lang === 'bn' ? 'তারিখ ও বার: ' : 'Date & Day: '}</span>
              <span className="font-semibold text-neutral-900 dark:text-white">
                {formattedNextBday}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Lifetime Stats Grid */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
            <Hourglass className="w-3.5 h-3.5 text-neutral-500" />
            <span>{lang === 'bn' ? 'জীবনের মোট পরিসংখ্যান' : 'Total Life Units'}</span>
          </h3>

          {/* Live Seconds Counter Button */}
          <button
            type="button"
            onClick={() => setLiveSecondsEnabled(!liveSecondsEnabled)}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border transition-all ${
              liveSecondsEnabled
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700'
            }`}
          >
            {liveSecondsEnabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{lang === 'bn' ? (liveSecondsEnabled ? 'লাইভ চলছে' : 'লাইভ সেকেন্ডস') : (liveSecondsEnabled ? 'Live ticking' : 'Live seconds')}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {/* Total Months */}
          <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-3 border border-neutral-100 dark:border-neutral-700">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              {lang === 'bn' ? 'মোট মাস' : 'Total Months'}
            </span>
            <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white block mt-0.5">
              {formatNum(result.totalMonths, lang)}
            </span>
          </div>

          {/* Total Weeks */}
          <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-3 border border-neutral-100 dark:border-neutral-700">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              {lang === 'bn' ? 'মোট সপ্তাহ' : 'Total Weeks'}
            </span>
            <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white block mt-0.5">
              {formatNum(result.totalWeeks, lang)}
            </span>
          </div>

          {/* Total Days */}
          <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-3 border border-neutral-100 dark:border-neutral-700">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              {lang === 'bn' ? 'মোট দিন' : 'Total Days'}
            </span>
            <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white block mt-0.5">
              {formatNum(result.totalDays, lang)}
            </span>
          </div>

          {/* Total Hours */}
          <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-3 border border-neutral-100 dark:border-neutral-700">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              {lang === 'bn' ? 'মোট ঘণ্টা' : 'Total Hours'}
            </span>
            <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white block mt-0.5">
              {formatNum(result.totalHours, lang)}
            </span>
          </div>

          {/* Total Minutes */}
          <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-3 border border-neutral-100 dark:border-neutral-700">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block">
              {lang === 'bn' ? 'মোট মিনিট' : 'Total Minutes'}
            </span>
            <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white block mt-0.5">
              {formatNum(result.totalMinutes, lang)}
            </span>
          </div>

          {/* Total Seconds (live if toggled) */}
          <div className="bg-neutral-50 dark:bg-neutral-800/70 rounded-xl p-3 border border-neutral-100 dark:border-neutral-700 relative overflow-hidden">
            <span className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 flex items-center justify-between">
              <span>{lang === 'bn' ? 'মোট সেকেন্ড' : 'Total Seconds'}</span>
              {liveSecondsEnabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </span>
            <span className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white block mt-0.5 font-mono">
              {formatNum(displaySeconds, lang)}
            </span>
          </div>
        </div>
      </div>

      {/* Zodiac & Signs Card */}
      <div className="grid grid-cols-2 gap-3">
        {/* Western Zodiac */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3.5 sm:p-4 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xl font-serif shrink-0">
            {result.zodiacSign.symbol}
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium block">
              {lang === 'bn' ? 'রাশি (Zodiac)' : 'Zodiac Sign'}
            </span>
            <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white block leading-tight">
              {lang === 'bn' ? result.zodiacSign.bn : result.zodiacSign.en}
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
              {result.zodiacSign.dateRange}
            </span>
          </div>
        </div>

        {/* Chinese Zodiac */}
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-3.5 sm:p-4 shadow-xs flex items-center gap-3 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xl shrink-0">
            {result.chineseZodiac.symbol}
          </div>
          <div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium block">
              {lang === 'bn' ? 'চাইনিজ রাশি' : 'Chinese Zodiac'}
            </span>
            <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white block leading-tight">
              {lang === 'bn' ? result.chineseZodiac.bn : result.chineseZodiac.en}
            </span>
            <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
              {lang === 'bn' ? 'জন্ম বছর অনুযায়ী' : 'Based on birth year'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
