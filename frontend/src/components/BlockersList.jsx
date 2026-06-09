// import React from 'react';

// const BlockersList = ({ blockers }) => {
//   if (!blockers || blockers.length === 0) {
//     return <p className="text-slate-500 italic py-4">No blockers or risks identified.</p>;
//   }

//   const getTypeStyle = (type) => {
//     switch (type?.toLowerCase()) {
//       case 'blocker':
//         return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
//       case 'risk':
//         return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
//       default:
//         return 'bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/20';
//     }
//   };

//   return (
//     <div className="grid gap-4 my-4 sm:grid-cols-1 md:grid-cols-2">
//       {blockers.map((blocker, idx) => (
//         <div 
//           key={idx} 
//           className={`relative p-4 rounded-xl border ring-1 ring-inset transition-all animate-in fade-in slide-in-from-left-4 duration-300 ${getTypeStyle(blocker.type)}`}
//         >
//           <div className="flex justify-between items-start mb-2">
//             <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white/50 backdrop-blur-sm border border-current/20">
//               {blocker.type || 'OPEN QUESTION'}
//             </span>
//             {blocker.raised_by && (
//               <span className="text-[10px] font-medium opacity-70 italic tracking-tight">
//                 Raised by: {blocker.raised_by}
//               </span>
//             )}
//           </div>
//           <p className="text-sm font-medium leading-relaxed">
//             {blocker.description}
//           </p>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default BlockersList;
