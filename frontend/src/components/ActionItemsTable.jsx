// import React from 'react';

// const ActionItemsTable = ({ items }) => {
//   if (!items || items.length === 0) {
//     return <p className="text-slate-500 italic py-4">No action items identified.</p>;
//   }

//   return (
//     <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white my-4">
//       <table className="min-w-full divide-y divide-slate-200 text-sm">
//         <thead className="bg-slate-50">
//           <tr>
//             <th className="px-4 py-3 text-left font-semibold text-slate-900 border-r border-slate-200">Description</th>
//             <th className="px-4 py-3 text-left font-semibold text-slate-900 border-r border-slate-200">Owner</th>
//             <th className="px-4 py-3 text-left font-semibold text-slate-900 border-r border-slate-200">Deadline</th>
//             <th className="px-4 py-3 text-left font-semibold text-slate-900">Priority</th>
//           </tr>
//         </thead>
//         <tbody className="divide-y divide-slate-200">
//           {items.map((item, idx) => (
//             <tr key={idx} className="hover:bg-slate-50 transition-colors">
//               <td className="px-4 py-3 text-slate-700 leading-relaxed border-r border-slate-200">{item.description}</td>
//               <td className="px-4 py-3 text-slate-600 border-r border-slate-200 font-medium">{item.owner}</td>
//               <td className="px-4 py-3 text-slate-500 border-r border-slate-200 whitespace-nowrap">{item.deadline}</td>
//               <td className="px-4 py-3">
//                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
//                   item.priority?.toLowerCase() === 'high' 
//                     ? 'bg-rose-100 text-rose-700' 
//                     : item.priority?.toLowerCase() === 'medium'
//                     ? 'bg-amber-100 text-amber-700'
//                     : 'bg-emerald-100 text-emerald-700'
//                 }`}>
//                   {item.priority || 'NORMAL'}
//                 </span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default ActionItemsTable;
