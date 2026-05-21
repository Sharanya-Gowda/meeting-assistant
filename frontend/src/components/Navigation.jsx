import { Link } from 'react-router-dom';

export default function Navigation() {
  return (
    <nav className="bg-slate-900 text-white p-4 flex gap-6 shadow-md">
      <div className="font-bold mr-4 text-sky-400">Meeting Assistant</div>
      <Link to="/" className="hover:text-sky-300 transition">Home</Link>
      <Link to="/history" className="hover:text-sky-300 transition">Meeting History</Link>
    </nav>
  );
}