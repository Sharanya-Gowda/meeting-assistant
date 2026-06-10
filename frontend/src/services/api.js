import axios from 'axios';

// 1. Get raw URL from environment or fallback
let BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 2. Safe Guard: Clean trailing slashes or duplicate /api prefixes automatically
if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1);
}
if (BASE_URL.endsWith('/api')) {
  BASE_URL = BASE_URL.slice(0, -4); // Removes the duplicate /api portion if configured locally
}

// Health Check
export const checkHealth = () => axios.get(`${BASE_URL}/api/health`);

// Submission Endpoints
export const submitMeetingText = (data) => axios.post(`${BASE_URL}/api/meetings/text`, data);
export const submitMeetingFile = (formData) => axios.post(`${BASE_URL}/api/meetings/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// Polling and Detail Endpoints
export const getMeetingStatus = (id) => axios.get(`${BASE_URL}/api/meetings/${id}/status`);
export const getMeeting = (id) => axios.get(`${BASE_URL}/api/meetings/${id}`);

// Paginated History Ledger Entries
export const getMeetings = async (skip = 0, limit = 10) => {
  return await axios.get(`${BASE_URL}/api/meetings?skip=${skip}&limit=${limit}`);
};

// Global Keyword Router Search 
export const searchMeetings = async (query, skip = 0, limit = 10) => {
  return await axios.get(`${BASE_URL}/api/meetings/search/query?q=${encodeURIComponent(query)}&skip=${skip}&limit=${limit}`);
};

// Delete meeting and all cascaded relation mappings
export const deleteMeeting = (meetingId) => {
  return axios.delete(`${BASE_URL}/api/meetings/${meetingId}`);
};