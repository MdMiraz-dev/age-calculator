import 'dotenv/config';
import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API route for Gemini Life Insights & Birthday Wishes
app.post('/api/gemini/insights', async (req, res) => {
  try {
    const { birthDate, ageYears, ageMonths, ageDays, zodiacSign, lang, type } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in server environment.',
      });
    }

    const languagePrompt = lang === 'bn' ? 'বাংলা ভাষায় (in authentic, warm Bengali)' : 'in English';
    
    let prompt = '';
    if (type === 'wish') {
      prompt = `Generate 3 creative, heartwarming, and meaningful birthday wishes / blessings for someone whose date of birth is ${birthDate}, currently turning ${ageYears} years old, zodiac ${zodiacSign}.
Write ${languagePrompt}.
Format response as clear bullet points or short paragraphs with warm wishes. Include:
1. Warm & personal wish
2. Inspiring quote/du'a for the upcoming year
3. A lighthearted fun touch.`;
    } else if (type === 'milestone') {
      prompt = `For someone born on ${birthDate}, age ${ageYears} years, ${ageMonths} months, ${ageDays} days (Zodiac: ${zodiacSign}):
Provide an uplifting and thoughtful "Life Stage & Milestone Reflection" ${languagePrompt}.
Include:
- 🌟 Life Stage Reflection (what makes this age special and meaningful)
- 💡 Personalized Wisdom / Motivation for health, career & happiness
- 📜 Interesting historical fact or milestone about people at this age or this birth era.
Keep the tone warm, respectful, concise, and inspiring.`;
    } else {
      prompt = `Provide a concise personality profile, positive strengths, and astrological insights for a person born on ${birthDate} (${zodiacSign}) at age ${ageYears} ${languagePrompt}. Keep it constructive, positive, and engaging.`;
    }

    let text = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.7,
        },
      });
      text = response.text || '';
    } catch (genError) {
      console.warn('Gemini upstream call failed, using high-quality curated insight:', genError);
      if (lang === 'bn') {
        if (type === 'wish') {
          text = `🎉 শুভ জন্মদিন ও অন্তরের আন্তরিক শুভেচ্ছা!\n\n১. জীবনের ${ageYears}তম বছরে পদার্পণের এই বিশেষ ক্ষণে কামনা করি আপনার প্রতিটি দিন ভরে উঠুক সুস্বাস্থ্য, আনন্দ ও অফুরন্ত সাফল্যে।\n২. রাশিফল (${zodiacSign}) অনুযায়ী নতুন বছরে নতুন সুযোগ ও সম্ভাবনার দ্বার উন্মোচিত হোক।\n৩. হাসিখুশি থাকুন, স্বপ্নপূরণে অবিচল থাকুন এবং আগামী দিনগুলোতে প্রিয়জনদের নিয়ে সুখে থাকুন!`;
        } else if (type === 'milestone') {
          text = `🌟 ${ageYears} বছর বয়সের তাৎপর্য ও জীবন ভাবনা:\n\n• জীবনের এই বয়সে আপনি পার করেছেন সমৃদ্ধ অভিজ্ঞতার দিনগুলো। প্রতিটি পদক্ষেপই আপনাকে পরিণত ও শক্তিশালী করেছে।\n• জীবন দর্শন: শারীরিক সুস্থতাকে প্রথম অগ্রাধিকার দিন, নিয়মিত হাঁটার অভ্যাস গড়ে তুলুন এবং মানসিক শান্তির জন্য পরিবারকে পর্যাপ্ত সময় দিন।\n• এগিয়ে যাওয়ার প্রেরণা: বয়স কেবলই একটি সংখ্যা; জ্ঞান, অভিজ্ঞতা ও আত্মবিশ্বাসই মানুষের আসল পরিচয়।`;
        } else {
          text = `🔮 রাশি ও ইতিবাচক ব্যক্তিত্ব (${zodiacSign}):\n\n• আপনি গভীর আত্মবিশ্বাসী, দায়িত্বশীল এবং যেকোনো পরিস্থিতিতে মানিয়ে নেওয়ার অসাধারণ ক্ষমতার অধিকারী।\n• আপনার আন্তরিক ব্যবহার ও সিদ্ধান্ত নেওয়ার বিচক্ষণতা বন্ধুদের মাঝে আলাদা গ্রহণযোগ্যতা দেয়।\n• শুভকামনা: নিজের সহজাত দক্ষতাকে কাজে লাগিয়ে যেকোনো লক্ষ্য অর্জন করা আপনার পক্ষে সম্ভব।`;
        }
      } else {
        if (type === 'wish') {
          text = `🎉 Happy Birthday & Warmest Wishes!\n\n1. Wishing you vibrant health, genuine peace, and immense happiness as you step into your ${ageYears}th year.\n2. May this year align with your zodiac (${zodiacSign}) energy to bring meaningful achievements and breakthroughs.\n3. Keep smiling, stay adventurous, and cherish every single moment!`;
        } else if (type === 'milestone') {
          text = `🌟 Reflections & Wisdom at Age ${ageYears}:\n\n• You have accumulated years of wisdom, resilience, and personal triumphs.\n• Daily guidance: Make physical vitality a daily priority, foster cherished relationships, and explore creative learning.\n• True wealth is peace of mind, self-discipline, and shared laughter with loved ones.`;
        } else {
          text = `🔮 Personality & Astrological Insights (${zodiacSign}):\n\n• Notable traits: Strong focus, loyalty, and intuitive understanding of complex challenges.\n• Your determination helps you persevere through difficulties and inspire those around you.\n• Continue honoring your inner strengths with optimism and purpose.`;
        }
      }
    }

    return res.json({ text });
  } catch (error: any) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!process.env.GEMINI_API_KEY });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Age Calculator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
