import { useState, useEffect } from "react";
import { 
  Network, 
  Search, 
  Plus, 
  MousePointer2, 
  Maximize2, 
  RefreshCcw,
  Box,
  Share2,
  Trash2,
  Settings,
  ChevronRight,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { analysisApi } from "../../api/analysis";

interface GraphData {
  nodes: any[];
  edges: any[];
}

export default function GraphExplorer() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchGraph = async () => {
    setLoading(true);
    try {
      const data = await analysisApi.exploreGraph();
      setGraphData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  return (
    <div className="flex h-full overflow-hidden bg-white" id="graph-explorer">
      {/* Search & Tool Sidebar */}
      <div className="w-80 border-r border-tech flex flex-col bg-gray-50/20 shrink-0">
        <header className="p-4 border-b border-tech bg-white/50 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-[#106ba3]">关系浏览器</h2>
            <Share2 size={14} className="text-gray-400" />
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="搜索逻辑对象或实例..." 
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-tech rounded text-xs focus:ring-1 focus:ring-[#106ba3] outline-none shadow-sm" 
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
           <section className="space-y-3">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">图谱视角</h3>
              <div className="grid grid-cols-2 gap-2">
                 <button className="flex flex-col items-center gap-2 p-3 bg-[#e1f0f9] border border-[#106ba3] rounded-xl text-[#106ba3] font-bold transition-all">
                    <Box size={20} />
                    <span className="text-[10px]">Logical Schema</span>
                 </button>
                 <button className="flex flex-col items-center gap-2 p-3 bg-white border border-tech rounded-xl text-gray-500 hover:bg-gray-50 transition-all opacity-60">
                    <MousePointer2 size={20} />
                    <span className="text-[10px]">Object Instances</span>
                 </button>
              </div>
           </section>

           <section className="space-y-3">
              <div className="flex justify-between items-center px-1">
                 <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">已保存的视图</h3>
                 <Plus size={12} className="text-[#106ba3] cursor-pointer" />
              </div>
              <div className="space-y-1">
                 {["Supply Chain Global", "Customer 360", "Financial Audit Flow"].map(view => (
                   <div key={view} className="flex justify-between items-center px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors group cursor-pointer">
                      <span>{view}</span>
                      <Settings size={12} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col bg-[#f8f9fb] relative overflow-hidden">
        {/* Canvas Toolbar */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
           <div className="flex bg-white/90 backdrop-blur border border-tech rounded-lg shadow-lg p-1">
              <ToolbarButton icon={Plus} label="Zoom In" />
              <ToolbarButton icon={RefreshCcw} label="Refresh" />
              <ToolbarButton icon={Maximize2} label="Fit View" />
           </div>
        </div>

        {/* Mock Visualization */}
        <div className="flex-1 tech-grid flex items-center justify-center p-20 relative">
          {graphData && (
            <div className="w-full h-full relative">
               {/* Connections (Edges) */}
               <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <path d="M 300 250 L 500 150" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="4 4" />
                  <path d="M 300 250 L 500 350" stroke="#cbd5e1" strokeWidth="2" fill="none" strokeDasharray="4 4" />
               </svg>

               {/* Nodes */}
               <div className="absolute left-[200px] top-[200px]">
                  <VisualNode 
                    icon={Database} 
                    color="bg-blue-500" 
                    title="User" 
                    subtitle="Object Type" 
                    active={selectedNode?.id === 'User'}
                    onClick={() => setSelectedNode({ id: 'User', title: 'User Object' })}
                  />
               </div>

               <div className="absolute left-[500px] top-[100px]">
                  <VisualNode 
                    icon={Box} 
                    color="bg-purple-500" 
                    title="Order" 
                    subtitle="Object Type" 
                    onClick={() => setSelectedNode({ id: 'Order', title: 'Order Object' })}
                  />
               </div>

               <div className="absolute left-[500px] top-[300px]">
                  <VisualNode 
                    icon={Box} 
                    color="bg-purple-500" 
                    title="Transaction" 
                    subtitle="Object Type" 
                    onClick={() => setSelectedNode({ id: 'Transaction', title: 'Transaction Object' })}
                  />
               </div>
            </div>
          )}
        </div>

        {/* Floating Detail Panel (Right Side of Canvas) */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-72 bg-white/95 backdrop-blur-md border border-tech rounded-2xl shadow-2xl p-6 transition-all modal-enter">
             <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                   <Box size={20} />
                </div>
                <button onClick={() => setSelectedNode(null)} className="text-gray-300 hover:text-gray-500">
                   <Trash2 size={16} className="rotate-45" />
                </button>
             </div>
             <h4 className="text-lg font-bold text-gray-900 mb-1">{selectedNode.title}</h4>
             <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-6">ri.ontology.main.object-type.user</p>
             
             <div className="space-y-4">
                <div className="space-y-1.5">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Metadata</span>
                   <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-gray-50 rounded border border-tech">
                         <p className="text-[9px] text-gray-400 uppercase">Properties</p>
                         <p className="text-xs font-bold text-gray-700">12 Defined</p>
                      </div>
                      <div className="p-2 bg-gray-50 rounded border border-tech">
                         <p className="text-[9px] text-gray-400 uppercase">Incoming Connections</p>
                         <p className="text-xs font-bold text-gray-700">5 Path(s)</p>
                      </div>
                   </div>
                </div>
                <div className="pt-4 border-t border-tech">
                   <Link to="/build-studio/ont-001/objects" className="w-full py-2 px-4 bg-[#106ba3] hover:bg-[#0e5a8a] text-white rounded-lg text-xs font-bold shadow-sm flex items-center justify-center gap-2 group">
                      <Maximize2 size={14} className="group-hover:scale-110 transition-transform" />
                      Open In Builder
                   </Link>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function VisualNode({ icon: Icon, color, title, subtitle, onClick, active }: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white border rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg relative group",
        active ? "border-[#106ba3] ring-2 ring-[#106ba3]/20" : "border-tech hover:border-gray-400"
      )}
    >
       <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md", color)}>
          <Icon size={18} />
       </div>
       <div className="flex flex-col min-w-[120px]">
          <span className="text-sm font-bold text-gray-900 group-hover:text-[#106ba3] transition-colors">{title}</span>
          <span className="text-[10px] text-gray-400 font-mono tracking-tighter uppercase">{subtitle}</span>
       </div>
    </div>
  );
}

function ToolbarButton({ icon: Icon, label }: any) {
  return (
    <button className="p-2 hover:bg-gray-100 text-gray-500 transition-colors rounded-lg flex items-center gap-2 group relative">
       <Icon size={18} />
       <span className="absolute left-full ml-2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity z-50">
          {label}
       </span>
    </button>
  );
}
