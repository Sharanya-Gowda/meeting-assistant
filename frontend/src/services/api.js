import axios from 'axios';

// Safely point to FastAPI server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Health Check
export const checkHealth = () => axios.get(`${API_URL}/health`);

// Submission Endpoints 
export const submitMeetingText = (data) => axios.post(`${API_URL}/meetings/text`, data);
export const submitMeetingFile = (formData) => axios.post(`${API_URL}/meetings/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});


export const getMeetingStatus = (id) => axios.get(`${API_URL}/meetings/${id}/status`);
export const getMeeting = (id) => axios.get(`${API_URL}/meetings/${id}`);

export const getMeetings = async (skip = 0, limit = 10) => {
  return await axios.get(`${API_URL}/meetings?skip=${skip}&limit=${limit}`);
};