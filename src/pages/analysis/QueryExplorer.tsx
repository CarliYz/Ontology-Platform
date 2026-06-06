import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Clock, 
  Terminal, 
  ChevronRight, 
  Database,
  User,
  RefreshCw,
  LayoutList,
  ChevronLeft
} from "lucide-react";
import { cn } from "../../lib/utils";
import { analysisApi, QueryEvent } from "../../api/analysis";
import { NavLink } from "react-router-dom";

export default function QueryExplorer() {
  const [events, setEvents] = useState<QueryEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [queryType, setQueryType] = useState<string>('');

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await analysisApi.getQueryEvents({ 
        page, 
        limit: 10,
        queryType: queryType || undefined
      });
      setEvents(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [page, queryType]);

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      <header className="p-10 border-b border-slate-100 flex justify-between items-end bg-slate-50/20">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                  <Terminal size={20} />
               </div>
               <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Query Explorer</h1>
            </div>
            <p className="text-sm text-slate-500 max-w-md font-medium">
               审计并分析全域读请求。实时监控查询复杂度、延迟与结果吞吐。
            </p>
         </div>

         <div className="flex gap-4">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
               <input 
                 type="text" 
                 placeholder="搜索 Trace ID..."
                 className="h-12 pl-12 pr-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all w-64 shadow-sm"
               />
            </div>
            <select 
              value={queryType}
              onChange={(e) => { setQueryType(e.target.value); setPage(1); }}
              className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold uppercase tracking-widest outline-none focus:ring-4 focus:ring-blue-50 transition-all shadow-sm cursor-pointer lg:w-48"
            >
               <option value="">全部类型</option>
               <option value="ONTOLOGY_READ">Ontology</option>
               <option value="OBJECT_TYPE_READ">Objects</option>
               <option value="ACTION_READ">Actions</option>
            </select>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 tech-grid">
         <div className="max-w-6xl mx-auto space-y-4">
            {loading ? (
              <div className="py-20 text-center">
                 <RefreshCw size={32} className="animate-spin text-blue-500 mx-auto mb-4" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">FETCHING EXECUTION TRACES...</p>
              </div>
            ) : events.length === 0 ? (
               <div className="py-20 text-center bg-slate-50 rounded-3xl">
                  <p className="text-xs font-bold text-slate-400">No query events found yet. Trigger some read requests to start monitoring.</p>
               </div>
            ) : (
               <>
                  {events.map(event => (
                     <NavLink 
                       key={event.id}
                       to={`/analysis/queries/${event.id}`}
                       className="block group"
                     >
                        <div className="bg-white border border-slate-100 p-6 rounded-3xl group-hover:border-blue-500 group-hover:shadow-2xl group-hover:shadow-blue-50 transition-all flex items-center justify-between">
                           <div className="flex items-center gap-8">
                              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                 <LayoutList size={24} />
                              </div>
                              <div>
                                 <div className="flex items-center gap-3 mb-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                       {event.queryType}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">TRACE: {event.traceId.slice(0, 12)}...</span>
                                 </div>
                                 <div className="flex items-center gap-4 text-xs font-bold text-slate-900 italic">
                                     <div className="flex items-center gap-2">
                                        <Clock size={12} className="text-slate-400" />
                                        {event.durationMs}ms
                                     </div>
                                     <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                     <div className="flex items-center gap-2">
                                        <Database size={12} className="text-slate-400" />
                                        {event.resultCount} Results
                                     </div>
                                     <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                     <div className="flex items-center gap-2">
                                        <User size={12} className="text-slate-400" />
                                        {event.actorId}
                                     </div>
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-6">
                              <div className="text-right">
                                 <p className="text-[10px] font-mono text-slate-300 mb-1">ID: {event.id.slice(0,8)}</p>
                                 <p className="text-[10px] font-black text-slate-400 uppercase">{new Date(event.createdAt).toLocaleTimeString()}</p>
                              </div>
                              <div className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-blue-600 transition-all">
                                 <ChevronRight size={18} />
                              </div>
                           </div>
                        </div>
                     </NavLink>
                  ))}

                  <div className="flex items-center justify-center gap-4 mt-8 py-4">
                     <button 
                       onClick={() => setPage(p => Math.max(1, p - 1))}
                       disabled={page === 1}
                       className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"
                     >
                        <ChevronLeft size={20} />
                     </button>
                     <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                        PAGE {page} / {totalPages}
                     </span>
                     <button 
                       onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                       disabled={page === totalPages}
                       className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"
                     >
                        <ChevronRight size={20} />
                     </button>
                  </div>
               </>
            )}
         </div>
      </div>
    </div>
  );
}
