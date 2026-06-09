// import React from 'react';

// const DecisionsList = ({ decisions }) => {
//   if (!decisions || decisions.length === 0) {
//     return <p className="text-slate-500 italic py-4">No key decisions recorded.</p>;
//   }

//   return (
//     <div className="space-y-4 my-4">
//       {decisions.map((decision, idx) => (
//         <div key={idx} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all border-l-4 border-l-indigo-500">
//           <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-sm">
//             {idx + 1}
//           </div>
//           <div className="flex-grow">
//             <p className="text-slate-800 font-medium leading-relaxed">{decision.description}</p>
//             {decision.decided_by && (
//               <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
//                 <span className="font-semibold text-slate-600 uppercase tracking-tighter">Decided by:</span> {decision.decided_by}
//               </p>
//             )}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default DecisionsList;
