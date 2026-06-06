import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  Play, 
  Clock, 
  Terminal, 
  RefreshCw, 
  XSquare,
  CheckCircle2,
  AlertCircle,
  Hash,
  Database
} from "lucide-react";
import { runApi, Run } from "../../api/run";
import { cn } from "../../lib/utils";

export default function RunDetail() {
  const { runId } = useParams();
  const navigate = useNavigate();
  const [run, setRun] = useState<Run | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!runId) return;
    try {
      const data = await runApi.getRun(runId);
      setRun(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // More frequent polling for detail
    return () => clearInterval(interval);
  }, [runId]);

  const handleCancel = async () => {
    if (!runId) return;
    try {
      await runApi.cancelRun(runId);
      fetchData();
    } catch (err) {
      alert("Cancellation failed: " + err);
    }
  };

  const handleRetry = async () => {
    if (!runId) return;
    try {
      const newRun = await runApi.retryRun(runId);
      navigate(`/actions/runs/${newRun.id}`);
    } catch (err) {
      alert("Retry failed: " + err);
    }
  };

  if (loading && !run) return null;
  if (!run) return <div>Run not found</div>;

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="p-6 bg-white border-b border-tech flex items-center justify-between">
         <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/actions/runs')}
              className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-all"
            >
               <ChevronLeft size={20} />
            </button>
            <div>
               <div className="flex items-center gap-3">
                  <h1 className="text-lg font-black text-slate-900 uppercase italic">Run Detail</h1>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-mono text-[10px] border border-slate-200">
                     {run.id}
                  </span>
               </div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Action: {run.action?.displayName} ({run.action?.apiName})
               </p>
            </div>
         </div>

         <div className="flex gap-3">
            {run.status === 'running' || run.status === 'queued' ? (
               <button 
                 onClick={handleCancel}
                 className="h-10 px-6 bg-white border border-red-200 text-red-500 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 transition-all"
               >
                  <XSquare size={14} /> 取消任务
               </button>
            ) : (
               <button 
                 onClick={handleRetry}
                 className="h-10 px-6 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
               >
                  <RefreshCw size={14} /> 重新重试 (Retry)
               </button>
            )}
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8">
         <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8">
            {/* Main Content */}
            <div className="col-span-8 space-y-8">
               {/* execution Steps */}
               <section className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <Terminal size={14} /> Execution Trace (Logs)
                     </div>
                  </div>
                  <div className="p-8 space-y-6">
                     {run.steps?.map((step, i) => (
                        <div key={step.id} className="relative flex gap-6">
                           {i !== (run.steps?.length || 0) - 1 && (
                              <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-slate-100" />
                           )}
                           <div className={cn(
                             "w-6 h-6 rounded-full border-4 border-white shadow-sm flex-shrink-0 z-10",
                             step.status === 'COMPLETED' ? "bg-emerald-500" : "bg-blue-500"
                           )} />
                           <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-start">
                                 <h4 className="text-sm font-bold text-slate-800">{step.name}</h4>
                                 <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(step.startTime).toLocaleTimeString()}
                                 </span>
                              </div>
                              <div className="p-4 bg-slate-900 text-slate-400 font-mono text-[10px] rounded-xl leading-relaxed whitespace-pre-wrap">
                                 {step.logs || "No logs entry."}
                              </div>
                           </div>
                        </div>
                     ))}
                     {(!run.steps || run.steps.length === 0) && (
                        <div className="text-center py-12">
                           <RefreshCw size={24} className="animate-spin text-slate-200 mx-auto mb-3" />
                           <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">等待日志生成...</p>
                        </div>
                     )}
                  </div>
               </section>

               {/* IO Inspection */}
               <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Input Payload</span>
                     <pre className="p-4 bg-slate-50 rounded-xl text-[10px] font-mono text-slate-600 overflow-auto max-h-48">
                        {JSON.stringify(JSON.parse(run.input || "{}"), null, 2)}
                     </pre>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">Output Payload</span>
                     {run.output ? (
                        <pre className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] font-mono text-emerald-700 overflow-auto max-h-48">
                           {JSON.stringify(JSON.parse(run.output), null, 2)}
                        </pre>
                     ) : run.error ? (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                           <span className="text-[10px] font-bold text-red-700 block mb-1">EXECUTION_ERROR</span>
                           <p className="text-[10px] font-mono text-red-600">{run.error}</p>
                        </div>
                     ) : (
                        <div className="p-12 text-center border border-dashed border-slate-100 rounded-xl">
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">等待输出结果</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Sidebar Stats */}
            <div className="col-span-4 space-y-6">
               <div className="bg-white border border-slate-200 rounded-3xl p-6">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 block">Execution Summary</span>
                  <div className="space-y-6">
                     <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-xs text-slate-500 font-medium">Status</span>
                        <div className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                          run.status === 'succeeded' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                          run.status === 'failed' ? "bg-red-50 text-red-600 border-red-100" :
                          "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                           {run.status}
                        </div>
                     </div>
                     <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-xs text-slate-500 font-medium">Idempotency Key</span>
                        <span className="text-[10px] font-mono text-slate-400">{run.idempotencyKey || "N/A"}</span>
                     </div>
                     <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                        <span className="text-xs text-slate-500 font-medium">Duration</span>
                        <span className="text-xs font-bold text-slate-900">
                           {run.updatedAt ? (
                             `${Math.floor((new Date(run.updatedAt).getTime() - new Date(run.createdAt).getTime()) / 1000)}s`
                           ) : "-"}
                        </span>
                     </div>
                     {run.parentRunId && (
                       <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-medium">Retry Of</span>
                          <button 
                            onClick={() => navigate(`/actions/runs/${run.parentRunId}`)}
                            className="text-[10px] font-mono text-blue-500 hover:underline"
                          >
                             {run.parentRunId.slice(0, 8)}
                          </button>
                       </div>
                     )}
                  </div>
               </div>

               <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-300">
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-6">
                        <Database size={20} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environment Node</span>
                     </div>
                     <h3 className="text-xl font-black italic mb-2 italic">Production-Primary</h3>
                     <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                        Running in domain: ontology-execution-v3. Cluster: ais-west-2.
                     </p>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Connection</span>
                     </div>
                  </div>
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
