import React from 'react';
import { X, Code2, Award, Heart, CheckCircle2, Smartphone, Sparkles, ShieldCheck } from 'lucide-react';
import { Language } from '../types';

interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const CreatorModal: React.FC<CreatorModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 my-auto relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Creator Header */}
        <div className="flex flex-col items-center text-center pt-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-500 to-emerald-400 p-1 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full rounded-xl bg-neutral-900 flex items-center justify-center text-white">
                <span className="text-2xl font-black tracking-wider">M</span>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white dark:border-neutral-900">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'অফিসিয়াল সফটওয়্যার ক্রিয়েটর' : 'Official Software Creator'}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
              MIRAZ (মিরাজ)
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {lang === 'bn' ? 'প্রধান পরিকল্পনাকারী ও সফটওয়্যার নির্মাতা' : 'Lead Developer & Architect'}
            </p>
          </div>
        </div>

        {/* App Bio Card */}
        <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/80 dark:border-neutral-700/60 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
            <Code2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>{lang === 'bn' ? 'সফটওয়্যার পরিচিতি' : 'About This Application'}</span>
          </div>
          <p>
            {lang === 'bn'
              ? 'এই আধুনিক বয়স ক্যালকুলেটর অ্যাপ্লিকেশনটি MIRAZ তৈরি করেছেন যাতে যে কেউ খুব সহজে সেকেন্ডের মধ্যে নির্ভুল বয়স বের করতে পারেন, ছবিসহ প্রোফাইল সংরক্ষণ করতে পারেন এবং ভবিষ্যতে নির্দিষ্ট টার্গেট বয়সে নোটিফিকেশন পেতে পারেন।'
              : 'This comprehensive Age Calculator was engineered by MIRAZ to deliver instant age precision, personalized photo profiles, milestone alert notifications, and full PWA mobile support.'}
          </p>
        </div>

        {/* Feature Highlights by MIRAZ */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-700/40 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {lang === 'bn' ? '১০০% নিরাপদ ও অফলাইন' : '100% Safe & Offline'}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-700/40 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              {lang === 'bn' ? 'মোবাইল ফ্রেন্ডলি PWA' : 'Mobile PWA Ready'}
            </span>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
          <span className="flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>{lang === 'bn' ? 'স্বত্বাধিকার: MIRAZ' : 'Copyright © MIRAZ'}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold text-xs hover:opacity-90 transition-opacity"
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
