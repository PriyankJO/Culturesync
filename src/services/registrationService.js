import api from './api';

export const getRegistrations = async (eventId) => {
  const url = eventId ? `/registrations?eventId=${eventId}` : '/registrations';
  const response = await api.get(url);
  return response.data;
};

export const getMyRegistrations = async () => {
  const response = await api.get('/registrations/me');
  return response.data;
};

export const createRegistration = async (data) => {
  const response = await api.post('/registrations', data);
  return response.data;
};

export const updateRegistration = async (id, data) => {
  const response = await api.put(`/registrations/${id}`, data);
  return response.data;
};

export const deleteRegistration = async (id) => {
  const response = await api.delete(`/registrations/${id}`);
  return response.data;
};

export const markAttendance = async (id, attended) => {
  const response = await api.put(`/registrations/${id}/attendance`, { attended });
  return response.data;
}
