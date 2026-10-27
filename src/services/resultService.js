import api from './api';

export const getResults = async () => {
  const response = await api.get('/results');
  return response.data;
};

export const createResult = async (data) => {
  const response = await api.post('/results', data);
  return response.data;
};
