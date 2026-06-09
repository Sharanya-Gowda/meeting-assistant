// import React from 'react';

// const TextInputForm = ({ text, setText, title, setTitle, meetingDate, setMeetingDate, onSubmit, loading }) => {
//   return (
//     <form onSubmit={onSubmit} className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Title</label>
//           <input 
//             type="text" 
//             placeholder="e.g. Q3 Strategy Sync" 
//             value={title} 
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-white font-medium"
//           />
//         </div>
//         <div className="space-y-2">
//           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Date</label>
//           <input 
//             type="date" 
//             value={meetingDate} 
//             onChange={(e) => setMeetingDate(e.target.value)}
//             className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-white font-medium"
//           />
//         </div>
//       </div>

//       <div className="space-y-2">
//         <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Transcript / Notes</label>
//         <textarea 
//           placeholder="Paste your meeting conversation, notes, or transcript here..." 
//           rows="10"
//           value={text} 
//           onChange={(e) => setText(e.target.value)} 
//           required
//           className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none bg-white font-medium leading-relaxed resize-none"
//         />
//       </div>

//       <button 
//         type="submit" 
//         disabled={loading || !text.trim()}
//         className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
//       >
//         {loading ? (
//           <>
//             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//             Analyzing with Gemini...
//           </>
//         ) : (
//           <>
//             <span>🚀</span> Analyze Meeting
//           </>
//         )}
//       </button>
//     </form>
//   );
// };

// export default TextInputForm;
