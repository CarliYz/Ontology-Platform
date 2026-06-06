import { useState, useEffect } from "react";
import { AlertCircle, Plus, Bell, Activity, Zap, Shield, Trash2, Clock, Settings } from "lucide-react";
import { cn } from "../../lib/utils";
import { governanceApi, AlertRule, AlertEvent } from "../../api/governance";

export default function Alerts() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'events' | 'rules'>('events');

  useEffect(() => {
    governanceApi.getAlertRules().then(setRules).catch(console.error);
    governanceApi.getAlertEvents().then(setEvents).catch(console.error);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <h2 className="text-[18px] font-bold text-on-surface uppercase italic tracking-tight">Integrity Alerts</h2>
          <p className="text-[12px] text-secondary font-medium mt-1">Real-time telemetry and violation detection.</p>
        </div>
        <div className="flex bg-surface-container-low border border-outline-variant p-0.5">
           {[
              { id: 'events', label: 'ALERT_INBOX', icon: Bell },
              { id: 'rules', label: 'MONITOR_RULES', icon: Activity }
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

      <div className="grid grid-cols-12 gap-8">
         <div className="col-span-12">
            {activeTab === 'events' ? (
               <div className="bg-outline-variant border border-outline-variant space-y-px">
                  {events.length === 0 ? (
                     <div className="p-16 text-center bg-white">
                        <Bell size={32} className="text-secondary opacity-20 mx-auto mb-4" />
                        <p className="text-[11px] font-mono font-bold uppercase text-secondary">System_Operational_Nominal</p>
                     </div>
                  ) : (
                     events.map(event => (
                        <div key={event.id} className="bg-white p-5 hover:bg-surface-container transition-all group flex items-center justify-between border-l-4 border-l-transparent hover:border-l-primary-container">
                           <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-10 h-10 flex items-center justify-center border",
                                event.severity === 'CRITICAL' ? "bg-rose-600 text-white border-rose-700" : "bg-primary-container text-white border-primary"
                              )}>
                                 <AlertCircle size={20} />
                              </div>
                              <div>
                                 <h4 className="text-[13px] font-bold text-on-surface uppercase italic tracking-tight mb-1">{event.message}</h4>
                                 <div className="flex items-center gap-4 text-[10px] font-mono font-bold text-secondary uppercase">
                                    <span className="bg-surface-container px-2 py-0.5 border border-outline-variant">RULE: {event.rule?.name}</span>
                                    <span>•</span>
                                    <span>SRC: {event.sourceType} ({event.sourceId})</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Clock size={10} /> {new Date(event.createdAt).toISOString()}</span>
                                 </div>
                              </div>
                           </div>
                           <button className="h-9 px-5 bg-on-surface text-white text-[10px] font-bold uppercase tracking-wider hover:bg-primary transition-all">
                              ACKNOWLEDGE
                           </button>
                        </div>
                     ))
                  )}
               </div>
            ) : (
               <div className="grid grid-cols-3 gap-6">
                  {rules.map(rule => (
                     <div key={rule.id} className="bg-white border border-outline-variant p-6 hover:border-primary-container transition-all group flex flex-col justify-between min-h-[200px]">
                        <div>
                           <div className="flex justify-between items-start mb-6">
                              <div className={cn(
                                "w-10 h-10 flex items-center justify-center border",
                                rule.category === 'PERFORMANCE' ? "bg-surface-container text-primary border-outline-variant" : "bg-surface-container text-secondary border-outline-variant"
                              )}>
                                 {rule.category === 'PERFORMANCE' ? <Zap size={18} /> : <Shield size={18} />}
                              </div>
                              <div className={cn(
                                "text-[9px] font-mono font-bold uppercase px-2 py-0.5 border",
                                rule.enabled ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-surface-container text-outline border-outline-variant"
                              )}>
                                 {rule.enabled ? 'ACTIVE' : 'PAUSED'}
                              </div>
                           </div>
                           <h4 className="text-[14px] font-bold text-on-surface uppercase italic tracking-tight mb-2">{rule.name}</h4>
                           <p className="text-[11px] font-mono text-outline font-medium uppercase tracking-tight">{rule.threshold}</p>
                        </div>
                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant">
                           <span className={cn(
                             "text-[10px] font-mono font-bold uppercase",
                             rule.severity === 'CRITICAL' ? 'text-rose-600' : 'text-primary'
                           )}>{rule.severity}_LVL</span>
                           <button className="text-outline hover:text-on-surface transition-colors">
                              <Settings className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                  ))}
                  <button className="border-2 border-dashed border-outline-variant p-10 flex flex-col items-center justify-center text-center group hover:border-primary-container transition-all bg-surface/50">
                     <div className="w-12 h-12 bg-white border border-outline-variant flex items-center justify-center text-outline group-hover:bg-primary-container group-hover:text-white mb-4 transition-all">
                        <Plus size={24} />
                     </div>
                     <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-outline">APPEND_NEW_RULE</span>
                  </button>
               </div>
            )}
         </div>
      </div>
    </div>
  );
}
