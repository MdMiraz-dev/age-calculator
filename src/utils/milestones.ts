import { MilestoneItem, Language } from '../types';
import { toBnNum } from './ageCalculator';

export function calculateMilestones(
  birthDateObj: Date,
  targetDateObj: Date = new Date(),
  lang: Language
): MilestoneItem[] {
  const bTime = birthDateObj.getTime();
  const tTime = targetDateObj.getTime();

  const birthYear = birthDateObj.getFullYear();
  const birthMonth = birthDateObj.getMonth();
  const birthDate = birthDateObj.getDate();

  const milestonesRaw = [
    // Age milestones
    { years: 18, titleBn: '১৮ বছর পূর্ণ (প্রাপ্তবয়স্ক)', titleEn: '18th Birthday (Adulthood)' },
    { years: 21, titleBn: '২১ বছর পূর্ণ', titleEn: '21st Birthday' },
    { years: 25, titleBn: '২৫ বছর (রৌপ্য জয়ন্তী / Silver Jubilee)', titleEn: '25 Years (Silver Jubilee)' },
    { years: 30, titleBn: '৩০ বছর পূর্ণ (চাকরির সাধারণ বয়সসীমা)', titleEn: '30th Birthday (Job Age Limit)' },
    { years: 40, titleBn: '৪০ বছর পূর্ণ (চার দশক)', titleEn: '40th Birthday (4 Decades)' },
    { years: 50, titleBn: '৫০ বছর (সুবর্ণ জয়ন্তী / Golden Jubilee)', titleEn: '50 Years (Golden Jubilee)' },
    { years: 60, titleBn: '৬০ বছর পূর্ণ (হীরক জয়ন্তী / Diamond)', titleEn: '60 Years (Diamond Jubilee)' },
    { years: 70, titleBn: '৭০ বছর পূর্ণ', titleEn: '70th Birthday' },
    { years: 80, titleBn: '৮০ বছর পূর্ণ', titleEn: '80th Birthday' },
    { years: 100, titleBn: '১০০ বছর পূর্ণ (শতাব্দী / Century)', titleEn: '100 Years (Centennial)' },
  ];

  const items: MilestoneItem[] = [];

  // Age based
  for (const m of milestonesRaw) {
    const targetMDate = new Date(birthYear + m.years, birthMonth, birthDate);
    const diffMs = targetMDate.getTime() - tTime;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    items.push({
      id: `yr-${m.years}`,
      titleBn: m.titleBn,
      titleEn: m.titleEn,
      date: targetMDate,
      daysRemainingOrPassed: Math.abs(diffDays),
      isPassed: diffDays < 0,
    });
  }

  // Day based milestones (e.g. 5,000, 10,000, 15,000, 20,000, 25,000 days)
  const dayMilestones = [1000, 5000, 10000, 15000, 20000, 25000];
  for (const dm of dayMilestones) {
    const targetDDate = new Date(bTime + dm * 24 * 60 * 60 * 1000);
    const diffMs = targetDDate.getTime() - tTime;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    items.push({
      id: `day-${dm}`,
      titleBn: `${toBnNum(dm.toLocaleString('en-US'))} দিন পূরণ`,
      titleEn: `${dm.toLocaleString('en-US')} Days Alive`,
      date: targetDDate,
      daysRemainingOrPassed: Math.abs(diffDays),
      isPassed: diffDays < 0,
    });
  }

  // Sort by date ascending
  items.sort((a, b) => a.date.getTime() - b.date.getTime());

  return items;
}
