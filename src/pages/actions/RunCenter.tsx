import React, { useEffect, useState } from "react";
import { 
  Play, 
  Clock, 
  Search, 
  Filter, 
  ChevronRight, 
  RefreshCw,
  XCircle,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { runApi, Run } from "../../api/run";
import { cn } from "../../lib/utils";

export default function RunCenter() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = async () => {
    try {
      const data = await runApi.getRuns();
      setRuns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "queued": return "bg-gray-100 text-gray-500 border-gray-200";
      case "running": return "bg-blue-50 text-blue-600 border-blue-100 animate-pulse";
      case "succeeded": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "failed": return "bg-red-50 text-red-600 border-red-100";
      case "canceled": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-gray-50 text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "queued": return <Clock size={12} />;
      case "running": return <RefreshCw size={12} className="animate-spin" />;
      case "succeeded": return <CheckCircle2 size={12} />;
      case "failed": return <AlertCircle size={12} />;
      case "canceled": return <XCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-8 border-b border-tech bg-white flex justify-between items-end">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                  <Play size={20} fill="currentColor" />
               </div>
               <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Run Center</h1>
            </div>
            <p className="text-sm text-slate-500 max-w-md font-medium">
               追踪、审计并管理所有 Action 的执行状态与历史记录。
            </p>
         </div>

         <div className="flex gap-3">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-500" size={16} />
               <input 
                 type="text" 
                 placeholder="搜索 Run ID 或 Action 名称..."
                 className="h-11 pl-11 pr-6 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold transition-all outline-none focus:ring-4 focus:ring-blue-50 focus:bg-white w-64"
               />
            </div>
            <button className="h-11 px-6 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
               <Filter size={14} /> 筛选
            </button>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 tech-grid">
         <div className="max-w-6xl mx-auto space-y-4">
            {loading && runs.length === 0 ? (
               <div className="py-20 text-center">
                  <RefreshCw className="animate-spin text-blue-500 mx-auto mb-4" size={32} />
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">正在同步执行队列...</p>
               </div>
            ) : runs.map(run => (
               <NavLink 
                 key={run.id}
                 to={`/actions/runs/${run.id}`}
                 className="block group"
               >
                  <div className="bg-white border border-slate-100 p-6 rounded-2xl hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100 transition-all flex items-center justify-between">
                     <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105",
                          getStatusStyle(run.status)
                        )}>
                           {getStatusIcon(run.status)}
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <span className="text-xs font-black text-slate-900 uppercase">{run.action?.displayName || "Unknown Action"}</span>
                              <span className="text-[10px] font-mono text-slate-400">ID: {run.id.slice(0, 8)}</span>
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase">
                                 <Clock size={10} />
                                 {new Date(run.createdAt).toLocaleString()}
                              </div>
                              <span className="w-1 h-1 bg-slate-200 rounded-full" />
                              <span className="text-[10px] text-slate-400 font-medium">Actor: {run.actorId}</span>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <span className={cn(
                             "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                             getStatusStyle(run.status)
                           )}>
                              {run.status}
                           </span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                     </div>
                  </div>
               </NavLink>
            ))}

            {!loading && runs.length === 0 && (
               <div className="py-20 text-center border-4 border-dashed border-slate-50 rounded-3xl">
                  <Play className="text-slate-200 mx-auto mb-4" size={48} />
                  <p className="text-sm text-slate-300 font-bold uppercase tracking-widest">暂无执行任务</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
