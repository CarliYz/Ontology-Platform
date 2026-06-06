import { useState, useEffect } from "react";
import { useParams, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  AppWindow, 
  ChevronLeft, 
  Settings, 
  Menu, 
  Search, 
  Bell, 
  User,
  LayoutDashboard,
  List as ListIcon,
  FileText,
  Briefcase,
  ChevronRight,
  MoreVertical
} from "lucide-react";
import { cn } from "../../lib/utils";
import { appApi, App, AppNavItem } from "../../api/app";

export default function AppShell() {
  const { appId } = useParams<{ appId: string }>();
  const [app, setApp] = useState<App | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (appId) {
      appApi.getApp(appId).then(setApp).catch(console.error);
    }
  }, [appId]);

  if (!app) return null;

  return (
    <div className="flex h-full bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 flex flex-col transition-all duration-300 relative z-20",
        collapsed ? "w-20" : "w-72"
      )}>
        <div className="p-6 h-20 flex items-center gap-4 border-b border-white/5">
           <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shrink-0 shadow-lg shadow-black/20">
              <AppWindow size={20} />
           </div>
           {!collapsed && (
             <div className="overflow-hidden whitespace-nowrap">
                <h2 className="text-sm font-black text-white uppercase italic tracking-tight">{app.name}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Live Environment</p>
             </div>
           )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4 custom-scrollbar">
           {app.navItems?.length === 0 ? (
             <div className="p-4 text-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">No Menu Items</p>
             </div>
           ) : (
             app.navItems?.sort((a, b) => a.order - b.order).map(item => (
                <NavLink 
                  key={item.id}
                  to={`/apps/${app.id}/pages/${item.targetPageId}`}
                  className={({ isActive }) => cn(
                    "flex items-center gap-4 p-4 rounded-2xl transition-all group",
                    isActive ? "bg-white text-slate-900 shadow-xl shadow-black/20" : "text-slate-400 hover:bg-white/5"
                  )}
                >
                   <div className={cn(
                     "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                     location.pathname.includes(item.targetPageId!) ? "text-slate-900" : "group-hover:text-white"
                   )}>
                      <Menu size={18} />
                   </div>
                   {!collapsed && <span className="text-xs font-bold uppercase tracking-tight">{item.label}</span>}
                </NavLink>
             ))
           )}
        </nav>

        <div className="p-4 border-t border-white/5">
           <button 
             onClick={() => navigate('/apps')}
             className="w-full flex items-center gap-4 p-4 text-slate-500 hover:text-white transition-colors group"
           >
              <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              {!collapsed && <span className="text-[10px] font-black uppercase tracking-widest">Global Index</span>}
           </button>
        </div>
        
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-900 shadow-xl hover:scale-110 transition-transform"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
         <header className="h-20 bg-white border-b border-slate-100 px-8 flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-4">
               <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="text" 
                    placeholder="Search in app data..." 
                    className="h-11 w-80 pl-12 pr-6 bg-slate-50 border-none rounded-xl text-xs font-medium placeholder:text-slate-300 outline-none focus:ring-4 focus:ring-slate-100 transition-all"
                  />
               </div>
            </div>

            <div className="flex items-center gap-6">
               <button className="relative w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full" />
               </button>
               <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                  <div className="text-right">
                     <p className="text-[10px] font-black text-slate-900 uppercase">Karlee AI</p>
                     <p className="text-[8px] font-mono text-slate-400">ADMINISTRATOR</p>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                     <User size={20} />
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-900">
                     <MoreVertical size={16} />
                  </button>
               </div>
            </div>
         </header>

         <main className="flex-1 overflow-hidden relative">
            <Outlet />
         </main>
      </div>
    </div>
  );
}
