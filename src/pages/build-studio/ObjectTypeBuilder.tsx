import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Settings, 
  ChevronRight, 
  CheckCircle2, 
  AlertCircle,
  Database,
  Search,
  Layers,
  GitPullRequest,
  Zap
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { ontologyApi } from "../../api/ontology";
import { request } from "../../api/client";
import { ObjectType, Property } from "../../types/ontology";
import Modal from "../../components/shared/Modal";
import PageState from "../../components/layout/PageState";
import { PageStatus } from "../../types/common";

export default function ObjectTypeBuilder() {
  const { ontologyId, objectTypeId } = useParams();
  const navigate = useNavigate();
  const [objectTypes, setObjectTypes] = useState<ObjectType[]>([]);
  const [selectedOT, setSelectedOT] = useState<ObjectType | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [status, setStatus] = useState<PageStatus>(PageStatus.LOADING);
  const [isPropertiesLoading, setIsPropertiesLoading] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Modal States
  const [modalType, setModalType] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ id?: string, data?: any } | null>(null);
  const [modalInput, setModalInput] = useState("");

  const fetchObjectTypes = async () => {
    if (!ontologyId) return;
    try {
      const data = await ontologyApi.getObjectTypes(ontologyId);
      setObjectTypes(data);
      if (objectTypeId) {
        const matched = data.find(ot => ot.id === objectTypeId);
        if (matched) setSelectedOT(matched);
      } else if (data.length > 0 && !selectedOT) {
        setSelectedOT(data[0]);
      }
      setStatus(PageStatus.SUCCESS);
    } catch (err) {
      setStatus(PageStatus.ERROR);
    }
  };

  useEffect(() => {
    fetchObjectTypes();
  }, [ontologyId]);

  useEffect(() => {
    if (objectTypeId && objectTypes.length > 0) {
      const matched = objectTypes.find(ot => ot.id === objectTypeId);
      if (matched) setSelectedOT(matched);
    }
  }, [objectTypeId, objectTypes]);

  useEffect(() => {
    if (selectedOT) {
      setIsPropertiesLoading(true);
      request<Property[]>(`/api/object-types/${selectedOT.id}/properties`)
        .then(data => {
          setProperties(data);
          setIsPropertiesLoading(false);
        });
    }
  }, [selectedOT]);

  const addProperty = async () => {
    if (!selectedOT) return;
    const newProp = {
      apiName: `property${properties.length + 1}`,
      displayName: `新属性 ${properties.length + 1}`,
      type: "string",
      required: false
    };

    try {
      const data = await request<Property>(`/api/object-types/${selectedOT.id}/properties`, {
        method: "POST",
        body: JSON.stringify(newProp)
      });
      setProperties([...properties, data]);
    } catch (err) {
      console.error("Failed to add property", err);
    }
  };

  const updateProperty = (id: string, updates: Partial<Property>) => {
    setProperties(properties.map(p => p.id === id ? { ...p, ...updates } : p));
    setDirty(true);
  };

  const confirmDeleteProperty = (id: string) => {
    setPendingAction({ id });
    setModalType('deleteProperty');
  };

  const executeDeleteProperty = async () => {
    if (!pendingAction?.id) return;
    try {
      await request(`/api/properties/${pendingAction.id}`, { method: "DELETE" });
      setProperties(properties.filter(p => p.id !== pendingAction.id));
    } catch (err) {
      console.error("Failed to delete property", err);
    }
  };

  const openCreateModal = () => {
    setModalInput("");
    setModalType('createObjectType');
  };

  const executeCreateObjectType = async () => {
    if (!modalInput || !ontologyId) return;
    try {
      const data = await request<ObjectType>(`/api/ontologies/${ontologyId}/object-types`, {
        method: "POST",
        body: JSON.stringify({ displayName: modalInput, apiName: modalInput.replace(/\s+/g, '') })
      });
      setObjectTypes([...objectTypes, data]);
      setSelectedOT(data);
      navigate(`/build/${ontologyId}/objects/${data.id}`);
    } catch (err) {
      console.error("Failed to create object type", err);
    }
  };

  const saveChanges = async () => {
    if (!selectedOT) return;
    
    try {
      const promises = [
        ...properties.map(p => 
          request(`/api/properties/${p.id}`, {
            method: "PATCH",
            body: JSON.stringify(p)
          })
        ),
        request(`/api/object-types/${selectedOT.id}`, {
          method: "PATCH",
          body: JSON.stringify(selectedOT)
        })
      ];

      await Promise.all(promises);
      setDirty(false);
      setModalType('saveSuccess');
      fetchObjectTypes();
    } catch (err) {
      console.error("Failed to save changes", err);
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-white" id="object-type-builder">
      {/* Modals Replacement for prompt/alert/confirm */}
      <Modal 
        isOpen={modalType === 'deleteProperty'} 
        onClose={() => setModalType(null)}
        title="确认删除属性"
        type="warning"
        onConfirm={executeDeleteProperty}
      >
        确定要删除此属性吗？该操作不可撤销。
      </Modal>

      <Modal
        isOpen={modalType === 'createObjectType'}
        onClose={() => setModalType(null)}
        title="新建对象类型"
        onConfirm={executeCreateObjectType}
      >
        <div className="space-y-4">
          <p>请输入对象显示名称:</p>
          <input 
            autoFocus
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-50"
            value={modalInput}
            onChange={(e) => setModalInput(e.target.value)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={modalType === 'saveSuccess'}
        onClose={() => setModalType(null)}
        title="保存成功"
        type="success"
      >
        所有的对象定义与属性变更已成功保存。
      </Modal>

      <div className="w-64 border-r border-tech flex flex-col bg-gray-50/20">
        <div className="p-4 border-b border-tech bg-white/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
              type="text" 
              placeholder="搜索对象..." 
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-tech rounded text-xs focus:ring-1 focus:ring-[#106ba3] outline-none" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <PageState status={status} onRetry={fetchObjectTypes}>
            {objectTypes.map(ot => (
              <div
                key={ot.id}
                onClick={() => navigate(`/build/${ontologyId}/objects/${ot.id}`)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 text-sm rounded transition-all group cursor-pointer",
                  selectedOT?.id === ot.id 
                    ? "bg-[#e1f0f9] text-[#106ba3] font-medium" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <div className="flex items-center gap-2 truncate">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    ot.id.includes('ot-001') ? "bg-blue-400" : "bg-purple-400"
                  )} />
                  <span className="truncate">{ot.displayName}</span>
                </div>
                <ChevronRight size={14} className={cn(
                  "text-gray-300 opacity-0 group-hover:opacity-100 transition-all",
                  selectedOT?.id === ot.id && "text-[#106ba3] opacity-100"
                )} />
              </div>
            ))}
            <button 
              onClick={openCreateModal}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#106ba3] font-medium hover:bg-[#106ba3]/5 rounded transition-colors mt-2"
            >
              <Plus size={14} />
              新建对象类型
            </button>
          </PageState>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedOT ? (
          <>
            <header className="p-6 border-b border-tech bg-white shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-xl font-bold text-gray-900">{selectedOT.displayName}</h1>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded font-mono text-[10px] border border-tech uppercase tracking-tighter">
                      {selectedOT.apiName}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 max-w-2xl">
                    {selectedOT.description || "暂无描述信息。"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/analysis"
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 flex items-center gap-2 hover:bg-indigo-100 transition-colors"
                  >
                    <GitPullRequest size={14} />
                    影响分析
                  </Link>
                  <button 
                    onClick={() => setModalType('saveSuccess')}
                    className="btn-secondary py-1.5 px-3 flex items-center gap-2"
                  >
                    <Settings size={14} />
                    对象配置
                  </button>
                </div>
              </div>

              <div className="flex gap-6 mt-4 border-b border-tech -mb-6">
                <button className="pb-2 border-b-2 border-[#106ba3] text-[#106ba3] font-medium text-sm transition-all">属性列表</button>
                <button className="pb-2 border-b-2 border-transparent text-gray-400 hover:text-gray-600 text-sm transition-all">链接关系</button>
                <button className="pb-2 border-b-2 border-transparent text-gray-400 hover:text-gray-600 text-sm transition-all">安全授权</button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 tech-grid">
              <div className="bg-white border border-tech rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="bg-gray-50/50 px-4 py-3 border-b border-tech flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 font-medium text-gray-700 font-mono text-xs uppercase tracking-wider">
                    <Database size={14} />
                    Properties ({properties.length})
                  </div>
                  <button 
                    onClick={addProperty}
                    className="text-[#106ba3] hover:text-[#0e5a8a] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} />
                    添加属性
                  </button>
                </div>
                
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-tech">
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-10">#</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">显示名称</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">API 名称</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">数据类型</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-24">必填</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-16 text-center">主键</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tech">
                    {isPropertiesLoading ? (
                      <tr><td colSpan={7} className="p-8 text-center text-gray-400 text-sm italic">正在加载属性...</td></tr>
                    ) : properties.map((prop, idx) => (
                      <tr key={prop.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-4 py-3 text-xs text-gray-400 font-mono italic">{idx + 1}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">
                          <input 
                            type="text" 
                            value={prop.displayName}
                            onChange={(e) => updateProperty(prop.id, { displayName: e.target.value })}
                            className="w-full bg-transparent border-none p-0 focus:ring-0 outline-none"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input 
                            type="text"
                            value={prop.apiName || ''}
                            onChange={(e) => updateProperty(prop.id, { apiName: e.target.value })}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono text-[10px] border border-tech uppercase truncate block max-w-[150px] outline-none focus:bg-white focus:border-[#106ba3]"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select 
                            value={prop.type}
                            onChange={(e) => updateProperty(prop.id, { type: e.target.value })}
                            className="bg-transparent text-xs text-gray-600 outline-none"
                          >
                            <option value="string">String</option>
                            <option value="integer">Integer</option>
                            <option value="double">Double</option>
                            <option value="boolean">Boolean</option>
                            <option value="timestamp">Timestamp</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                           <input 
                             type="checkbox"
                             checked={prop.required}
                             onChange={(e) => updateProperty(prop.id, { required: e.target.checked })}
                             className="w-4 h-4 rounded border-tech text-[#106ba3] focus:ring-[#106ba3]"
                           />
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => {
                              setSelectedOT({ ...selectedOT, primaryKey: prop.apiName });
                              setDirty(true);
                            }}
                          >
                            {selectedOT.primaryKey === prop.apiName ? (
                              <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-tech mx-auto group-hover:border-gray-400 transition-colors" />
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => confirmDeleteProperty(prop.id)}
                            className="text-gray-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <Layers className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-sm font-medium">请从左侧列表选择或创建一个对象类型</p>
          </div>
        )}
      </div>

      <aside className="w-80 border-l border-tech bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-tech bg-gray-50/50">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">对象元数据</h2>
        </div>
        
        {selectedOT ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <section className="space-y-3 font-mono">
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Unique RID</label>
                <div className="p-2 bg-gray-50 border border-tech rounded text-[10px] text-gray-600 break-all">
                  ri.ontology.main.object-type.{selectedOT.id.split('-').pop()}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Status</label>
                <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  {selectedOT.status === 'active' ? 'Active / Published' : 'Draft'}
                </div>
              </div>
            </section>

            <div className="h-px bg-tech" />

            <section className="space-y-4">
               <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">Primary Key</label>
                  <select 
                    className="w-full px-2 py-1.5 bg-white border border-tech rounded text-xs outline-none focus:ring-1 focus:ring-[#106ba3]"
                    value={selectedOT.primaryKey || ''}
                    onChange={(e) => {
                      setSelectedOT({ ...selectedOT, primaryKey: e.target.value });
                      setDirty(true);
                    }}
                  >
                    <option value="">未选择</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.apiName}>{p.displayName} ({p.apiName})</option>
                    ))}
                  </select>
               </div>
            </section>

            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
               <div className="flex items-center gap-2 text-amber-800 text-xs font-bold font-mono uppercase tracking-tight">
                  <AlertCircle size={14} />
                  Validation Issues (1)
               </div>
               <p className="text-[11px] text-amber-700 leading-relaxed font-mono">
                 - Missing mapping for datasource CRM_SYNC. This object will not have backing data.
               </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-300 italic text-sm">
            选择一个对象以查看详细属性
          </div>
        )}

        <div className="p-4 border-t border-tech space-y-2">
           <button 
             disabled={!dirty}
             onClick={saveChanges}
             className={cn(
               "w-full py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-lg",
               dirty ? "bg-[#106ba3] hover:bg-[#0e5a8a] text-white shadow-xl shadow-blue-100" : "bg-gray-100 text-gray-400 cursor-not-allowed"
             )}
           >
             保存修改
           </button>
           <button 
             disabled={!dirty}
             onClick={() => {
                setDirty(false);
                fetchObjectTypes();
             }}
             className="w-full btn-secondary py-2 text-xs font-bold uppercase tracking-widest border-transparent hover:bg-slate-50 rounded-lg"
           >
             重置变更
           </button>
        </div>
      </aside>
    </div>
  );
}
