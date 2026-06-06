import { useState, useEffect } from "react";
import { Fingerprint, Search, Filter, Clock, Users, ArrowUpRight, Lock, Eye } from "lucide-react";
import { cn } from "../../lib/utils";
import { governanceApi } from "../../api/governance";

export default function Audit() {
  const [logs, setLogs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    governanceApi.getAuditLogs({}).then(setLogs).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <h2 className="text-[18px] font-bold text-on-surface uppercase italic tracking-tight">System Audit</h2>
          <p className="text-[12px] text-secondary font-medium mt-1">Immutable ledger of platform-wide interactions.</p>
        </div>
        <div className="flex gap-px bg-outline-variant border border-outline-variant">
           <div className="relative group bg-white">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-on-surface transition-colors" size={14} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="FILTER_LOGS..." 
                className="h-10 pl-10 pr-4 bg-transparent outline-none text-[11px] font-mono w-64 border-r border-outline-variant"
              />
           </div>
           <button 
             onClick={() => alert("正在导出审计日志...")}
             className="h-10 px-5 bg-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-container transition-all"
           >
              <Filter size={14} /> EXPORT_CSV
           </button>
        </div>
      </div>

      <div className="bg-white border border-outline-variant shadow-sm overflow-hidden">
         <div className="divide-y divide-outline-variant">
            {logs.length === 0 ? (
               <div className="p-16 text-center bg-surface-container-lowest">
                  <Fingerprint size={32} className="text-outline-variant mx-auto mb-4" />
                  <p className="text-[11px] font-mono font-bold uppercase text-outline">Null_Event_Capture</p>
               </div>
            ) : (
               logs.map((log, i) => (
                  <div key={log.id} className="px-8 py-5 flex items-center justify-between hover:bg-surface-container transition-all group border-l-4 border-l-transparent hover:border-l-primary-container">
                     <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-10 h-10 flex items-center justify-center transition-all",
                          log.action.includes('Denied') ? "bg-rose-100 text-rose-600 border border-rose-200" : "bg-surface-container text-secondary border border-outline-variant"
                        )}>
                           {log.action.includes('GET') ? <Eye size={16} /> : <Lock size={16} />}
                        </div>
                        <div>
                           <div className="flex items-center gap-3 mb-1">
                              <h4 className="text-[13px] font-bold text-on-surface uppercase italic tracking-tight">{log.action}</h4>
                              <span className="text-[10px] font-mono font-medium text-outline bg-surface-container px-1.5 py-0.5">TRC: {log.traceId.slice(0, 8)}</span>
                           </div>
                           <div className="flex items-center gap-4 text-[11px] font-mono font-medium text-secondary uppercase">
                              <span className="flex items-center gap-1.5"><Users size={12} /> {log.actorId}</span>
                              <span className="flex items-center gap-1.5"><Clock size={12} /> {new Date(log.createdAt).toISOString()}</span>
                           </div>
                        </div>
                     </div>
                     <button className="w-8 h-8 flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-all">
                        <ArrowUpRight size={16} />
                     </button>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
}
