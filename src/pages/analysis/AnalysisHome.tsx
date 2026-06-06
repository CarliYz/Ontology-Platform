import { useState, useEffect } from "react";
import { NavLink, Routes, Route, useLocation, Link } from "react-router-dom";
import { 
  Zap,
  BarChart3,
  Network,
  GitPullRequest,
  Search,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Database,
  GitFork,
  ArrowLeft,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import QueryExplorer from "./QueryExplorer";
import QueryDetail from "./QueryDetail";
import GraphExplorer from "./GraphExplorer";
import ImpactAnalysis from "./ImpactAnalysis";
import HotspotAnalysis from "./HotspotAnalysis";
import PathAnalysis from "./PathAnalysis";
import SavedViews from "./SavedViews";

const ANALYSIS_NAV = [
  { id: 'overview', label: '分析概览', icon: LayoutDashboard, path: '/analysis' },
  { id: 'query-monitor', label: '查询监视器', icon: Search, path: '/analysis/queries' },
  { id: 'graph-explore', label: '关系浏览器', icon: Network, path: '/analysis/graph' },
  { id: 'path-discovery', label: '路径发现', icon: GitFork, path: '/analysis/path' },
  { id: 'impact-analysis', label: '影响分析', icon: GitPullRequest, path: '/analysis/impact' },
  { id: 'hotspots', label: '热点分析', icon: TrendingUp, path: '/analysis/hotspots' },
  { id: 'saved-views', label: '保存的视图', icon: Database, path: '/analysis/saved-views' },
];

export default function AnalysisHome() {
  const location = useLocation();

  return (
    <div className="flex h-full bg-workspace/30" id="analysis-home">
      {/* Analysis Sidebar */}
      <aside className="w-64 border-r border-tech flex flex-col bg-white shrink-0 shadow-[1px_0_0_0_rgba(0,0,0,0.02)]">
        <div className="p-5 border-b border-tech">
           <Link to="/build-studio" className="flex items-center gap-2 text-gray-400 hover:text-[#106ba3] transition-colors mb-4 group text-[10px] font-bold uppercase tracking-widest">
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              返回建设中心
           </Link>
           <div className="flex items-center gap-2 mb-1">
             <Zap size={18} className="text-[#106ba3]" />
             <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900 font-sans">图谱分析</h2>
           </div>
           <p className="text-[10px] text-gray-400 font-mono tracking-tight">ANALYSIS & MONITORING</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {ANALYSIS_NAV.map(item => {
            const isActive = item.id === 'overview' 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);

            return (
              <NavLink 
                key={item.id} 
                to={item.path}
                className={cn(
                   "flex items-center justify-between px-3 py-2 text-xs rounded transition-all group",
                   isActive 
                    ? "bg-[#e1f0f9] text-[#106ba3] font-bold shadow-sm" 
                    : "text-gray-500 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-tech space-y-4 bg-gray-50/50">
           <div className="bg-white p-3 rounded border border-tech shadow-sm space-y-2">
             <div className="flex items-center gap-2 text-[#106ba3]">
                <BarChart3 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">System Health</span>
             </div>
             <div className="flex justify-between items-end">
                <span className="text-[10px] text-gray-400">Query Load</span>
                <span className="text-xs font-mono font-bold text-green-500">NORMAL</span>
             </div>
             <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                <div className="bg-green-400 h-full w-1/3" />
             </div>
           </div>
        </div>
      </aside>

      {/* Analysis Content */}
      <main className="flex-1 overflow-hidden flex flex-col bg-white">
        <Routes>
          <Route index element={<AnalysisOverview />} />
          <Route path="queries" element={<QueryExplorer />} />
          <Route path="queries/:id" element={<QueryDetail />} />
          <Route path="graph" element={<GraphExplorer />} />
          <Route path="path" element={<PathAnalysis />} />
          <Route path="impact" element={<ImpactAnalysis />} />
          <Route path="hotspots" element={<HotspotAnalysis />} />
          <Route path="saved-views" element={<SavedViews />} />
        </Routes>
      </main>
    </div>
  );
}

function AnalysisOverview() {
  return (
    <div className="p-12 overflow-y-auto space-y-12 max-w-6xl">
       <header className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-sans">图谱分析控制台</h1>
          <p className="text-gray-500 max-w-2xl leading-relaxed">
            深入了解图谱系统的运行状态。通过分析实时查询流、探索逻辑拓扑以及评估变更影响，确保您的本体架构在生产环境中始终保持高性能和强壮性。
          </p>
       </header>

       <div className="grid grid-cols-3 gap-6">
          <OverviewCard 
            title="实时查询流" 
            value="1.2M+" 
            subValue="查看实时执行计划" 
            icon={Search} 
            color="text-blue-500" 
            to="/analysis/queries"
          />
          <OverviewCard 
            title="影响范围分析" 
            value="Impact" 
            subValue="评估属性变更代价" 
            icon={GitPullRequest} 
            color="text-indigo-500" 
            to="/analysis/impact"
          />
          <OverviewCard 
            title="性能热点" 
            value="Hotspots" 
            subValue="发现慢查询路径" 
            icon={TrendingUp} 
            color="text-amber-500" 
            to="/analysis/hotspots"
          />
       </div>

       <section className="bg-gray-50 border border-tech rounded-2xl p-8 flex items-center justify-between">
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-indigo-600">
                <AlertCircle size={18} />
                <h3 className="font-bold uppercase tracking-wider text-xs">发现 3 个优化建议</h3>
             </div>
             <p className="text-sm text-gray-600">
               部分多跳查询存在结果膨胀风险，索引覆盖率已达到 98%，点击查看详情。
             </p>
          </div>
          <Link to="/governance/alerts" className="btn-primary py-2 px-6 shadow-none flex items-center gap-2">
            查看建议清单
            <ChevronRight size={16} />
          </Link>
       </section>

       <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
             <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">最近高频查询路径</h4>
             <div className="space-y-2">
                {[
                  { path: "User → Orders → Transaction", count: "4.2k" },
                  { path: "Order → Shipping → Address", count: "2.1k" },
                  { path: "Warehouse → Stock → Product", count: "1.8k" }
                ].map((item, i) => (
                  <Link key={i} to="/analysis/path" className="flex items-center gap-3 p-3 bg-white border border-tech rounded-lg hover:border-[#106ba3] hover:shadow-sm transition-all group">
                     <div className="p-1.5 bg-gray-50 text-gray-400 group-hover:text-[#106ba3] rounded-lg">
                        <Network size={16} />
                     </div>
                     <div className="flex-1">
                        <p className="text-xs font-medium text-gray-700">{item.path}</p>
                        <p className="text-[10px] text-gray-400">Visited {item.count} times today</p>
                     </div>
                     <ChevronRight size={14} className="text-gray-200 group-hover:text-[#106ba3]" />
                  </Link>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400">API 服务状态</h4>
             <div className="space-y-2">
                 <div className="p-4 bg-white border border-tech rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-600">/api/ontology/search</span>
                       <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-full font-mono font-bold">200 OK</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-600">/api/graph/pathfind</span>
                       <span className="text-[10px] px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded-full font-mono font-bold">200 OK</span>
                    </div>
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-bold text-gray-600">/api/analysis/impact</span>
                       <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full font-mono font-bold">DEPRECATED</span>
                    </div>
                 </div>
             </div>
          </div>
       </div>
    </div>
  );
}

function OverviewCard({ title, value, subValue, icon: Icon, color, to }: any) {
  return (
     <Link to={to} className="p-6 bg-white border border-tech rounded-2xl shadow-sm hover:shadow-md hover:border-[#106ba3]/30 transition-all group block">
        <div className="flex justify-between items-start mb-6">
           <div className={cn("p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-inner transition-colors", color)}>
              <Icon size={20} />
           </div>
           <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
              <span className="text-2xl font-bold text-gray-900">{value}</span>
           </div>
        </div>
        <div className="flex justify-between items-center">
           <p className="text-[11px] text-gray-400 font-medium">{subValue}</p>
           <ChevronRight size={14} className="text-gray-200 group-hover:text-[#106ba3] group-hover:translate-x-1 transition-all" />
        </div>
     </Link>
  );
}
