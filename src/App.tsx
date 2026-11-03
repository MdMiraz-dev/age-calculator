/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { DateSelector } from './components/DateSelector';
import { ResultDisplay } from './components/ResultDisplay';
import { GeminiInsights } from './components/GeminiInsights';
import { MilestonesTracker } from './components/MilestonesTracker';
import { DateDifferenceCalculator } from './components/DateDifferenceCalculator';
import { JobAgeChecker } from './components/JobAgeChecker';
import { SavedRecords } from './components/SavedRecords';
import { PdfExportModal } from './components/PdfExportModal';
import { CreatorModal } from './components/CreatorModal';
import { UserProfileManager } from './components/UserProfileManager';
import { LocationSelector } from './components/LocationSelector';
import { TargetAgeNotification } from './components/TargetAgeNotification';
import { PwaInstallCard } from './components/PwaInstallCard';
import { Language, Theme, UserProfile } from './types';
import { calculateAge } from './utils/ageCalculator';
import { AlertCircle, Smartphone, Heart, Sparkles, Award } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('bn');
  const [theme, setTheme] = useState<Theme>('light');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [userLocation, setUserLocation] = useState<string>(() => {
    try {
      return localStorage.getItem('age_calc_user_location') || 'ঢাকা, বাংলাদেশ';
    } catch {
      return 'ঢাকা, বাংলাদেশ';
    }
  });

  const handleLocationChange = (loc: string) => {
    setUserLocation(loc);
    try {
      localStorage.setItem('age_calc_user_location', loc);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (activeProfile?.location) {
      handleLocationChange(activeProfile.location);
    }
  }, [activeProfile]);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('age_calc_theme') as Theme;
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    } catch {
      // ignore
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme: Theme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      localStorage.setItem('age_calc_theme', nextTheme);
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  };

  // Default birth date: 2000-01-01
  const [birthDate, setBirthDate] = useState<string>('2000-01-01');

  // Today's date YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [targetDate, setTargetDate] = useState<string>(todayStr);

  // Compute calculation
  const calculationResult = useMemo(() => {
    if (!birthDate || !targetDate) return null;
    const [bY, bM, bD] = birthDate.split('-').map(Number);
    const [tY, tM, tD] = targetDate.split('-').map(Number);

    const bDateObj = new Date(bY, bM - 1, bD);
    const tDateObj = new Date(tY, tM - 1, tD);

    return calculateAge(bDateObj, tDateObj);
  }, [birthDate, targetDate]);

  const handleResetToToday = () => {
    setTargetDate(todayStr);
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col antialiased transition-colors duration-200">
      {/* Top App Header with Theme, Language, Active Profile & MIRAZ badge */}
      <Header
        lang={lang}
        theme={theme}
        activeProfile={activeProfile}
        onToggleLang={setLang}
        onToggleTheme={handleToggleTheme}
        onOpenCreatorModal={() => setIsCreatorModalOpen(true)}
      />

      {/* Main Container - Optimized for mobile viewports */}
      <main className="flex-1 w-full max-w-lg mx-auto px-3.5 py-4 sm:py-6 space-y-4">
        
        {/* PWA Download / Install Card */}
        <PwaInstallCard lang={lang} />

        {/* User Profile Manager with Email Sign Up & Photo Upload */}
        <UserProfileManager
          lang={lang}
          activeProfile={activeProfile}
          onSelectProfile={setActiveProfile}
          onSyncBirthDate={setBirthDate}
          onSyncLocation={handleLocationChange}
        />

        {/* Location Selector (GPS Auto-detect, District Presets, PDF sync) */}
        <LocationSelector
          lang={lang}
          location={userLocation}
          onLocationChange={handleLocationChange}
        />

        {/* Mobile-Friendly Date Picker Card with Prominent Date Banner */}
        <DateSelector
          lang={lang}
          birthDate={birthDate}
          targetDate={targetDate}
          onBirthDateChange={setBirthDate}
          onTargetDateChange={setTargetDate}
          onResetToToday={handleResetToToday}
        />

        {/* Invalid date guard */}
        {!calculationResult ? (
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-amber-900 dark:text-amber-200 text-xs sm:text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {lang === 'bn' ? 'সঠিক জন্মতারিখ দিন' : 'Please check birth date'}
              </p>
              <p className="text-amber-800 dark:text-amber-300 mt-0.5 leading-relaxed">
                {lang === 'bn'
                  ? 'জন্মতারিখ বর্তমান বা হিসাবের তারিখের চেয়ে ভবিষ্যৎ হতে পারে না।'
                  : 'Birth date cannot be later than the target calculation date.'}
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Main Result Displays with user photo banner & PDF download trigger */}
            <ResultDisplay
              result={calculationResult}
              lang={lang}
              birthDateStr={birthDate}
              targetDateStr={targetDate}
              activeProfile={activeProfile}
              location={userLocation}
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
            />

            {/* Target Age Milestone Notification (e.g. 21y 6m 5d alert) */}
            <TargetAgeNotification
              lang={lang}
              result={calculationResult}
              birthDateStr={birthDate}
              targetDateStr={targetDate}
            />

            {/* Gemini AI Life Insights & Birthday Wishes */}
            <GeminiInsights
              lang={lang}
              result={calculationResult}
              birthDateStr={birthDate}
            />

            {/* Life Milestones Tracker (10,000 days, Silver/Golden jubilee) */}
            <MilestonesTracker
              lang={lang}
              birthDate={birthDate}
              targetDate={targetDate}
            />

            {/* Two Dates Difference Calculator */}
            <DateDifferenceCalculator lang={lang} />

            {/* Government / Private Job Age Checker */}
            <JobAgeChecker lang={lang} result={calculationResult} />

            {/* Saved Birthdays Records */}
            <SavedRecords
              lang={lang}
              currentBirthDate={birthDate}
              onSelectBirthDate={setBirthDate}
            />
          </>
        )}

        {/* Footer with Verified Creator MIRAZ Credit */}
        <footer className="pt-4 pb-8 text-center space-y-2.5 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsCreatorModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
            >
              <Award className="w-3.5 h-3.5 text-amber-400 dark:text-amber-500" />
              <span>{lang === 'bn' ? 'পরিকল্পনা ও নির্মাণে: MIRAZ (মিরাজ)' : 'Created & Designed by MIRAZ'}</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-[11px] font-medium shadow-2xs">
            <Smartphone className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
            <span>
              {lang === 'bn'
                ? 'ফোনে অফলাইন PWA হিসেবে ব্যবহারযোগ্য'
                : 'Installable mobile PWA with offline support'}
            </span>
          </div>

          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 flex items-center justify-center gap-1">
            <span>{lang === 'bn' ? 'নির্ভুল ও নিরাপদ বয়স হিসাব' : 'Precise Age Calculator'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span>{lang === 'bn' ? 'সবার জন্য সহজ' : 'Made with care'}</span>
              <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
            </span>
          </p>
        </footer>
      </main>

      {/* PDF Export Modal */}
      {calculationResult && (
        <PdfExportModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          result={calculationResult}
          lang={lang}
          birthDateStr={birthDate}
          targetDateStr={targetDate}
          activeProfile={activeProfile}
          location={userLocation}
        />
      )}

      {/* Creator Profile Modal (MIRAZ) */}
      <CreatorModal
        isOpen={isCreatorModalOpen}
        onClose={() => setIsCreatorModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
