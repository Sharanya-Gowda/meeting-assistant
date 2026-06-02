import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMeetings, searchMeetings } from '../services/api';

function HistoryPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // New Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState(""); // Tracks the actual submitted search

  useEffect(() => {
    fetchData(page, activeQuery);
  }, [page, activeQuery]);

  const fetchData = async (currentPage, query) => {
    try {
      setLoading(true);
      const skip = (currentPage - 1) * limit;
      
      // Decide whether to call the standard history API or the search API
      const response = query 
        ? await searchMeetings(query, skip, limit)
        : await getMeetings(skip, limit);
      
      if (currentPage === 1) {
        setMeetings(response.data.items);
      } else {
        setMeetings((prev) => [...prev, ...response.data.items]);
      }
      
      setTotal(response.data.total);
      setError(null);
    } catch (err) {
      setError("Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    setActiveQuery(searchQuery.trim());
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveQuery("");
    setPage(1);
  };

  const hasMore = meetings.length < total;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Meeting History</h1>
        <Link to="/" style={{ textDecoration: 'none', background: '#0066cc', color: 'white', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold' }}>
          + New Meeting
        </Link>
      </div>

      {/* SEARCH BAR COMPONENT */}
      <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input 
          type="text" 
          placeholder="Search topics, decisions, or action items..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '10px 15px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <button type="submit" style={{ padding: '10px 20px', background: '#333', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Search
        </button>
        {activeQuery && (
          <button type="button" onClick={clearSearch} style={{ padding: '10px 15px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Clear
          </button>
        )}
      </form>

      {/* RESULTS HEADER */}
      {activeQuery && (
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Found {total} result(s) for <strong>"{activeQuery}"</strong>
        </p>
      )}

      {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
      
      {meetings.length === 0 && !loading && !error ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '8px' }}>
          <p>{activeQuery ? "No matching meetings found. Try a different keyword." : "No meetings found. Start by analyzing your first meeting!"}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {meetings.map((meeting) => (
            <Link key={meeting.id} to={`/result/${meeting.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1.5rem', background: 'white', transition: 'transform 0.2s', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, color: '#0066cc' }}>{meeting.title}</h3>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '12px', background: meeting.status === 'completed' ? '#e8f5e9' : '#ffebee', color: meeting.status === 'completed' ? '#2e7d32' : '#c62828' }}>
                    {meeting.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>📅 {meeting.meeting_date}</div>
                <p style={{ margin: 0, color: '#444', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {meeting.short_summary || "No summary available."}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={() => setPage(p => p + 1)} disabled={loading} style={{ padding: '10px 20px', background: '#f0f0f0', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

export default HistoryPage;