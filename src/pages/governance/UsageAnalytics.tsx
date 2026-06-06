import { useState, useEffect } from "react";
import { Activity, Zap, TrendingUp, Users, ArrowRight, MousePointer2, Clock, Box } from "lucide-react";
import { cn } from "../../lib/utils";
import { governanceApi } from "../../api/governance";

export default function UsageAnalytics() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    governanceApi.getUsageMetrics().then(setMetrics).catch(console.error);
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <h2 className="text-[18px] font-bold text-on-surface uppercase italic tracking-tight">Usage_Analytics</h2>
          <p className="text-[12px] text-secondary font-medium mt-1">Platform engagement and interaction patterns telemetry.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px bg-outline-variant border border-outline-variant shadow-sm">
         <div className="bg-white p-8 relative overflow-hidden group border-r border-outline-variant">
            <div className="relative z-10">
               <div className="w-10 h-10 bg-surface-container flex items-center justify-center mb-6 border border-outline-variant text-secondary">
                  <MousePointer2 size={18} />
               </div>
               <p className="text-[10px] font-mono font-bold uppercase text-secondary mb-2">QUERY_IMPACT_METRIC</p>
               <p className="text-[32px] font-bold text-on-surface italic uppercase tracking-tighter">
                  {metrics?.queryCount || 0}
               </p>
               <div className="mt-8 flex items-center gap-2 text-[10px] font-mono font-bold text-emerald-600 uppercase">
                  <TrendingUp size={12} /> +14.2%_DELTA
               </div>
            </div>
         </div>

         <div className="bg-on-surface p-8 relative overflow-hidden text-white border-r border-outline-variant">
            <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center mb-6 text-white">
               <Zap size={18} />
            </div>
            <p className="text-[10px] font-mono font-bold uppercase text-surface-dim mb-2">EXECUTION_TOTAL_RUNS</p>
            <p className="text-[32px] font-bold italic uppercase tracking-tighter">
               {metrics?.runCount || 0}
            </p>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-mono font-bold text-surface-dim opacity-60 uppercase">
               <Activity size={12} /> STABILITY: 99.8%_NOMINAL
            </div>
         </div>

         <div className="bg-white p-8 relative overflow-hidden">
            <div className="w-10 h-10 bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-6">
               <Box size={18} />
            </div>
            <p className="text-[10px] font-mono font-bold uppercase text-secondary mb-2">ALERT_INCIDENCE_LOG</p>
            <p className="text-[32px] font-bold text-on-surface italic uppercase tracking-tighter">
               {metrics?.alertCount || 0}
            </p>
            <div className="mt-8 flex items-center gap-2 text-[10px] font-mono font-bold text-secondary uppercase">
               <Clock size={12} /> RES_TIME &lt; 5MIN
            </div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
         <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
               <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                  <Activity size={12} /> HIGH_ENGAGEMENT_NODES
               </h3>
               <button className="text-[10px] font-mono font-bold text-primary uppercase hover:underline tracking-tight">Node_Map_View</button>
            </div>
            <div className="divide-y divide-outline-variant">
               {[
                  { name: 'Order_Repository_V3', hits: 1240, color: 'text-primary' },
                  { name: 'User_Identity_Auth', hits: 890, color: 'text-primary' },
                  { name: 'Logistics_Sync_Unit', hits: 420, color: 'text-secondary' },
                  { name: 'Action_Runner_Root', hits: 310, color: 'text-secondary' }
               ].map(node => (
                  <div key={node.name} className="flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors group">
                     <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-surface-container-high group-hover:bg-primary transition-colors" />
                        <span className="text-[12px] font-bold uppercase italic text-on-surface tracking-tight">{node.name}</span>
                     </div>
                     <div className="flex items-center gap-6">
                        <span className="text-[10px] font-mono font-bold text-secondary uppercase tracking-tight">{node.hits} REQS</span>
                        <ArrowRight size={14} className="text-surface-dim group-hover:text-primary transition-colors" />
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="col-span-12 lg:col-span-5 bg-white border border-outline-variant shadow-sm flex flex-col min-h-[300px]">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low">
               <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                  <Users size={12} /> ACTOR_INTENSITY_TELEMETRY
               </h3>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative group overflow-hidden">
               <div className="absolute inset-0 bg-surface-container-low opacity-20 group-hover:opacity-40 transition-all border border-dashed border-outline-variant m-4" />
               <Users size={48} className="text-surface-dim mb-4" />
               <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-secondary relative z-10">Cross_Reference_Load_Pending</p>
               <p className="text-[9px] font-mono text-outline uppercase mt-2 relative z-10">V6.0_STABLE_FEED</p>
            </div>
         </div>
      </div>
    </div>
  );
}
