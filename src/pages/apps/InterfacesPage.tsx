import { useState, useEffect } from "react";
import { 
  Layout, 
  Plus, 
  Search, 
  Monitor, 
  Settings, 
  Trash2, 
  ChevronRight,
  AppWindow,
  Activity,
  Box
} from "lucide-react";
import { cn } from "../../lib/utils";
import { appApi, App } from "../../api/app";
import { NavLink, useNavigate } from "react-router-dom";
import Modal from "../../components/shared/Modal";

export default function InterfacesPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApp, setNewApp] = useState({ name: "", description: "", icon: "AppWindow" });
  const navigate = useNavigate();

  const fetchApps = async () => {
    setLoading(true);
    try {
      const data = await appApi.getApps();
      setApps(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreate = async () => {
    if (!newApp.name) return;
    try {
      const created = await appApi.createApp(newApp);
      setIsModalOpen(false);
      setNewApp({ name: "", description: "", icon: "AppWindow" });
      navigate(`/apps/${created.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans overflow-hidden">
      <header className="p-10 border-b border-slate-100 flex justify-between items-end bg-white">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-slate-200">
                  <Layout size={20} />
               </div>
               <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Applications</h1>
            </div>
            <p className="text-sm text-slate-500 max-w-md font-medium">
               管理并访问已发布的业务应用。将图谱原子能力编排为高度定制的交互界面。
            </p>
         </div>

         <div className="flex gap-4">
            <div className="relative group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="搜索应用..."
                 className="h-12 pl-12 pr-6 bg-white border border-slate-200 rounded-2xl text-xs font-bold font-mono outline-none focus:ring-4 focus:ring-blue-50 transition-all w-64 shadow-sm"
               />
            </div>
            <button 
               onClick={() => setIsModalOpen(true)}
               className="h-12 px-6 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-200"
            >
               <Plus size={16} /> CREATE APP
            </button>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-10 tech-grid">
         <div className="max-w-6xl mx-auto">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
                  <Activity size={40} className="animate-spin text-slate-400 mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Hydrating Applications...</p>
               </div>
            ) : apps.length === 0 ? (
               <div className="py-20 text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
                  <Box size={48} className="text-slate-100 mx-auto mb-6" />
                  <h3 className="text-lg font-black text-slate-300 uppercase italic mb-2">No apps deployed</h3>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Start by creating your first business interface.</p>
               </div>
            ) : (
               <div className="grid grid-cols-3 gap-8">
                  {apps.map(app => (
                     <AppCard key={app.id} app={app} />
                  ))}
               </div>
            )}
         </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Deploy New Application"
        onConfirm={handleCreate}
      >
        <div className="space-y-6">
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Application Name</label>
              <input 
                type="text" 
                value={newApp.name}
                onChange={e => setNewApp({...newApp, name: e.target.value})}
                placeholder="e.g. Supply Chain Control Tower"
                className="w-full h-14 px-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
              />
           </div>
           <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
              <textarea 
                value={newApp.description}
                onChange={e => setNewApp({...newApp, description: e.target.value})}
                placeholder="Describe the business purpose..."
                className="w-full h-32 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold placeholder:text-slate-300 outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all resize-none"
              />
           </div>
        </div>
      </Modal>
    </div>
  );
}

function AppCard({ app }: { app: App }) {
   return (
      <NavLink 
        to={`/apps/${app.id}`}
        className="group block bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:border-slate-900 transition-all hover:shadow-2xl hover:shadow-slate-200/50"
      >
         <div className="flex justify-between items-start mb-10">
            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-inner">
               <AppWindow size={28} />
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
               <div className="px-3 py-1 text-[8px] font-black uppercase tracking-widest text-slate-400">
                  {app.status}
               </div>
            </div>
         </div>
         <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight group-hover:translate-x-1 transition-transform">{app.name}</h3>
            <p className="text-xs text-slate-400 line-clamp-2 font-medium leading-relaxed">{app.description || "No description provided."}</p>
         </div>
         <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
            <div className="text-[9px] font-mono font-bold text-slate-300 uppercase">
               Last updated: {new Date(app.updatedAt).toLocaleDateString()}
            </div>
            <ChevronRight size={16} className="text-slate-200 group-hover:text-slate-900 transition-colors" />
         </div>
      </NavLink>
   );
}
