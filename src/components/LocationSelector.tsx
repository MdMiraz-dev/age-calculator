import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Check, Loader2, Globe, Sparkles, Building2 } from 'lucide-react';
import { Language, UserProfile } from '../types';

interface LocationSelectorProps {
  lang: Language;
  currentLocation: string;
  onLocationChange: (loc: string) => void;
  activeProfile: UserProfile | null;
  onUpdateProfileLocation?: (loc: string) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  lang,
  currentLocation,
  onLocationChange,
  activeProfile,
  onUpdateProfileLocation,
}) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [customInput, setCustomInput] = useState(currentLocation || '');
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentLocation && currentLocation !== customInput) {
      setCustomInput(currentLocation);
    }
  }, [currentLocation]);

  // Quick preset locations for Bangladesh and popular regions
  const presets = [
    { bn: 'ঢাকা, বাংলাদেশ', en: 'Dhaka, Bangladesh' },
    { bn: 'চট্টগ্রাম, বাংলাদেশ', en: 'Chattogram, Bangladesh' },
    { bn: 'রাজশাহী, বাংলাদেশ', en: 'Rajshahi, Bangladesh' },
    { bn: 'সিলেট, বাংলাদেশ', en: 'Sylhet, Bangladesh' },
    { bn: 'খুলনা, বাংলাদেশ', en: 'Khulna, Bangladesh' },
    { bn: 'বরিশাল, বাংলাদেশ', en: 'Barishal, Bangladesh' },
    { bn: 'রংপুর, বাংলাদেশ', en: 'Rangpur, Bangladesh' },
    { bn: 'ময়মনসিংহ, বাংলাদেশ', en: 'Mymensingh, Bangladesh' },
    { bn: 'কুমিল্লা, বাংলাদেশ', en: 'Cumilla, Bangladesh' },
    { bn: 'কক্সবাজার, বাংলাদেশ', en: 'Cox\'s Bazar, Bangladesh' },
    { bn: 'কলকাতা, ভারত', en: 'Kolkata, India' },
  ];

  // GPS Auto-detect location
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setDetectionMessage(
        lang === 'bn'
          ? 'আপনার ব্রাউজার জিপিএস সমর্থন করে না।'
          : 'Geolocation is not supported by your browser.'
      );
      return;
    }

    setIsDetecting(true);
    setDetectionMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Free Nominatim reverse geocode lookup
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            {
              headers: {
                'Accept-Language': lang === 'bn' ? 'bn,en' : 'en',
              },
            }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const city =
              addr.city ||
              addr.town ||
              addr.state_district ||
              addr.state ||
              addr.county ||
              '';
            const country = addr.country || '';
            const detectedStr = city && country ? `${city}, ${country}` : data.display_name?.split(',').slice(0, 2).join(',') || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;

            setCustomInput(detectedStr);
            onLocationChange(detectedStr);
            if (onUpdateProfileLocation) {
              onUpdateProfileLocation(detectedStr);
            }
            setDetectionMessage(
              lang === 'bn'
                ? `লোকেশন সফলভাবে সনাক্ত হয়েছে: ${detectedStr}`
                : `Location detected: ${detectedStr}`
            );
          } else {
            throw new Error('Reverse geocoding failed');
          }
        } catch {
          // Fallback to coordinates format
          const coordStr = `${lang === 'bn' ? 'জিপিএস অবস্থান' : 'GPS Location'} (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
          setCustomInput(coordStr);
          onLocationChange(coordStr);
          if (onUpdateProfileLocation) {
            onUpdateProfileLocation(coordStr);
          }
          setDetectionMessage(
            lang === 'bn'
              ? `জিপিএস কোঅর্ডিনেট সংগৃহীত হয়েছে`
              : `GPS coordinates captured`
          );
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        let msg = lang === 'bn' ? 'লোকেশন পাওয়া যায়নি।' : 'Unable to retrieve location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg =
            lang === 'bn'
              ? 'লোকেশন পারমিশন মেলেনি। অনুগ্রহ করে নিচের তালিকা থেকে নির্বাচন করুন বা লিখে দিন।'
              : 'Location permission was denied. Please pick from presets or type manually.';
        }
        setDetectionMessage(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectPreset = (presetName: string) => {
    setCustomInput(presetName);
    onLocationChange(presetName);
    if (onUpdateProfileLocation) {
      onUpdateProfileLocation(presetName);
    }
    setDetectionMessage(null);
  };

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;
    onLocationChange(customInput.trim());
    if (onUpdateProfileLocation) {
      onUpdateProfileLocation(customInput.trim());
    }
    setDetectionMessage(
      lang === 'bn' ? 'লোকেশন সেভ করা হয়েছে ও সনদে যুক্ত থাকবে' : 'Location saved for PDF report'
    );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>{lang === 'bn' ? 'লোকেশন সেট করুন' : 'Set Your Location'}</span>
              <span className="text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold px-2 py-0.5 rounded-full">
                {lang === 'bn' ? 'PDF রিপোর্টে থাকবে' : 'In PDF Report'}
              </span>
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {lang === 'bn'
                ? 'আপনার জন্মস্থান বা বর্তমান ঠিকানা বয়স সনদে প্রিন্ট হবে'
                : 'Your birthplace or address will be printed in the PDF certificate'}
            </p>
          </div>
        </div>

        {/* Current Active Location Pill */}
        {currentLocation && (
          <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold max-w-[140px] truncate">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{currentLocation}</span>
          </div>
        )}
      </div>

      {/* Main Form & GPS Auto Detect */}
      <div className="pt-3 space-y-3">
        <form onSubmit={handleSaveManual} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'যেমন: ঢাকা, বাংলাদেশ / ধানমন্ডি, ঢাকা'
                  : 'e.g. Dhaka, Bangladesh'
              }
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold hover:opacity-90 transition-all shrink-0 active:scale-95 shadow-xs"
          >
            {lang === 'bn' ? 'সেট করুন' : 'Set'}
          </button>

          {/* GPS Auto Detect Button */}
          <button
            type="button"
            onClick={handleDetectGps}
            disabled={isDetecting}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white text-xs font-semibold shadow-xs transition-all shrink-0 active:scale-95"
            title={lang === 'bn' ? 'জিপিএস থেকে অটো লোকেশন নিন' : 'Detect location via GPS'}
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isDetecting
                ? lang === 'bn' ? 'খোঁজা হচ্ছে...' : 'Detecting...'
                : lang === 'bn' ? 'অটো জিপিএস' : 'GPS Auto'}
            </span>
          </button>
        </form>

        {/* Feedback / status message */}
        {detectionMessage && (
          <div className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/80 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{detectionMessage}</span>
          </div>
        )}

        {/* Quick Presets for Bangladeshi Districts */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              <span>{lang === 'bn' ? 'জনপ্রিয় জেলা বা বিভাগ:' : 'Quick Districts:'}</span>
            </span>
            {currentLocation && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <Check className="w-3 h-3" />
                <span>{lang === 'bn' ? 'যুক্ত আছে' : 'Active'}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {presets.map((item, idx) => {
              const label = lang === 'bn' ? item.bn : item.en;
              const isSelected = currentLocation === label || customInput === label;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(label)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                  }`}
                >
                  {label.split(',')[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
