import { useState, useEffect } from "react";
import { BarChart3, PieChart, LineChart, Database, Zap, TrendingUp, Filter, Search, ArrowUpRight, Activity } from "lucide-react";
import { cn } from "../../lib/utils";
import { governanceApi, CostRecord } from "../../api/governance";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function OQCM() {
  const [records, setRecords] = useState<CostRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'explorer' | 'attribution'>('dashboard');

  useEffect(() => {
    governanceApi.getCostRecords().then(setRecords).catch(console.error);
  }, []);

  const totalCompute = records.reduce((s, r) => s + r.computeSecs, 0);
  const totalQueries = records.reduce((s, r) => s + r.queryCount, 0);

  const chartData = records.slice(0, 20).reverse().map(r => ({
    time: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    compute: r.computeSecs,
    queries: r.queryCount
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <h2 className="text-[18px] font-bold text-on-surface uppercase italic tracking-tight">OQ_Matrix</h2>
          <p className="text-[12px] text-secondary font-medium mt-1">Operational Quality & Cost Management telemetry.</p>
        </div>
        <div className="flex bg-surface-container-low border border-outline-variant p-0.5">
           {[
              { id: 'dashboard', label: 'OVERVIEW', icon: BarChart3 },
              { id: 'explorer', label: 'RAW_EXPLORER', icon: Database },
              { id: 'attribution', label: 'ATTRIBUTION', icon: PieChart }
           ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-5 py-2 text-[10px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                  activeTab === tab.id ? "bg-white text-primary border border-outline-variant shadow-sm" : "text-secondary hover:text-on-surface"
                )}
              >
                 <tab.icon size={13} />
                 {tab.label}
              </button>
           ))}
        </div>
      </div>

      <AnimateContent activeTab={activeTab}>
         {activeTab === 'dashboard' && (
            <div className="space-y-8">
               <div className="grid grid-cols-4 gap-px bg-outline-variant border border-outline-variant">
                  {[
                    { label: 'Compute_Load', value: `${totalCompute.toFixed(2)}s`, icon: Zap, color: 'text-primary' },
                    { label: 'Query_Velocity', value: totalQueries.toLocaleString(), icon: TrendingUp, color: 'text-emerald-600' },
                    { label: 'Intensity_Lvl', value: 'High', icon: Database, color: 'text-secondary' },
                    { label: 'Cost_Index', value: 'NOMINAL', icon: LineChart, color: 'text-on-surface' }
                  ].map(stat => (
                    <div key={stat.label} className="bg-white p-6 space-y-4 shadow-sm hover:bg-surface-container transition-colors">
                       <div className="w-9 h-9 bg-surface-container flex items-center justify-center text-secondary border border-outline-variant">
                          <stat.icon size={16} />
                       </div>
                       <div>
                          <p className="text-[10px] font-mono font-bold uppercase text-secondary mb-1">{stat.label}</p>
                          <p className={cn("text-[20px] font-bold italic tracking-tight uppercase", stat.color)}>{stat.value}</p>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="bg-white border border-outline-variant shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                     <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                        <Activity size={12} /> COMPUTE_QUERY_VELOCITY_DATA
                     </h3>
                     <div className="flex gap-4">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-primary" /> <span className="text-[9px] font-mono font-bold text-secondary">COMPUTE</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500" /> <span className="text-[9px] font-mono font-bold text-secondary">QUERIES</span></div>
                     </div>
                  </div>
                  <div className="h-80 w-full p-8 border-b border-outline-variant">
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                           <CartesianGrid strokeDasharray="1 3" vertical={false} stroke="#e2e8f0" />
                           <XAxis 
                             dataKey="time" 
                             axisLine={{ stroke: '#cbd5e1' }} 
                             tickLine={false} 
                             tick={{fontSize: 9, fill: '#64748b', fontFamily: 'Space Grotesk'}} 
                           />
                           <YAxis 
                             axisLine={{ stroke: '#cbd5e1' }} 
                             tickLine={false} 
                             tick={{fontSize: 9, fill: '#64748b', fontFamily: 'Space Grotesk'}} 
                           />
                           <Tooltip 
                             contentStyle={{borderRadius: '0', border: '1px solid #e2e8f0', fontFamily: 'Space Grotesk', fontSize: '10px'}} 
                           />
                           <Area type="stepBefore" dataKey="compute" stroke="#004a96" strokeWidth={2} fillOpacity={0.05} fill="#004a96" />
                           <Area type="stepBefore" dataKey="queries" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>
            </div>
         )}

         {activeTab === 'explorer' && (
            <div className="bg-white border border-outline-variant shadow-sm overflow-hidden">
               <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                  <div className="flex items-center gap-4 bg-white border border-outline-variant px-3 py-2">
                     <Search size={14} className="text-outline" />
                     <input type="text" placeholder="FILTER_RECORDS..." className="bg-transparent border-none outline-none text-[11px] font-mono uppercase w-64 placeholder:text-outline" />
                  </div>
                  <button className="flex items-center gap-2 h-9 px-4 bg-white border border-outline-variant text-[10px] font-bold text-on-surface uppercase hover:bg-surface-container">
                     <Filter size={14} /> FILTER_NODE
                  </button>
               </div>
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-surface-container-low border-b border-outline-variant text-[10px] font-mono font-bold uppercase text-secondary">
                        <th className="px-6 py-3 border-r border-outline-variant">Timestamp_UTC</th>
                        <th className="px-6 py-3 border-r border-outline-variant">Control_Window</th>
                        <th className="px-6 py-3 border-r border-outline-variant text-right">Compute (s)</th>
                        <th className="px-6 py-3 border-r border-outline-variant text-right">Queries</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                     {records.map(record => (
                        <tr key={record.id} className="hover:bg-surface-container transition-colors group">
                           <td className="px-6 py-3 text-[11px] font-mono font-medium text-secondary border-r border-outline-variant">{new Date(record.createdAt).toISOString()}</td>
                           <td className="px-6 py-3 border-r border-outline-variant">
                              <span className="px-2 py-0.5 bg-surface-container border border-outline-variant text-[9px] font-mono font-bold uppercase">{record.window}</span>
                           </td>
                           <td className="px-6 py-3 border-r border-outline-variant text-[11px] font-bold text-on-surface text-right">{record.computeSecs.toFixed(3)}</td>
                           <td className="px-6 py-3 border-r border-outline-variant text-[11px] font-bold text-secondary text-right">{record.queryCount}</td>
                           <td className="px-6 py-3 text-right">
                              <button className="text-outline hover:text-primary transition-colors"><ArrowUpRight size={16} /></button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         )}

         {activeTab === 'attribution' && (
            <div className="grid grid-cols-12 gap-8">
               <div className="col-span-12 lg:col-span-7 bg-white border border-outline-variant p-10 shadow-sm flex flex-col justify-center min-h-[400px]">
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-secondary mb-10 text-center">COMPUTE_RESOURCE_DISTRIBUTION</h3>
                  <div className="h-64 w-full flex items-center justify-center relative">
                     <div className="w-48 h-48 border-8 border-primary rounded-full border-t-transparent animate-[spin_3s_linear_infinite]" />
                     <p className="text-[10px] font-mono font-bold text-outline uppercase absolute text-center">Realtime_Mapping<br/>In_Progress</p>
                  </div>
               </div>
               <div className="col-span-12 lg:col-span-5 bg-on-surface border border-on-surface p-10 text-white shadow-2xl flex flex-col justify-between">
                  <div>
                     <h3 className="text-[20px] font-bold italic uppercase tracking-tight mb-2">Usage_Attribution</h3>
                     <p className="text-[12px] opacity-60 font-medium mb-12">Identification of origin for computational resource loading.</p>
                     
                     <div className="space-y-8">
                        <AttributionRow label="SYSTEM_AUTOMATION" value={72} />
                        <AttributionRow label="END_USER_QUERIES" value={18} />
                        <AttributionRow label="BACKGROUND_JOBS" value={10} />
                     </div>
                  </div>
                  <button className="w-full h-12 bg-white text-on-surface text-[11px] font-bold uppercase tracking-widest hover:bg-surface-container transition-all">
                     GENERATE_AUDIT_REPORT
                  </button>
               </div>
            </div>
         )}
      </AnimateContent>
    </div>
  );
}

function AttributionRow({ label, value }: { label: string, value: number }) {
   return (
      <div className="space-y-2">
         <div className="flex justify-between text-[10px] font-mono font-bold uppercase tracking-widest text-surface-dim">
            <span>{label}</span>
            <span>{value}%</span>
         </div>
         <div className="h-1 bg-white/10 overflow-hidden border border-white/5">
            <div className="h-full bg-primary" style={{ width: `${value}%` }} />
         </div>
      </div>
   );
}

function AnimateContent({ activeTab, children }: any) {
   return <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-4 duration-500">{children}</div>;
}
