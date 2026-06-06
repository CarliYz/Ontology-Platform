import { useState } from "react";
import { 
  GitBranch, 
  Settings2, 
  Plus, 
  Trash2, 
  Share2, 
  Database,
  ArrowRightLeft,
  Search,
  Network
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

export default function LinkTypeBuilder() {
  const [links, setLinks] = useState([
    { id: 'lnk-1', name: 'User to Order', api: 'user_orders', from: 'User', to: 'Order', type: 'OneToMany' },
    { id: 'lnk-2', name: 'Order to Transaction', api: 'order_tx', from: 'Order', to: 'Transaction', type: 'OneToOne' },
  ]);

  return (
    <div className="flex flex-col h-full bg-white">
      <header className="p-8 border-b border-tech bg-white flex justify-between items-end">
         <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center text-white shadow-lg">
                  <ArrowRightLeft size={20} />
               </div>
               <div>
                  <h1 className="text-2xl font-bold text-gray-900">Link Types</h1>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-mono">Topological Relations</p>
               </div>
            </div>
         </div>
         <div className="flex gap-3">
            <Link to="/analysis/graph" className="btn-secondary py-2 px-4 flex items-center gap-2">
               <Network size={16} className="text-[#106ba3]" /> Relation Explorer
            </Link>
            <button className="btn-primary py-2 px-6 flex items-center gap-2">
               <Plus size={16} /> Create Link
            </button>
         </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 bg-gray-50/20 tech-grid">
         <div className="max-w-5xl space-y-6">
            <div className="relative mb-8">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
               <input type="text" placeholder="Search relations..." className="w-full pl-10 pr-4 py-3 bg-white border border-tech rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-[#106ba3]/10" />
            </div>

            <div className="grid grid-cols-1 gap-6">
               {links.map(link => (
                 <div key={link.id} className="bg-white border border-tech rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div className="p-6 flex items-center justify-between border-b border-tech bg-gray-50/30">
                       <div className="flex items-center gap-4">
                          <h3 className="text-base font-bold text-gray-900">{link.name}</h3>
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded text-[9px] font-mono tracking-widest uppercase">{link.api}</span>
                       </div>
                       <div className="flex gap-2">
                          <Link to="/analysis/graph" className="p-2 hover:bg-white rounded-lg text-[#106ba3] shadow-sm border border-transparent hover:border-tech transition-all flex items-center gap-2 text-[10px] font-bold uppercase">
                             <Network size={14} /> Explorer
                          </Link>
                          <button className="p-2 hover:bg-white rounded-lg text-gray-400 shadow-sm border border-transparent hover:border-tech"><Settings2 size={14} /></button>
                          <button className="p-2 hover:bg-red-50 rounded-lg text-gray-300 hover:text-red-500"><Trash2 size={14} /></button>
                       </div>
                    </div>
                    <div className="p-8 flex items-center justify-between relative">
                       <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg">
                             <Database size={20} />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{link.from}</span>
                       </div>

                       <div className="flex-1 flex flex-col items-center gap-4 px-12">
                          <div className="w-full h-px bg-gray-200 relative group">
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-white border border-tech rounded-full text-[10px] font-bold text-[#106ba3] shadow-sm group-hover:scale-110 transition-transform">
                                {link.type}
                             </div>
                             <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-200" />
                          </div>
                       </div>

                       <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-purple-500 flex items-center justify-center text-white shadow-lg">
                             <Database size={20} />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{link.to}</span>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
