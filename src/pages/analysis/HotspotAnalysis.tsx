import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Clock, 
  Activity, 
  Database, 
  ChevronRight,
  Filter,
  RefreshCw,
  Zap,
  BarChart2,
  AlertTriangle
} from "lucide-react";
import { cn } from "../../lib/utils";
import { analysisApi, Hotspot } from "../../api/analysis";

type Window = '1h' | '24h' | '7d';

export default function HotspotAnalysis() {
  const [window, setWindow] = useState<Window>('24h');
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHotspots = async () => {
    setLoading(true);
    try {
      const data = await analysisApi.getHotspots(window);
      setHotspots(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
  }, [window]);

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      <header className="p-10 border-b border-slate-100 flex justify-between items-end bg-slate-50/20">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-amber-100">
                  <TrendingUp size={20} />
               </div>
               <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Hotspot Analysis</h1>
            </div>
            <p className="text-sm text-slate-500 max-w-md font-medium">
               识别图谱中的性能瓶颈与流量高地。通过实时快照发现由于高负载导致的延迟抖动。
            </p>
         </div>

         <div className="flex bg-slate-100 p-1 rounded-2xl shadow-inner">
            {(['1h', '24h', '7d'] as Window[]).map((w) => (
               <button
                 key={w}
                 onClick={() => setWindow(w)}
                 className={cn(
                   "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl",
                   window === w ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                 {w} Window
               </button>
            ))}
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 tech-grid">
         <div className="max-w-6xl mx-auto space-y-12">
            
            <div className="grid grid-cols-3 gap-8">
               <SummaryStat label="Active Hotspots" value={hotspots.length} icon={Activity} color="text-amber-500" />
               <SummaryStat label="Traffic Intensity" value={hotspots.reduce((acc, h) => acc + h.intensity, 0).toFixed(0)} icon={Zap} color="text-blue-500" />
               <SummaryStat label="Snapshot Interval" value={window} icon={Clock} color="text-slate-500" />
            </div>

            <section className="space-y-6">
               <div className="flex justify-between items-end">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">热点实体排行 (Top 20)</h3>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">
                     LAST UPDATE: {new Date().toLocaleTimeString()}
                  </div>
               </div>

               {loading ? (
                  <div className="py-20 text-center">
                     <RefreshCw size={32} className="animate-spin text-amber-500 mx-auto mb-4" />
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ANALYZING TRAFFIC PATTERNS...</p>
                  </div>
               ) : hotspots.length === 0 ? (
                  <div className="py-20 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                     <AlertTriangle size={32} className="text-slate-200 mx-auto mb-4" />
                     <p className="text-xs text-slate-400 uppercase font-black">No hotspots detected in this window</p>
                  </div>
               ) : (
                  <div className="space-y-3">
                     {hotspots.map((h, i) => (
                        <div key={h.id} className="bg-white border border-slate-100 p-6 rounded-3xl hover:border-amber-500 transition-all group flex items-center justify-between shadow-sm hover:shadow-xl hover:shadow-amber-50/50">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all font-mono font-black text-sm">
                                 #{i + 1}
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase italic mb-1">{h.targetRef}</h4>
                                 <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                                    <div className="flex items-center gap-1.5 uppercase">
                                       <Activity size={10} />
                                       {h.hitCount} Hits
                                    </div>
                                    <div className="flex items-center gap-1.5 uppercase">
                                       <Zap size={10} />
                                       Intensity: {h.intensity.toFixed(1)}
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-8 text-right">
                              <div className="w-48 h-2 bg-slate-50 rounded-full overflow-hidden">
                                 <div 
                                   className="bg-amber-400 h-full transition-all duration-1000" 
                                   style={{ width: `${Math.min(100, (h.intensity / (hotspots[0].intensity || 1)) * 100)}%` }} 
                                 />
                              </div>
                              <ChevronRight size={18} className="text-slate-200 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </section>
         </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, icon: Icon, color }: any) {
   return (
      <div className="bg-slate-50/50 border border-slate-100 p-8 rounded-3xl space-y-4">
         <div className={cn("w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center", color)}>
            <Icon size={20} />
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{value}</p>
         </div>
      </div>
   );
}
