import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  GitPullRequest, 
  Search, 
  ArrowRight, 
  AlertCircle,
  FileCode,
  Layout,
  PlayCircle,
  ChevronRight,
  ShieldAlert,
  Info,
  Save,
  CheckCircle2,
  RefreshCw
} from "lucide-react";
import { cn } from "../../lib/utils";
import { analysisApi } from "../../api/analysis";

export default function ImpactAnalysis() {
  const [searchParams] = useSearchParams();
  const [searchRef, setSearchRef] = useState(searchParams.get("ref") || "");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (searchParams.get("ref")) {
      runAnalysis();
    }
  }, [searchParams]);

  const runAnalysis = async () => {
    const term = searchRef || searchParams.get("ref");
    if (!term) return;
    setLoading(true);
    setSaved(false);
    try {
      const data = await analysisApi.calculateImpact(term);
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveView = async () => {
    if (!result || !searchRef) return;
    setSaving(true);
    try {
      await analysisApi.saveView({
        name: `Impact: ${searchRef}`,
        category: 'impact',
        config: { rootId: searchRef, result }
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
               <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                  <GitPullRequest size={20} />
               </div>
               <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Impact Analysis</h1>
            </div>
            <p className="text-sm text-slate-500 max-w-md font-medium">
               评估变更引发的涟漪效应。精准定位受影响的 API、下游应用与数据流向。
            </p>
         </div>

         <div className="flex gap-4">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
               <input 
                 type="text" 
                 value={searchRef}
                 onChange={(e) => setSearchRef(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && runAnalysis()}
                 placeholder="输入 ObjectType 或 Property API Name..."
                 className="h-12 pl-12 pr-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold font-mono outline-none focus:ring-4 focus:ring-blue-50 transition-all w-80 shadow-sm"
               />
            </div>
            <button 
               onClick={runAnalysis}
               className="h-12 px-8 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
               disabled={loading}
            >
               {loading ? <RefreshCw size={16} className="animate-spin" /> : 'RUN ANALYSIS'}
            </button>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 bg-slate-50/10 tech-grid">
         {loading ? (
            <div className="py-20 text-center">
               <RefreshCw size={32} className="animate-spin text-indigo-500 mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MAPS TRAVERSING DEEP RELATIONS...</p>
            </div>
         ) : result ? (
            <div className="max-w-5xl mx-auto space-y-10">
               <div className="flex justify-between items-start">
                  <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl shadow-indigo-100 flex-1 mr-8">
                     <div className="flex items-center gap-3 mb-4">
                        <ShieldAlert size={24} />
                        <h3 className="text-lg font-black uppercase italic tracking-tight">Impact Score: {result.score}</h3>
                     </div>
                     <p className="opacity-80 text-xs font-medium leading-relaxed">
                        变更 <b>{searchRef}</b> 被评估为高危变更。检测到 {result.graphData.nodes.length} 个直接/间接关联组件可能发生中断或行为漂移。
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
                     {saved ? <CheckCircle2 size={18} /> : <Save size={18} />}
                     {saved ? 'VIEW SAVED' : saving ? 'SAVING...' : 'SAVE ANALYSIS VIEW'}
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-8">
                  <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Layout size={14} /> Affected Components
                     </h4>
                     <div className="space-y-3">
                        {result.graphData.nodes.map((node: any) => (
                           <div key={node.id} className="flex items-center gap-4 p-4 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer">
                              <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                 {node.id === searchRef ? <AlertCircle size={18} className="text-red-500" /> : <PlayCircle size={18} />}
                              </div>
                              <div>
                                 <p className="text-xs font-bold text-slate-900 uppercase italic tracking-tight">{node.label}</p>
                                 <p className="text-[9px] font-mono text-slate-400">ID: {node.id}</p>
                              </div>
                              <ChevronRight size={14} className="ml-auto text-slate-200" />
                           </div>
                        ))}
                     </div>
                  </section>

                  <section className="bg-slate-900 border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-4">
                     <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 mb-4 animate-pulse">
                        <GitPullRequest size={32} />
                     </div>
                     <h4 className="text-lg font-black text-white uppercase italic tracking-tight">Graph View Active</h4>
                     <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        Interactive graph visualization is hydrated in new tab or large viewport.
                     </p>
                     <button className="px-6 py-2 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                        Open Visualization
                     </button>
                  </section>
               </div>
            </div>
         ) : (
            <div className="py-32 text-center">
               <GitPullRequest size={48} className="text-slate-200 mx-auto mb-6" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enter an API name and run analysis to map its dependencies.</p>
            </div>
         )}
      </div>
    </div>
  );
}
