import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  GitCommit, 
  History, 
  ArrowRight, 
  FileDiff, 
  Clock, 
  User,
  Plus,
  Minus,
  AlertCircle
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { ontologyApi } from "../../api/ontology";

interface Version {
  id: string;
  version: string;
  status: string;
  changelog: string;
  createdAt: string;
}

export default function HistoryDiff() {
  const { ontologyId } = useParams();
  const [history, setHistory] = useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [diff, setDiff] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!ontologyId) return;
    try {
      const data = await ontologyApi.getVersions(ontologyId);
      setHistory(data);
      if (data.length > 0) setSelectedVersion(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiff = async () => {
    if (!ontologyId) return;
    try {
      // If no selectedVersion, we might compare current draft vs latest published
      // For now, let's just diff from selectedVersion to "current" (empty 'to' param)
      const data = await ontologyApi.getDiff(ontologyId, selectedVersion?.version);
      setDiff(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [ontologyId]);

  useEffect(() => {
    fetchDiff();
  }, [selectedVersion, ontologyId]);

  return (
    <div className="flex h-full overflow-hidden bg-white" id="history-diff">
      {/* Version Sidebar */}
      <div className="w-80 border-r border-tech flex flex-col bg-gray-50/20">
        <header className="p-4 border-b border-tech bg-white/50 flex justify-between items-center">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest">版本历史</h2>
          <History size={14} className="text-gray-400" />
        </header>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.map(ver => (
            <button
              key={ver.id}
              onClick={() => setSelectedVersion(ver)}
              className={cn(
                "w-full p-4 rounded-lg border-2 text-left transition-all group",
                selectedVersion?.id === ver.id ? "border-[#106ba3] bg-[#e1f0f9]/30" : "border-transparent bg-white hover:border-gray-200 shadow-sm"
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono font-bold text-[#106ba3]">{ver.version}</span>
                <span className="text-[10px] text-gray-400 font-mono">{new Date(ver.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-3 leading-tight">{ver.changelog || '无描述'}</p>
              <div className="flex items-center gap-3 text-[10px] text-gray-400">
                <div className="flex items-center gap-1">
                  <User size={10} /> admin
                </div>
                {ver.status === 'published' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <History size={10} /> Published
                  </div>
                )}
              </div>
            </button>
          ))}
          {history.length === 0 && !loading && (
            <div className="p-8 text-center space-y-2">
               <AlertCircle size={24} className="mx-auto text-gray-300" />
               <p className="text-xs text-gray-400">暂无发布历史</p>
            </div>
          )}
        </div>
      </div>

      {/* Diff Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="p-6 border-b border-tech bg-white shrink-0">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded text-gray-400">
                <FileDiff size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">结构差异对比</h1>
                <p className="text-sm text-gray-500">
                  {selectedVersion ? `对比当前草稿与 ${selectedVersion.version} 版本的差异。` : '选择一个版本进行对比。'}
                </p>
              </div>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 bg-[#fbfbfc] tech-grid">
           <div className="max-w-5xl mx-auto space-y-8">
              {diff ? (
                <div className="space-y-6">
                  {/* Added Section */}
                  {(diff.added.objectTypes.length > 0 || diff.added.linkTypes.length > 0) && (
                    <div className="bg-white border border-tech rounded-xl shadow-sm overflow-hidden">
                      <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                          <Plus size={14} /> Added Elements
                        </span>
                      </div>
                      <div className="p-6 space-y-4">
                        {diff.added.objectTypes.map((ot: any) => (
                          <div key={ot.id} className="flex items-center gap-3 text-sm text-gray-800">
                             <div className="w-2 h-2 rounded-full bg-emerald-400" />
                             <span>ObjectType: <b className="font-bold">{ot.displayName}</b> ({ot.apiName})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Modified Section */}
                  {diff.modified.objectTypes.length > 0 && (
                    <div className="bg-white border border-tech rounded-xl shadow-sm overflow-hidden">
                      <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest flex items-center gap-2">
                          <GitCommit size={14} /> Modified Elements
                        </span>
                      </div>
                      <div className="p-6 space-y-4">
                        {diff.modified.objectTypes.map((ot: any) => (
                          <div key={ot.id} className="flex items-center gap-3 text-sm text-gray-800">
                             <div className="w-2 h-2 rounded-full bg-blue-400" />
                             <span>ObjectType: <b className="font-bold">{ot.displayName}</b>has changes in schema.</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Removed Section */}
                  {diff.removed.objectTypes.length > 0 && (
                    <div className="bg-white border border-tech rounded-xl shadow-sm overflow-hidden">
                      <div className="p-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest flex items-center gap-2">
                          <Minus size={14} /> Removed Elements
                        </span>
                      </div>
                      <div className="p-6 space-y-4">
                        {diff.removed.objectTypes.map((ot: any) => (
                          <div key={ot.id} className="flex items-center gap-3 text-sm text-gray-400 line-through">
                             <div className="w-2 h-2 rounded-full bg-red-400" />
                             <span>ObjectType: {ot.displayName}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {diff.added.objectTypes.length === 0 && diff.modified.objectTypes.length === 0 && diff.removed.objectTypes.length === 0 && (
                    <div className="p-20 text-center bg-white border border-dashed border-gray-200 rounded-3xl">
                       <FileCheck className="mx-auto text-gray-200 mb-4" size={48} />
                       <p className="text-sm text-gray-400 font-medium">无差异，当前工作区与该版本完全一致。</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-20 text-center">
                   <RefreshCw className="mx-auto text-[#106ba3] animate-spin mb-4" size={32} />
                   <p className="text-sm text-gray-500 font-medium tracking-tight">正在计算语义差异...</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}

const FileCheck = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 17 2 2 4-4"/><path d="M13 18h8"/><path d="M13 8h8"/><path d="M13 13h8"/><path d="M3 8h1"/><path d="M3 13h1"/>
  </svg>
);

const RefreshCw = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
  </svg>
);
