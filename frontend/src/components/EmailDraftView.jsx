// import React, { useState } from 'react';

// const EmailDraftView = ({ email }) => {
//   const [copyStatus, setCopyStatus] = useState('Copy Email');

//   if (!email) {
//     return <p className="text-slate-500 italic py-4">No email draft available.</p>;
//   }

//   const handleCopy = () => {
//     navigator.clipboard.writeText(email);
//     setCopyStatus('✓ Copied!');
//     setTimeout(() => setCopyStatus('Copy Email'), 2000);
//   };

//   return (
//     <div className="my-6 bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
//       <div className="flex items-center justify-between px-6 py-4 bg-slate-800/50 border-b border-slate-700/50">
//         <div className="flex items-center gap-2">
//           <div className="w-3 h-3 rounded-full bg-rose-500"></div>
//           <div className="w-3 h-3 rounded-full bg-amber-500"></div>
//           <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
//           <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Follow-up Draft</span>
//         </div>
//         <button 
//           onClick={handleCopy}
//           className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
//         >
//           {copyStatus}
//         </button>
//       </div>
//       <div className="p-8">
//         <pre className="text-slate-300 font-mono text-sm leading-8 whitespace-pre-wrap selection:bg-indigo-500/30">
//           {email}
//         </pre>
//       </div>
//     </div>
//   );
// };

// export default EmailDraftView;
