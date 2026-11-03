import { CalculationResult } from '../types';

export const toBnNum = (val: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return val.toString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
};

export const formatNum = (num: number, lang: 'bn' | 'en'): string => {
  const formatted = num.toLocaleString('en-US');
  if (lang === 'bn') {
    return toBnNum(formatted);
  }
  return formatted;
};

const DAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MONTHS_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export function getDaysInMonth(year: number, monthZeroIndexed: number): number {
  return new Date(year, monthZeroIndexed + 1, 0).getDate();
}

export function calculateAge(
  birthDateObj: Date,
  targetDateObj: Date = new Date()
): CalculationResult | null {
  // Normalize time parts to midnight for accurate day calculation
  const birthYear = birthDateObj.getFullYear();
  const birthMonth = birthDateObj.getMonth();
  const birthDay = birthDateObj.getDate();

  const targetYear = targetDateObj.getFullYear();
  const targetMonth = targetDateObj.getMonth();
  const targetDay = targetDateObj.getDate();

  const birthMidnight = new Date(birthYear, birthMonth, birthDay);
  const targetMidnight = new Date(targetYear, targetMonth, targetDay);

  if (birthMidnight.getTime() > targetMidnight.getTime()) {
    return null;
  }

  let years = targetYear - birthYear;
  let months = targetMonth - birthMonth;
  let days = targetDay - birthDay;

  if (days < 0) {
    // Borrow days from previous month
    const prevMonthDays = getDaysInMonth(targetYear, targetMonth - 1);
    days += prevMonthDays;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  // Totals
  const diffTime = targetMidnight.getTime() - birthMidnight.getTime();
  const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = totalDays * 24;
  const totalMinutes = totalHours * 60;
  const totalSeconds = totalMinutes * 60;

  // Next Birthday Calculation
  let nextBdayYear = targetYear;
  // Account for leap year birth (Feb 29)
  let bdayDayForCalc = birthDay;
  if (birthMonth === 1 && birthDay === 29 && !isLeapYear(nextBdayYear)) {
    bdayDayForCalc = 28;
  }

  let nextBday = new Date(nextBdayYear, birthMonth, bdayDayForCalc);
  if (nextBday.getTime() < targetMidnight.getTime()) {
    nextBdayYear += 1;
    if (birthMonth === 1 && birthDay === 29 && !isLeapYear(nextBdayYear)) {
      bdayDayForCalc = 28;
    } else {
      bdayDayForCalc = birthDay;
    }
    nextBday = new Date(nextBdayYear, birthMonth, bdayDayForCalc);
  }

  const msToNextBday = nextBday.getTime() - targetMidnight.getTime();
  const daysToNextBday = Math.floor(msToNextBday / (1000 * 60 * 60 * 24));

  // Months and days remaining to next birthday
  let nbMonths = nextBday.getMonth() - targetMidnight.getMonth();
  let nbDays = nextBday.getDate() - targetMidnight.getDate();
  if (nbMonths < 0) {
    nbMonths += 12;
  }
  if (nbDays < 0) {
    const prevMonthDays = getDaysInMonth(nextBday.getFullYear(), nextBday.getMonth() - 1);
    nbDays += prevMonthDays;
    nbMonths = nbMonths > 0 ? nbMonths - 1 : 11;
  }

  const dayOfWeekBornBn = DAYS_BN[birthMidnight.getDay()];
  const dayOfWeekBornEn = DAYS_EN[birthMidnight.getDay()];

  const nextBdayDayOfWeekBn = DAYS_BN[nextBday.getDay()];
  const nextBdayDayOfWeekEn = DAYS_EN[nextBday.getDay()];

  const zodiacSign = getZodiacSign(birthMonth + 1, birthDay);
  const chineseZodiac = getChineseZodiac(birthYear);

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalMonths,
    totalHours,
    totalMinutes,
    totalSeconds,
    nextBirthday: {
      daysRemaining: daysToNextBday,
      monthsRemaining: nbMonths,
      daysInMonthRemaining: nbDays,
      targetDate: nextBday,
      dayOfWeekBn: nextBdayDayOfWeekBn,
      dayOfWeekEn: nextBdayDayOfWeekEn,
    },
    dayOfWeekBornBn,
    dayOfWeekBornEn,
    zodiacSign,
    chineseZodiac,
  };
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getZodiacSign(month: number, day: number) {
  // Month is 1-indexed
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { en: 'Aries', bn: 'মেষ', symbol: '♈', dateRange: 'Mar 21 - Apr 19' };
  }
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { en: 'Taurus', bn: 'বৃষ', symbol: '♉', dateRange: 'Apr 20 - May 20' };
  }
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) {
    return { en: 'Gemini', bn: 'মিথুন', symbol: '♊', dateRange: 'May 21 - Jun 20' };
  }
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) {
    return { en: 'Cancer', bn: 'কর্কট', symbol: '♋', dateRange: 'Jun 21 - Jul 22' };
  }
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { en: 'Leo', bn: 'সিংহ', symbol: '♌', dateRange: 'Jul 23 - Aug 22' };
  }
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { en: 'Virgo', bn: 'কন্যা', symbol: '♍', dateRange: 'Aug 23 - Sep 22' };
  }
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) {
    return { en: 'Libra', bn: 'তুলা', symbol: '♎', dateRange: 'Sep 23 - Oct 22' };
  }
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) {
    return { en: 'Scorpio', bn: 'বৃশ্চিক', symbol: '♏', dateRange: 'Oct 23 - Nov 21' };
  }
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) {
    return { en: 'Sagittarius', bn: 'ধনু', symbol: '♐', dateRange: 'Nov 22 - Dec 21' };
  }
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
    return { en: 'Capricorn', bn: 'মকর', symbol: '♑', dateRange: 'Dec 22 - Jan 19' };
  }
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { en: 'Aquarius', bn: 'কুম্ভ', symbol: '♒', dateRange: 'Jan 20 - Feb 18' };
  }
  return { en: 'Pisces', bn: 'মীন', symbol: '♓', dateRange: 'Feb 19 - Mar 20' };
}

export function getChineseZodiac(year: number) {
  const animals = [
    { en: 'Rat', bn: 'ইঁদুর', symbol: '🐀' },
    { en: 'Ox', bn: 'ষাঁড়', symbol: '🐂' },
    { en: 'Tiger', bn: 'বাঘ', symbol: '🐅' },
    { en: 'Rabbit', bn: 'খরগোশ', symbol: '🐇' },
    { en: 'Dragon', bn: 'ড্রাগন', symbol: '🐉' },
    { en: 'Snake', bn: 'সাপ', symbol: '🐍' },
    { en: 'Horse', bn: 'ঘোড়া', symbol: '🐎' },
    { en: 'Goat', bn: 'ছাগল', symbol: '🐐' },
    { en: 'Monkey', bn: 'বানর', symbol: '🐒' },
    { en: 'Rooster', bn: 'মোরগ', symbol: '🐓' },
    { en: 'Dog', bn: 'কুকুর', symbol: '🐕' },
    { en: 'Pig', bn: 'শূকর', symbol: '🐖' },
  ];
  // 1900 was Year of the Rat (index 0)
  const index = (year - 1900) % 12;
  const safeIndex = index >= 0 ? index : index + 12;
  return animals[safeIndex];
}
