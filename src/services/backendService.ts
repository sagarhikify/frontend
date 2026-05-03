/**
 * Service to interact with the Express backend
 */

export interface AnalyzeResponse {
  success: boolean;
  data?: {
    title: string;
    summaryEn: string;
    summaryKn: string;
    category: string;
    urgency: 'low' | 'medium' | 'high';
    deadlines: { label: string; date: string; isUrgent: boolean }[];
    fees: string;
    eligibility: string;
    actions: string[];
  };
  error?: string;
}

export const analyzeNotice = async (input: string | File): Promise<AnalyzeResponse> => {
  try {
    let text = "";
    if (typeof input === 'string') {
      text = input;
    } else {
      // 1. OCR in Backend
      const formData = new FormData();
      formData.append('file', input);
      const ocrRes = await fetch('/api/ocr', { method: 'POST', body: formData });
      if (!ocrRes.ok) throw new Error('OCR Failed');
      const ocrData = await ocrRes.json();
      text = ocrData.text;
    }

    // 2. AI Analysis in Frontend (using geminiService)
    const { simplifyNotice } = await import('./geminiService');
    const result = await simplifyNotice(text);

    // 3. Save to Backend
    const saveRes = await fetch('/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result),
    });
    
    if (!saveRes.ok) console.warn("Failed to persist notice, but showing result.");

    return { success: true, data: result };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export const getCalendarEvents = async () => {
  const response = await fetch('/api/calendar');
  return response.json();
};

export const getNotifications = async () => {
  const response = await fetch('/api/notifications');
  return response.json();
};

export const broadcastMessage = async (message: string, title?: string, type?: string) => {
  const response = await fetch('/api/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, title, type }),
  });
  return response.json();
};

export const getNotices = async () => {
  const response = await fetch('/api/notices');
  return response.json();
};

export const sendEmailNotification = async (email: string, subject: string, message: string) => {
  const response = await fetch('/api/notify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, subject, message }),
  });
  return response.json();
};

export const askChatbot = async (message: string, context?: string) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  });
  return response.json();
};

export const registerCitizen = async (data: any) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const loginCitizen = async (credentials: any) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return response.json();
};
