import React, { useState, useEffect } from 'react';
import { Download, X, FileText, CheckCircle2, ShieldCheck, User, Calendar, Gift, Hourglass, Award, MapPin, Navigation, Loader2 } from 'lucide-react';
import { CalculationResult, Language, UserProfile } from '../types';
import { toBnNum, formatNum } from '../utils/ageCalculator';
import { formatFullDate } from '../utils/dateFormatter';
import { exportElementToPdf } from '../utils/pdfGenerator';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: CalculationResult;
  lang: Language;
  birthDateStr: string;
  targetDateStr: string;
  activeProfile?: UserProfile | null;
  location?: string;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  result,
  lang,
  birthDateStr,
  targetDateStr,
  activeProfile,
  location,
}) => {
  const [userName, setUserName] = useState(activeProfile?.name || '');
  const [pdfLocation, setPdfLocation] = useState(location || activeProfile?.location || 'ঢাকা, বাংলাদেশ');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (activeProfile?.name && !userName) {
      setUserName(activeProfile.name);
    }
    if (location) {
      setPdfLocation(location);
    } else if (activeProfile?.location) {
      setPdfLocation(activeProfile.location);
    }
  }, [activeProfile, location]);

  if (!isOpen) return null;

  const handleGpsDetectForPdf = () => {
    if (!navigator.geolocation) return;
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`,
            { headers: { 'Accept-Language': lang === 'bn' ? 'bn,en' : 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city = addr.city || addr.town || addr.state_district || addr.state || '';
            const country = addr.country || '';
            const detected = city && country ? `${city}, ${country}` : data.display_name?.split(',').slice(0, 2).join(',') || 'ঢাকা, বাংলাদেশ';
            setPdfLocation(detected);
          } else {
            setPdfLocation('ঢাকা, বাংলাদেশ');
          }
        } catch {
          setPdfLocation('ঢাকা, বাংলাদেশ');
        } finally {
          setIsDetectingGps(false);
        }
      },
      () => {
        setIsDetectingGps(false);
      }
    );
  };

  const formattedBirth = formatFullDate(birthDateStr, lang, true);
  const formattedTarget = formatFullDate(targetDateStr, lang, true);
  const formattedNextBday = formatFullDate(result.nextBirthday.targetDate, lang, true);
  const generationTimestamp = new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US');

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    setSuccess(false);

    // Allow DOM to settle before snapshot
    await new Promise((r) => setTimeout(r, 150));

    const cleanName = userName.trim() ? userName.trim().replace(/\s+/g, '_') : 'My';
    const fileName = `${cleanName}_Age_Certificate_Report.pdf`;

    const ok = await exportElementToPdf('printable-age-certificate', fileName);
    setIsGenerating(false);

    if (ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white leading-tight">
                {lang === 'bn' ? 'পূর্ণাঙ্গ বয়স সনদ PDF ডাউনলোড' : 'Download Full Age Report PDF'}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {lang === 'bn' ? 'সব ডিটেইলসসহ প্রিন্ট ও সেভ করার কপি' : 'Official report with all calculations'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Name and Location Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-500" />
              <span>{lang === 'bn' ? 'আপনার নাম (ঐচ্ছিক):' : 'Person Name (Optional):'}</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={lang === 'bn' ? 'যেমন: মোঃ তুশান' : 'e.g. John Doe'}
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all"
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>{lang === 'bn' ? 'লোকেশন / জেলা (PDF এ আসবে):' : 'Location / City:'}</span>
              </label>
              <button
                type="button"
                onClick={handleGpsDetectForPdf}
                disabled={isDetectingGps}
                className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 disabled:opacity-50"
              >
                {isDetectingGps ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Navigation className="w-3 h-3" />
                )}
                <span>{lang === 'bn' ? 'অটো জিপিএস' : 'Auto GPS'}</span>
              </button>
            </div>
            <input
              type="text"
              value={pdfLocation}
              onChange={(e) => setPdfLocation(e.target.value)}
              placeholder={lang === 'bn' ? 'যেমন: ঢাকা, বাংলাদেশ' : 'e.g. Dhaka, Bangladesh'}
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>
        </div>

        {/* Live Preview of Certificate Summary */}
        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs space-y-1.5 text-neutral-700 dark:text-neutral-300">
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">{lang === 'bn' ? 'জন্ম তারিখ:' : 'Birth Date:'}</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{formattedBirth}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">{lang === 'bn' ? 'বর্তমান বয়স:' : 'Current Age:'}</span>
            <span className="font-bold text-neutral-900 dark:text-white">
              {lang === 'bn'
                ? `${toBnNum(result.years)} বছর, ${toBnNum(result.months)} মাস, ${toBnNum(result.days)} দিন`
                : `${result.years}y ${result.months}m ${result.days}d`}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">{lang === 'bn' ? 'স্থান / লোকেশন:' : 'Location:'}</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400 truncate max-w-[200px]">{pdfLocation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">{lang === 'bn' ? 'মোট দিন:' : 'Total Days:'}</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{formatNum(result.totalDays, lang)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500 dark:text-neutral-400">{lang === 'bn' ? 'পরবর্তী জন্মদিন:' : 'Next Birthday:'}</span>
            <span className="font-semibold text-neutral-900 dark:text-white">{formattedNextBday}</span>
          </div>
        </div>

        {/* Download Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl text-xs font-bold hover:bg-neutral-800 dark:hover:bg-neutral-100 shadow-sm transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{lang === 'bn' ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...'}</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{lang === 'bn' ? 'ডাউনলোড সম্পন্ন!' : 'Downloaded!'}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{lang === 'bn' ? 'পিডিএফ ফাইল ডাউনলোড' : 'Download PDF File'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hidden high-res Printable DOM Template optimized for PDF snapshot */}
      <div className="absolute -left-[9999px] top-0">
        <div
          id="printable-age-certificate"
          className="w-[794px] min-h-[1123px] bg-white text-neutral-900 p-10 font-sans border-[12px] border-neutral-900 relative"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Inner ornamental border */}
          <div className="border border-neutral-400 p-8 h-full flex flex-col justify-between">
            {/* Header / Brand */}
            <div className="text-center space-y-2 border-b-2 border-neutral-900 pb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 text-xs font-bold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-neutral-900" />
                <span>{lang === 'bn' ? 'অফিসিয়াল বয়স সনদ ও রিপোর্ট' : 'Official Age Certificate & Report'}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-neutral-950 tracking-tight">
                {lang === 'bn' ? 'বয়স ক্যালকুলেটর সনদ' : 'Age Certificate'}
              </h1>
              <p className="text-xs text-neutral-500">
                {lang === 'bn'
                  ? `সনদ প্রস্তুতের তারিখ: ${generationTimestamp}`
                  : `Generated on: ${generationTimestamp}`}
              </p>
            </div>

            {/* Person Info with Passport Photo Box */}
            <div className="my-5 p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {activeProfile?.photoUrl ? (
                  <div className="w-16 h-20 border-2 border-neutral-900 rounded-md overflow-hidden bg-white shadow-xs shrink-0">
                    <img
                      src={activeProfile.photoUrl}
                      alt="Candidate photo"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-20 border-2 border-dashed border-neutral-400 rounded-md bg-neutral-100 flex flex-col items-center justify-center text-[9px] text-neutral-500 shrink-0 text-center p-1">
                    <User className="w-6 h-6 mb-1 text-neutral-400" />
                    <span>{lang === 'bn' ? 'ফটো সংযুক্ত' : 'Photo'}</span>
                  </div>
                )}
                <div>
                  <span className="text-[11px] font-medium text-neutral-500 block uppercase">
                    {lang === 'bn' ? 'নাম / ব্যবহারকারী' : 'Candidate / Name'}
                  </span>
                  <span className="text-xl font-bold text-neutral-900">
                    {userName.trim() ? userName : lang === 'bn' ? 'হিসাবকারী' : 'User'}
                  </span>
                  {activeProfile?.email && (
                    <span className="text-xs text-neutral-500 block mt-0.5">
                      {activeProfile.email}
                    </span>
                  )}
                  {pdfLocation && (
                    <div className="flex items-center gap-1 text-xs text-rose-700 font-bold mt-1 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md inline-flex">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>{lang === 'bn' ? 'স্থান: ' : 'Location: '} {pdfLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-medium text-neutral-500 block uppercase">
                  {lang === 'bn' ? 'জন্মবার' : 'Born on'}
                </span>
                <span className="text-base font-bold text-neutral-900">
                  {lang === 'bn' ? result.dayOfWeekBornBn : result.dayOfWeekBornEn}
                </span>
              </div>
            </div>

            {/* Date Details Table */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b pb-1">
                {lang === 'bn' ? 'তারিখ ও সনদের বিস্তারিত বিবরণ' : 'Date & Certificate Details'}
              </h2>
              <div className="grid grid-cols-4 gap-2.5 text-xs">
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 block">
                    {lang === 'bn' ? 'জন্ম তারিখ:' : 'Date of Birth:'}
                  </span>
                  <span className="font-bold text-neutral-900 text-xs block mt-0.5">{formattedBirth}</span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 block">
                    {lang === 'bn' ? 'হিসাবের তারিখ:' : 'Calculation Date:'}
                  </span>
                  <span className="font-bold text-neutral-900 text-xs block mt-0.5">{formattedTarget}</span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 block">
                    {lang === 'bn' ? 'স্থান / লোকেশন:' : 'Report Location:'}
                  </span>
                  <span className="font-bold text-neutral-900 text-xs block mt-0.5 truncate" title={pdfLocation}>
                    {pdfLocation || (lang === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh')}
                  </span>
                </div>
                <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 block">
                    {lang === 'bn' ? 'সনদ ট্র্যাকিং নং:' : 'Certificate ID:'}
                  </span>
                  <span className="font-mono font-bold text-indigo-700 text-xs block mt-0.5">
                    BD-AGE-{Math.abs((result.totalSeconds % 899999) + 100000)}
                  </span>
                </div>
              </div>
            </div>

            {/* Exact Age Hero */}
            <div className="my-5 p-6 bg-neutral-900 text-white rounded-xl text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                {lang === 'bn' ? 'নির্ধারিত তারিখে সঠিক বয়স' : 'Exact Age On Calculation Date'}
              </span>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-neutral-800 p-3 rounded-lg">
                  <div className="text-4xl font-extrabold">
                    {lang === 'bn' ? toBnNum(result.years) : result.years}
                  </div>
                  <div className="text-xs font-medium text-neutral-300 mt-1">
                    {lang === 'bn' ? 'বছর (Years)' : 'Years'}
                  </div>
                </div>
                <div className="bg-neutral-800 p-3 rounded-lg">
                  <div className="text-4xl font-extrabold">
                    {lang === 'bn' ? toBnNum(result.months) : result.months}
                  </div>
                  <div className="text-xs font-medium text-neutral-300 mt-1">
                    {lang === 'bn' ? 'মাস (Months)' : 'Months'}
                  </div>
                </div>
                <div className="bg-neutral-800 p-3 rounded-lg">
                  <div className="text-4xl font-extrabold">
                    {lang === 'bn' ? toBnNum(result.days) : result.days}
                  </div>
                  <div className="text-xs font-medium text-neutral-300 mt-1">
                    {lang === 'bn' ? 'দিন (Days)' : 'Days'}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Birthday Details */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-950">
              <div>
                <span className="font-bold block text-sm">
                  {lang === 'bn' ? 'পরবর্তী জন্মদিন (Next Birthday):' : 'Next Birthday:'}
                </span>
                <span className="mt-0.5 block">{formattedNextBday}</span>
              </div>
              <div className="text-right font-bold text-sm bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300">
                {lang === 'bn'
                  ? `আর ${toBnNum(result.nextBirthday.daysRemaining)} দিন বাকি`
                  : `${result.nextBirthday.daysRemaining} days left`}
              </div>
            </div>

            {/* Complete Lifetime Stats Grid */}
            <div className="space-y-2 mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 border-b pb-1">
                {lang === 'bn' ? 'জীবনের মোট পরিসংখ্যান (Lifetime Units)' : 'Lifetime Units'}
              </h2>
              <div className="grid grid-cols-3 gap-2.5 text-xs text-neutral-800">
                <div className="p-2.5 bg-neutral-50 border rounded-lg">
                  <span className="text-neutral-500 block">{lang === 'bn' ? 'মোট মাস:' : 'Total Months:'}</span>
                  <span className="font-bold text-sm">{formatNum(result.totalMonths, lang)}</span>
                </div>
                <div className="p-2.5 bg-neutral-50 border rounded-lg">
                  <span className="text-neutral-500 block">{lang === 'bn' ? 'মোট সপ্তাহ:' : 'Total Weeks:'}</span>
                  <span className="font-bold text-sm">{formatNum(result.totalWeeks, lang)}</span>
                </div>
                <div className="p-2.5 bg-neutral-50 border rounded-lg">
                  <span className="text-neutral-500 block">{lang === 'bn' ? 'মোট দিন:' : 'Total Days:'}</span>
                  <span className="font-bold text-sm">{formatNum(result.totalDays, lang)}</span>
                </div>
                <div className="p-2.5 bg-neutral-50 border rounded-lg">
                  <span className="text-neutral-500 block">{lang === 'bn' ? 'মোট ঘণ্টা:' : 'Total Hours:'}</span>
                  <span className="font-bold text-sm">{formatNum(result.totalHours, lang)}</span>
                </div>
                <div className="p-2.5 bg-neutral-50 border rounded-lg">
                  <span className="text-neutral-500 block">{lang === 'bn' ? 'মোট মিনিট:' : 'Total Minutes:'}</span>
                  <span className="font-bold text-sm">{formatNum(result.totalMinutes, lang)}</span>
                </div>
                <div className="p-2.5 bg-neutral-50 border rounded-lg">
                  <span className="text-neutral-500 block">{lang === 'bn' ? 'মোট সেকেন্ড:' : 'Total Seconds:'}</span>
                  <span className="font-bold text-sm font-mono">{formatNum(result.totalSeconds, lang)}</span>
                </div>
              </div>
            </div>

            {/* Zodiac and Job Status */}
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="p-3 bg-neutral-50 border rounded-xl">
                <span className="font-bold block text-neutral-700 mb-1">
                  {lang === 'bn' ? 'রাশিফল (Zodiac):' : 'Zodiac & Astrological Sign:'}
                </span>
                <p className="text-neutral-600">
                  {lang === 'bn' ? 'পাশ্চাত্য রাশি: ' : 'Western Zodiac: '}
                  <span className="font-bold text-neutral-900">
                    {lang === 'bn' ? result.zodiacSign.bn : result.zodiacSign.en} ({result.zodiacSign.symbol})
                  </span>
                </p>
                <p className="text-neutral-600 mt-0.5">
                  {lang === 'bn' ? 'চাইনিজ রাশি: ' : 'Chinese Zodiac: '}
                  <span className="font-bold text-neutral-900">
                    {lang === 'bn' ? result.chineseZodiac.bn : result.chineseZodiac.en} ({result.chineseZodiac.symbol})
                  </span>
                </p>
              </div>

              <div className="p-3 bg-neutral-50 border rounded-xl">
                <span className="font-bold block text-neutral-700 mb-1">
                  {lang === 'bn' ? 'সরকারি চাকরির বয়স যোগ্যতা:' : 'Job Eligibility (Age Limits):'}
                </span>
                <p className="text-neutral-600">
                  {lang === 'bn' ? '৩০ বছর সীমা: ' : '30 Years Limit: '}
                  <span className={`font-bold ${result.years < 30 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {result.years < 30
                      ? lang === 'bn' ? 'যোগ্য' : 'Eligible'
                      : lang === 'bn' ? 'অতিক্রম করেছে' : 'Exceeded'}
                  </span>
                </p>
                <p className="text-neutral-600 mt-0.5">
                  {lang === 'bn' ? '৩২ বছর সীমা: ' : '32 Years Limit: '}
                  <span className={`font-bold ${result.years < 32 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {result.years < 32
                      ? lang === 'bn' ? 'যোগ্য' : 'Eligible'
                      : lang === 'bn' ? 'অতিক্রম করেছে' : 'Exceeded'}
                  </span>
                </p>
              </div>
            </div>

            {/* Footer Seal & Builder Signature */}
            <div className="mt-6 pt-4 border-t-2 border-neutral-900 flex items-center justify-between text-[11px] text-neutral-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-neutral-900 block">
                    {lang === 'bn' ? 'স্বয়ংক্রিয়ভাবে নির্ভুল গণনাকৃত ও সত্যায়িত' : 'System Verified & Computed'}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {lang === 'bn' ? `যাচাইকৃত অবস্থান: ${pdfLocation} • সরকারি ও পেশাদার ব্যবহারের উপযোগী` : `Verified Location: ${pdfLocation} • Official Age Verification`}
                  </span>
                </div>
              </div>

              {/* MIRAZ Official Builder Signature Stamp */}
              <div className="text-right">
                <div className="border border-neutral-800 rounded-lg px-3 py-1.5 bg-neutral-50 inline-block text-left">
                  <p className="font-black text-neutral-900 text-xs tracking-wide">
                    {lang === 'bn' ? 'নির্মাতা ও ডেভেলপার: MIRAZ' : 'Software Creator: MIRAZ'}
                  </p>
                  <p className="text-[10px] text-indigo-700 font-semibold">
                    Age Calculator Official Service • Verified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
