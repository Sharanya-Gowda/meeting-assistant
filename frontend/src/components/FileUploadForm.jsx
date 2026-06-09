// import React from 'react';

// const FileUploadForm = ({ file, setFile, title, setTitle, meetingDate, setMeetingDate, onSubmit, loading }) => {
//   const onFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       setFile(e.target.files[0]);
//     }
//   };

//   return (
//     <form onSubmit={onSubmit} className="space-y-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div className="space-y-2">
//           <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Meeting Title</label>
//           <input 
//             type="text" 
//             placeholder="e.g. Weekly Standup" 
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

//       <div className="relative group">
//         <input 
//           type="file" 
//           accept=".txt,.md,.docx"
//           onChange={onFileChange} 
//           className="hidden"
//           id="file-upload"
//           required
//         />
//         <label 
//           htmlFor="file-upload"
//           className={`flex flex-col items-center justify-center w-full min-h-[300px] border-2 border-dashed rounded-3xl cursor-pointer transition-all ${
//             file 
//             ? 'border-indigo-500 bg-indigo-50/30' 
//             : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-slate-400'
//           }`}
//         >
//           <div className="flex flex-col items-center justify-center pt-5 pb-6 px-10 text-center">
//             {file ? (
//               <>
//                 <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl mb-4">📄</div>
//                 <p className="mb-2 text-sm text-indigo-900 font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-full">
//                   {file.name}
//                 </p>
//                 <p className="text-xs text-indigo-600 font-medium">
//                   {(file.size / 1024).toFixed(1)} KB • Click to change
//                 </p>
//               </>
//             ) : (
//               <>
//                 <div className="w-20 h-20 rounded-2xl bg-slate-200 flex items-center justify-center text-3xl mb-4 group-hover:bg-indigo-100 transition-colors">📤</div>
//                 <p className="mb-2 text-lg text-slate-700 font-bold">Click to upload transcript</p>
//                 <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
//                     Supports .txt, .md, and .docx files.<br/>
//                     AI will automatically extract the conversation.
//                 </p>
//               </>
//             )}
//           </div>
//         </label>
//       </div>

//       <button 
//         type="submit" 
//         disabled={loading || !file}
//         className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
//       >
//         {loading ? (
//           <>
//             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//             Uploading & Analyzing...
//           </>
//         ) : (
//           <>
//             <span>📁</span> Process Transcript File
//           </>
//         )}
//       </button>
//     </form>
//   );
// };

// export default FileUploadForm;
