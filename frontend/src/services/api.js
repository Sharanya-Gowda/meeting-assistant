import axios from 'axios';

// Safely point to your FastAPI server
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Health Check
export const checkHealth = () => axios.get(`${API_URL}/health`);

// Submission Endpoints (Day 6 & 8)
export const submitMeetingText = (data) => axios.post(`${API_URL}/meetings/text`, data);
export const submitMeetingFile = (formData) => axios.post(`${API_URL}/meetings/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Retrieval Endpoints (Day 9)
export const getMeetingStatus = (id) => axios.get(`${API_URL}/meetings/${id}/status`);
export const getMeeting = (id) => axios.get(`${API_URL}/meetings/${id}`);