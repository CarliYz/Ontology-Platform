import { useState, useEffect } from "react";
import { 
  Zap, 
  Settings2, 
  Plus, 
  Trash2, 
  Play, 
  ShieldCheck,
  Save,
  Database,
  Terminal,
  Globe,
  PlusCircle,
  Activity,
  History,
  RefreshCw
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useParams, useNavigate } from "react-router-dom";
import { Action, ActionParameter, GuardPolicy } from "../../types/action";
import { actionApi } from "../../api/action";
import { runApi } from "../../api/run";
import { generateIdempotencyKey } from "../../lib/idempotency";
import Modal from "../../components/shared/Modal";

export default function ActionTypeBuilder() {
  const { ontologyId } = useParams();
  const navigate = useNavigate();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActionId, setSelectedActionId] = useState<string | null>(null);
  
  const selectedAction = actions.find(a => a.id === selectedActionId) || null;
  const [activeTab, setActiveTab] = useState<'logic' | 'params' | 'config'>('logic');
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [testInputs, setTestInputs] = useState<Record<string, any>>({});
  const [modalType, setModalType] = useState<string | null>(null);

  const fetchActions = async () => {
    try {
      const data = await actionApi.getActions();
      setActions(data);
      if (data.length > 0 && !selectedActionId) {
        setSelectedActionId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch actions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  const updateActionState = (id: string, updates: Partial<Action>) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const getParameters = (): ActionParameter[] => {
    try {
      return JSON.parse(selectedAction?.parameters || "[]");
    } catch {
       return [];
    }
  };

  const setParameters = (params: ActionParameter[]) => {
    if (!selectedActionId) return;
    updateActionState(selectedActionId, { parameters: JSON.stringify(params) });
  };

  const getGuardPolicy = (): GuardPolicy => {
    try {
      return JSON.parse(selectedAction?.guardPolicy || "{}") as GuardPolicy;
    } catch {
      return { requireApproval: false, dryRun: false };
    }
  };

  const setGuardPolicy = (policy: Partial<GuardPolicy>) => {
    if (!selectedActionId) return;
    const current = getGuardPolicy();
    updateActionState(selectedActionId, { guardPolicy: JSON.stringify({ ...current, ...policy }) });
  };

  const addParameter = () => {
    const params = getParameters();
    const newParam: ActionParameter = {
      id: `p-${Date.now()}`,
      displayName: 'newParam',
      name: `param${params.length + 1}`,
      type: 'String',
      required: false
    };
    setParameters([...params, newParam]);
  };

  const removeParameter = (id: string) => {
    setParameters(getParameters().filter(p => p.id !== id));
  };

  const handleExecute = async () => {
    if (!selectedActionId) return;
    setIsExecuting(true);
    const key = generateIdempotencyKey(selectedActionId, 'admin', testInputs);
    try {
      const run = await actionApi.executeAction(selectedActionId, testInputs, key);
      navigate(`/actions/runs/${run.id}`);
    } catch (err: any) {
      alert("Execution Denied: " + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const saveAction = async () => {
    if (!selectedAction) return;
    try {
      await actionApi.updateAction(selectedAction.id, selectedAction);
      setModalType('saveSuccess');
    } catch (err) {
      console.error("Failed to save action", err);
    }
  };

  const createNewAction = async () => {
    try {
      const name = prompt("Enter Action Name:");
      if (!name) return;
      const newAction = await actionApi.createAction({
        displayName: name,
        apiName: name.toLowerCase().replace(/\s+/g, '_'),
        parameters: "[]",
        guardPolicy: JSON.stringify({ requireApproval: false, dryRun: false }),
        script: "// Write implementation here"
      });
      setActions([newAction, ...actions]);
      setSelectedActionId(newAction.id);
    } catch (err) {
       console.error(err);
    }
  };

  return (
    <div className="flex h-full bg-white font-sans relative">
      <Modal 
        isOpen={modalType === 'saveSuccess'} 
        onClose={() => setModalType(null)}
        title="发布成功"
        type="success"
      >
        动作定义已发布至实时执行域轨道。
      </Modal>

      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/30 shrink-0">
        <header className="p-6 border-b border-slate-100 flex flex-col gap-4">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-100">
                 <Zap size={20} />
              </div>
              <h2 className="text-lg font-black text-slate-800 uppercase italic tracking-tight">Actions</h2>
           </div>
           <button 
             onClick={createNewAction}
             className="w-full h-11 bg-slate-900 text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-all"
           >
              <PlusCircle size={16} /> Create New
           </button>
           <button 
             onClick={() => navigate('/actions/runs')}
             className="w-full h-11 bg-white border border-slate-200 text-slate-600 rounded-xl flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
           >
              <Activity size={16} /> Run Center
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
           {actions.map(action => (
             <button 
               key={action.id}
               onClick={() => setSelectedActionId(action.id)}
               className={cn(
                 "w-full p-4 rounded-2xl text-left transition-all border group",
                 selectedActionId === action.id 
                   ? "bg-white border-blue-500 shadow-xl shadow-blue-50 ring-1 ring-blue-500/10" 
                   : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
               )}
             >
                <div className="flex justify-between items-start mb-2">
                   <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                      <Terminal size={14} />
                   </div>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <History size={12} className="text-slate-300" />
                   </div>
                </div>
                <h3 className="text-sm font-black text-slate-800 truncate mb-1">{action.displayName}</h3>
                <p className="text-[10px] font-mono text-slate-400">/{action.apiName}</p>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
         {selectedAction ? (
           <>
             <header className="h-20 px-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                      <Database size={18} />
                   </div>
                   <div>
                      <h1 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">{selectedAction.displayName}</h1>
                      <p className="text-[10px] text-slate-400 font-mono tracking-widest">{selectedAction.id}</p>
                   </div>
                </div>
                <div className="flex gap-3">
                   <button 
                     onClick={() => setIsExecuting(true)}
                     className="h-10 px-6 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 flex items-center gap-2 font-mono"
                   >
                      <Play size={14} fill="currentColor" /> 执行任务 (Execute)
                   </button>
                   <button 
                     onClick={saveAction}
                     className="h-10 px-8 bg-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-200 flex items-center gap-2"
                   >
                      <Save size={14} /> 发布定义
                   </button>
                </div>
             </header>

             <div className="flex-1 overflow-hidden flex flex-col p-8">
                <div className="flex gap-10 border-b border-slate-100 mb-8 overflow-x-auto scrollbar-hide">
                   {[
                     { id: 'logic', label: '业务逻辑', icon: Terminal },
                     { id: 'params', label: '参数方案', icon: Globe },
                     { id: 'config', label: '守卫策略 (Guards)', icon: ShieldCheck }
                   ].map(tab => (
                     <button 
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id as any)}
                       className={cn(
                         "pb-4 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 transition-all relative whitespace-nowrap",
                         activeTab === tab.id ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                       )}
                     >
                        <tab.icon size={14} />
                        {tab.label}
                        {activeTab === tab.id && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full shadow-lg shadow-blue-400" />
                        )}
                     </button>
                   ))}
                </div>

                <div className="flex-1 overflow-y-auto pr-4 space-y-8 pb-12 custom-scrollbar">
                   {activeTab === 'logic' && (
                     <div className="h-full bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl relative">
                        <textarea 
                           value={selectedAction.script}
                           onChange={(e) => updateActionState(selectedAction.id, { script: e.target.value })}
                           className="w-full h-[500px] bg-transparent text-emerald-400 font-mono text-[13px] leading-relaxed resize-none outline-none border-none custom-scrollbar"
                           spellCheck={false}
                        />
                     </div>
                   )}

                   {activeTab === 'params' && (
                     <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                           <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input Parameters</h4>
                           <button onClick={addParameter} className="text-xs font-black text-blue-600 hover:underline">Add Param +</button>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                           {getParameters().map(param => (
                             <div key={param.id} className="bg-white border border-slate-100 p-6 rounded-2xl flex items-center justify-between group hover:border-blue-500 transition-all shadow-sm">
                                <div className="flex items-center gap-6 flex-1">
                                   <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-mono text-[10px] font-bold text-slate-400 group-hover:text-blue-500">
                                      {param.type.toUpperCase().slice(0, 3)}
                                   </div>
                                   <div className="flex-1">
                                      <input 
                                        type="text" 
                                        value={param.displayName}
                                        onChange={(e) => setParameters(getParameters().map(p => p.id === param.id ? { ...p, displayName: e.target.value } : p))}
                                        className="font-bold text-slate-800 bg-transparent border-none p-0 focus:ring-0 w-full"
                                      />
                                      <input 
                                        type="text" 
                                        value={param.name}
                                        onChange={(e) => setParameters(getParameters().map(p => p.id === param.id ? { ...p, name: e.target.value } : p))}
                                        className="text-[10px] font-mono text-slate-400 italic block mt-1 outline-none"
                                      />
                                   </div>
                                </div>
                                <button onClick={() => removeParameter(param.id)} className="p-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Trash2 size={18} />
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {activeTab === 'config' && (
                     <div className="max-w-2xl space-y-8">
                        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 space-y-8">
                           <div className="flex items-center justify-between">
                              <div>
                                 <h4 className="text-sm font-black text-slate-800 uppercase italic">Require Approval</h4>
                                 <p className="text-xs text-slate-400 font-medium">执行前必须经过人工审核权限。</p>
                              </div>
                              <button 
                                onClick={() => setGuardPolicy({ requireApproval: !getGuardPolicy().requireApproval })}
                                className={cn(
                                  "w-12 h-6 rounded-full transition-all relative",
                                  getGuardPolicy().requireApproval ? "bg-blue-600" : "bg-slate-200"
                                )}
                              >
                                 <div className={cn(
                                   "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                   getGuardPolicy().requireApproval ? "left-7" : "left-1"
                                 )} />
                              </button>
                           </div>

                           <div className="flex items-center justify-between">
                              <div>
                                 <h4 className="text-sm font-black text-slate-800 uppercase italic">Dry Run Mode</h4>
                                 <p className="text-xs text-slate-400 font-medium">仅模拟执行逻辑，不提交持久化变更。</p>
                              </div>
                              <button 
                                onClick={() => setGuardPolicy({ dryRun: !getGuardPolicy().dryRun })}
                                className={cn(
                                  "w-12 h-6 rounded-full transition-all relative",
                                  getGuardPolicy().dryRun ? "bg-amber-500" : "bg-slate-200"
                                )}
                              >
                                 <div className={cn(
                                   "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                                   getGuardPolicy().dryRun ? "left-7" : "left-1"
                                 )} />
                              </button>
                           </div>

                           <div className="space-y-4">
                              <h4 className="text-sm font-black text-slate-800 uppercase italic">Rate Limit (Runs/Min)</h4>
                              <input 
                                type="number" 
                                value={getGuardPolicy().rateLimit || 10}
                                onChange={(e) => setGuardPolicy({ rateLimit: parseInt(e.target.value) })}
                                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                              />
                           </div>
                        </div>

                        <div className="p-8 border border-slate-100 rounded-3xl bg-blue-50/20">
                           <div className="flex items-start gap-4">
                              <ShieldCheck className="text-blue-500 mt-1" size={20} />
                              <div>
                                 <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Security Enforcement</h4>
                                 <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                    守卫策略（Guards）集成在运行时网关中。任何违反策略的行为将导致 403 PERMISSION_DENIED 且不产生 Run 实例。
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
             </div>
           </>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 transform -rotate-12">
                 <Zap size={48} fill="currentColor" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-lg font-black text-slate-800 uppercase italic tracking-tight">Select Action</h3>
                 <p className="text-sm text-slate-400 font-medium max-w-xs">从侧边栏选择一个动作类型开始定义逻辑与守卫策略。</p>
              </div>
           </div>
         )}
      </div>

      {/* Execution Overlay */}
      {isExecuting && (
        <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-center justify-center">
           <div className="text-center space-y-4">
              <RefreshCw className="animate-spin text-white mx-auto" size={48} />
              <p className="text-white font-black uppercase tracking-[0.2em] italic">Dispatching Execution...</p>
           </div>
        </div>
      )}

      {/* Manual Test Trigger */}
      {selectedAction && !isExecuting && (
        <Modal 
          isOpen={modalType === 'testInputs'}
          onClose={() => setModalType(null)}
          title="Manual Execute"
          type="info"
        >
           <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                 {getParameters().map(p => (
                   <div key={p.id} className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-600">{p.displayName}</label>
                      <input 
                        type="text" 
                        placeholder={p.type}
                        onChange={(e) => setTestInputs(prev => ({ ...prev, [p.name]: e.target.value }))}
                        className="w-full h-11 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-none"
                      />
                   </div>
                 ))}
              </div>
              <button 
                onClick={handleExecute}
                className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
              >
                 Confirm Execution
              </button>
           </div>
        </Modal>
      )}
    </div>
  );
}
