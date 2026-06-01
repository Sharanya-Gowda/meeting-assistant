import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMeetings } from '../services/api';

function HistoryPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const fetchHistory = async (currentPage) => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * limit;
      const response = await getMeetings(skip, limit);
      
      // If page is 1, replace data. If page > 1, append data.
      if (currentPage === 1) {
        setMeetings(response.data.items);
      } else {
        setMeetings((prev) => [...prev, ...response.data.items]);
      }
      
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError("Failed to load meeting history.");
    } finally {
      setLoading(false);
    }
  };

  const hasMore = meetings.length < total;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Meeting History</h1>
        <Link to="/" style={{ textDecoration: 'none', background: '#0066cc', color: 'white', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}>
          + New Meeting
        </Link>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      {meetings.length === 0 && !loading && !error ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <p>No meetings found. Start by analyzing your first meeting!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {meetings.map((meeting) => (
            <Link 
              key={meeting.id} 
              to={`/result/${meeting.id}`} 
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '1.5rem', 
                transition: 'box-shadow 0.2s, transform 0.2s',
                cursor: 'pointer',
                background: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: '#0066cc' }}>{meeting.title}</h3>
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '0.8rem', 
                    fontWeight: 'bold',
                    background: meeting.status === 'completed' ? '#e8f5e9' : meeting.status === 'pending' ? '#fff3e0' : '#ffebee',
                    color: meeting.status === 'completed' ? '#2e7d32' : meeting.status === 'pending' ? '#ef6c00' : '#c62828'
                  }}>
                    {meeting.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  📅 {meeting.meeting_date}
                </div>
                <p style={{ margin: 0, color: '#444', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {meeting.short_summary || "No summary available for this meeting yet."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Load More Button */}
      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={() => setPage(p => p + 1)} 
            disabled={loading}
            style={{ padding: '10px 20px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            {loading ? 'Loading...' : 'Load Older Meetings'}
          </button>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;