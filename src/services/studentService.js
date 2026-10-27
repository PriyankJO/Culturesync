import api from './api';

export const getStudents = async () => {
  const response = await api.get('/users/students');
  return response.data;
};

export const createStudent = async (data) => {
  const response = await api.post('/users/students', data);
  return response.data;
};

export const updateStudent = async (id, data) => {
  const response = await api.put(`/users/students/${id}`, data);
  return response.data;
};

export const deleteStudent = async (id) => {
  const response = await api.delete(`/users/students/${id}`);
  return response.data;
};
