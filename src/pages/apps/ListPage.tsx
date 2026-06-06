import { useState, useEffect } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import { 
  List as ListIcon, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical, 
  Zap, 
  Plus, 
  Database,
  ArrowUpDown,
  CheckSquare
} from "lucide-react";
import { cn } from "../../lib/utils";
import { appApi, AppPage } from "../../api/app";

export default function ListPage() {
  const { appId, pageId } = useParams<{ appId: string, pageId: string }>();
  const [page, setPage] = useState<AppPage | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (pageId) {
      appApi.getAppPages(appId!).then(pages => {
        const p = pages.find(it => it.id === pageId);
        setPage(p || null);
      }).catch(console.error);
    }
  }, [pageId, appId]);

  const toggleSelect = (id: string, e: React.MouseEvent) => {
     e.preventDefault();
     e.stopPropagation();
     setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleRunAction = () => {
    // Jump to RunCenter as requested in DoD
    navigate(`/actions/runs?source=list&app=${appId}&page=${pageId}&targets=${selectedItems.join(',')}`);
  };

  if (!page) return null;

  const targetRef = page.bindings?.find(b => b.slotName === 'target')?.refId || "OBJECT";

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden font-sans">
      <header className="p-10 border-b border-slate-100 bg-slate-50/20 shrink-0">
         <div className="flex justify-between items-end mb-8">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                     <ListIcon size={20} />
                  </div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">{page.name}</h1>
               </div>
               <p className="text-xs text-slate-500 max-w-md font-medium">
                  {targetRef} 实体集合。支持全字段检索、动态过滤与批量业务动作执行。
               </p>
            </div>
            
            <div className="flex gap-4">
               <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search records..." 
                    className="h-12 pl-12 pr-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-slate-100 transition-all w-64"
                  />
               </div>
               <button className="h-12 px-6 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all">
                  <Filter size={16} /> FILTER
               </button>
               <button className="h-12 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:shadow-xl transition-all">
                  <Plus size={16} /> NEW {targetRef}
               </button>
            </div>
         </div>

         <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Database size={12} /> {targetRef} Repository
               </div>
               <span className="w-[1px] h-3 bg-slate-200" />
               <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  Showing 25 of 1,280 Results
               </div>
            </div>

            {selectedItems.length > 0 && (
               <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 transition-all duration-300">
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                     {selectedItems.length} Records Selected
                  </span>
                  <button 
                    onClick={handleRunAction}
                    className="h-10 px-6 bg-amber-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-amber-600 shadow-lg shadow-amber-200"
                  >
                     <Zap size={14} className="fill-current" /> RUN BATCH ACTION
                  </button>
               </div>
            )}
         </div>
      </header>

      <div className="flex-1 overflow-y-auto tech-grid p-10">
         <div className="max-w-7xl mx-auto">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-50">
                        <th className="p-6 w-16">
                           <div className="w-5 h-5 border-2 border-slate-200 rounded flex items-center justify-center cursor-pointer" />
                        </th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                           <div className="flex items-center gap-2">Identifier <ArrowUpDown size={12} /></div>
                        </th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">DisplayName</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                     {[1,2,3,4,5,6,7,8].map(i => {
                        const id = `REC-00${i}`;
                        const isSelected = selectedItems.includes(id);
                        return (
                           <NavLink 
                             key={id}
                             to={`/apps/${appId}/pages/${pageId}/records/${id}`}
                             className={cn(
                               "table-row group transition-all",
                               isSelected ? "bg-amber-50/30" : "hover:bg-slate-50/50"
                             )}
                           >
                              <td className="p-6">
                                 <div 
                                   onClick={(e) => toggleSelect(id, e)}
                                   className={cn(
                                     "w-5 h-5 border-2 rounded flex items-center justify-center transition-all",
                                     isSelected ? "bg-amber-500 border-amber-500 text-white" : "border-slate-200 group-hover:border-slate-300"
                                   )}
                                 >
                                    {isSelected && <CheckSquare size={12} />}
                                 </div>
                              </td>
                              <td className="p-6 text-xs font-mono font-black text-slate-400 uppercase">{id}</td>
                              <td className="p-6">
                                 <p className="text-sm font-black text-slate-900 uppercase italic tracking-tight">Primary Node Instance #{i}</p>
                                 <p className="text-[10px] text-slate-400 uppercase font-bold mt-1">L1 Deployment Unit</p>
                              </td>
                              <td className="p-6">
                                 <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black uppercase text-slate-600">Syncing</span>
                                 </div>
                              </td>
                              <td className="p-6 text-right">
                                 <button className="w-10 h-10 rounded-xl text-slate-200 group-hover:text-slate-900 transition-colors">
                                    <ChevronRight size={20} />
                                 </button>
                              </td>
                           </NavLink>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
