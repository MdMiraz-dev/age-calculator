import React, { useState, useEffect } from 'react';
import { Bell, BellRing, Sparkles, CheckCircle2, Calendar, Clock, AlertCircle, Trash2, Send, PartyPopper } from 'lucide-react';
import { CalculationResult, Language, AgeMilestoneReminder } from '../types';
import { toBnNum } from '../utils/ageCalculator';
import { formatFullDate } from '../utils/dateFormatter';

interface TargetAgeNotificationProps {
  lang: Language;
  result: CalculationResult;
  birthDateStr: string;
  targetDateStr: string;
}

export const TargetAgeNotification: React.FC<TargetAgeNotificationProps> = ({
  lang,
  result,
  birthDateStr,
  targetDateStr,
}) => {
  const [reminders, setReminders] = useState<AgeMilestoneReminder[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [targetYears, setTargetYears] = useState<number>(result.years);
  const [targetMonths, setTargetMonths] = useState<number>(result.months);
  const [targetDays, setTargetDays] = useState<number>(result.days + 5);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [celebrationReminder, setCelebrationReminder] = useState<AgeMilestoneReminder | null>(null);

  // Sync state when result changes
  useEffect(() => {
    setTargetYears(result.years);
    setTargetMonths(result.months);
    setTargetDays(result.days + 5);
  }, [result.years, result.months, result.days]);

  // Check notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  // Load reminders
  useEffect(() => {
    try {
      const stored = localStorage.getItem('age_calc_milestone_reminders');
      if (stored) {
        const list: AgeMilestoneReminder[] = JSON.parse(stored);
        setReminders(list);

        // Check if any reminder is reached today!
        const todayStr = new Date().toISOString().split('T')[0];
        const triggered = list.find((r) => !r.isTriggered && r.targetDate <= todayStr);
        if (triggered) {
          setCelebrationReminder(triggered);
          // Fire browser notification if allowed
          if ('Notification' in window && Notification.permission === 'granted') {
            const bodyText = lang === 'bn'
              ? `আপনার আজ ${toBnNum(triggered.targetYears)} বছর ${toBnNum(triggered.targetMonths)} মাস ${toBnNum(triggered.targetDays)} দিন পূর্ণ হয়েছে!`
              : `You have completed ${triggered.targetYears}y ${triggered.targetMonths}m ${triggered.targetDays}d today!`;

            new Notification(lang === 'bn' ? '🎉 বয়স ক্যালকুলেটর নোটিফিকেশন' : '🎉 Age Milestone Notification', {
              body: bodyText,
              icon: '/pwa-192x192.png',
            });
          }

          // Mark triggered
          const updated = list.map((r) => (r.id === triggered.id ? { ...r, isTriggered: true } : r));
          setReminders(updated);
          localStorage.setItem('age_calc_milestone_reminders', JSON.stringify(updated));
        }
      }
    } catch (e) {
      console.error('Failed to load reminders:', e);
    }
  }, [lang]);

  const saveReminders = (list: AgeMilestoneReminder[]) => {
    setReminders(list);
    try {
      localStorage.setItem('age_calc_milestone_reminders', JSON.stringify(list));
    } catch (e) {
      console.error('Failed to persist reminders:', e);
    }
  };

  // Request Notification Permission
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert(lang === 'bn' ? 'আপনার ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই।' : 'Notifications not supported in this browser.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    } catch (e) {
      console.error('Permission request failed:', e);
    }
  };

  // Send immediate test notification
  const handleSendTestNotification = () => {
    if (!('Notification' in window) || notificationPermission !== 'granted') {
      requestPermission();
      return;
    }

    const title = lang === 'bn' ? '🎉 বয়স মাইলস্টোন টেস্ট অ্যালার্ট' : '🎉 Age Milestone Alert';
    const body = lang === 'bn'
      ? `আপনার আজ ${toBnNum(result.years)} বছর ${toBnNum(result.months)} মাস ${toBnNum(result.days + 5)} দিন সম্পূর্ণ হয়েছে! MIRAZ বয়স ক্যালকুলেটর।`
      : `You have completed ${result.years}y ${result.months}m ${result.days + 5}d! Age Calculator by MIRAZ.`;

    try {
      new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
      });
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } catch (e) {
      console.error('Notification error:', e);
    }
  };

  // Calculate target calendar date given target age
  const calculateTargetDate = (years: number, months: number, days: number): string => {
    const [bY, bM, bD] = birthDateStr.split('-').map(Number);
    // Add years and months to birthdate, then days
    const date = new Date(bY + years, bM - 1 + months, bD + days);
    return date.toISOString().split('T')[0];
  };

  const calculatedTargetDate = calculateTargetDate(targetYears, targetMonths, targetDays);

  // Days remaining until that milestone date
  const [cY, cM, cD] = targetDateStr.split('-').map(Number);
  const currentDateObj = new Date(cY, cM - 1, cD);
  const [tY, tM, tD] = calculatedTargetDate.split('-').map(Number);
  const targetDateObj = new Date(tY, tM - 1, tD);
  const diffDays = Math.ceil((targetDateObj.getTime() - currentDateObj.getTime()) / (1000 * 60 * 60 * 24));

  // Handle setting the reminder
  const handleSetReminder = () => {
    if (diffDays <= 0) {
      alert(
        lang === 'bn'
          ? 'টার্গেট বয়স বর্তমান বয়সের চেয়ে বেশি হতে হবে।'
          : 'Target age must be greater than current age.'
      );
      return;
    }

    const newReminder: AgeMilestoneReminder = {
      id: 'rem_' + Date.now(),
      targetYears,
      targetMonths,
      targetDays,
      targetDate: calculatedTargetDate,
      note: lang === 'bn' ? `${toBnNum(targetYears)} বছর ${toBnNum(targetMonths)} মাস ${toBnNum(targetDays)} দিন পূর্ণ` : `${targetYears}y ${targetMonths}m ${targetDays}d milestone`,
      createdAt: Date.now(),
      isTriggered: false,
    };

    const updated = [newReminder, ...reminders];
    saveReminders(updated);

    if (notificationPermission !== 'granted') {
      requestPermission();
    }
  };

  const handleDeleteReminder = (id: string) => {
    const filtered = reminders.filter((r) => r.id !== id);
    saveReminders(filtered);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-xs transition-colors space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BellRing className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>{lang === 'bn' ? 'টার্গেট বয়স নোটিফিকেশন ও অ্যালার্ট' : 'Target Age Milestone Notification'}</span>
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 font-semibold px-2 py-0.5 rounded-full">
                {lang === 'bn' ? 'অ্যালার্ট' : 'Alert'}
              </span>
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {lang === 'bn'
                ? 'নির্দিষ্ট বয়সে (যেমন: ২১ বছর ৬ মাস ৫ দিন) পৌঁছালে নোটিফিকেশন পাবেন'
                : 'Get notified automatically when you reach a specific age'}
            </p>
          </div>
        </div>

        {/* Browser Permission status */}
        <div>
          {notificationPermission === 'granted' ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle2 className="w-3 h-3" />
              <span>{lang === 'bn' ? 'অনুমোদিত' : 'Allowed'}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={requestPermission}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 px-2.5 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 transition-colors"
            >
              {lang === 'bn' ? 'অনুমতি দিন' : 'Allow Alert'}
            </button>
          )}
        </div>
      </div>

      {/* Quick Presets Section (e.g. +5 days user exact query!) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{lang === 'bn' ? 'দ্রুত টার্গেট বয়স নির্বাচন:' : 'Quick Target Presets:'}</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* +5 Days Preset (Miraz's exact request!) */}
          <button
            type="button"
            onClick={() => {
              setTargetYears(result.years);
              setTargetMonths(result.months);
              setTargetDays(result.days + 5);
            }}
            className={`p-2.5 rounded-2xl border text-left transition-all ${
              targetDays === result.days + 5 && targetMonths === result.months && targetYears === result.years
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-amber-400'
            }`}
          >
            <div className="text-[10px] uppercase font-bold opacity-80">
              {lang === 'bn' ? 'আগামী ৫ দিন পর' : '+5 Days'}
            </div>
            <div className="font-extrabold text-xs mt-0.5">
              {lang === 'bn'
                ? `${toBnNum(result.years)}ব ${toBnNum(result.months)}মা ${toBnNum(result.days + 5)}দি`
                : `${result.years}y ${result.months}m ${result.days + 5}d`}
            </div>
          </button>

          {/* +10 Days */}
          <button
            type="button"
            onClick={() => {
              setTargetYears(result.years);
              setTargetMonths(result.months);
              setTargetDays(result.days + 10);
            }}
            className={`p-2.5 rounded-2xl border text-left transition-all ${
              targetDays === result.days + 10 && targetMonths === result.months && targetYears === result.years
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-amber-400'
            }`}
          >
            <div className="text-[10px] uppercase font-bold opacity-80">
              {lang === 'bn' ? 'আগামী ১০ দিন পর' : '+10 Days'}
            </div>
            <div className="font-extrabold text-xs mt-0.5">
              {lang === 'bn'
                ? `${toBnNum(result.years)}ব ${toBnNum(result.months)}মা ${toBnNum(result.days + 10)}দি`
                : `${result.years}y ${result.months}m ${result.days + 10}d`}
            </div>
          </button>

          {/* +1 Month */}
          <button
            type="button"
            onClick={() => {
              setTargetYears(result.years);
              setTargetMonths(result.months + 1);
              setTargetDays(result.days);
            }}
            className={`p-2.5 rounded-2xl border text-left transition-all ${
              targetMonths === result.months + 1 && targetDays === result.days && targetYears === result.years
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-amber-400'
            }`}
          >
            <div className="text-[10px] uppercase font-bold opacity-80">
              {lang === 'bn' ? 'আগামী ১ মাস পর' : '+1 Month'}
            </div>
            <div className="font-extrabold text-xs mt-0.5">
              {lang === 'bn'
                ? `${toBnNum(result.years)}ব ${toBnNum(result.months + 1)}মা ${toBnNum(result.days)}দি`
                : `${result.years}y ${result.months + 1}m ${result.days}d`}
            </div>
          </button>

          {/* Next Round Year */}
          <button
            type="button"
            onClick={() => {
              setTargetYears(result.years + 1);
              setTargetMonths(0);
              setTargetDays(0);
            }}
            className={`p-2.5 rounded-2xl border text-left transition-all ${
              targetYears === result.years + 1 && targetMonths === 0 && targetDays === 0
                ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-800/60 border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:border-amber-400'
            }`}
          >
            <div className="text-[10px] uppercase font-bold opacity-80">
              {lang === 'bn' ? 'পরবর্তী জন্মদিন' : 'Next Birthday'}
            </div>
            <div className="font-extrabold text-xs mt-0.5">
              {lang === 'bn' ? `${toBnNum(result.years + 1)} বছর পূর্ণ` : `${result.years + 1}y Completed`}
            </div>
          </button>
        </div>
      </div>

      {/* Target Age Input Customizer */}
      <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/70 space-y-3">
        <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
          {lang === 'bn' ? 'টার্গেট বয়স কাস্টমাইজ করুন:' : 'Customize Target Age:'}
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] text-neutral-500 font-medium block mb-1">
              {lang === 'bn' ? 'বছর (Years)' : 'Years'}
            </label>
            <input
              type="number"
              min={result.years}
              max={150}
              value={targetYears}
              onChange={(e) => setTargetYears(Number(e.target.value))}
              className="w-full text-xs font-bold p-2 text-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 font-medium block mb-1">
              {lang === 'bn' ? 'মাস (Months)' : 'Months'}
            </label>
            <input
              type="number"
              min={0}
              max={11}
              value={targetMonths}
              onChange={(e) => setTargetMonths(Number(e.target.value))}
              className="w-full text-xs font-bold p-2 text-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-[10px] text-neutral-500 font-medium block mb-1">
              {lang === 'bn' ? 'দিন (Days)' : 'Days'}
            </label>
            <input
              type="number"
              min={0}
              max={31}
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
              className="w-full text-xs font-bold p-2 text-center rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Target Date Calculation Preview */}
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs flex items-center justify-between gap-2">
          <div className="space-y-0.5">
            <span className="text-amber-800 dark:text-amber-300 font-bold block">
              {lang === 'bn' ? 'নির্ধারিত লক্ষ্য তারিখ:' : 'Target Milestone Date:'}
            </span>
            <span className="text-amber-950 dark:text-amber-100 font-extrabold text-sm">
              {formatFullDate(calculatedTargetDate, lang, true)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-amber-700 dark:text-amber-400 block font-medium">
              {lang === 'bn' ? 'বাকি সময়:' : 'Time Left:'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-xs inline-block">
              {diffDays > 0 ? (
                lang === 'bn' ? `আর ${toBnNum(diffDays)} দিন বাকি` : `${diffDays} days remaining`
              ) : (
                lang === 'bn' ? 'আজ বা অতিক্রান্ত' : 'Today / Passed'
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSetReminder}
            className="w-full sm:flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Bell className="w-4 h-4" />
            <span>{lang === 'bn' ? 'নোটিফিকেশন অ্যালার্ট সেট করুন' : 'Schedule Notification Alert'}</span>
          </button>

          <button
            type="button"
            onClick={handleSendTestNotification}
            className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            title={lang === 'bn' ? 'ফোনে নোটিফিকেশন টেস্ট করুন' : 'Test notification on your device'}
          >
            <Send className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {testNotificationSent
                ? lang === 'bn' ? 'নোটিফিকেশন পাঠানো হয়েছে!' : 'Notification Sent!'
                : lang === 'bn' ? 'টেস্ট নোটিফিকেশন পাঠান' : 'Send Test Notification'}
            </span>
          </button>
        </div>
      </div>

      {/* Saved Reminders List */}
      {reminders.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            {lang === 'bn' ? 'আপনার সেট করা সক্রিয় রিমাইন্ডার সমূহ:' : 'Active Scheduled Reminders:'}
          </div>
          <div className="space-y-1.5">
            {reminders.map((rem) => {
              const rDiff = Math.ceil((new Date(rem.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={rem.id}
                  className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-neutral-900 dark:text-white truncate">
                        {lang === 'bn'
                          ? `টার্গেট: ${toBnNum(rem.targetYears)} বছর ${toBnNum(rem.targetMonths)} মাস ${toBnNum(rem.targetDays)} দিন`
                          : `Target: ${rem.targetYears}y ${rem.targetMonths}m ${rem.targetDays}d`}
                      </div>
                      <div className="text-[11px] text-neutral-500">
                        {formatFullDate(rem.targetDate, lang, true)} •{' '}
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          {rDiff > 0
                            ? lang === 'bn' ? `আর ${toBnNum(rDiff)} দিন বাকি` : `${rDiff} days left`
                            : lang === 'bn' ? 'আজকে পূর্ণ!' : 'Reached today!'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="p-1.5 text-neutral-400 hover:text-rose-500 transition-colors"
                    title={lang === 'bn' ? 'মুছুন' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Celebration Modal when milestone arrives */}
      {celebrationReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-amber-300 dark:border-amber-800 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 text-white flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <PartyPopper className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tracking-wide uppercase">
                {lang === 'bn' ? '🎉 অভিনন্দন!' : '🎉 Congratulations!'}
              </span>
              <h3 className="text-xl font-black text-neutral-900 dark:text-white mt-1">
                {lang === 'bn' ? 'আপনার টার্গেট বয়স পূর্ণ হয়েছে!' : 'Milestone Age Completed!'}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 font-medium">
                {lang === 'bn'
                  ? `আপনার আজ ${toBnNum(celebrationReminder.targetYears)} বছর ${toBnNum(celebrationReminder.targetMonths)} মাস ${toBnNum(celebrationReminder.targetDays)} দিন সম্পূর্ণ হয়েছে!`
                  : `You have successfully completed ${celebrationReminder.targetYears} years ${celebrationReminder.targetMonths} months ${celebrationReminder.targetDays} days today!`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setCelebrationReminder(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              {lang === 'bn' ? 'ধন্যবাদ / সম্পন্ন' : 'Thank You'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
