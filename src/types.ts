export type Language = 'bn' | 'en';
export type Theme = 'light' | 'dark';

export interface MilestoneItem {
  id: string;
  titleBn: string;
  titleEn: string;
  date: Date;
  daysRemainingOrPassed: number;
  isPassed: boolean;
}

export interface CalculationResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  nextBirthday: {
    daysRemaining: number;
    monthsRemaining: number;
    daysInMonthRemaining: number;
    targetDate: Date;
    dayOfWeekBn: string;
    dayOfWeekEn: string;
  };
  dayOfWeekBornBn: string;
  dayOfWeekBornEn: string;
  zodiacSign: {
    en: string;
    bn: string;
    symbol: string;
    dateRange: string;
  };
  chineseZodiac: {
    en: string;
    bn: string;
    symbol: string;
  };
}

export interface SavedRecord {
  id: string;
  name: string;
  birthDate: string;
  photoUrl?: string;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  birthDate: string;
  location?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  photoUrl?: string;
  createdAt: number;
}

export interface AgeMilestoneReminder {
  id: string;
  targetYears: number;
  targetMonths: number;
  targetDays: number;
  targetDate: string; // YYYY-MM-DD
  note?: string;
  createdAt: number;
  isTriggered: boolean;
}

