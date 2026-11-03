import React, { useState } from 'react';
import { Sparkles, RefreshCw, Copy, Check, HeartHandshake, Compass, Gift, AlertCircle } from 'lucide-react';
import { CalculationResult, Language } from '../types';
import { toBnNum } from '../utils/ageCalculator';
import { formatFullDate } from '../utils/dateFormatter';

interface GeminiInsightsProps {
  lang: Language;
  result: CalculationResult;
  birthDateStr: string;
}

type InsightType = 'wish' | 'milestone' | 'zodiac';

export const GeminiInsights: React.FC<GeminiInsightsProps> = ({
  lang,
  result,
  birthDateStr,
}) => {
  const [selectedType, setSelectedType] = useState<InsightType>('wish');
  const [loading, setLoading] = useState(false);
  const [insightText, setInsightText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getFallbackInsight = (type: InsightType): string => {
    if (lang === 'bn') {
      if (type === 'wish') {
        return `🎉 শুভ জন্মদিন ও অন্তরের উষ্ণ শুভেচ্ছা!\n\n১. ${toBnNum(result.years)} বছরে পদার্পণের এই বিশেষ ক্ষণে আপনার জীবন ভরে উঠুক সুস্থতা, অফুরন্ত সুখ আর অনাবিল প্রশান্তিতে।\n২. আগামী প্রতিটি দিন যেন আপনার স্বপ্ন পূরণের নতুন দিগন্ত উন্মোচন করে।\n৩. হাসিখুশি থাকুন, নিজেকে ভালোবাসুন এবং প্রতিটি মুহূর্ত উপভোগ করুন!`;
      }
      if (type === 'milestone') {
        return `🌟 ${toBnNum(result.years)} বছর বয়সের তাৎপর্য:\n\n• জীবনের এই বয়সে আপনি ইতিমধ্যে পার করেছেন ${toBnNum(result.totalDays.toLocaleString('en-US'))} টি অনন্য দিন। প্রতিটি দিনই ছিল অভিজ্ঞতা অর্জনের সুযোগ।\n• পরামর্শ: প্রতিদিনের স্বাস্থ্যচর্চাকে অগ্রাধিকার দিন, নতুন কোনো শখ বা দক্ষতা অর্জন করুন এবং প্রিয়জনদের পর্যাপ্ত সময় দিন।\n• জীবন একটাই—প্রতিটি বছরকে অর্থবহ ও স্মৃতিময় করে তোলাই আসল সাফল্য।`;
      }
      return `🔮 ${result.zodiacSign.bn} রাশির জাতক/জাতিকা হিসেবে আপনার বৈশিষ্ট্য:\n\n• আপনি স্বভাবসুলভ আন্তরিক, কর্মঠ এবং দূরদর্শী মনোভাবের অধিকারী।\n• আপনার ইতিবাচক মানসিকতা ও সংকল্প যেকোনো বাধা কাটিয়ে এগিয়ে যেতে সাহায্য করে।\n• নিজের আত্মবিশ্বাসে অটল থাকুন এবং প্রতিটি পদক্ষেপ আত্মপ্রত্যয়ের সাথে ফেলুন।`;
    }

    if (type === 'wish') {
      return `🎉 Warmest Birthday Wishes!\n\n1. As you celebrate ${result.years} wonderful years, may your upcoming year be filled with radiant health, joy, and peace.\n2. May every single day bring new opportunities to fulfill your greatest dreams and aspirations.\n3. Keep shining bright, embrace every moment, and make unforgettable memories!`;
    }
    if (type === 'milestone') {
      return `🌟 Life Reflection at Age ${result.years}:\n\n• You have lived through over ${result.totalDays.toLocaleString('en-US')} remarkable days, accumulating wisdom and resilience.\n• Wisdom for this stage: Invest consistently in physical health, nourish deep friendships, and pursue learning with passion.\n• Age is not merely a number, but a rich tapestry of stories and future possibilities.`;
    }
    return `🔮 Astrological Profile (${result.zodiacSign.en}):\n\n• Natural qualities: Deep determination, intuition, and warmth toward loved ones.\n• Your ability to adapt and stay focused on meaningful goals is your strongest asset.\n• Continue cultivating clarity, balance, and enthusiasm in all your pursuits.`;
  };

  const handleGenerate = async (type: InsightType = selectedType) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const formattedBDate = formatFullDate(birthDateStr, lang, false);
      const res = await fetch('/api/gemini/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthDate: formattedBDate,
          ageYears: result.years,
          ageMonths: result.months,
          ageDays: result.days,
          zodiacSign: lang === 'bn' ? result.zodiacSign.bn : result.zodiacSign.en,
          lang,
          type,
        }),
      });

      if (!res.ok) {
        throw new Error('API unavailable');
      }

      const data = await res.json();
      if (data.text) {
        setInsightText(data.text);
      } else {
        setInsightText(getFallbackInsight(type));
      }
    } catch {
      // Graceful fallback with human wisdom
      setInsightText(getFallbackInsight(type));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!insightText) return;
    navigator.clipboard.writeText(insightText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-xs transition-colors space-y-4">
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white leading-none flex items-center gap-1.5">
              <span>{lang === 'bn' ? 'জিমিনি এআই ইনসাইট ও শুভেচ্ছা' : 'Gemini AI Life Insights'}</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/60 text-violet-700 dark:text-violet-300">
                Gemini AI
              </span>
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium mt-1">
              {lang === 'bn'
                ? 'ব্যক্তিগত শুভেচ্ছা বার্তা ও বয়সের তাৎপর্য জানুন'
                : 'Personalized birthday wishes & life stage reflections'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setSelectedType('wish');
            handleGenerate('wish');
          }}
          className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            selectedType === 'wish'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Gift className="w-3.5 h-3.5" />
          <span className="truncate">{lang === 'bn' ? 'শুভেচ্ছা বার্তা' : 'Wishes'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedType('milestone');
            handleGenerate('milestone');
          }}
          className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            selectedType === 'milestone'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="truncate">{lang === 'bn' ? 'জীবন ভাবনা' : 'Reflection'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedType('zodiac');
            handleGenerate('zodiac');
          }}
          className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            selectedType === 'zodiac'
              ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span className="truncate">{lang === 'bn' ? 'রাশি ও ব্যক্তিত্ব' : 'Zodiac AI'}</span>
        </button>
      </div>

      {/* Action / Result Display */}
      {insightText ? (
        <div className="bg-violet-50/50 dark:bg-neutral-800/80 rounded-xl p-3.5 border border-violet-100 dark:border-neutral-700 space-y-3">
          <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed whitespace-pre-line font-medium">
            {insightText}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-violet-100/70 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => handleGenerate(selectedType)}
              disabled={loading}
              className="inline-flex items-center gap-1 text-[11px] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{lang === 'bn' ? 'নতুন করে লিখুন' : 'Regenerate'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'কপি হয়েছে' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'বার্তা কপি করুন' : 'Copy'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 px-3 bg-neutral-50 dark:bg-neutral-800/50 rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 space-y-3">
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {lang === 'bn'
              ? 'জিমিনি এআই দিয়ে আপনার বর্তমান বয়সের উপযোগী অনুপ্রেরণাদায়ী কথা বা সুন্দর জন্মদিনের শুভেচ্ছা তৈরি করুন।'
              : 'Generate inspirational life insights, blessings, or tailored birthday wishes powered by Gemini AI.'}
          </p>
          <button
            type="button"
            onClick={() => handleGenerate(selectedType)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading
                ? lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...'
                : lang === 'bn' ? 'এআই দিয়ে তৈরি করুন' : 'Generate with Gemini'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
