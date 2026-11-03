import React, { useState, useEffect, useRef } from 'react';
import { User, Camera, Upload, Plus, Check, Trash2, Mail, Calendar, Sparkles, X, UserCheck, Shield, MapPin, Navigation, Loader2 } from 'lucide-react';
import { UserProfile, Language } from '../types';

interface UserProfileManagerProps {
  lang: Language;
  activeProfile: UserProfile | null;
  onSelectProfile: (profile: UserProfile | null) => void;
  onSyncBirthDate: (birthDate: string) => void;
  onSyncLocation?: (location: string) => void;
}

export const UserProfileManager: React.FC<UserProfileManagerProps> = ({
  lang,
  activeProfile,
  onSelectProfile,
  onSyncBirthDate,
  onSyncLocation,
}) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [location, setLocation] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved profiles from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('age_calc_user_profiles');
      if (stored) {
        const parsed: UserProfile[] = JSON.parse(stored);
        setProfiles(parsed);
        if (!activeProfile && parsed.length > 0) {
          onSelectProfile(parsed[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load profiles:', e);
    }
  }, []);

  // Save to localStorage when profiles change
  const saveProfiles = (newProfiles: UserProfile[]) => {
    setProfiles(newProfiles);
    try {
      localStorage.setItem('age_calc_user_profiles', JSON.stringify(newProfiles));
    } catch (e) {
      console.error('Failed to persist profiles:', e);
    }
  };

  // Handle Photo File Upload & Compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress to max 256x256 for smooth localStorage storage
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPhotoUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDetectGpsForModal = () => {
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
            setLocation(detected);
          } else {
            setLocation('ঢাকা, বাংলাদেশ');
          }
        } catch {
          setLocation('ঢাকা, বাংলাদেশ');
        } finally {
          setIsDetectingGps(false);
        }
      },
      () => {
        setIsDetectingGps(false);
      }
    );
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProfile: UserProfile = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.trim() || 'user@example.com',
      birthDate: birthDate || '2000-01-01',
      location: location.trim() || undefined,
      photoUrl: photoUrl || undefined,
      createdAt: Date.now(),
    };

    const updated = [newProfile, ...profiles];
    saveProfiles(updated);
    onSelectProfile(newProfile);
    if (newProfile.birthDate) {
      onSyncBirthDate(newProfile.birthDate);
    }
    if (newProfile.location && onSyncLocation) {
      onSyncLocation(newProfile.location);
    }

    // Reset form
    setName('');
    setEmail('');
    setBirthDate('');
    setLocation('');
    setPhotoUrl('');
    setIsModalOpen(false);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = profiles.filter((p) => p.id !== id);
    saveProfiles(filtered);
    if (activeProfile?.id === id) {
      onSelectProfile(filtered.length > 0 ? filtered[0] : null);
    }
  };

  const presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-4 sm:p-5 shadow-xs transition-colors">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <span>{lang === 'bn' ? 'ব্যবহারকারীর প্রোফাইল ও ছবি' : 'User Profile & Photo'}</span>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                {lang === 'bn' ? 'ব্যক্তিগত' : 'Personal'}
              </span>
            </h3>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {lang === 'bn'
                ? 'ইমেল দিয়ে সাইন আপ করুন ও নিজের ছবি সেট করুন'
                : 'Sign up with email & attach your personal photo'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'নতুন প্রোফাইল' : 'Add Profile'}</span>
        </button>
      </div>

      {/* Active User Banner or Profile Chips */}
      <div className="pt-3">
        {activeProfile ? (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/70 to-sky-50/70 dark:from-indigo-950/30 dark:to-neutral-900 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                {activeProfile.photoUrl ? (
                  <img
                    src={activeProfile.photoUrl}
                    alt={activeProfile.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 shadow-xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    {activeProfile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-neutral-900 rounded-full" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                    {activeProfile.name}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium rounded-md shrink-0">
                    {lang === 'bn' ? 'সক্রিয়' : 'Active'}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                  {activeProfile.email}
                </p>
                {activeProfile.birthDate && (
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{lang === 'bn' ? 'জন্মতারিখ: ' : 'DOB: '} {activeProfile.birthDate}</span>
                  </p>
                )}
                {activeProfile.location && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-0.5 flex items-center gap-1 truncate max-w-[220px]">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{activeProfile.location}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onSyncBirthDate(activeProfile.birthDate)}
                className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                title={lang === 'bn' ? 'এই জন্মতারিখে ক্যালকুলেট করুন' : 'Calculate for this profile'}
              >
                {lang === 'bn' ? 'হিসাব করুন' : 'Calculate'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 px-2 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
            <User className="w-8 h-8 text-neutral-400 mx-auto mb-1.5" />
            <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              {lang === 'bn'
                ? 'এখনও কোনো প্রোফাইল যুক্ত করা হয়নি। আপনার নাম ও ছবি যোগ করতে "নতুন প্রোফাইল" বাটনে ক্লিক করুন।'
                : 'No profile added yet. Click "Add Profile" to set your name and photo.'}
            </p>
          </div>
        )}

        {/* Profiles Horizontal List for Multi-user switching */}
        {profiles.length > 1 && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5">
              {lang === 'bn' ? 'অন্যান্য সংরক্ষিত প্রোফাইল:' : 'Switch Profiles:'}
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onSelectProfile(p);
                    if (p.birthDate) onSyncBirthDate(p.birthDate);
                    if (p.location && onSyncLocation) onSyncLocation(p.location);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all shrink-0 ${
                    activeProfile?.id === p.id
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100'
                  }`}
                >
                  {p.photoUrl ? (
                    <img src={p.photoUrl} alt={p.name} className="w-4 h-4 rounded-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                  <span>{p.name}</span>
                  {activeProfile?.id === p.id && <Check className="w-3 h-3 text-white ml-0.5" />}
                  <span
                    onClick={(e) => handleDeleteProfile(p.id, e)}
                    className="ml-1 hover:text-rose-300 opacity-60 hover:opacity-100"
                    title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                  >
                    ×
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sign Up / Create Profile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-neutral-200 dark:border-neutral-800 space-y-4 my-auto relative">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                    {lang === 'bn' ? 'ইমেল দিয়ে সাইন আপ / প্রোফাইল' : 'Sign Up / New Profile'}
                  </h3>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    {lang === 'bn' ? 'ছবি ও নাম সেট করে অফলাইনে সংরক্ষণ করুন' : 'Add custom photo, name & email'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-3.5">
              {/* Photo Upload & Preview */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative group">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Uploaded avatar"
                      className="w-20 h-20 rounded-full object-cover border-2 border-indigo-600 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-neutral-100 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex flex-col items-center justify-center text-neutral-400">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] mt-1">{lang === 'bn' ? 'ছবি দিন' : 'Photo'}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-700 transition-colors"
                    title={lang === 'bn' ? 'ছবি আপলোড করুন' : 'Upload photo'}
                  >
                    <Upload className="w-3.5 h-3.5" />
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />

                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <span>{lang === 'bn' ? 'ডিভাইস থেকে ছবি আপলোড করুন' : 'Upload from phone/computer'}</span>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="text-rose-500 hover:underline font-semibold ml-1"
                    >
                      {lang === 'bn' ? 'মুছে দিন' : 'Remove'}
                    </button>
                  )}
                </div>

                {/* Preset Avatars quick select */}
                {!photoUrl && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-neutral-400">{lang === 'bn' ? 'নমুনা:' : 'Sample:'}</span>
                    {presetAvatars.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setPhotoUrl(url)}
                        className="w-7 h-7 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 hover:scale-110 transition-transform"
                      >
                        <img src={url} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{lang === 'bn' ? 'ব্যবহারকারীর নাম' : 'Full Name'} *</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: মোঃ তুশান / মিরাজ' : 'e.g. Miraz / Alex'}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{lang === 'bn' ? 'ইমেল এড্রেস (সাইন আপ)' : 'Email Address'} *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="mdtushan8@gmail.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
              </div>

              {/* Birth Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                  <span>{lang === 'bn' ? 'জন্মতারিখ' : 'Birth Date'}</span>
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                />
              </div>

              {/* Location (for PDF report) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{lang === 'bn' ? 'লোকেশন / ঠিকানা (PDF এ আসবে)' : 'Location / City (In PDF)'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGpsForModal}
                    disabled={isDetectingGps}
                    className="text-[10px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 disabled:opacity-50"
                  >
                    {isDetectingGps ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Navigation className="w-3 h-3" />
                    )}
                    <span>{lang === 'bn' ? 'অটো জিপিএস' : 'GPS Auto'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: ঢাকা, বাংলাদেশ' : 'e.g. Dhaka, Bangladesh'}
                  className="w-full text-xs p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
                />
              </div>

              {/* Security badge */}
              <div className="p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{lang === 'bn' ? 'আপনার ছবি ও ডাটা ১০০% নিরাপদে আপনার ফোনেই সংরক্ষিত থাকবে।' : 'Your data and photo are stored safely on your device.'}</span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'প্রোফাইল সংরক্ষণ করুন' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
