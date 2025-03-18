import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Example API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth'),
  logout: () => api.post('/auth/logout')
};

export const usersAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (userId) => api.get(`/users/${userId}`),
  updateProfile: (profileData) => api.put('/users/profile', profileData)
};

export const messagesAPI = {
  getDirectMessages: (userId) => api.get(`/messages/direct/${userId}`),
  getGroupMessages: (groupId) => api.get(`/messages/group/${groupId}`),
  sendDirectMessage: (messageData) => api.post('/messages/direct', messageData),
  sendGroupMessage: (messageData) => api.post('/messages/group', messageData),
  editMessage: (messageId, message) => api.put(`/messages/${messageId}`, { message })
};

export const groupsAPI = {
  getUserGroups: () => api.get('/groups'),
  getGroupById: (groupId) => api.get(`/groups/${groupId}`),
  createGroup: (groupData) => api.post('/groups', groupData),
  joinGroup: (inviteCode) => api.post(`/groups/join/${inviteCode}`),
  updateGroup: (groupId, groupData) => api.put(`/groups/${groupId}`, groupData)
};

export const tasksAPI = {
  getUserTasks: () => api.get('/tasks'),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData)
};

export default api;