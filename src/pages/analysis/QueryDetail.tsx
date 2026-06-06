import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Terminal, 
  Clock, 
  Database, 
  User, 
  Shield, 
  Zap,
  Activity,
  Code2,
  ChevronRight,
  Info,
  RefreshCw
} from "lucide-react";
import { cn } from "../../lib/utils";
import { analysisApi, QueryEvent } from "../../api/analysis";

export default function QueryDetail() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<QueryEvent | null>(null);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'explain' | 'raw'>('overview');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [eventData, planData] = await Promise.all([
          analysisApi.getQueryEvent(id),
          analysisApi.explainQuery(id)
        ]);
        setEvent(eventData);
        setPlan(planData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-white">
       <RefreshCw size={32} className="animate-spin text-blue-500" />
    </div>
  );

  if (!event) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white">
       <p className="text-slate-400 font-bold">Query trace not found</p>
       <Link to="/analysis/queries" className="mt-4 text-blue-600 hover:underline">Back to Explorer</Link>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-white font-sans overflow-hidden">
      <header className="p-8 border-b border-slate-100 shrink-0 bg-slate-50/20">
         <Link to="/analysis/queries" className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-6 group text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            返回查询监视器
         </Link>
         
         <div className="flex justify-between items-start">
            <div className="space-y-2">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                     <Terminal size={20} />
                  </div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase italic">Execution Trace Analysis</h1>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 pl-1">
                  <span className="flex items-center gap-1"><Shield size={12} /> ID: {event.id}</span>
                  <span className="w-1 h-1 bg-slate-200 rounded-full" />
                  <span className="flex items-center gap-1"><Activity size={12} /> TID: {event.traceId}</span>
               </div>
            </div>

            <div className="flex border border-slate-200 rounded-2xl p-1 bg-white shadow-sm overflow-hidden">
               {['overview', 'explain', 'raw'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl",
                      activeTab === tab ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {tab}
                  </button>
               ))}
            </div>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 bg-slate-50/10 tech-grid">
         <div className="max-w-5xl mx-auto">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                 <div className="grid grid-cols-4 gap-6">
                    <StatCard label="Response Time" value={`${event.durationMs}ms`} icon={Clock} color="text-blue-500" />
                    <StatCard label="Results" value={event.resultCount} icon={Database} color="text-indigo-500" />
                    <StatCard label="Cost Units" value={plan?.cost.toFixed(1)} icon={Zap} color="text-amber-500" />
                    <StatCard label="Actor" value={event.actorId} icon={User} color="text-slate-500" />
                 </div>

                 <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                       <Info size={16} className="text-blue-500" />
                       Query Parameters
                    </h3>
                    <div className="bg-slate-50 rounded-2xl p-6 font-mono text-xs text-slate-600 leading-relaxed overflow-x-auto whitespace-pre">
                       {JSON.stringify(JSON.parse(event.parameters || '{}'), null, 2)}
                    </div>
                 </section>
              </div>
            )}

            {activeTab === 'explain' && (
               <div className="space-y-8">
                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                     <div className="px-8 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Explain Plan Steps</span>
                        <span>Complexity Score: {plan?.cost}</span>
                     </div>
                     <div className="p-8 space-y-4">
                        {plan?.steps.map((step: any, idx: number) => (
                           <div key={idx} className="flex items-center gap-6 group">
                              <div className="relative">
                                 <div className="w-12 h-12 bg-white border-2 border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:border-blue-500 group-hover:text-blue-600 transition-all z-10 relative">
                                    <Database size={20} />
                                 </div>
                                 {idx < plan.steps.length - 1 && (
                                    <div className="absolute top-12 left-1/2 w-0.5 h-4 bg-slate-100 -translate-x-1/2" />
                                 )}
                              </div>
                              <div className="flex-1 bg-slate-50/50 border border-slate-50 p-4 rounded-2xl group-hover:bg-blue-50/30 group-hover:border-blue-100 transition-all">
                                 <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-bold text-slate-900 uppercase italic tracking-tight">{step.name}</span>
                                    <span className="text-[10px] font-mono text-slate-400">COST: {step.cost}</span>
                                 </div>
                                 <p className="text-xs text-slate-500">{step.detail}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                           <Database size={14} /> Data Sources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                           {plan?.dataSources.map((ds: string) => (
                              <span key={ds} className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl text-[10px] font-bold uppercase tracking-tight">
                                 {ds}
                              </span>
                           ))}
                        </div>
                     </section>
                     <section className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
                           <Zap size={14} /> Performance Tip
                        </h4>
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                           当前查询包含<b>投影映射(Projection)</b>步骤。建议在主查询中限制字段筛选(Select fields)，可减少约 15% 的内存复制开销。
                        </p>
                     </section>
                  </div>
               </div>
            )}

            {activeTab === 'raw' && (
               <section className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="px-8 py-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                     </div>
                     <span className="text-[10px] text-slate-500 font-mono">trace_data.json</span>
                  </div>
                  <div className="p-8 font-mono text-[11px] text-cyan-400 overflow-x-auto whitespace-pre leading-relaxed">
                     {JSON.stringify(event, null, 2)}
                  </div>
               </section>
            )}
         </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
   return (
      <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm space-y-4">
         <div className={cn("w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center transition-colors", color)}>
            <Icon size={18} />
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
            <p className="text-xl font-black text-slate-900 tracking-tight italic">{value}</p>
         </div>
      </div>
   );
}
