import OpenAI from "openai";
import { db } from '../db';

let openaiInstance: OpenAI | null = null;
let cachedApiKey: string | null = null;

export async function getApiKey(): Promise<string> {
  try {
    // First check cached key
    if (cachedApiKey) {
      return cachedApiKey;
    }

    console.log('[OpenAI] Getting API key from database');
    
    // Check settings table first
    const settings = await db.settings.toArray();
    if (settings[0]?.openaiApiKey) {
      cachedApiKey = settings[0].openaiApiKey;
      return cachedApiKey;
    }

    // Fallback to api_keys table
    const apiKey = await db.apiKeys
      .where('status')
      .equals('active')
      .first();

    if (!apiKey?.key) {
      console.error('[OpenAI] No active API key found');
      throw new Error('لم يتم تكوين مفتاح API. يرجى إضافة مفتاح في لوحة التحكم.');
    }

    cachedApiKey = apiKey.key;
    return cachedApiKey;
  } catch (error) {
    console.error('[OpenAI] Error getting API key:', error);
    throw error;
  }
}

export async function getOpenAI(): Promise<OpenAI> {
  try {
    if (!openaiInstance) {
      console.log('[OpenAI] Initializing OpenAI instance');
      const apiKey = await getApiKey();
      
      openaiInstance = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true
      });
    }

    return openaiInstance;
  } catch (error) {
    console.error('[OpenAI] Error getting OpenAI instance:', error);
    throw error;
  }
}

export async function resetApiKey(): Promise<void> {
  console.log('[OpenAI] Resetting API instance and cache');
  openaiInstance = null;
  cachedApiKey = null;
}