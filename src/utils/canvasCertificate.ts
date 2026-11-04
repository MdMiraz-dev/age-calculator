import { CalculationResult, Language, UserProfile } from '../types';
import { toBnNum, formatNum } from './ageCalculator';

export interface CertificateData {
  userName: string;
  pdfLocation: string;
  formattedBirth: string;
  formattedTarget: string;
  formattedNextBday: string;
  result: CalculationResult;
  activeProfile?: UserProfile | null;
  lang: Language;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function generateCertificateCanvas(data: CertificateData): Promise<HTMLCanvasElement> {
  const {
    userName,
    pdfLocation,
    formattedBirth,
    formattedTarget,
    formattedNextBday,
    result,
    activeProfile,
    lang,
  } = data;

  const width = 1240;
  const height = 1754; // A4 @ 150 DPI
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const isBn = lang === 'bn';
  const fontSans = '"Hind Siliguri", "Segoe UI", Roboto, system-ui, sans-serif';

  // 1. Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Formal Border
  // Outer border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 14;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Inner decorative border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(34, 34, width - 68, height - 68);

  // Corner Accents
  ctx.fillStyle = '#0f172a';
  const cornerSize = 24;
  ctx.fillRect(20, 20, cornerSize, cornerSize);
  ctx.fillRect(width - 20 - cornerSize, 20, cornerSize, cornerSize);
  ctx.fillRect(20, height - 20 - cornerSize, cornerSize, cornerSize);
  ctx.fillRect(width - 20 - cornerSize, height - 20 - cornerSize, cornerSize, cornerSize);

  let curY = 60;

  // 3. Top Header
  // Top Badge
  ctx.fillStyle = '#f1f5f9';
  roundRect(ctx, width / 2 - 160, curY, 320, 32, 16);
  ctx.fill();

  ctx.fillStyle = '#475569';
  ctx.font = `bold 14px ${fontSans}`;
  ctx.textAlign = 'center';
  ctx.fillText(
    isBn ? '🛡️ অফিসিয়াল বয়স সনদ ও রিপোর্ট' : '🛡️ OFFICIAL AGE CERTIFICATE',
    width / 2,
    curY + 21
  );

  curY += 50;

  // Main Title
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 38px ${fontSans}`;
  ctx.textAlign = 'center';
  ctx.fillText(
    isBn ? 'বয়স ক্যালকুলেটর সনদ' : 'Age Certificate Report',
    width / 2,
    curY + 30
  );

  curY += 46;

  // Subtitle (Date)
  ctx.fillStyle = '#64748b';
  ctx.font = `14px ${fontSans}`;
  const nowStr = new Date().toLocaleString(isBn ? 'bn-BD' : 'en-US');
  ctx.fillText(
    isBn ? `সনদ প্রস্তুতের তারিখ: ${nowStr}` : `Generated on: ${nowStr}`,
    width / 2,
    curY + 16
  );

  curY += 30;

  // Header Divider
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(60, curY);
  ctx.lineTo(width - 60, curY);
  ctx.stroke();

  curY += 24;

  // 4. Candidate Info Card with Passport Photo
  const cardX = 60;
  const cardW = width - 120;
  const cardH = 150;

  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, cardX, curY, cardW, cardH, 16);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Photo box
  const photoW = 100;
  const photoH = 120;
  const photoX = cardX + 16;
  const photoY = curY + 15;

  let loadedPhoto: HTMLImageElement | null = null;
  if (activeProfile?.photoUrl) {
    loadedPhoto = await loadImage(activeProfile.photoUrl);
  }

  if (loadedPhoto) {
    ctx.save();
    roundRect(ctx, photoX, photoY, photoW, photoH, 8);
    ctx.clip();
    ctx.drawImage(loadedPhoto, photoX, photoY, photoW, photoH);
    ctx.restore();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    roundRect(ctx, photoX, photoY, photoW, photoH, 8);
    ctx.stroke();
  } else {
    // Default Photo Box
    ctx.fillStyle = '#e2e8f0';
    roundRect(ctx, photoX, photoY, photoW, photoH, 8);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = `bold 13px ${fontSans}`;
    ctx.textAlign = 'center';
    ctx.fillText(isBn ? 'ছবি' : 'Photo', photoX + photoW / 2, photoY + photoH / 2 - 4);
    ctx.font = `11px ${fontSans}`;
    ctx.fillText(isBn ? 'সংযুক্ত' : 'Box', photoX + photoW / 2, photoY + photoH / 2 + 14);
  }

  // Name & details next to photo
  const infoX = photoX + photoW + 24;
  ctx.textAlign = 'left';

  ctx.fillStyle = '#64748b';
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(isBn ? 'নাম / ব্যবহারকারী (NAME)' : 'CANDIDATE NAME', infoX, curY + 38);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 26px ${fontSans}`;
  const displayName = userName.trim() || (isBn ? 'হিসাবকারী' : 'User');
  ctx.fillText(displayName, infoX, curY + 70);

  // Location pill
  ctx.fillStyle = '#fff1f2';
  roundRect(ctx, infoX, curY + 86, 260, 32, 8);
  ctx.fill();
  ctx.strokeStyle = '#fecdd3';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#e11d48';
  ctx.font = `bold 13px ${fontSans}`;
  const locText = `📍 ${isBn ? 'স্থান: ' : 'Location: '} ${pdfLocation || 'ঢাকা, বাংলাদেশ'}`;
  ctx.fillText(locText.length > 30 ? locText.substring(0, 28) + '...' : locText, infoX + 10, curY + 107);

  // Right side: Born on Day
  const rightX = cardX + cardW - 24;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(isBn ? 'জন্মবার (BORN ON)' : 'DAY OF BIRTH', rightX, curY + 45);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 22px ${fontSans}`;
  ctx.fillText(isBn ? result.dayOfWeekBornBn : result.dayOfWeekBornEn, rightX, curY + 78);

  curY += cardH + 18;

  // 5. 4-Column Grid: Birth, Calc Date, Location, Tracking ID
  const colW = (cardW - 36) / 4;
  const colH = 68;
  const items = [
    { label: isBn ? 'জন্ম তারিখ:' : 'Birth Date:', val: formattedBirth },
    { label: isBn ? 'হিসাবের তারিখ:' : 'Calc Date:', val: formattedTarget },
    { label: isBn ? 'স্থান / জেলা:' : 'Location:', val: pdfLocation || 'ঢাকা, বাংলাদেশ' },
    {
      label: isBn ? 'সনদ ট্র্যাকিং নং:' : 'Certificate ID:',
      val: `BD-AGE-${Math.abs((result.totalSeconds % 899999) + 100000)}`,
      color: '#4338ca',
    },
  ];

  items.forEach((item, idx) => {
    const itemX = cardX + idx * (colW + 12);
    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, itemX, curY, colW, colH, 10);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = `11px ${fontSans}`;
    ctx.fillText(item.label, itemX + 12, curY + 24);

    ctx.fillStyle = item.color || '#0f172a';
    ctx.font = `bold 13px ${fontSans}`;
    const txt = item.val.length > 22 ? item.val.substring(0, 20) + '...' : item.val;
    ctx.fillText(txt, itemX + 12, curY + 48);
  });

  curY += colH + 20;

  // 6. Large Hero Box: Exact Age (Years, Months, Days)
  const heroH = 175;
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, cardX, curY, cardW, heroH, 18);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = `bold 13px ${fontSans}`;
  ctx.fillText(
    isBn ? 'নির্ধারিত তারিখে সঠিক বয়স (EXACT AGE ON DATE)' : 'EXACT AGE ON CALCULATION DATE',
    width / 2,
    curY + 28
  );

  const heroCardW = (cardW - 48) / 3;
  const heroCardH = 105;
  const heroCardY = curY + 44;

  const ageData = [
    { num: isBn ? toBnNum(result.years) : result.years.toString(), unit: isBn ? 'বছর (Years)' : 'Years' },
    { num: isBn ? toBnNum(result.months) : result.months.toString(), unit: isBn ? 'মাস (Months)' : 'Months' },
    { num: isBn ? toBnNum(result.days) : result.days.toString(), unit: isBn ? 'দিন (Days)' : 'Days' },
  ];

  ageData.forEach((ad, i) => {
    const boxX = cardX + 16 + i * (heroCardW + 8);
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, boxX, heroCardY, heroCardW, heroCardH, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 52px ${fontSans}`;
    ctx.textAlign = 'center';
    ctx.fillText(ad.num, boxX + heroCardW / 2, heroCardY + 60);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `13px ${fontSans}`;
    ctx.fillText(ad.unit, boxX + heroCardW / 2, heroCardY + 88);
  });

  curY += heroH + 16;

  // 7. Next Birthday Card
  const bdayH = 60;
  ctx.fillStyle = '#fffbeb';
  roundRect(ctx, cardX, curY, cardW, bdayH, 12);
  ctx.fill();
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#78350f';
  ctx.font = `bold 14px ${fontSans}`;
  ctx.fillText(isBn ? '🎂 পরবর্তী জন্মদিন (Next Birthday):' : '🎂 Next Birthday:', cardX + 16, curY + 25);
  ctx.fillStyle = '#92400e';
  ctx.font = `13px ${fontSans}`;
  ctx.fillText(formattedNextBday, cardX + 16, curY + 46);

  // Badge
  ctx.fillStyle = '#fef3c7';
  roundRect(ctx, cardX + cardW - 200, curY + 12, 184, 36, 8);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#78350f';
  ctx.font = `bold 13px ${fontSans}`;
  const daysLeftStr = isBn
    ? `আর ${toBnNum(result.nextBirthday.daysRemaining)} দিন বাকি`
    : `${result.nextBirthday.daysRemaining} days left`;
  ctx.fillText(daysLeftStr, cardX + cardW - 108, curY + 35);

  curY += bdayH + 20;

  // 8. Lifetime Units Grid (3 x 2)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(isBn ? 'জীবনের মোট পরিসংখ্যান (LIFETIME UNITS)' : 'LIFETIME UNITS STATISTICS', cardX, curY);

  curY += 12;

  const unitColW = (cardW - 24) / 3;
  const unitColH = 58;

  const unitStats = [
    { label: isBn ? 'মোট মাস:' : 'Total Months:', val: formatNum(result.totalMonths, lang) },
    { label: isBn ? 'মোট সপ্তাহ:' : 'Total Weeks:', val: formatNum(result.totalWeeks, lang) },
    { label: isBn ? 'মোট দিন:' : 'Total Days:', val: formatNum(result.totalDays, lang) },
    { label: isBn ? 'মোট ঘণ্টা:' : 'Total Hours:', val: formatNum(result.totalHours, lang) },
    { label: isBn ? 'মোট মিনিট:' : 'Total Minutes:', val: formatNum(result.totalMinutes, lang) },
    { label: isBn ? 'মোট সেকেন্ড:' : 'Total Seconds:', val: formatNum(result.totalSeconds, lang) },
  ];

  unitStats.forEach((st, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const boxX = cardX + col * (unitColW + 12);
    const boxY = curY + row * (unitColH + 10);

    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, boxX, boxY, unitColW, unitColH, 8);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = `11px ${fontSans}`;
    ctx.fillText(st.label, boxX + 12, boxY + 22);

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold 16px ${fontSans}`;
    ctx.fillText(st.val, boxX + 12, boxY + 45);
  });

  curY += unitColH * 2 + 30;

  // 9. Zodiac & Job Eligibility (2 Columns)
  const metaW = (cardW - 16) / 2;
  const metaH = 100;

  // Box 1: Zodiac
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, cardX, curY, metaW, metaH, 12);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 13px ${fontSans}`;
  ctx.fillText(isBn ? '🔮 রাশিফল (Zodiac):' : '🔮 Zodiac Profile:', cardX + 14, curY + 26);

  ctx.font = `12px ${fontSans}`;
  ctx.fillStyle = '#475569';
  const westText = isBn
    ? `পাশ্চাত্য রাশি: ${result.zodiacSign.bn} (${result.zodiacSign.symbol})`
    : `Western Zodiac: ${result.zodiacSign.en} (${result.zodiacSign.symbol})`;
  ctx.fillText(westText, cardX + 14, curY + 54);

  const chinText = isBn
    ? `চাইনিজ রাশি: ${result.chineseZodiac.bn} (${result.chineseZodiac.symbol})`
    : `Chinese Zodiac: ${result.chineseZodiac.en} (${result.chineseZodiac.symbol})`;
  ctx.fillText(chinText, cardX + 14, curY + 80);

  // Box 2: Job eligibility
  const jobX = cardX + metaW + 16;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, jobX, curY, metaW, metaH, 12);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 13px ${fontSans}`;
  ctx.fillText(isBn ? '💼 সরকারি চাকরির বয়স সীমা:' : '💼 Job Age Eligibility:', jobX + 14, curY + 26);

  ctx.font = `12px ${fontSans}`;
  ctx.fillStyle = '#475569';
  ctx.fillText(isBn ? '৩০ বছর সীমা (সাধারণ):' : '30 Years Limit (General):', jobX + 14, curY + 54);
  const eligible30 = result.years < 30;
  ctx.fillStyle = eligible30 ? '#047857' : '#be123c';
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(
    eligible30 ? (isBn ? 'যোগ্য (Eligible)' : 'Eligible') : (isBn ? 'অতিক্রম করেছে (Exceeded)' : 'Exceeded'),
    jobX + 190,
    curY + 54
  );

  ctx.font = `12px ${fontSans}`;
  ctx.fillStyle = '#475569';
  ctx.fillText(isBn ? '৩২ বছর সীমা (কোটা):' : '32 Years Limit (Quota):', jobX + 14, curY + 80);
  const eligible32 = result.years < 32;
  ctx.fillStyle = eligible32 ? '#047857' : '#be123c';
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(
    eligible32 ? (isBn ? 'যোগ্য (Eligible)' : 'Eligible') : (isBn ? 'অতিক্রম করেছে (Exceeded)' : 'Exceeded'),
    jobX + 190,
    curY + 80
  );

  curY += metaH + 28;

  // 10. Footer Divider & Stamp
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cardX, curY);
  ctx.lineTo(cardX + cardW, curY);
  ctx.stroke();

  curY += 24;

  // Footer Left: Verification Seal
  ctx.textAlign = 'left';
  ctx.fillStyle = '#047857';
  ctx.font = `bold 13px ${fontSans}`;
  ctx.fillText(
    isBn ? '✔ স্বয়ংক্রিয়ভাবে নির্ভুল গণনাকৃত ও সত্যায়িত' : '✔ SYSTEM VERIFIED & ACCURATELY COMPUTED',
    cardX,
    curY + 14
  );

  ctx.fillStyle = '#64748b';
  ctx.font = `11px ${fontSans}`;
  ctx.fillText(
    isBn ? `যাচাইকৃত অবস্থান: ${pdfLocation || 'ঢাকা, বাংলাদেশ'} • অফিসিয়াল ব্যবহারের উপযোগী` : `Location: ${pdfLocation || 'Dhaka, Bangladesh'} • Official Document`,
    cardX,
    curY + 34
  );

  // Footer Right: MIRAZ Creator Seal
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, cardX + cardW - 270, curY - 6, 270, 52, 10);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 12px ${fontSans}`;
  ctx.fillText(isBn ? 'নির্মাতা ও ডেভেলপার: MIRAZ' : 'Software Creator: MIRAZ', cardX + cardW - 255, curY + 16);

  ctx.fillStyle = '#4338ca';
  ctx.font = `10px ${fontSans}`;
  ctx.fillText('Age Calculator Official Service • Verified', cardX + cardW - 255, curY + 36);

  return canvas;
}
