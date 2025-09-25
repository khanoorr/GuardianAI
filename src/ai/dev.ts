import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-audio-for-deepfake-indicators.ts';
import '@/ai/flows/summarize-news-article-for-credibility.ts';
import '@/ai/flows/explain-image-manipulation-detection.ts';
import '@/ai/flows/analyze-video-for-deepfake-indicators.ts';
