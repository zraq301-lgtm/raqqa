import axios from 'axios';

// إعداد الرابط الأساسي لـ API
const API_BASE_URL = 'https://raqqa-v6cd.vercel.app/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ApiService = {
  // --- قسم الأرجوحة (المنشورات) ---
  getPosts: () => apiClient.get('/get-posts'),
  
  savePost: (postData) => apiClient.post('/save-post', postData),

  // --- قسم الذكاء الاصطناعي ---
  askRaqqaAI: (question) => apiClient.post('/raqqa-ai', { prompt: question }),

  // --- قسم الصحة ---
  saveHealthData: (healthData) => apiClient.post('/save-health', healthData),

  // --- قسم الإشعارات ---
  getNotifications: () => apiClient.get('/notifications'),
  
  deleteNotification: (id) => apiClient.delete(`/delete-notification?id=${id}`),

  // --- قسم الإشارات والتسجيل ---
  sendKnockTrigger: (triggerData) => apiClient.post('/send-trigger', triggerData),
  
  registerUser: (userData) => apiClient.post('/register', userData),

  // --- قسم الملفات ---
  getUploadToken: (fileDetails) => apiClient.post('/upload-token', fileDetails),
};
