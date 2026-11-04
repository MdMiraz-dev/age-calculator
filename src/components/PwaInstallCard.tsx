import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle, Share, PlusSquare, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Language } from '../types';

interface PwaInstallCardProps {
  lang: Language;
}

export const PwaInstallCard: React.FC<PwaInstallCardProps> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, isStandalone, installApp } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (isInstallable) {
      const ok = await installApp();
      if (ok) {
        setInstallSuccess(true);
      }
    } else {
      // Fallback instructions modal
      setShowIOSModal(true);
    }
  };

  if (isStandalone || isInstalled) {
    return (
      <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold block">
              {lang === 'bn' ? 'অ্যাপ ইনস্টল সম্পন্ন!' : 'App Installed on Device'}
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
              {lang === 'bn' ? 'আপনি এখন অফলাইনে সরাসরি হোম স্ক্রিন থেকে ব্যবহার করছেন।' : 'Running in offline standalone mode.'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900 via-neutral-900 to-neutral-950 text-white border border-indigo-500/30 shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <img
              src="./pwa-192x192.png"
              alt="Age Calculator Icon"
              className="w-11 h-11 rounded-2xl object-cover shrink-0 shadow-md shadow-indigo-500/30 border border-white/20"
            />
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Zap className="w-3 h-3 text-indigo-400" />
                <span>{lang === 'bn' ? 'অফলাইন মোবাইল অ্যাপ' : 'Mobile PWA App'}</span>
              </div>
              <h4 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                {lang === 'bn' ? 'ফোনে অ্যাপটি ডাউনলোড / ইনস্টল করুন' : 'Download & Install on Phone'}
              </h4>
              <p className="text-xs text-neutral-300 mt-0.5">
                {lang === 'bn'
                  ? 'ইন্টারনেট ছাড়াই ১০০% অফলাইন চলবে, হোম স্ক্রিনে অ্যাপ আইকন থাকবে।'
                  : 'Works 100% offline, opens fullscreen with app icon on home screen.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-100 font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0"
          >
            <Smartphone className="w-4 h-4 text-indigo-600" />
            <span>{lang === 'bn' ? 'অ্যাপ ডাউনলোড করুন' : 'Install App'}</span>
          </button>
        </div>
      </div>

      {/* iOS / General Install Guidance Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="text-center">
              <img
                src="./pwa-192x192.png"
                alt="App Icon"
                className="w-14 h-14 rounded-2xl object-cover mx-auto mb-2.5 shadow-lg shadow-indigo-500/20 border-2 border-indigo-500/40"
              />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {lang === 'bn' ? 'সহজেই ফোনে ইনস্টল করার নিয়ম' : 'How to Install on Phone'}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                {lang === 'bn'
                  ? 'নিচের লেখাগুলো কোনো ক্লিক বাটন নয়। আপনার ব্রাউজারের মেনু থেকে এই ৩টি ধাপ অনুসরণ করুন:'
                  : 'Follow these quick steps in your browser menu:'}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {lang === 'bn' ? 'ব্রাউজার মেনু বা Share চাপুন' : 'Tap Menu or Share'}
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">
                    {lang === 'bn'
                      ? 'iPhone এ Safari এর নিচে Share (⎋) অথবা Android এ ৩ ডট মেনু (⋮) চাপুন।'
                      : 'Tap Share (⎋) on Safari or three dots (⋮) on Chrome.'}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1">
                    <PlusSquare className="w-3.5 h-3.5 text-indigo-600 inline" />
                    <span>{lang === 'bn' ? '"Add to Home Screen" নির্বাচন করুন' : 'Select "Add to Home Screen"'}</span>
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">
                    {lang === 'bn'
                      ? 'বা "ইনস্টল অ্যাপ" / "হোম স্ক্রিনে যোগ করুন" বাটনে ক্লিক করুন।'
                      : 'Or click "Install App" option in the list.'}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">
                    {lang === 'bn' ? '"Add / Install" চাপুন' : 'Tap "Add / Install"'}
                  </p>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] mt-0.5">
                    {lang === 'bn'
                      ? 'অ্যাপ আইকনটি আপনার ফোনের হোম স্ক্রিনে ইনস্টল হয়ে যাবে।'
                      : 'The app icon will immediately appear on your home screen.'}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold text-xs hover:opacity-90 transition-opacity"
            >
              {lang === 'bn' ? 'বুঝেছি / বন্ধ করুন' : 'Understood'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
