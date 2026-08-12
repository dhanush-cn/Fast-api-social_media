import axios from 'axios';

// Create Axios instance pointing to FastAPI backend
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token if available in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle unauthenticated errors automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_email');
    }
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export const loginApi = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await api.post('/login', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
};

export const registerApi = async (email, password) => {
  const response = await api.post('/users/', { email, password });
  return response.data;
};

export const getUserApi = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

// --- Post Endpoints ---
export const getPostsApi = async () => {
  const response = await api.get('/posts/');
  return response.data;
};

export const createPostApi = async ({ title, content, published = true }) => {
  const response = await api.post('/posts/', { title, content, published });
  return response.data;
};

export const deletePostApi = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};

export const voteApi = async (postId, dir) => {
  const response = await api.post('/vote/', {
    post_id: postId,
    dir: dir,
  });
  return response.data;
};

// --- Comment Endpoints ---
export const getCommentsApi = async (postId) => {
  const response = await api.get(`/posts/${postId}/comments`);
  return response.data;
};

export const createCommentApi = async (postId, content) => {
  const response = await api.post('/comments/', {
    post_id: postId,
    content: content,
  });
  return response.data;
};

export const deleteCommentApi = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

// --- Direct Messaging Endpoints ---
export const sendMessageApi = async (receiverId, content) => {
  const response = await api.post('/messages/', {
    receiver_id: receiverId,
    content: content,
  });
  return response.data;
};

export const getChatHistoryApi = async (userId) => {
  const response = await api.get(`/messages/${userId}`);
  return response.data;
};

export const getConversationsApi = async () => {
  const response = await api.get('/conversations/');
  return response.data;
};

export default api;
