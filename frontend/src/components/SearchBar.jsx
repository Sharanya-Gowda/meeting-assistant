// import React from 'react';

// const SearchBar = ({ searchQuery, setSearchQuery, onSubmit, activeQuery, clearSearch }) => {
//   return (
//     <div className="relative group mb-8">
//       <form onSubmit={onSubmit} className="flex gap-3">
//         <div className="relative flex-grow">
//           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
//           </div>
//           <input 
//             type="text" 
//             placeholder="Search topics, decisions, or action items..." 
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-slate-700 font-medium placeholder:text-slate-400 shadow-sm"
//           />
//         </div>
//         <button 
//           type="submit" 
//           className="px-8 py-4 bg-slate-900 border border-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-900/10"
//         >
//           Search
//         </button>
//         {activeQuery && (
//           <button 
//             type="button" 
//             onClick={clearSearch} 
//             className="px-6 py-4 bg-white border border-rose-100 text-rose-600 font-bold rounded-2xl hover:bg-rose-50 transition-all active:scale-95 flex items-center justify-center"
//           >
//             Clear
//           </button>
//         )}
//       </form>
      
//       {activeQuery && (
//         <div className="mt-4 flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
//             <p className="text-sm text-slate-500 font-medium">
//                 Filtering by <span className="text-slate-900 font-bold">"{activeQuery}"</span>
//             </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SearchBar;
