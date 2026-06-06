import { Outlet, NavLink, useLocation } from "react-router-dom";
import { 
  Database, 
  Search, 
  PlayCircle, 
  Layout, 
  ShieldCheck, 
  Menu,
  Box
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { id: 'build', label: '图谱建设', icon: Database, path: '/build' },
  { id: 'analysis', label: '图谱分析', icon: Search, path: '/analysis' },
  { id: 'actions', label: '动作与函数', icon: PlayCircle, path: '/actions', children: [
    { id: 'registry', label: '逻辑注册', path: '/actions' },
    { id: 'runs', label: '执行中心', path: '/actions/runs' }
  ] },
  { id: 'apps', label: '界面与应用', icon: Layout, path: '/apps' },
  { id: 'governance', label: '治理与运维', icon: ShieldCheck, path: '/governance' },
];

export default function Shell() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden" id="app-shell">
      {/* Sidebar */}
      <aside className="w-16 md:w-64 border-r border-tech bg-sidebar flex flex-col transition-all" id="app-sidebar">
        <div className="h-14 border-b border-tech flex items-center px-4 gap-3 bg-gray-50/50">
          <div className="w-8 h-8 bg-[#106ba3] rounded flex items-center justify-center text-white shrink-0 shadow-sm">
            <Box size={20} />
          </div>
          <span className="font-bold text-sm truncate hidden md:block tracking-tight uppercase">
            Ontology Platform
          </span>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname.startsWith(item.path);

            return (
              <div key={item.id} className="space-y-1">
                <NavLink
                  to={item.path}
                  end={!item.children}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded transition-all group relative",
                    isActive 
                      ? "bg-[#e1f0f9] text-[#106ba3] font-medium" 
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon size={20} className={cn(
                    "shrink-0",
                    isActive ? "text-[#106ba3]" : "group-hover:text-gray-900"
                  )} />
                  <span className="text-sm truncate hidden md:block">{item.label}</span>
                  
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#106ba3] rounded-r md:hidden" />
                  )}
                </NavLink>

                {isActive && item.children && (
                  <div className="pl-11 pr-2 py-1 space-y-1 hidden md:block">
                    {item.children.map(child => (
                      <NavLink
                        key={child.id}
                        to={child.path}
                        end
                        className={({ isActive: isChildActive }) => cn(
                          "block text-xs py-1.5 rounded transition-colors px-2",
                          isChildActive ? "text-[#106ba3] font-bold" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                        )}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-tech text-gray-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
            <div className="hidden md:block truncate">
              <p className="text-xs font-semibold text-gray-700">Administrator</p>
              <p className="text-[10px]">admin@palantir.style</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-workspace tech-grid" id="main-content">
        <Outlet />
      </main>
    </div>
  );
}
