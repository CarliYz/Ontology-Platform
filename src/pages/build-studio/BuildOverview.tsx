import { useState, useEffect } from "react";
import { 
  Box,
  Layers,
  Link as LinkIcon,
  ChevronRight,
  Zap,
  ArrowRightLeft,
  Activity,
  FileCheck,
  History,
  GitPullRequest
} from "lucide-react";
import { Link, useParams, NavLink } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { ObjectType, LinkType } from "../../types/ontology";

export default function BuildOverview() {
  const { ontologyId } = useParams();
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [linkTypes, setLinkTypes] = useState<LinkType[]>([]);

  useEffect(() => {
    fetch(`/api/ontologies/${ontologyId}/object-types`).then(res => res.json()).then(setObjectTypes);
    fetch(`/api/ontologies/${ontologyId}/link-types`).then(res => res.json()).then(setLinkTypes);
  }, [ontologyId]);

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-gray-50/20 tech-grid">
      <div className="max-w-5xl mx-auto space-y-12">
        <header className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-sans">Ontology 总览</h2>
          <p className="text-gray-500 max-w-2xl leading-relaxed">
            这是您的核心语义层。在这里定义物理数据与业务逻辑之间的映射。当前您正在编辑一个草稿版本，所有的变更在发布前都将记录在历史版本中。
          </p>
        </header>

        <div className="grid grid-cols-3 gap-6">
          <OverviewStatCard 
            title="对象类型" 
            value={objectTypes.length} 
            icon={Layers} 
            color="text-blue-500" 
            path={`/build/${ontologyId}/objects`}
          />
          <OverviewStatCard 
            title="链接关系" 
            value={linkTypes.length} 
            icon={ArrowRightLeft} 
            color="text-purple-500" 
            path={`/build/${ontologyId}/links`}
          />
          <OverviewStatCard 
            title="动作定义" 
            value="2" 
            icon={Zap} 
            color="text-amber-500" 
            path="/actions"
          />
        </div>

        <section className="bg-white border border-tech rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">最近活动</h3>
            <Link to={`/build/${ontologyId}/history`} className="text-xs font-bold text-[#106ba3] hover:underline">查看全部日志</Link>
          </div>
          <div className="divide-y divide-tech">
            {[
              { action: "Updated Property", target: "Order.amount", time: "2h ago", user: "Admin" },
              { action: "Created Link", target: "user_orders", time: "5h ago", user: "Admin" },
              { action: "Modified Action", target: "SubmitOrder", time: "Yesterday", user: "Dev_1" }
            ].map((log, i) => (
              <div key={i} className="py-4 flex justify-between items-center bg-white group hover:bg-gray-50 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-[10px] uppercase">
                    {log.user[0]}
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-bold text-gray-800">{log.action}: <span className="text-[#106ba3]">{log.target}</span></p>
                    <p className="text-[10px] text-gray-400 font-mono">{log.user}</p>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-mono">{log.time}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-indigo-600 rounded-2xl p-8 text-white space-y-6 shadow-xl relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-bold">关联分析控制台</h3>
              <p className="text-sm opacity-80 leading-relaxed">
                利用图谱拓扑结构进行执行计划分析、影响范围评估以及性能热点探测。
              </p>
              <Link to="/analysis" className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-600 rounded-xl text-xs font-bold shadow-lg hover:bg-indigo-50 transition-all">
                进入控制台 <ChevronRight size={16} />
              </Link>
            </div>
            <GitPullRequest className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12 group-hover:scale-110 transition-transform" />
          </div>

          <div className="bg-white border border-tech rounded-2xl p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 text-green-600">
              <FileCheck size={24} />
              <h3 className="text-lg font-bold">校验与合规性</h3>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              所有对象定义都通过了一系列结构化校验规则，包括主键完整性、循环引用检测以及 API 命名规范。
            </p>
            <Link to={`/build/${ontologyId}/validation`} className="inline-flex items-center gap-1.5 text-xs font-bold text-[#106ba3] hover:underline">
              运行完整性检查 <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewStatCard({ title, value, icon: Icon, color, path }: any) {
  return (
    <Link to={path} className="p-6 bg-white border border-tech rounded-2xl shadow-sm hover:shadow-md hover:border-[#106ba3]/30 transition-all group block">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("p-2 rounded-lg bg-gray-50 group-hover:bg-white group-hover:shadow-inner transition-colors", color)}>
          <Icon size={20} />
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</span>
          <span className="text-2xl font-bold text-gray-900">{value}</span>
        </div>
      </div>
      <div className="flex justify-between items-center text-[11px] text-gray-400 font-medium">
        <span>Manage entries</span>
        <ChevronRight size={14} className="text-gray-200 group-hover:text-[#106ba3] group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}
