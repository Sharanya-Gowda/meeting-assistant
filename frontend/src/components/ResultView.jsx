// import React from 'react';
// import ActionItemsTable from './ActionItemsTable';
// import DecisionsList from './DecisionsList';
// import BlockersList from './BlockersList';
// import EmailDraftView from './EmailDraftView';

// const ResultView = ({ meeting }) => {
//   if (!meeting) return null;

//   return (
//     <div className="space-y-12 animate-in fade-in duration-700">
//       {/* Summary Section */}
//       <section>
//         <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
//           <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">✨</span>
//           Executive Summary
//         </h2>
//         <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm mb-6">
//           <p className="text-lg text-indigo-900 font-semibold leading-relaxed">
//             {meeting.short_summary || "No short summary available."}
//           </p>
//         </div>
//         <div className="prose prose-slate max-w-none">
//           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Detailed Analysis</h3>
//           <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
//             {meeting.detailed_summary || "No detailed analysis available."}
//           </p>
//         </div>
//       </section>

//       {/* Action Items */}
//       <section>
//         <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
//           <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">📅</span>
//           Action Items
//         </h2>
//         <ActionItemsTable items={meeting.action_items} />
//       </section>

//       {/* Decisions */}
//       <section>
//         <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
//           <span className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">⚖️</span>
//           Key Decisions
//         </h2>
//         <DecisionsList decisions={meeting.decisions} />
//       </section>

//       {/* Blockers */}
//       <section>
//         <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
//           <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">🚧</span>
//           Blockers & Risks
//         </h2>
//         <BlockersList blockers={meeting.blockers} />
//       </section>

//       {/* Email Draft */}
//       <section>
//         <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
//           <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">📧</span>
//           Follow-Up Email
//         </h2>
//         <EmailDraftView email={meeting.followup_email} />
//       </section>
//     </div>
//   );
// };

// export default ResultView;
