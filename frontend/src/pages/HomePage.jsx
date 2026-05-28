import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitMeetingText, submitMeetingFile } from '../services/api';

function HomePage() {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'
  const [title, setTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      // Route the payload to the correct backend endpoint based on active tab
      if (activeTab === 'text') {
        response = await submitMeetingText({ 
          title: title || "Untitled Meeting", 
          meeting_date: meetingDate || null, 
          text 
        });
      } else {
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        if (meetingDate) formData.append('meeting_date', meetingDate);
        response = await submitMeetingFile(formData);
      }

      // Extract the new Meeting UUID and route to the Result page
      const meetingId = response.data.id;
      navigate(`/result/${meetingId}`);
      
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to process meeting.");
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h2>Submit a Meeting</h2>
      
      {/* Tab Selectors */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          onClick={() => setActiveTab('text')} 
          style={{ fontWeight: activeTab === 'text' ? 'bold' : 'normal' }}
        >
          Paste Text
        </button>
        <button 
          onClick={() => setActiveTab('file')}
          style={{ fontWeight: activeTab === 'file' ? 'bold' : 'normal' }}
        >
          Upload File
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input 
          type="text" 
          placeholder="Meeting Title (Optional)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        
        <input 
          type="date" 
          value={meetingDate} 
          onChange={(e) => setMeetingDate(e.target.value)} 
        />

        {activeTab === 'text' ? (
          <textarea 
            placeholder="Paste your meeting transcript here (min 20 chars)..." 
            rows="6"
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            required
          />
        ) : (
          <input 
            type="file" 
            accept=".txt,.md,.docx"
            onChange={(e) => setFile(e.target.files[0])} 
            required
          />
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Processing via Gemini AI..." : "Submit Meeting"}
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</p>}
    </div>
  );
}

export default HomePage;