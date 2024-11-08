import { getOpenAI } from './config';
import { SYSTEM_PROMPT, SECTION_PROMPTS } from './prompts';
import { updateUserCredits } from '../credits';
import type { GenerateOptions } from './types';

const DEFAULT_OPTIONS: GenerateOptions = {
  maxRetries: 3,
  retryDelay: 1000,
  stream: true
};

class AIError extends Error {
  code?: string;
  status?: number;
  type?: string;

  constructor(message: string, options: { code?: string; status?: number; type?: string } = {}) {
    super(message);
    this.name = 'AIError';
    this.code = options.code;
    this.status = options.status;
    this.type = options.type;
  }
}

async function validateRequest(userId: number, section: string, title: string) {
  if (!userId) {
    throw new AIError('يجب تسجيل الدخول أولاً', { code: 'AUTH_REQUIRED' });
  }

  if (!title?.trim()) {
    throw new AIError('يجب إدخال عنوان البحث أولاً', { code: 'TITLE_REQUIRED' });
  }

  const prompt = SECTION_PROMPTS[section as keyof typeof SECTION_PROMPTS];
  if (!prompt) {
    throw new AIError(`قسم غير صالح: ${section}`, { code: 'INVALID_SECTION' });
  }
}

async function handleStreamingResponse(completion: AsyncIterable<any>, onProgress?: (content: string) => void): Promise<string> {
  let fullContent = '';
  
  try {
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullContent += content;
        onProgress?.(fullContent);
      }
    }
    
    if (!fullContent.trim()) {
      throw new AIError('لم يتم إنشاء محتوى', { code: 'EMPTY_RESPONSE' });
    }
    
    return fullContent;
  } catch (error) {
    if (error instanceof AIError) throw error;
    
    console.error('[OpenAI] Streaming error:', error);
    throw new AIError('فشل في استقبال المحتوى', { 
      code: 'STREAM_ERROR',
      type: 'streaming_error' 
    });
  }
}

export async function generateContent(
  section: string,
  title: string,
  userId: number,
  previousSections: Record<string, string> = {},
  options: GenerateOptions = {}
): Promise<string> {
  const { maxRetries, retryDelay, stream, onProgress, projectId, projectTitle } = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | null = null;

  // Deduct credit before starting generation
  await updateUserCredits(userId, -1, 'استخدام الذكاء الاصطناعي', {
    projectId,
    projectTitle,
    section,
    usageType: section === 'continue' ? 'continue' : 'generate'
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await validateRequest(userId, section, title);

      const openai = await getOpenAI();
      if (!openai) {
        throw new AIError('فشل في الاتصال بخدمة الذكاء الاصطناعي', {
          code: 'CONNECTION_ERROR'
        });
      }

      const prompt = SECTION_PROMPTS[section as keyof typeof SECTION_PROMPTS]
        .replace('{{title}}', title)
        .replace(/{{(\w+)}}/g, (_, key) => previousSections[key] || '');

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true
      });

      return handleStreamingResponse(completion, onProgress);
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on these errors
      if (error?.code === 'TITLE_REQUIRED' || 
          error?.code === 'AUTH_REQUIRED' ||
          error?.code === 'INSUFFICIENT_CREDITS') {
        break;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }

      // Refund credit if generation fails (except for insufficient credits)
      if (error?.code !== 'INSUFFICIENT_CREDITS') {
        await updateUserCredits(userId, 1, 'استرجاع رصيد - فشل في إنشاء المحتوى', {
          projectId,
          projectTitle,
          section
        });
      }

      console.error('[OpenAI] Generation error:', {
        name: error.name,
        message: error.message,
        code: error.code,
        status: error.status,
        type: error.type,
        stack: error.stack
      });

      if (error instanceof AIError) throw error;

      if (error.response?.data?.error) {
        const apiError = error.response.data.error;
        throw new AIError(getOpenAIErrorMessage(apiError), {
          code: apiError.code,
          type: apiError.type,
          status: error.response.status
        });
      }

      throw new AIError(error.message || 'حدث خطأ أثناء إنشاء المحتوى', {
        code: 'UNKNOWN_ERROR'
      });
    }
  }

  throw lastError || new Error('فشل في إنشاء المحتوى');
}

function getOpenAIErrorMessage(apiError: any): string {
  switch (apiError.code) {
    case 'insufficient_quota':
      return 'تم تجاوز الحد الأقصى للاستخدام. يرجى التواصل مع الدعم الفني.';
    case 'rate_limit_exceeded':
      return 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة بعد قليل.';
    case 'invalid_api_key':
      return 'مفتاح API غير صالح. يرجى التواصل مع الدعم الفني.';
    case 'content_filter':
      return 'تم رفض المحتوى من قبل نظام التصفية. يرجى تعديل الطلب والمحاولة مرة أخرى.';
    case 'context_length_exceeded':
      return 'المحتوى طويل جداً. يرجى تقسيمه إلى أجزاء أصغر.';
    default:
      return apiError.message || 'حدث خطأ أثناء الاتصال بخدمة الذكاء الاصطناعي';
  }
}