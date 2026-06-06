import { useState, useEffect } from "react";
import { 
  Database, 
  Trash2, 
  ChevronRight, 
  Clock, 
  Search,
  Filter,
  Plus,
  ArrowRight,
  RefreshCw,
  Layout
} from "lucide-react";
import { cn } from "../../lib/utils";
import { analysisApi, SavedView } from "../../api/analysis";
import { Link } from "react-router-dom";

export default function SavedViews() {
  const [views, setViews] = useState<SavedView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchViews = async () => {
    setLoading(true);
    try {
      const data = await analysisApi.getSavedViews();
      setViews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViews();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this view?')) return;
    try {
      await analysisApi.deleteView(id);
      setViews(views.filter(v => v.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white font-sans">
      <header className="p-10 border-b border-slate-100 flex justify-between items-end bg-slate-50/20">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100">
                  <Layout size={20} />
               </div>
               <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Saved Views</h1>
            </div>
            <p className="text-sm text-slate-500 max-w-md font-medium">
               持久化的分析快照。快速访问已保存的影响图谱、查询配置与洞察。
            </p>
         </div>

         <div className="flex gap-4">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={16} />
               <input 
                 type="text" 
                 placeholder="搜索视图名称..."
                 className="h-12 pl-12 pr-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-4 focus:ring-blue-50 transition-all w-64 shadow-sm"
               />
            </div>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 tech-grid">
         <div className="max-w-6xl mx-auto space-y-6">
            {loading ? (
              <div className="py-20 text-center">
                 <RefreshCw size={32} className="animate-spin text-indigo-500 mx-auto mb-4" />
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LOADING REPOSITORY...</p>
              </div>
            ) : views.length === 0 ? (
               <div className="py-32 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                  <Database size={48} className="text-slate-200 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-slate-400 uppercase italic">空空如也</h3>
                  <p className="text-xs text-slate-400 mt-2">在影响分析或路径发现中保存视图以在此显示。</p>
               </div>
            ) : (
               <div className="grid grid-cols-2 gap-6">
                  {views.map(view => (
                     <div key={view.id} className="bg-white border border-slate-100 p-8 rounded-3xl hover:border-indigo-600 hover:shadow-2xl hover:shadow-indigo-50 transition-all group flex flex-col justify-between">
                        <div>
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                    <Database size={24} />
                                 </div>
                                 <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase italic">{view.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                       <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                                          {view.category}
                                       </span>
                                       <span className="text-[9px] font-mono text-slate-400">UUID: {view.id.slice(0,8)}</span>
                                    </div>
                                 </div>
                              </div>
                              <button 
                                onClick={() => handleDelete(view.id)}
                                className="text-slate-200 hover:text-red-500 transition-colors p-2"
                              >
                                 <Trash2 size={18} />
                              </button>
                           </div>
                           <p className="text-xs text-slate-500 leading-relaxed min-h-[3rem]">
                              {view.description || '无详细描述。此视图捕获了特定的图谱关系状态。'}
                           </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                           <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                              <div className="flex items-center gap-1.5 uppercase">
                                 <Clock size={12} />
                                 {new Date(view.updatedAt).toLocaleDateString()}
                              </div>
                           </div>
                           <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:underline">
                              Restore View <ArrowRight size={14} />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
