import React, { useState, useEffect } from 'react';
import { Download, X, FileText, CheckCircle2, User, MapPin, Navigation, Loader2, Printer, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { CalculationResult, Language, UserProfile } from '../types';
import { toBnNum, formatNum } from '../utils/ageCalculator';
import { formatFullDate } from '../utils/dateFormatter';
import { downloadCertificatePdf, downloadCertificateImage, printCertificateDirectly } from '../utils/pdfGenerator';

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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageSuccess, setImageSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadLink, setDownloadLink] = useState<{ url: string; name: string } | null>(null);

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

  const getCertificateData = () => ({
    userName,
    pdfLocation,
    formattedBirth,
    formattedTarget,
    formattedNextBday,
    result,
    activeProfile,
    lang,
  });

  const handlePrint = async () => {
    if (!userName.trim()) {
      setErrorMsg(
        lang === 'bn'
          ? 'দয়া করে প্রার্থীর পূর্ণ নাম লিখুন (বাধ্যতামূলক)।'
          : 'Please enter the candidate full name (Required).'
      );
      return;
    }
    try {
      const data = getCertificateData();
      await printCertificateDirectly(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownloadPdf = async () => {
    if (!userName.trim()) {
      setErrorMsg(
        lang === 'bn'
          ? 'দয়া করে প্রার্থীর পূর্ণ নাম লিখুন (বাধ্যতামূলক)।'
          : 'Please enter the candidate full name (Required).'
      );
      return;
    }

    setIsGenerating(true);
    setSuccess(false);
    setErrorMsg(null);
    setDownloadLink(null);

    const data = getCertificateData();
    const res = await downloadCertificatePdf(data);
    setIsGenerating(false);

    if (res.success) {
      setSuccess(true);
      if (res.blobUrl) {
        const cleanName = userName.trim() ? userName.trim().replace(/\s+/g, '_') : 'My';
        setDownloadLink({ url: res.blobUrl, name: `${cleanName}_Age_Certificate.pdf` });
      }
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2500);
    } else {
      setErrorMsg(
        res.error ||
          (lang === 'bn'
            ? 'স্বয়ংক্রিয় ডাউনলোডে সমস্যা হলে পাশে থাকা "প্রিন্ট / সেভ" বা "ছবি (PNG)" অপশনটি ব্যবহার করুন।'
            : 'Could not auto-download. Please click "Print / Save" or "Image (PNG)".')
      );
    }
  };

  const handleDownloadImage = async () => {
    if (!userName.trim()) {
      setErrorMsg(
        lang === 'bn'
          ? 'দয়া করে প্রার্থীর পূর্ণ নাম লিখুন (বাধ্যতামূলক)।'
          : 'Please enter the candidate full name (Required).'
      );
      return;
    }

    setIsGeneratingImage(true);
    setImageSuccess(false);
    setErrorMsg(null);
    setDownloadLink(null);

    const data = getCertificateData();
    const res = await downloadCertificateImage(data);
    setIsGeneratingImage(false);

    if (res.success) {
      setImageSuccess(true);
      if (res.blobUrl) {
        const cleanName = userName.trim() ? userName.trim().replace(/\s+/g, '_') : 'My';
        setDownloadLink({ url: res.blobUrl, name: `${cleanName}_Age_Certificate.png` });
      }
    } else {
      setErrorMsg(
        lang === 'bn'
          ? 'ছবি তৈরিতে সমস্যা হলে "প্রিন্ট / সেভ" বাটনটি চাপুন।'
          : 'Image save failed. Please use Print / Save.'
      );
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cursor-default bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 my-auto"
      >
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
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>{lang === 'bn' ? 'প্রার্থীর পূর্ণ নাম (বাধ্যতামূলক):' : 'Candidate Full Name (Required):'}</span>
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder={lang === 'bn' ? 'যেমন: মোঃ তুশান' : 'e.g. John Doe'}
              className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-neutral-400 transition-all font-medium"
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

        {/* Error message if any */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Direct manual download link if popup was blocked */}
        {downloadLink && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-2">
            <span>{lang === 'bn' ? 'ফাইল তৈরি হয়েছে!' : 'File Ready!'}</span>
            <a
              href={downloadLink.url}
              download={downloadLink.name}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-emerald-700 dark:text-emerald-300 hover:text-emerald-900"
            >
              {lang === 'bn' ? 'সরাসরি ফাইলটি সেভ করতে এখানে ক্লিক করুন ⬇' : 'Click here to save file ⬇'}
            </a>
          </div>
        )}

        {/* Download Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
          >
            {success ? (lang === 'bn' ? 'সম্পন্ন / বন্ধ করুন ✕' : 'Done / Close ✕') : (lang === 'bn' ? 'বন্ধ করুন ✕' : 'Close ✕')}
          </button>

          {/* Native Print / Save */}
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all shadow-xs"
            title={lang === 'bn' ? 'সরাসরি ব্রাউজার/ফোনের প্রিন্ট থেকে PDF সেভ করুন' : 'Print or Save as PDF via native print'}
          >
            <Printer className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            <span>{lang === 'bn' ? 'প্রিন্ট / সেভ' : 'Print / Save'}</span>
          </button>

          {/* PNG Image Download */}
          <button
            type="button"
            onClick={handleDownloadImage}
            disabled={isGeneratingImage || isGenerating}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all shadow-xs disabled:opacity-50"
            title={lang === 'bn' ? 'গ্যালারিতে সরাসরি ছবি হিসেবে সেভ করুন' : 'Save as PNG image to gallery'}
          >
            {isGeneratingImage ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : imageSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <ImageIcon className="w-4 h-4 text-neutral-600 dark:text-neutral-300" />
            )}
            <span>{lang === 'bn' ? 'ছবি (PNG)' : 'Image (PNG)'}</span>
          </button>

          {/* PDF Download */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isGenerating || isGeneratingImage}
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
                <span>{lang === 'bn' ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
