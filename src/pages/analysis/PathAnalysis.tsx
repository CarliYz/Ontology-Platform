import { useState } from "react";
import { 
  GitFork, 
  Search, 
  ArrowRight, 
  Map, 
  Database, 
  DatabaseZap,
  Play,
  RotateCcw,
  RefreshCw,
  Layout,
  Activity
} from "lucide-react";
import { cn } from "../../lib/utils";
import { analysisApi, SavedView } from "../../api/analysis";

export default function PathAnalysis() {
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [path, setPath] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const runAnalysis = async () => {
    if (!source || !target) return;
    setLoading(true);
    setSaved(false);
    try {
      const data = await analysisApi.analyzePath(source, target);
      setPath(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveView = async () => {
    if (!path || !source || !target) return;
    setSaving(true);
    try {
      await analysisApi.saveView({
        name: `Path: ${source} → ${target}`,
        category: 'query',
        config: { source, target, path }
      });
      setSaved(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      <header className="p-10 border-b border-slate-100 flex justify-between items-end bg-slate-50/20">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                  <GitFork size={20} />
               </div>
               <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Path Discovery</h1>
            </div>
            <p className="text-sm text-slate-500 max-w-md font-medium">
               自动探测实体间的逻辑路径。分析多跳关系的复杂度、代价及其应用覆盖率。
            </p>
         </div>
         
         <div className="flex items-end gap-4 max-w-3xl">
            <div className="flex-1 space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">起始点 (Source Entity)</label>
               <input 
                 type="text" 
                 value={source}
                 onChange={(e) => setSource(e.target.value)}
                 placeholder="例如: User" 
                 className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold font-mono outline-none focus:ring-4 focus:ring-blue-50 transition-all w-48 shadow-sm"
               />
            </div>
            <div className="pb-4">
               <ArrowRight className="text-slate-300" size={24} />
            </div>
            <div className="flex-1 space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">终点 (Target Entity)</label>
               <input 
                 type="text" 
                 value={target}
                 onChange={(e) => setTarget(e.target.value)}
                 placeholder="例如: Transaction" 
                 className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold font-mono outline-none focus:ring-4 focus:ring-blue-50 transition-all w-48 shadow-sm"
               />
            </div>
            <button 
               onClick={runAnalysis}
               className="h-12 px-8 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200"
               disabled={loading}
            >
               {loading ? <RefreshCw size={16} className="animate-spin" /> : 'FIND PATH'}
            </button>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 bg-slate-50/10 tech-grid">
         {loading ? (
            <div className="py-20 text-center">
               <RefreshCw size={32} className="animate-spin text-emerald-500 mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CALCULATING SHORTEST LOGICAL PATHS...</p>
            </div>
         ) : path ? (
            <div className="max-w-5xl mx-auto space-y-10 animate-fade-in">
               <div className="flex justify-between items-start">
                  <div className="bg-emerald-600 text-white p-8 rounded-3xl shadow-xl shadow-emerald-100 flex-1 mr-8">
                     <div className="flex items-center gap-3 mb-4">
                        <Map size={24} />
                        <h3 className="text-lg font-black uppercase italic tracking-tight">Optimal Path Discovered</h3>
                     </div>
                     <p className="opacity-80 text-xs font-medium leading-relaxed">
                        从 <b>{source}</b> 到 <b>{target}</b> 发现一条 {path.steps.length - 1} 跳路径。复杂度得分为 {path.complexity}，目前建议保持现有的缓存策略。
                     </p>
                  </div>
                  
                  <button 
                    onClick={handleSaveView}
                    disabled={saving || saved}
                    className={cn(
                      "h-16 px-8 rounded-3xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all",
                      saved ? "bg-green-500 text-white" : "bg-white border border-slate-200 text-slate-900 hover:shadow-xl"
                    )}
                  >
                     {saved ? 'PATH SAVED' : saving ? 'SAVING...' : 'SAVE PATH VIEW'}
                  </button>
               </div>

               {/* Visual Path Display */}
               <div className="bg-white border border-slate-100 rounded-3xl p-12 flex flex-col items-center gap-12 shadow-sm relative">
                  <div className="flex items-center gap-8">
                     {path.steps.map((step: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-8">
                           <div className="flex flex-col items-center gap-3 transition-transform hover:scale-110">
                              <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-xl",
                                step.type === 'link' ? "bg-purple-500" : "bg-emerald-600"
                              )}>
                                 <Database size={28} />
                              </div>
                              <div className="text-center">
                                 <p className="text-sm font-bold text-slate-900 uppercase italic tracking-tight">{step.id}</p>
                                 <p className="text-[9px] text-slate-400 font-mono uppercase tracking-widest">{step.type}</p>
                              </div>
                           </div>
                           {idx < path.steps.length - 1 && (
                              <div className="flex flex-col items-center gap-2">
                                 <div className="w-24 h-px bg-slate-200 relative group">
                                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                                 </div>
                              </div>
                           )}
                        </div>
                     ))}
                  </div>

                  <div className="absolute top-6 right-6">
                     <button 
                       onClick={() => setPath(null)}
                       className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
                     >
                       <RotateCcw size={18} />
                     </button>
                  </div>
               </div>

               {/* Path Properties */}
               <div className="grid grid-cols-2 gap-8">
                  <section className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 shadow-sm">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Activity size={14} /> Path Properties
                     </h4>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400 font-bold uppercase tracking-tight">Hops Count</span>
                           <span className="font-mono font-black text-slate-900">{path.steps.length - 1}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400 font-bold uppercase tracking-tight">Complexity Score</span>
                           <span className="font-mono font-black text-slate-900">{path.complexity}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-slate-400 font-bold uppercase tracking-tight">Estimated Latency</span>
                           <span className="font-mono font-black text-emerald-500">LOW ({"<"}5ms)</span>
                        </div>
                     </div>
                  </section>

                  <div className="bg-white border border-slate-100 rounded-3xl p-8 space-y-6 shadow-sm">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Layout size={14} /> Potential Consumers
                     </h4>
                     <div className="space-y-2">
                        {['Global Sales Dash', 'Audit Tool', 'Warehouse Manager'].map(app => (
                          <div key={app} className="flex items-center justify-between text-xs p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer group">
                             <span className="text-sm font-bold text-slate-900 italic uppercase tracking-tight">{app}</span>
                             <ArrowRight size={14} className="text-slate-200 group-hover:text-emerald-500 transition-colors" />
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         ) : (
            <div className="py-32 text-center">
               <GitFork size={48} className="text-slate-200 mx-auto mb-6" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enter source and target entities to discover logical paths.</p>
            </div>
         )}
      </div>
    </div>
  );
}
