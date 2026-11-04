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

  // A4 dimensions @ 150 DPI: 1240 x 1754 (Aspect ratio: 1 : 1.414)
  const width = 1240;
  const height = 1754;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;

  const isBn = lang === 'bn';
  const fontSans = '"Hind Siliguri", "Segoe UI", Roboto, system-ui, sans-serif';

  // 1. Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Formal Border Frame
  // Outer border
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 14;
  ctx.strokeRect(22, 22, width - 44, height - 44);

  // Inner decorative border
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Corner Accents
  ctx.fillStyle = '#0f172a';
  const cornerSize = 24;
  ctx.fillRect(22, 22, cornerSize, cornerSize);
  ctx.fillRect(width - 22 - cornerSize, 22, cornerSize, cornerSize);
  ctx.fillRect(22, height - 22 - cornerSize, cornerSize, cornerSize);
  ctx.fillRect(width - 22 - cornerSize, height - 22 - cornerSize, cornerSize, cornerSize);

  let curY = 64;

  // 3. Top Header
  // Top Badge
  ctx.fillStyle = '#f1f5f9';
  roundRect(ctx, width / 2 - 180, curY, 360, 36, 18);
  ctx.fill();

  ctx.fillStyle = '#334155';
  ctx.font = `bold 15px ${fontSans}`;
  ctx.textAlign = 'center';
  ctx.fillText(
    isBn ? '🛡️ গণপ্রজাতন্ত্রী বাংলাদেশ • অফিসিয়াল বয়স সনদ' : '🛡️ OFFICIAL VERIFIED AGE CERTIFICATE',
    width / 2,
    curY + 23
  );

  curY += 54;

  // Main Title
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 44px ${fontSans}`;
  ctx.textAlign = 'center';
  ctx.fillText(
    isBn ? 'বয়স ক্যালকুলেটর সনদ' : 'Age Certificate Report',
    width / 2,
    curY + 34
  );

  curY += 50;

  // Subtitle (Date)
  ctx.fillStyle = '#64748b';
  ctx.font = `15px ${fontSans}`;
  const nowStr = new Date().toLocaleString(isBn ? 'bn-BD' : 'en-US');
  ctx.fillText(
    isBn ? `সনদ প্রস্তুতের তারিখ ও সময়: ${nowStr}` : `Certificate Issue Date: ${nowStr}`,
    width / 2,
    curY + 16
  );

  curY += 32;

  // Header Divider
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(60, curY);
  ctx.lineTo(width - 60, curY);
  ctx.stroke();

  curY += 28;

  // 4. Candidate Info Card with Passport Photo
  const cardX = 60;
  const cardW = width - 120;
  const cardH = 170;

  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, cardX, curY, cardW, cardH, 16);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Photo box (Passport ratio 4:5)
  const photoW = 115;
  const photoH = 140;
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
    ctx.lineWidth = 2.5;
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

    ctx.fillStyle = '#475569';
    ctx.font = `bold 14px ${fontSans}`;
    ctx.textAlign = 'center';
    ctx.fillText(isBn ? 'ছবি' : 'Photo', photoX + photoW / 2, photoY + photoH / 2 - 4);
    ctx.font = `12px ${fontSans}`;
    ctx.fillText(isBn ? 'সংযুক্ত' : 'Box', photoX + photoW / 2, photoY + photoH / 2 + 16);
  }

  // Name & details next to photo
  const infoX = photoX + photoW + 28;
  ctx.textAlign = 'left';

  ctx.fillStyle = '#64748b';
  ctx.font = `bold 13px ${fontSans}`;
  ctx.fillText(isBn ? 'প্রার্থীর নাম (CANDIDATE NAME)' : 'CANDIDATE FULL NAME', infoX, curY + 40);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 32px ${fontSans}`;
  const displayName = userName.trim() || activeProfile?.name || (isBn ? 'নাম প্রদান করা হয়নি' : 'Not Provided');
  ctx.fillText(displayName, infoX, curY + 76);

  // Location pill
  ctx.fillStyle = '#fff1f2';
  roundRect(ctx, infoX, curY + 98, 360, 36, 8);
  ctx.fill();
  ctx.strokeStyle = '#fecdd3';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#e11d48';
  ctx.font = `bold 14px ${fontSans}`;
  const locText = `📍 ${isBn ? 'স্থান / ঠিকানা: ' : 'Location: '} ${pdfLocation || 'ঢাকা, বাংলাদেশ'}`;
  ctx.fillText(locText.length > 40 ? locText.substring(0, 38) + '...' : locText, infoX + 12, curY + 122);

  // Right side: Born on Day
  const rightX = cardX + cardW - 24;
  ctx.textAlign = 'right';
  ctx.fillStyle = '#64748b';
  ctx.font = `bold 13px ${fontSans}`;
  ctx.fillText(isBn ? 'জন্মবার (BORN ON)' : 'DAY OF BIRTH', rightX, curY + 45);

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 26px ${fontSans}`;
  ctx.fillText(isBn ? result.dayOfWeekBornBn : result.dayOfWeekBornEn, rightX, curY + 84);

  curY += cardH + 22;

  // 5. 2x2 Grid for Dates & ID (Ample space so dates never get truncated)
  const gridW = (cardW - 16) / 2;
  const gridH = 68;

  const dateItems = [
    {
      label: isBn ? 'জন্ম তারিখ (Date of Birth):' : 'Date of Birth:',
      val: formattedBirth,
    },
    {
      label: isBn ? 'হিসাবের তারিখ (Calculation Date):' : 'Calculation Date:',
      val: formattedTarget,
    },
    {
      label: isBn ? 'রিপোর্ট প্রদানের স্থান (Location):' : 'Location / District:',
      val: pdfLocation || (isBn ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh'),
    },
    {
      label: isBn ? 'সনদ ট্র্যাকিং নম্বর (Certificate ID):' : 'Certificate ID:',
      val: `BD-AGE-${Math.abs((result.totalSeconds % 899999) + 100000)}`,
      color: '#4338ca',
    },
  ];

  dateItems.forEach((item, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const itemX = cardX + col * (gridW + 16);
    const itemY = curY + row * (gridH + 12);

    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, itemX, itemY, gridW, gridH, 10);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = `12px ${fontSans}`;
    ctx.fillText(item.label, itemX + 16, itemY + 24);

    ctx.fillStyle = item.color || '#0f172a';
    ctx.font = `bold 16px ${fontSans}`;
    ctx.fillText(item.val, itemX + 16, itemY + 50);
  });

  curY += gridH * 2 + 30;

  // 6. Large Hero Box: Exact Age (Years, Months, Days)
  const heroH = 200;
  ctx.fillStyle = '#0f172a';
  roundRect(ctx, cardX, curY, cardW, heroH, 18);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.font = `bold 15px ${fontSans}`;
  ctx.fillText(
    isBn ? '★ নির্ধারিত তারিখে প্রার্থীর সঠিক বয়স (EXACT AGE ON DATE) ★' : '★ EXACT AGE ON CALCULATION DATE ★',
    width / 2,
    curY + 32
  );

  const heroCardW = (cardW - 48) / 3;
  const heroCardH = 125;
  const heroCardY = curY + 50;

  const ageData = [
    { num: isBn ? toBnNum(result.years) : result.years.toString(), unit: isBn ? 'বছর (Years)' : 'Years' },
    { num: isBn ? toBnNum(result.months) : result.months.toString(), unit: isBn ? 'মাস (Months)' : 'Months' },
    { num: isBn ? toBnNum(result.days) : result.days.toString(), unit: isBn ? 'দিন (Days)' : 'Days' },
  ];

  ageData.forEach((ad, i) => {
    const boxX = cardX + 16 + i * (heroCardW + 8);
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, boxX, heroCardY, heroCardW, heroCardH, 14);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold 64px ${fontSans}`;
    ctx.textAlign = 'center';
    ctx.fillText(ad.num, boxX + heroCardW / 2, heroCardY + 74);

    ctx.fillStyle = '#94a3b8';
    ctx.font = `bold 16px ${fontSans}`;
    ctx.fillText(ad.unit, boxX + heroCardW / 2, heroCardY + 108);
  });

  curY += heroH + 22;

  // 7. Next Birthday Card
  const bdayH = 70;
  ctx.fillStyle = '#fffbeb';
  roundRect(ctx, cardX, curY, cardW, bdayH, 12);
  ctx.fill();
  ctx.strokeStyle = '#fde68a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#78350f';
  ctx.font = `bold 16px ${fontSans}`;
  ctx.fillText(isBn ? '🎂 পরবর্তী জন্মদিন (Next Birthday):' : '🎂 Next Birthday:', cardX + 20, curY + 28);
  ctx.fillStyle = '#92400e';
  ctx.font = `15px ${fontSans}`;
  ctx.fillText(formattedNextBday, cardX + 20, curY + 54);

  // Badge
  ctx.fillStyle = '#fef3c7';
  roundRect(ctx, cardX + cardW - 240, curY + 14, 220, 42, 10);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#78350f';
  ctx.font = `bold 15px ${fontSans}`;
  const daysLeftStr = isBn
    ? `আর মাত্র ${toBnNum(result.nextBirthday.daysRemaining)} দিন বাকি`
    : `${result.nextBirthday.daysRemaining} days remaining`;
  ctx.fillText(daysLeftStr, cardX + cardW - 130, curY + 41);

  curY += bdayH + 26;

  // 8. Lifetime Units Grid (3 Columns x 2 Rows)
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 14px ${fontSans}`;
  ctx.fillText(isBn ? '📊 জীবনের মোট পরিসংখ্যান (LIFETIME UNITS):' : '📊 LIFETIME UNITS STATISTICS:', cardX, curY);

  curY += 14;

  const unitColW = (cardW - 24) / 3;
  const unitColH = 70;

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
    const boxY = curY + row * (unitColH + 12);

    ctx.fillStyle = '#f8fafc';
    roundRect(ctx, boxX, boxY, unitColW, unitColH, 10);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = `12px ${fontSans}`;
    ctx.fillText(st.label, boxX + 14, boxY + 26);

    ctx.fillStyle = '#0f172a';
    ctx.font = `bold 19px ${fontSans}`;
    ctx.fillText(st.val, boxX + 14, boxY + 54);
  });

  curY += unitColH * 2 + 36;

  // 9. Zodiac & Job Eligibility (2 Columns)
  const metaW = (cardW - 16) / 2;
  const metaH = 115;

  // Box 1: Zodiac
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, cardX, curY, metaW, metaH, 12);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 14px ${fontSans}`;
  ctx.fillText(isBn ? '🔮 জ্যোতিষশাস্ত্র ও রাশিফল (Zodiac):' : '🔮 Zodiac & Astrological Profile:', cardX + 16, curY + 28);

  ctx.font = `13px ${fontSans}`;
  ctx.fillStyle = '#475569';
  const westText = isBn
    ? `পাশ্চাত্য রাশি: ${result.zodiacSign.bn} (${result.zodiacSign.symbol})`
    : `Western Zodiac: ${result.zodiacSign.en} (${result.zodiacSign.symbol})`;
  ctx.fillText(westText, cardX + 16, curY + 60);

  const chinText = isBn
    ? `চাইনিজ রাশি: ${result.chineseZodiac.bn} (${result.chineseZodiac.symbol})`
    : `Chinese Zodiac: ${result.chineseZodiac.en} (${result.chineseZodiac.symbol})`;
  ctx.fillText(chinText, cardX + 16, curY + 90);

  // Box 2: Job eligibility
  const jobX = cardX + metaW + 16;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, jobX, curY, metaW, metaH, 12);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 14px ${fontSans}`;
  ctx.fillText(isBn ? '💼 সরকারি চাকরির বয়স সীমা যোগ্যতা:' : '💼 Job Age Limit Eligibility:', jobX + 16, curY + 28);

  ctx.font = `13px ${fontSans}`;
  ctx.fillStyle = '#475569';
  ctx.fillText(isBn ? '৩০ বছর বয়স সীমা (সাধারণ):' : '30 Years Limit (General):', jobX + 16, curY + 60);
  const eligible30 = result.years < 30;
  ctx.fillStyle = eligible30 ? '#047857' : '#be123c';
  ctx.font = `bold 13px ${fontSans}`;
  ctx.fillText(
    eligible30 ? (isBn ? 'যোগ্য (Eligible)' : 'Eligible') : (isBn ? 'অতিক্রম করেছে (Exceeded)' : 'Exceeded'),
    jobX + 220,
    curY + 60
  );

  ctx.font = `13px ${fontSans}`;
  ctx.fillStyle = '#475569';
  ctx.fillText(isBn ? '৩২ বছর বয়স সীমা (কোটা):' : '32 Years Limit (Quota):', jobX + 16, curY + 90);
  const eligible32 = result.years < 32;
  ctx.fillStyle = eligible32 ? '#047857' : '#be123c';
  ctx.font = `bold 13px ${fontSans}`;
  ctx.fillText(
    eligible32 ? (isBn ? 'যোগ্য (Eligible)' : 'Eligible') : (isBn ? 'অতিক্রম করেছে (Exceeded)' : 'Exceeded'),
    jobX + 220,
    curY + 90
  );

  curY += metaH + 34;

  // 10. Footer Divider & Official Certification Stamp
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cardX, curY);
  ctx.lineTo(cardX + cardW, curY);
  ctx.stroke();

  curY += 28;

  // Footer Left: Verification Seal
  ctx.textAlign = 'left';
  ctx.fillStyle = '#047857';
  ctx.font = `bold 15px ${fontSans}`;
  ctx.fillText(
    isBn ? '✔ স্বয়ংক্রিয়ভাবে নির্ভুল গণনাকৃত ও সত্যায়িত' : '✔ SYSTEM COMPUTED & VERIFIED ACCURATE',
    cardX,
    curY + 16
  );

  ctx.fillStyle = '#64748b';
  ctx.font = `13px ${fontSans}`;
  ctx.fillText(
    isBn
      ? `যাচাইকৃত অবস্থান: ${pdfLocation || 'ঢাকা, বাংলাদেশ'} • সরকারি ও পেশাদার ব্যবহারের উপযোগী`
      : `Verified Location: ${pdfLocation || 'Dhaka, Bangladesh'} • Official Document`,
    cardX,
    curY + 42
  );

  // Footer Right: MIRAZ Creator Seal
  const stampW = 300;
  const stampH = 64;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, cardX + cardW - stampW, curY - 10, stampW, stampH, 12);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = `bold 14px ${fontSans}`;
  ctx.fillText(isBn ? 'নির্মাতা ও ডেভেলপার: MIRAZ' : 'Software Creator: MIRAZ', cardX + cardW - stampW + 16, curY + 16);

  ctx.fillStyle = '#4338ca';
  ctx.font = `11px ${fontSans}`;
  ctx.fillText('Age Calculator Official Service • Verified', cardX + cardW - stampW + 16, curY + 38);

  return canvas;
}
