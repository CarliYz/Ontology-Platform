import { useState } from "react";
import { 
  Activity, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  Filter,
  Plus,
  RefreshCcw
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function MappingBuilder() {
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [isMapping, setIsMapping] = useState(false);
  const [sources, setSources] = useState([
    { id: 'src-1', name: 'SAP_PRODUCTION_DB', type: 'PostgreSQL', status: 'connected', sync: '15m ago', tables: ['Orders', 'Users', 'Inventory'] },
    { id: 'src-2', name: 'SALESFORCE_CRM', type: 'Cloud API', status: 'error', sync: '2h ago', tables: ['Accounts', 'Leads', 'Opportunities'] },
  ]);

  return (
    <div className="flex h-full bg-white" id="mapping-builder">
      {/* Sidebar: Sources */}
      <div className="w-80 border-r border-tech flex flex-col bg-gray-50/20 shrink-0">
        <header className="p-6 border-b border-tech bg-white shrink-0">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                 <Activity size={20} />
              </div>
              <div>
                 <h1 className="text-xl font-bold text-gray-900">Data Mappings</h1>
                 <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Sources</p>
              </div>
           </div>
           <button className="w-full btn-primary py-2 flex items-center justify-center gap-2 text-xs">
              <Plus size={14} /> Add Data Source
           </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
           <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Active Connectors</h3>
           <div className="space-y-3">
              {sources.map(src => (
                <button 
                  key={src.id} 
                  onClick={() => setSelectedSource(src)}
                  className={cn(
                    "w-full bg-white border rounded-xl p-4 text-left transition-all group",
                    selectedSource?.id === src.id ? "border-[#106ba3] shadow-md ring-1 ring-[#106ba3]/10" : "border-tech hover:border-gray-300 shadow-sm"
                  )}
                >
                   <div className="flex justify-between items-start mb-3">
                      <div className={cn("p-2 rounded-lg", src.status === 'connected' ? "bg-green-50 text-green-500" : "bg-red-50 text-red-500")}>
                         <Database size={18} />
                      </div>
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border",
                        src.status === 'connected' ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                      )}>
                         {src.status}
                      </span>
                   </div>
                   <h4 className="text-sm font-bold text-gray-900 truncate">{src.name}</h4>
                   <p className="text-[10px] text-gray-400 font-mono mt-1">{src.type}</p>
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Main Content: Mapping Editor */}
      <div className="flex-1 overflow-y-auto bg-gray-50/10 tech-grid">
         {selectedSource ? (
           <div className="p-12 max-w-5xl mx-auto space-y-12 animate-fade-in pb-32">
              <header className="flex justify-between items-end">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-600">
                       <Database size={20} />
                       <h2 className="text-2xl font-bold">{selectedSource.name}</h2>
                    </div>
                    <p className="text-sm text-gray-500">Configuring relational mappings for {selectedSource.tables.length} identified tables.</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="btn-secondary py-2 px-4 text-xs flex items-center gap-2">
                       <RefreshCcw size={14} /> Refresh Schema
                    </button>
                    <button className="btn-primary py-2 px-6 text-xs bg-blue-600 hover:bg-blue-700">Save Pipeline</button>
                 </div>
              </header>

              <div className="grid grid-cols-1 gap-6">
                 {selectedSource.tables.map((table: string, i: number) => (
                   <div key={table} className="bg-white border border-tech rounded-2xl p-8 shadow-sm flex items-center justify-between group transition-all hover:border-[#106ba3]/30">
                      <div className="flex items-center gap-8 flex-1">
                         <div className="flex flex-col items-center gap-2 w-24">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                               <Database size={20} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase truncate w-full text-center">{table}</span>
                         </div>
                         
                         <div className="flex-1 flex items-center gap-4">
                            <div className="h-px bg-gray-200 flex-1 relative">
                               <ArrowRight size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                            <button className="px-4 py-2 bg-[#e1f0f9] text-[#106ba3] border border-[#106ba3]/20 rounded-lg text-xs font-bold hover:bg-[#106ba3] hover:text-white transition-all">
                               Map to Object Type
                            </button>
                            <div className="h-px bg-gray-200 flex-1 relative invisible group-hover:visible transition-all">
                               <ArrowRight size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-300" />
                            </div>
                         </div>

                         <div className="flex flex-col items-center gap-2 w-24 opacity-40 group-hover:opacity-100 transition-all">
                             <div className="w-12 h-12 rounded-xl bg-[#106ba3]/10 border border-dashed border-[#106ba3]/30 flex items-center justify-center text-[#106ba3]">
                                <Activity size={20} />
                             </div>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ontology</span>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>

              <section className="bg-blue-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
                 <div className="relative z-10 space-y-6 max-w-lg">
                    <h3 className="text-2xl font-bold leading-tight">Smart Mapping Suggestion</h3>
                    <p className="text-sm opacity-70 leading-relaxed">
                      Our ML engine has identified 12 schema overlaps between <b>{selectedSource.name}</b> and your current Ontology.
                    </p>
                    <button className="px-8 py-3 bg-white text-blue-900 rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-xl">
                       Apply All Recommendations
                    </button>
                 </div>
                 <Activity size={200} className="absolute -right-20 -bottom-20 opacity-10 rotate-12" />
              </section>
           </div>
         ) : (
           <div className="flex h-full items-center justify-center p-20 opacity-40">
              <div className="text-center space-y-4">
                 <Activity className="w-20 h-20 text-gray-300 mx-auto" />
                 <p className="text-sm font-medium text-gray-500">Pick a datasource from the sidebar to begin mapping definitions.</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}

function PipelineNode({ label, icon: Icon, color }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
       <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", color)}>
          <Icon size={20} />
       </div>
       <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{label}</span>
    </div>
  );
}

function PipelineArrow() {
  return (
    <div className="flex-1 h-px bg-gray-200 relative mx-4">
       <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-200" />
    </div>
  );
}
