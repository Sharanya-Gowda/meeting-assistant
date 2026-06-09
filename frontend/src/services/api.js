import axios from 'axios';

// point to the base domain of the FastAPI server
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Health Check (Matches @app.get("/api/health") in your main.py)
export const checkHealth = () => axios.get(`${BASE_URL}/api/health`);

// Submission Endpoints (Explicitly stating /api prefix)
export const submitMeetingText = (data) => axios.post(`${BASE_URL}/api/meetings/text`, data);
export const submitMeetingFile = (formData) => axios.post(`${BASE_URL}/api/meetings/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Polling and Detail Endpoints
export const getMeetingStatus = (id) => axios.get(`${BASE_URL}/api/meetings/${id}/status`);
export const getMeeting = (id) => axios.get(`${BASE_URL}/api/meetings/${id}`);

// Paginated History Entry Fetcher
export const getMeetings = async (skip = 0, limit = 10) => {
  return await axios.get(`${BASE_URL}/api/meetings?skip=${skip}&limit=${limit}`);
};

// Global Multi-Relational Keyword Search
export const searchMeetings = async (query, skip = 0, limit = 10) => {
  return await axios.get(`${BASE_URL}/api/meetings/search/query?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`);
};

// Delete a specific meeting and cascaded relations
export const deleteMeeting = (meetingId) => {
  return axios.delete(`${BASE_URL}/api/meetings/${meetingId}`);
};