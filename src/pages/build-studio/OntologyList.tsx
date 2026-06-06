import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Database, Clock, ChevronRight, Search, Filter } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { ontologyApi } from "../../api/ontology";
import Modal from "../../components/shared/Modal";
import PageState from "../../components/layout/PageState";
import { PageStatus } from "../../types/common";

export default function OntologyList() {
  const [ontologies, setOntologies] = useState<any[]>([]);
  const [status, setStatus] = useState<PageStatus>(PageStatus.LOADING);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOntologyName, setNewOntologyName] = useState("");

  const fetchOntologies = async () => {
    setStatus(PageStatus.LOADING);
    try {
      const resp = await ontologyApi.getOntologies();
      const list = resp.data || [];
      setOntologies(list);
      setStatus(list.length > 0 ? PageStatus.SUCCESS : PageStatus.EMPTY);
    } catch (err) {
      console.error(err);
      setStatus(PageStatus.ERROR);
    }
  };

  useEffect(() => {
    fetchOntologies();
  }, []);

  const handleCreateOntology = async () => {
    if (!newOntologyName) return;

    try {
      await ontologyApi.createOntology(newOntologyName);
      setNewOntologyName("");
      setIsModalOpen(false);
      fetchOntologies();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-workspace/50 p-8 overflow-y-auto" id="ontology-list-page">
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新建 Ontology"
        onConfirm={handleCreateOntology}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">请输入新 Ontology 的原始名称，系统将自动生成唯一标识。</p>
          <input 
            autoFocus
            type="text" 
            placeholder="例如: 供应链知识图谱" 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-50 transition-all font-medium"
            value={newOntologyName}
            onChange={(e) => setNewOntologyName(e.target.value)}
          />
        </div>
      </Modal>

      <header className="flex justify-between items-end mb-10 max-w-6xl mx-auto w-full">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">图谱建设</h1>
          <p className="text-gray-500 text-sm">定义和管理组织内部的对象类型、关系及其数据映射。</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2" 
          id="btn-create-ontology"
        >
          <Plus size={18} />
          <span>新建 Ontology</span>
        </button>
      </header>

      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Statistics or Quick Filters */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="搜索 Ontology..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-tech rounded-md text-sm outline-none focus:ring-1 focus:ring-[#106ba3]" 
            />
          </div>
          <button 
            onClick={() => alert("筛选功能开发中...")}
            className="btn-secondary flex items-center gap-2"
          >
            <Filter size={16} />
            <span>筛选</span>
          </button>
        </div>

        {/* List */}
        <PageState status={status} onRetry={fetchOntologies}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="ontology-cards-grid">
            {ontologies.map((ont) => (
              <motion.div
                layoutId={ont.id}
                key={ont.id}
                whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                className="bg-white border border-tech rounded-lg p-6 group transition-shadow cursor-pointer relative"
              >
                <Link to={`/build/${ont.id}`} className="absolute inset-0 z-10" />
                
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-[#f0f7ff] text-[#106ba3] rounded">
                    <Database size={20} />
                  </div>
                  <div className={cn(
                    "text-[10px] uppercase font-bold px-2 py-0.5 rounded border tracking-wider",
                    ont.status === 'published' ? "text-green-600 bg-green-50 border-green-200" : "text-amber-600 bg-amber-50 border-amber-200"
                  )}>
                    {ont.status === 'published' ? '正式版本' : '草稿'}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#106ba3] transition-colors mb-1">
                  {ont.name}
                </h3>
                <p className="text-xs text-gray-400 font-mono mb-6 uppercase tracking-widest">{ont.id}</p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50 text-gray-500">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Clock size={12} />
                    <span>最近更新: 2026-04-23</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </PageState>
      </div>
    </div>
  );
}
