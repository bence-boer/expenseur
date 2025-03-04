import { type GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import type { GeminiModel } from '../types/local.ts';

const GEMINI_API_KEY: string = Deno.env.get('GEMINI_API_KEY')!;
const GEMINI_MODEL: GeminiModel = Deno.env.get('GEMINI_MODEL') as GeminiModel;

const AI: GoogleGenerativeAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const gemini: GenerativeModel = AI.getGenerativeModel({ model: GEMINI_MODEL });
