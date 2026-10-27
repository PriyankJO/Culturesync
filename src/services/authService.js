import api from './api';

export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.success) {
    sessionStorage.setItem('user', JSON.stringify(response.data.data));
  }
  return response.data;
};

export const logout = () => {
  sessionStorage.removeItem('user');
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  if (response.data.success) {
    const existing = JSON.parse(sessionStorage.getItem('user') || '{}');
    sessionStorage.setItem('user', JSON.stringify({ ...existing, ...response.data.data }));
  }
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/auth/profile', data);
  if (response.data.success) {
    const existing = JSON.parse(sessionStorage.getItem('user') || '{}');
    sessionStorage.setItem('user', JSON.stringify({ ...existing, ...response.data.data }));
  }
  return response.data;
};
