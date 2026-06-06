import { useState } from "react";
import { 
  Briefcase, 
  Inbox, 
  Pin, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Activity,
  Box,
  User,
  Star
} from "lucide-react";
import { cn } from "../../lib/utils";

export default function Workspace() {
  const [activeSegment, setActiveSegment] = useState<'tasks' | 'pins'>('tasks');

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      <header className="p-10 border-b border-slate-100 bg-white shrink-0">
         <div className="flex justify-between items-end mb-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                     <Briefcase size={20} />
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Personal Workspace</h1>
               </div>
               <p className="text-xs text-slate-500 max-w-md font-medium">
                  个人工作集合。汇总待办任务与高频关注的实体记录，快速处理业务流。
               </p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-2xl">
               {[
                  { id: 'tasks', label: 'Task Inbox', icon: Inbox },
                  { id: 'pins', label: 'Pinned Records', icon: Pin }
               ].map(seg => (
                  <button 
                    key={seg.id}
                    onClick={() => setActiveSegment(seg.id as any)}
                    className={cn(
                      "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                      activeSegment === seg.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                     <seg.icon size={14} />
                     {seg.label}
                  </button>
               ))}
            </div>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 tech-grid">
         <div className="max-w-6xl mx-auto space-y-10">
            
            <div className="grid grid-cols-3 gap-8">
               <SummaryMini label="Pending Tasks" value="12" icon={Clock} color="amber" />
               <SummaryMini label="Completed Today" value="08" icon={CheckCircle2} color="emerald" />
               <SummaryMini label="Pinned Objects" value="05" icon={Star} color="blue" />
            </div>

            {activeSegment === 'tasks' ? (
               <section className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">待办任务 (Task Inbox)</h3>
                     <div className="flex items-center gap-2 text-[10px] font-mono text-slate-300">QUEUE_ID: UX-TASK-992</div>
                  </div>

                  <div className="space-y-3">
                     {[
                        { title: "审批采购订单 PR-2024-001", priority: "High", due: "2h left" },
                        { title: "更新生产线状态 #B-2", priority: "Medium", due: "Today" },
                        { title: "处理系统异构报警", priority: "Critical", due: "NOW" },
                        { title: "审核新入库物料属性", priority: "Low", due: "Tomorrow" }
                     ].map((task, i) => (
                        <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] hover:border-slate-900 transition-all group flex items-center justify-between shadow-sm">
                           <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                task.priority === 'Critical' ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white"
                              )}>
                                 <AlertCircle size={24} />
                              </div>
                              <div>
                                 <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tight mb-1">{task.title}</h4>
                                 <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase">
                                    <span className={cn(
                                       "px-2 py-0.5 rounded",
                                       task.priority === 'Critical' ? "bg-red-500 text-white" : "bg-slate-100"
                                    )}>{task.priority} Priority</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={10} /> {task.due}</span>
                                 </div>
                              </div>
                           </div>
                           <button className="h-10 px-6 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-slate-900 transition-all">
                              Handle
                           </button>
                        </div>
                     ))}
                  </div>
               </section>
            ) : (
               <section className="space-y-6">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">固定的记录 (Pinned Objects)</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                     {[1,2,3,4,5].map(i => (
                        <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:border-blue-500 transition-all group shadow-sm flex flex-col justify-between h-48">
                           <div className="flex justify-between items-start">
                              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                                 <Box size={24} />
                              </div>
                              <button className="text-slate-200 hover:text-red-500">
                                 <Pin size={18} className="fill-current" />
                              </button>
                           </div>
                           <div>
                              <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">System Node #X-00{i}</h4>
                              <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Status: Stable</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            )}
         </div>
      </div>
    </div>
  );
}

function SummaryMini({ label, value, icon: Icon, color }: any) {
   const colors: any = {
      amber: "text-amber-500 bg-amber-50",
      emerald: "text-emerald-500 bg-emerald-50",
      blue: "text-blue-500 bg-blue-50"
   };
   
   return (
      <div className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center gap-6 shadow-sm">
         <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner", colors[color])}>
            <Icon size={24} />
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="text-xl font-black text-slate-900 italic uppercase">{value}</p>
         </div>
      </div>
   );
}
