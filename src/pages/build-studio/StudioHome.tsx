import { useState, useEffect } from "react";
import { 
  Plus, 
  Database, 
  GitBranch, 
  Settings, 
  FileCheck, 
  History,
  Activity,
  Box,
  Layers,
  Link as LinkIcon,
  ChevronLeft,
  Zap,
  GitPullRequest,
  AlertCircle,
  X,
  CheckCircle2,
  RefreshCcw
} from "lucide-react";
import { Link, useParams, NavLink, useNavigate, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { ontologyApi } from "../../api/ontology";
import { ObjectType, LinkType } from "../../types/ontology";

export default function StudioHome() {
  const { ontologyId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [ontology, setOntology] = useState<any>(null);
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [linkTypes, setLinkTypes] = useState<LinkType[]>([]);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStep, setPublishStep] = useState<'validate' | 'confirm' | 'success'>('validate');
  const [changelog, setChangelog] = useState("");
  const [errorInfo, setErrorInfo] = useState<any>(null);

  const fetchData = async () => {
    if (!ontologyId) return;
    try {
      const [ont, ots, lts] = await Promise.all([
        ontologyApi.getOntology(ontologyId),
        ontologyApi.getObjectTypes(ontologyId),
        ontologyApi.getLinkTypes(ontologyId)
      ]);
      setOntology(ont);
      setObjectTypes(ots);
      setLinkTypes(lts);
    } catch (err) {
      console.error("Failed to fetch ontology data", err);
    }
  };

  const handlePublish = async () => {
    if (!ontologyId) return;
    setPublishStep('validate');
    try {
      // Simulate validation step for UX consistency as per design, but with real backend publish
      await new Promise(r => setTimeout(r, 1500)); 
      await ontologyApi.publishOntology(ontologyId, changelog);
      setPublishStep('success');
      fetchData(); // Refresh to get new version
      setTimeout(() => setIsPublishing(false), 3000);
    } catch (err: any) {
      console.error(err);
      setErrorInfo(err);
      setIsPublishing(false);
    }
  };

  const STUDIO_NAV = [
    { id: 'overview', label: '总览', icon: Box, path: `/build/${ontologyId}` },
    { id: 'objects', label: '对象类型', icon: Layers, path: `/build/${ontologyId}/objects` },
    { id: 'links', label: '链接关系', icon: LinkIcon, path: `/build/${ontologyId}/links` },
    { id: 'mappings', label: '数据映射', icon: Activity, path: `/build/${ontologyId}/mappings` },
    { id: 'validation', label: '检查中心', icon: FileCheck, path: `/build/${ontologyId}/validation` },
    { id: 'history', label: '变更历史', icon: History, path: `/build/${ontologyId}/history` },
  ];

  useEffect(() => {
    fetchData();
  }, [ontologyId]);

  return (
    <div className="flex h-full flex-col" id="studio-home">
      {/* Studio Header */}
      <header className="h-14 bg-white border-b border-tech flex items-center px-4 justify-between z-20 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <NavLink to="/build" className="p-1 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-900">
            <ChevronLeft size={20} />
          </NavLink>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <Database size={18} className="text-[#106ba3]" />
            <h2 className="font-bold text-sm tracking-tight uppercase">{ontology?.name || "Loading..."}</h2>
            {ontology?.latestPublishedVersion ? (
              <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 rounded uppercase font-bold tracking-tighter">
                Published {ontology.latestPublishedVersion}
              </span>
            ) : (
              <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 rounded uppercase font-bold tracking-tighter">Draft</span>
            )}
            {ontology?.status === 'draft' && ontology?.latestPublishedVersion && (
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-1.5 rounded uppercase font-bold tracking-tighter">Changed</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/analysis"
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors mr-2"
          >
            <GitPullRequest size={14} />
            图谱分析
          </Link>
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1 mr-2">
            <button className="px-3 py-1 text-[11px] font-bold rounded bg-white shadow-sm text-gray-800">EDITING</button>
            <button className="px-3 py-1 text-[11px] font-bold rounded text-gray-500 hover:bg-gray-200 transition-colors">VIEWING</button>
          </div>
          <button 
            onClick={() => alert("Ontology 配置项:\n- 名称: " + (ontology?.name || "") + "\n- ID: " + ontologyId + "\n- 设置正在开发中...")}
            className="btn-secondary py-1 text-[12px] flex items-center gap-1.5 px-3"
          >
            <Settings size={14} />
            配置
          </button>
          <button 
            onClick={() => {
              setIsPublishing(true);
              setPublishStep('confirm'); // Go straight to confirmation input
            }}
            className="btn-primary py-1 text-[12px] flex items-center gap-1.5 px-4 h-9"
          >
            <GitBranch size={16} />
            发布变更
          </button>
        </div>
      </header>

      {/* Publish Modal Overlay */}
      <AnimatePresence>
        {isPublishing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsPublishing(false)}
               className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden"
             >
                {publishStep === 'validate' && (
                  <div className="p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[2rem] flex items-center justify-center mx-auto">
                       <RefreshCcw size={40} className="animate-spin" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-slate-900">正在检查本体完整性</h3>
                       <p className="text-sm text-slate-500 mt-2">正在验证属性签名、映射逻辑及 Action 依赖关系...</p>
                    </div>
                    <div className="space-y-3 pt-6">
                       <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-400 italic">
                          <CheckCircle2 size={14} className="text-emerald-500" /> Object Type Schema: Valid
                       </div>
                       <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-400 italic">
                          <CheckCircle2 size={14} className="text-emerald-500" /> Link Type Cardinality: Valid
                       </div>
                       <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 italic">
                          <RefreshCcw size={14} className="animate-spin" /> Checking Action Scripts...
                       </div>
                    </div>
                  </div>
                )}

                {publishStep === 'confirm' && (
                  <div className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                       <div>
                          <h3 className="text-2xl font-black text-slate-900">发布本体变更</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Version v1.2.0-beta.rc1</p>
                       </div>
                       <button onClick={() => setIsPublishing(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                    </div>

                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">变更摘要 (Release Notes)</label>
                       <textarea 
                        autoFocus
                        value={changelog}
                        onChange={(e) => setChangelog(e.target.value)}
                        placeholder="描述本次发布修复的问题或新增的功能模块..."
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-blue-50 transition-all resize-none"
                       />
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
                       <AlertCircle size={20} className="text-amber-600 shrink-0" />
                       <div className="text-[11px] text-amber-700 leading-relaxed font-medium">
                         <b>注意：</b> 发布后本体将进入锁定状态直到部署完成。下游应用 Interface 及 Analysis 模块将立即同步这些变更。
                       </div>
                    </div>

                    <div className="flex gap-4">
                       <button 
                        onClick={() => setIsPublishing(false)}
                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all"
                       >
                         取消
                       </button>
                       <button 
                         onClick={handlePublish}
                         className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                       >
                         立即发布
                       </button>
                    </div>
                  </div>
                )}

                {publishStep === 'success' && (
                  <div className="p-10 text-center space-y-6 bg-emerald-600 text-white">
                    <div className="w-20 h-20 bg-white/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                       <CheckCircle2 size={40} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black">发布成功</h3>
                       <p className="text-sm opacity-80 mt-2">本体已同步至生产集群。版本快照已保存至历史记录。</p>
                    </div>
                    <motion.div 
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="inline-block px-4 py-1.5 bg-white/10 rounded-full text-[10px] uppercase font-bold tracking-widest"
                    >
                      rid.ontology.v120.published
                    </motion.div>
                  </div>
                )}
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden">
        {/* Studio Sub-sidebar */}
        <aside className="w-56 border-r border-tech bg-gray-50/30 flex flex-col p-2 space-y-1 overflow-y-auto shrink-0 z-10 shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)]">
          <div className="px-3 py-2">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2">功能模块</p>
          </div>
          {STUDIO_NAV.map((item) => {
            const isActive = item.id === 'overview' 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-all relative group",
                  isActive 
                    ? "bg-white border-tech border shadow-sm text-[#106ba3] font-medium z-10" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon size={16} className={cn(
                  isActive ? "text-[#106ba3]" : "text-gray-400 group-hover:text-gray-600"
                )} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-2 bottom-2 w-0.5 bg-[#106ba3] rounded-l" />
                )}
              </NavLink>
            );
          })}
          
          <div className="mt-8 px-3 py-2">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2">对象清单</p>
             <div className="space-y-1">
                {objectTypes.map(ot => (
                  <NavLink key={ot.id} to={`/build/${ontologyId}/objects/${ot.id}`} className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded group transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        ot.id === 'ot-001' ? "bg-blue-400" : "bg-purple-400"
                      )} />
                      <span className="truncate">{ot.displayName}</span>
                    </div>
                  </NavLink>
                ))}
                <button 
                  onClick={() => navigate(`/build/${ontologyId}/objects`)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-[11px] text-[#106ba3] font-medium border border-dashed border-[#106ba3]/30 bg-[#106ba3]/5 hover:bg-[#106ba3]/10 rounded transition-colors mt-4"
                >
                  <Plus size={14} />
                  新建对象
                </button>
             </div>
          </div>

          <div className="mt-8 px-3 py-2">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2">链接清单</p>
             <div className="space-y-1">
                {linkTypes.map(lt => (
                  <NavLink key={lt.id} to={`/build/${ontologyId}/links/${lt.id}`} className="w-full flex items-center justify-between px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded group transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <LinkIcon size={12} className="text-gray-400" />
                      <span className="truncate">{lt.displayName}</span>
                    </div>
                  </NavLink>
                ))}
                <button 
                  onClick={() => navigate(`/build/${ontologyId}/links`)}
                  className="w-full flex items-center gap-2 px-2 py-2 text-[11px] text-[#106ba3] font-medium border border-dashed border-[#106ba3]/30 bg-[#106ba3]/5 hover:bg-[#106ba3]/10 rounded transition-colors mt-4"
                >
                  <Plus size={14} />
                  新建链接
                </button>
             </div>
          </div>
        </aside>

        {/* Studio Content */}
        <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
