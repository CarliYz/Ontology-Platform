import { useState, useEffect } from "react";
import { useParams, NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Activity, 
  ExternalLink,
  Plus,
  Settings2,
  Database
} from "lucide-react";
import { cn } from "../../lib/utils";
import { appApi, AppPage } from "../../api/app";
import { analysisApi, Hotspot, SavedView } from "../../api/analysis";

export default function Dashboard() {
  const { appId, pageId } = useParams<{ appId: string, pageId: string }>();
  const [page, setPage] = useState<AppPage | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  useEffect(() => {
    if (pageId) {
      appApi.getAppPages(appId!).then(pages => {
        const p = pages.find(it => it.id === pageId);
        setPage(p || null);
      }).catch(console.error);

      analysisApi.getHotspots('24h').then(setHotspots).catch(console.error);
      analysisApi.getSavedViews().then(setSavedViews).catch(console.error);
    }
  }, [pageId, appId]);

  if (!page) return null;

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      <header className="p-10 border-b border-slate-100 bg-white shrink-0">
         <div className="flex justify-between items-end">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                     <LayoutDashboard size={20} />
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">{page.name}</h1>
               </div>
               <p className="text-xs text-slate-500 max-w-md font-medium">
                  综合业务看板。实时观测全域指标，通过绑定 SavedView 沉淀多维度分析视角。
               </p>
            </div>
            
            <div className="flex gap-4">
               <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 shadow-sm transition-all">
                  <Settings2 size={16} /> CONFIGURE
               </button>
               <button className="h-12 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200">
                  <TrendingUp size={16} /> SHARE VIEW
               </button>
            </div>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 tech-grid">
         <div className="max-w-7xl mx-auto space-y-12">
            
            {/* Stat Summary */}
            <div className="grid grid-cols-4 gap-8">
               <DashboardStat label="Total Records" value="1,284" icon={Database} color="indigo" />
               <DashboardStat label="Action Velocity" value="48/hr" icon={Zap} color="amber" />
               <DashboardStat label="System Health" value="99.9%" icon={Activity} color="emerald" />
               <DashboardStat label="Query Intensity" value="4.2k" icon={TrendingUp} color="blue" />
            </div>

            <div className="grid grid-cols-12 gap-10">
               {/* Left: Hotspots (Slot: analysis) */}
               <div className="col-span-12 lg:col-span-7 space-y-6">
                  <div className="flex justify-between items-end">
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">实时流量高地 (Hotspots)</h3>
                     <NavLink to="/analysis/hotspots" className="text-[10px] font-black text-indigo-600 hover:underline uppercase">View Explorer</NavLink>
                  </div>
                  
                  <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-6">
                     {hotspots.slice(0, 5).map((h, i) => (
                        <div key={h.id} className="flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-mono font-black text-[10px] text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                 {i + 1}
                              </div>
                              <div>
                                 <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{h.targetRef}</p>
                                 <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase mt-1">
                                    <span>Intensity: {h.intensity.toFixed(1)}</span>
                                    <span>•</span>
                                    <span>{h.hitCount} Hits</span>
                                 </div>
                              </div>
                           </div>
                           <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, (h.intensity / (hotspots[0]?.intensity || 1)) * 100)}%` }} />
                           </div>
                        </div>
                     ))}
                  </div>
               </div>

               {/* Right: Saved Views (Slot: views) */}
               <div className="col-span-12 lg:col-span-5 space-y-6">
                  <div className="flex justify-between items-end">
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">绑定的分析视图 (Bound Views)</h3>
                  </div>

                  <div className="space-y-4">
                     {savedViews.length === 0 ? (
                        <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
                           <BarChart3 size={32} className="text-slate-100 mx-auto mb-4" />
                           <p className="text-[10px] font-black uppercase text-slate-400">No Views Bound</p>
                        </div>
                     ) : (
                        savedViews.map(view => (
                           <div key={view.id} className="bg-white border border-slate-100 p-6 rounded-3xl hover:border-slate-900 transition-all group flex items-center justify-between shadow-sm">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                                    <BarChart3 size={20} />
                                 </div>
                                 <div>
                                    <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{view.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">{view.category}</p>
                                 </div>
                              </div>
                              <NavLink 
                                 to={`/analysis/${view.category === 'impact' ? 'impact' : 'paths'}?saved=${view.id}`}
                                 className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 hover:text-slate-900 transition-colors"
                              >
                                 <ExternalLink size={16} />
                              </NavLink>
                           </div>
                        ))
                     )}

                     <button className="w-full py-6 border border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all flex flex-col items-center justify-center gap-2">
                        <Plus size={20} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Connect Saved View</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function DashboardStat({ label, value, icon: Icon, color }: any) {
   const colors: any = {
      indigo: "bg-indigo-50 text-indigo-600 shadow-indigo-100",
      amber: "bg-amber-50 text-amber-600 shadow-amber-100",
      emerald: "bg-emerald-50 text-emerald-600 shadow-emerald-100",
      blue: "bg-blue-50 text-blue-600 shadow-blue-100"
   };

   return (
      <div className="bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm space-y-4">
         <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", colors[color])}>
            <Icon size={20} />
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">{value}</p>
         </div>
      </div>
   );
}
