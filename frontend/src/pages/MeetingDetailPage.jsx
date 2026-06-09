import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMeeting } from '../services/api';
// import ResultView from '../components/ResultView';

export default function MeetingDetailPage() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const response = await getMeeting(meetingId);
        setMeeting(response.data);
      } catch (err) {
        setError("Meeting not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [meetingId]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
      {error}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <header className="mb-10 border-b border-slate-200 pb-8">
        <div className="flex items-center gap-4 mb-4">
            <Link to="/history" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Historical Session: {meeting?.title}</h1>
        </div>
        <div className="flex gap-4 text-sm text-slate-500 ml-12">
          <span>📅 {meeting?.meeting_date}</span>
          <span className="font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700 uppercase">{meeting?.status}</span>
        </div>
      </header>
      
      <ResultView meeting={meeting} />
    </div>
  );
}
