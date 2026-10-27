import api from './api';

export const getJudges = async () => {
  const response = await api.get('/judges');
  return response.data;
};

export const createJudge = async (data) => {
  const response = await api.post('/judges', data);
  return response.data;
};

export const updateJudge = async (id, data) => {
  const response = await api.put(`/judges/${id}`, data);
  return response.data;
};

export const deleteJudge = async (id) => {
  const response = await api.delete(`/judges/${id}`);
  return response.data;
};

// Scores
export const getScores = async (params) => {
  const response = await api.get('/scores', { params });
  return response.data;
};

export const createScore = async (data) => {
  const response = await api.post('/scores', data);
  return response.data;
};
