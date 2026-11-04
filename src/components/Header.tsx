import React from 'react';
import { Calendar, Sun, Moon, Sparkles, Download, CheckCircle2 } from 'lucide-react';
import { Language, Theme, UserProfile } from '../types';

interface HeaderProps {
  lang: Language;
  theme: Theme;
  activeProfile?: UserProfile | null;
  onToggleLang: (newLang: Language) => void;
  onToggleTheme: () => void;
  onOpenCreatorModal: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  theme,
  activeProfile,
  onToggleLang,
  onToggleTheme,
  onOpenCreatorModal,
  onOpenInstallModal,
}) => {
  return (
    <header className="w-full bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-3.5 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <img
            src="./pwa-192x192.png"
            alt="Age Calculator"
            className="w-9 h-9 rounded-xl object-cover shadow-xs border border-neutral-200 dark:border-neutral-700 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-sm sm:text-base font-bold text-neutral-950 dark:text-white tracking-tight leading-none">
                {lang === 'bn' ? 'বয়স ক্যালকুলেটর' : 'Age Calculator'}
              </h1>
              {/* MIRAZ Verified Creator Badge */}
              <button
                type="button"
                onClick={onOpenCreatorModal}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-[10px] font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs"
                title={lang === 'bn' ? 'নির্মাতা MIRAZ সম্পর্কে জানুন' : 'Created by MIRAZ'}
              >
                <Sparkles className="w-2.5 h-2.5 text-indigo-500" />
                <span>by MIRAZ</span>
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-0.5">
              {lang === 'bn' ? 'সহজ ও নির্ভুল হিসাব • নির্মাতা MIRAZ' : 'Precise & Instant • Built by MIRAZ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active Profile Avatar if present */}
          {activeProfile && (
            <div
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 max-w-[120px]"
              title={activeProfile.name}
            >
              {activeProfile.photoUrl ? (
                <img
                  src={activeProfile.photoUrl}
                  alt={activeProfile.name}
                  className="w-5 h-5 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                  {activeProfile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[11px] font-semibold text-neutral-800 dark:text-neutral-200 truncate hidden xs:inline">
                {activeProfile.name.split(' ')[0]}
              </span>
            </div>
          )}

          {/* Dark / Light Mode Switcher */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            title={
              theme === 'dark'
                ? lang === 'bn' ? 'লাইট মোড করুন' : 'Switch to Light mode'
                : lang === 'bn' ? 'ডার্ক মোড করুন' : 'Switch to Dark mode'
            }
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-neutral-700" />
            )}
          </button>

          {/* Language Switcher Pill */}
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-0.5 sm:p-1 rounded-xl border border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => onToggleLang('bn')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                lang === 'bn'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              বাং
            </button>
            <button
              type="button"
              onClick={() => onToggleLang('en')}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                lang === 'en'
                  ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

