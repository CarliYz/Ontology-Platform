import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  FileText, 
  Settings2, 
  ArrowRight, 
  History, 
  Zap, 
  GitBranch,
  ShieldCheck,
  MoreVertical,
  Activity as ActivityIcon,
  Database
} from "lucide-react";
import { cn } from "../../lib/utils";
import { appApi, AppPage } from "../../api/app";

export default function RecordPage() {
  const { appId, pageId, recordId } = useParams<{ appId: string, pageId: string, recordId?: string }>();
  const [page, setPage] = useState<AppPage | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'activity' | 'links'>('main');

  useEffect(() => {
    if (pageId) {
      // In a real app we'd fetch the specific page config
      // For now we get it from the app pages list
      appApi.getAppPages(appId!).then(pages => {
        const p = pages.find(it => it.id === pageId);
        setPage(p || null);
      }).catch(console.error);
    }
  }, [pageId, appId]);

  if (!page) return null;

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden font-sans">
      <header className="p-10 pb-0 shrink-0">
         <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 shadow-inner">
                  <Database size={32} />
               </div>
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-black uppercase rounded tracking-widest">
                        {page.bindings?.find(b => b.slotName === 'target')?.refId || "OBJECT"}
                     </span>
                     <span className="text-[10px] font-mono text-slate-300">REF: {recordId || "SYSTEM_PROT_01"}</span>
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Record Workspace</h1>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button className="h-11 px-6 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all">
                  <Zap size={14} className="fill-current" /> RUN ACTION
               </button>
               <button className="w-11 h-11 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                  <MoreVertical size={18} />
               </button>
            </div>
         </div>

         <div className="flex border-b border-slate-100 px-2">
            {[
               { id: 'main', label: 'Properties', icon: FileText },
               { id: 'activity', label: 'Activity Log', icon: History },
               { id: 'links', label: 'Relations', icon: GitBranch }
            ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id as any)}
                 className={cn(
                   "flex items-center gap-3 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative",
                   activeTab === tab.id ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                 )}
               >
                  <tab.icon size={14} />
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900" />}
               </button>
            ))}
         </div>
      </header>

      <div className="flex-1 overflow-y-auto tech-grid p-10">
         <div className="max-w-6xl mx-auto grid grid-cols-12 gap-10">
            {/* Left Slot: Main UI */}
            <div className="col-span-8 space-y-10">
               {activeTab === 'main' && (
                 <section className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
                    <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Core Attributes</h3>
                       <Settings2 size={14} className="text-slate-300" />
                    </div>
                    <div className="p-10 divide-y divide-slate-50">
                       <AttributeRow label="System Identifier" value={recordId || "UID-883920-X"} />
                       <AttributeRow label="Display Alias" value="Global Production Node 01" />
                       <AttributeRow label="Deployment Status" value="ACTIVE" status="success" />
                       <AttributeRow label="Metadata Hash" value="SHA256:772...1a2" mono />
                       <AttributeRow label="Creation Source" value="ONTOLOGY_BOOT_ENGINE" />
                    </div>
                 </section>
               )}

               {activeTab === 'activity' && (
                  <div className="space-y-4">
                     {[1,2,3,4].map(i => (
                        <div key={i} className="flex gap-4 items-start p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                              <ActivityIcon size={18} />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-slate-900 uppercase italic">ACTION_TRIGGERED</p>
                              <p className="text-[10px] text-slate-400 mt-1 font-medium leading-relaxed">
                                 The record was modified via a Batch Action update.
                              </p>
                              <div className="flex items-center gap-3 mt-3 text-[9px] font-mono font-black text-slate-300">
                                 <span>@ADMIN_USER</span>
                                 <span>•</span>
                                 <span>2026-04-29 12:00:00</span>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>

            {/* Right Slot: Sidebar UI */}
            <div className="col-span-4 space-y-8">
               <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="relative z-10">
                     <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Security Context</h4>
                     <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400">
                           <ShieldCheck size={24} />
                        </div>
                        <div>
                           <p className="text-xs font-bold italic uppercase">Inherited Access</p>
                           <p className="text-[10px] opacity-60">Ontology Layer Enforcement</p>
                        </div>
                     </div>
                     <p className="text-[10px] text-slate-400 font-medium leading-relaxed mb-6">
                        This view is restricted to authenticated nodes with WRITE_RECORD permission.
                     </p>
                     <button className="w-full py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all">
                        Validate Integrity
                     </button>
                  </div>
                  <Zap size={140} className="absolute -bottom-10 -right-10 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform duration-700" />
               </div>

               <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Knowledge Graph Bindings</h4>
                  {['Production Line', 'Quality Audit', 'Maintenance Log'].map(link => (
                     <div key={link} className="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-300 transition-all group cursor-pointer shadow-sm">
                        <span className="text-xs font-bold text-slate-900 italic uppercase">{link}</span>
                        <ArrowRight size={14} className="text-slate-200 group-hover:text-slate-900 transition-all group-hover:translate-x-1" />
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function AttributeRow({ label, value, mono, status }: { label: string, value: string, mono?: boolean, status?: 'success' | 'warning' }) {
   return (
      <div className="grid grid-cols-3 py-6 group">
         <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
         <div className="col-span-2 flex items-center gap-3">
            <span className={cn(
               "text-sm font-bold uppercase italic tracking-tight transition-colors",
               mono ? "font-mono text-slate-500" : "text-slate-900",
               status === 'success' && "text-emerald-500"
            )}>
               {value}
            </span>
            {status === 'success' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
         </div>
      </div>
   );
}
