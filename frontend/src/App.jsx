import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from './services/api';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import ResultPage from './pages/ResultPage';
import HistoryPage from './pages/HistoryPage';
import MeetingDetailPage from './pages/MeetingDetailPage';

export default function App() {
  const [backendStatus, setBackendStatus] = useState('Verifying Link...');

  useEffect(() => {
    // Perform infrastructure verification check on runtime mount
    api.get('/api/health')
      .then((res) => {
        if (res.data.status === 'healthy') {
          setBackendStatus('Backend connected');
        } else {
          setBackendStatus('Backend validation mismatched');
        }
      })
      .catch(() => {
        setBackendStatus('Backend not available');
      });
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
        <Navigation />
        
        {/* Network Infrastructure Diagnostic Bar Banner */}
        <div className={`p-2 text-center text-xs font-semibold ${
          backendStatus === 'Backend connected' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          Status Diagnostic Link: {backendStatus}
        </div>

        <main className="max-w-6xl mx-auto py-6 px-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/result/:meetingId" element={<ResultPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/meeting/:meetingId" element={<MeetingDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}