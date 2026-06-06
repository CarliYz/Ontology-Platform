import { useState, useEffect } from "react";
import { Settings, Save, RefreshCw, Layers, Database, Shield, Zap, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import { governanceApi, ConfigItem } from "../../api/governance";

export default function Configuration() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    governanceApi.getConfigs().then(setConfigs).catch(console.error);
  }, []);

  const handleSave = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      await governanceApi.saveConfig({ key, value });
      const updated = await governanceApi.getConfigs();
      setConfigs(updated);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <h2 className="text-[18px] font-bold text-on-surface uppercase italic tracking-tight">Environment_Config</h2>
          <p className="text-[12px] text-secondary font-medium mt-1">Platform parameter fine-tuning and global state management.</p>
        </div>
        <button className="h-9 px-5 bg-white border border-outline-variant text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-surface-container transition-all">
           <RefreshCw size={14} /> REFRESH_CACHE
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
         <div className="col-span-12 lg:col-span-8 space-y-8">
            <div className="bg-white border border-outline-variant shadow-sm overflow-hidden">
               <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex items-center gap-3">
                  <Layers size={14} className="text-primary" />
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-secondary">GENERAL_PARAMETERS</h3>
               </div>
               
               <div className="divide-y divide-outline-variant px-6 pb-6">
                  <ConfigRow 
                    label="Platform_Mode" 
                    value={configs.find(c => c.key === 'platform_mode')?.value || "PRODUCTION"} 
                    onSave={v => handleSave('platform_mode', v)}
                    options={["PRODUCTION", "MAINTENANCE", "DEBUG"]}
                  />
                  <ConfigRow 
                    label="Autoscale_Threshold" 
                    value={configs.find(c => c.key === 'autoscale_threshold')?.value || "0.85"} 
                    onSave={v => handleSave('autoscale_threshold', v)}
                  />
                  <ConfigRow 
                    label="Audit_Retention_Days" 
                    value={configs.find(c => c.key === 'audit_retention_days')?.value || "365"} 
                    onSave={v => handleSave('audit_retention_days', v)}
                  />
               </div>
            </div>

            <div className="bg-white border border-outline-variant shadow-sm overflow-hidden">
               <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex items-center gap-3">
                  <Shield size={14} className="text-rose-600" />
                  <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-secondary">SECURITY_COMPLIANCE</h3>
               </div>
               
               <div className="divide-y divide-outline-variant px-6 pb-6">
                  <ConfigRow 
                    label="Enforce_2FA_on_Publish" 
                    value={configs.find(c => c.key === 'enforce_2fa')?.value || "TRUE"} 
                    onSave={v => handleSave('enforce_2fa', v)}
                    options={["TRUE", "FALSE"]}
                  />
                  <ConfigRow 
                    label="Default_Actor_Role" 
                    value={configs.find(c => c.key === 'default_actor_role')?.value || "VIEWER"} 
                    onSave={v => handleSave('default_actor_role', v)}
                  />
               </div>
            </div>
         </div>

         <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="bg-on-surface border border-on-surface p-8 text-white shadow-2xl flex flex-col">
               <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-white/10 border border-white/20 flex items-center justify-center">
                     <Info size={18} />
                  </div>
                  <h4 className="text-[16px] font-bold uppercase italic tracking-tight underline underline-offset-4 decoration-primary">Safety_Protocol</h4>
               </div>
               <p className="text-[11px] text-surface-dim leading-relaxed font-medium uppercase tracking-tight mb-10">
                  Global configuration changes are applied immediately to all clusters. 
                  Transient failures may occur during the propagation stage.
               </p>
               <div className="p-4 bg-white/5 border border-white/10 mt-auto">
                  <p className="text-[9px] font-mono text-outline uppercase mb-2">SYSTEM_ACTOR_TRACE</p>
                  <p className="text-[11px] font-mono font-bold uppercase tracking-widest">ADMIN_SYSTEM_BOOT_LOG</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function ConfigRow({ label, value, onSave, options }: { label: string, value: string, onSave: (v: string) => void, options?: string[] }) {
   const [val, setVal] = useState(value);
   
   useEffect(() => {
     setVal(value);
   }, [value]);

   return (
      <div className="grid grid-cols-12 pt-8 group gap-4 relative">
         <div className="col-span-12 lg:col-span-4">
            <p className="text-[10px] font-mono font-bold uppercase text-secondary group-hover:text-primary transition-colors tracking-tight italic">{label}</p>
         </div>
         <div className="col-span-12 lg:col-span-8 flex items-center gap-3">
            {options ? (
               <select 
                 value={val}
                 onChange={e => setVal(e.target.value)}
                 className="flex-1 bg-surface-container-low border border-outline-variant px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-tight outline-none focus:border-primary transition-all"
               >
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
               </select>
            ) : (
               <input 
                 value={val}
                 onChange={e => setVal(e.target.value)}
                 className="flex-1 bg-surface-container-low border border-outline-variant px-3 py-1.5 text-[11px] font-mono font-bold uppercase tracking-tight outline-none focus:border-primary transition-all"
               />
            )}
            <div className="w-10 shrink-0">
               {val !== value && (
                  <button 
                    onClick={() => onSave(val)}
                    className="h-8 w-8 bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all animate-in zoom-in"
                  >
                     <Save size={14} />
                  </button>
               )}
            </div>
         </div>
      </div>
   );
}
