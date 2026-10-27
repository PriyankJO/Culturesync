import api from './api';

export const getCompetitions = async () => {
  const response = await api.get('/competitions');
  return response.data;
};

export const createCompetition = async (data) => {
  const response = await api.post('/competitions', data);
  return response.data;
};

export const updateCompetition = async (id, data) => {
  const response = await api.put(`/competitions/${id}`, data);
  return response.data;
};

export const deleteCompetition = async (id) => {
  const response = await api.delete(`/competitions/${id}`);
  return response.data;
};
