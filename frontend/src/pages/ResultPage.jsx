import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMeeting } from '../services/api';

function ResultPage() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');

  useEffect(() => {
    let timeoutId;

    const fetchResults = async () => {
      try {
        const response = await getMeeting(meetingId);
        setMeeting(response.data);
        setLoading(false);

        // Poll every 3 seconds if the AI is still processing
        if (response.data.status === 'pending') {
          timeoutId = setTimeout(fetchResults, 3000);
        }
      } catch (err) {
        setError("Failed to load meeting results. It may not exist.");
        setLoading(false);
      }
    };

    fetchResults();

    // Cleanup timeout on unmount to prevent memory leaks
    return () => clearTimeout(timeoutId);
  }, [meetingId]);

  const copyToClipboard = () => {
    if (meeting && meeting.followup_email) {
      navigator.clipboard.writeText(meeting.followup_email);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '3rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', marginTop: '3rem', color: 'red' }}>{error}</div>;
  if (!meeting) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '2rem auto', fontFamily: 'sans-serif', padding: '0 1rem' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#0066cc' }}>&larr; Back to Home</Link>
      
      <header style={{ marginTop: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #ccc' }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{meeting.title}</h1>
        <p style={{ margin: '0.2rem 0' }}><strong>Date:</strong> {meeting.meeting_date}</p>
        <p style={{ margin: '0.2rem 0' }}>
          <strong>Status: </strong> 
          <span style={{ 
            color: meeting.status === 'completed' ? '#2e7d32' : meeting.status === 'failed' ? '#c62828' : '#f57c00',
            fontWeight: 'bold' 
          }}>
            {meeting.status.toUpperCase()}
          </span>
        </p>
      </header>

      {/* PENDING STATE */}
      {meeting.status === 'pending' && (
        <div style={{ textAlign: 'center', margin: '4rem 0' }}>
          <h2>🤖 AI is analyzing your meeting...</h2>
          <p>Please wait. This page will automatically update when finished.</p>
        </div>
      )}

      {/* FAILED STATE */}
      {meeting.status === 'failed' && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: '1rem', borderRadius: '5px', marginTop: '2rem' }}>
          <h3>❌ Processing Failed</h3>
          <p>{meeting.error_message || "An unknown error occurred during AI extraction."}</p>
        </div>
      )}

      {/* COMPLETED STATE */}
      {meeting.status === 'completed' && (
        <>
          <section style={{ marginTop: '2rem' }}>
            <h3>Short Summary</h3>
            <p style={{ background: '#f0f4f8', color: '#333', padding: '1.2rem', borderRadius: '8px', borderLeft: '5px solid #0066cc', fontSize: '1.1rem' }}>
              {meeting.short_summary || "No summary available."}
            </p>
          </section>

          <section style={{ marginTop: '2rem' }}>
            <h3>Detailed Summary</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#f0f4f8' }}>
              {meeting.detailed_summary || "No detailed summary available."}
            </p>
          </section>
          
          <section style={{ marginTop: '2rem' }}>
            <h3>📅 Action Items</h3>
            {meeting.action_items && meeting.action_items.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#110b46' }}>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Description</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Owner</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Deadline</th>
                      <th style={{ padding: '12px', borderBottom: '2px solid #ccc' }}>Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meeting.action_items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{item.description}</td>
                        <td style={{ padding: '12px' }}>{item.owner}</td>
                        <td style={{ padding: '12px' }}>{item.deadline}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px', 
                            borderRadius: '12px', 
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            // background: item.priority === 'high' ? '#ffebee' : item.priority === 'medium' ? '#fff3e0' : '#e8f5e9',
                            // color: item.priority === 'high' ? '#c62828' : item.priority === 'medium' ? '#ef6c00' : '#2e7d32'
                          }}>
                            {item.priority.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: '#666' }}>No action items identified.</p>
            )}
          </section>

          <section style={{ marginTop: '2.5rem' }}>
            <h3>⚖️ Decisions Made</h3>
            {meeting.decisions && meeting.decisions.length > 0 ? (
              <ul style={{ lineHeight: '1.8', color: '#f0f4f8' }}>
                {meeting.decisions.map((decision, idx) => (
                  <li key={idx}>
                    <strong>{decision.description}</strong> 
                    <span style={{ color: '#666', fontSize: '0.9rem' }}> (Decided by: {decision.decided_by})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>No key decisions recorded.</p>
            )}
          </section>

          <section style={{ marginTop: '2.5rem' }}>
            <h3>🚧 Blockers & Risks</h3>
            {meeting.blockers && meeting.blockers.length > 0 ? (
              <ul style={{ lineHeight: '1.8', color: '#f0f4f8' }}>
                {meeting.blockers.map((blocker, idx) => (
                  <li key={idx}>
                    <span style={{ fontWeight: 'bold', color: blocker.type === 'blocker' ? '#d32f2f' : '#f57c00' }}>
                      [{blocker.type.toUpperCase()}]
                    </span>{' '}
                    {blocker.description} 
                    <span style={{ color: '#666', fontSize: '0.9rem' }}> (Raised by: {blocker.raised_by})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#666' }}>No blockers or risks identified.</p>
            )}
          </section>

          <section style={{ marginTop: '3rem', marginBottom: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>📧 Follow-Up Email Draft</h3>
              <button 
                onClick={copyToClipboard}
                style={{ padding: '8px 16px', cursor: 'pointer', background: '#0066cc', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
              >
                {copySuccess || 'Copy to Clipboard'}
              </button>
            </div>
            <pre style={{ 
              background: '#f8f9fa', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              border: '1px solid #dee2e6',
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
              color: '#333'
            }}>
              {meeting.followup_email || "No email draft available."}
            </pre>
          </section>
        </>
      )}
    </div>
  );
}

export default ResultPage;