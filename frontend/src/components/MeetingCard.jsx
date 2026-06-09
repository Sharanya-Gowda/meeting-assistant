// import React from 'react';
// import { Link } from 'react-router-dom';

// const MeetingCard = ({ meeting }) => {
//   const getStatusStyle = (status) => {
//     switch (status?.toLowerCase()) {
//       case 'completed':
//         return 'bg-emerald-100 text-emerald-700';
//       case 'failed':
//         return 'bg-rose-100 text-rose-700';
//       case 'pending':
//         return 'bg-amber-100 text-amber-700 animate-pulse';
//       default:
//         return 'bg-slate-100 text-slate-700';
//     }
//   };

//   return (
//     <Link to={`/result/${meeting.id}`} className="block transition-transform hover:scale-[1.01] active:scale-[0.99]">
//       <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col h-full group">
//         <div className="flex justify-between items-start mb-4">
//           <div className="space-y-1">
//             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${getStatusStyle(meeting.status)}`}>
//               {meeting.status}
//             </span>
//             <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
//               {meeting.title || 'Untitled Meeting'}
//             </h3>
//           </div>
//           <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
//           </div>
//         </div>
        
//         <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
//           <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
//             <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
//             {meeting.meeting_date}
//           </span>
//           <span className="text-xs font-bold text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity">
//             View Analysis
//           </span>
//         </div>
        
//         <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-2 italic">
//           {meeting.short_summary || 'No summary generated yet.'}
//         </p>
//       </div>
//     </Link>
//   );
// };

// export default MeetingCard;
