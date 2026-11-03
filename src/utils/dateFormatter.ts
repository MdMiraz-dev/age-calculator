import { Language } from '../types';
import { MONTHS_BN, MONTHS_EN, toBnNum } from './ageCalculator';

const DAYS_BN = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function formatFullDate(
  dateStringOrDate: string | Date,
  lang: Language,
  includeDayOfWeek = true
): string {
  if (!dateStringOrDate) return '';
  
  let date: Date;
  if (typeof dateStringOrDate === 'string') {
    const [y, m, d] = dateStringOrDate.split('-').map(Number);
    if (!y || !m || !d) return dateStringOrDate;
    date = new Date(y, m - 1, d);
  } else {
    date = dateStringOrDate;
  }

  const day = date.getDate();
  const monthIdx = date.getMonth();
  const year = date.getFullYear();
  const dayOfWeekIdx = date.getDay();

  if (lang === 'bn') {
    const dayStr = toBnNum(day);
    const monthStr = MONTHS_BN[monthIdx];
    const yearStr = toBnNum(year);
    const dayOfWeek = DAYS_BN[dayOfWeekIdx];

    return includeDayOfWeek
      ? `${dayStr} ${monthStr} ${yearStr} (${dayOfWeek})`
      : `${dayStr} ${monthStr} ${yearStr}`;
  }

  const monthStr = MONTHS_EN[monthIdx];
  const dayOfWeek = DAYS_EN[dayOfWeekIdx];
  return includeDayOfWeek
    ? `${day} ${monthStr} ${year} (${dayOfWeek})`
    : `${day} ${monthStr} ${year}`;
}
