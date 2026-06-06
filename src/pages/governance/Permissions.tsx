import { useState, useEffect } from "react";
import { Users, Shield, Plus, Lock, Trash2, Key } from "lucide-react";
import { cn } from "../../lib/utils";
import { governanceApi, Role, PermissionRule } from "../../api/governance";

export default function Permissions() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [rules, setRules] = useState<PermissionRule[]>([]);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [rs, rls] = await Promise.all([
      governanceApi.getRoles(),
      governanceApi.getPermissions()
    ]);
    setRoles(rs);
    setRules(rls);
  };

  const createRole = async () => {
    if (!newRoleName) return;
    await governanceApi.createRole({ name: newRoleName });
    setNewRoleName("");
    setIsAddingRole(false);
    loadData();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end border-b border-outline-variant pb-6">
        <div>
          <h2 className="text-[18px] font-bold text-on-surface uppercase italic tracking-tight">Access Control</h2>
          <p className="text-[12px] text-secondary font-medium mt-1">Manage platform roles and granular permission rules.</p>
        </div>
        <button 
          onClick={() => setIsAddingRole(true)}
          className="h-10 px-6 bg-primary-container text-white text-[11px] font-bold uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-2"
        >
          <Plus size={14} /> NEW_ROLE
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-4 space-y-4">
           <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
              <Users size={12} /> SYSTEM_ROLES
           </h3>
           <div className="space-y-px bg-outline-variant border border-outline-variant">
              {roles.map(role => (
                 <div key={role.id} className="bg-white p-5 flex items-center justify-between group hover:bg-surface-container transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-surface-container-high flex items-center justify-center text-secondary group-hover:bg-primary-container group-hover:text-white transition-all">
                          <Users size={18} />
                       </div>
                       <div>
                          <p className="text-[12px] font-bold uppercase italic text-on-surface">{role.name}</p>
                          <p className="text-[10px] font-mono text-secondary uppercase font-medium mt-0.5">{role.rules?.length || 0} ACTIVE_NODES</p>
                       </div>
                    </div>
                    <Lock size={14} className="text-outline group-hover:text-primary transition-colors" />
                 </div>
              ))}
              {isAddingRole && (
                 <div className="bg-surface-container p-5 animate-in slide-in-from-top-2 border-t border-outline-variant">
                    <input 
                      autoFocus
                      value={newRoleName}
                      onChange={e => setNewRoleName(e.target.value)}
                      placeholder="ROLE_NAME..."
                      className="w-full bg-white border border-outline-variant px-3 py-2 outline-none text-[11px] font-mono uppercase tracking-tight placeholder:text-outline mb-4"
                    />
                    <div className="flex gap-1">
                       <button onClick={createRole} className="flex-1 py-2 bg-primary-container text-white text-[10px] font-bold uppercase">Confirm</button>
                       <button onClick={() => setIsAddingRole(false)} className="flex-1 py-2 bg-white border border-outline-variant text-on-surface text-[10px] font-bold uppercase">Cancel</button>
                    </div>
                 </div>
              )}
           </div>
        </div>

        <div className="col-span-8 space-y-4">
           <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
              <Shield size={12} /> PERMISSION_POLICIES
           </h3>
           <div className="bg-white border border-outline-variant shadow-sm overflow-hidden">
              <table className="w-full border-collapse">
                 <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                       <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-secondary text-left border-r border-outline-variant">Role Context</th>
                       <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-secondary text-left border-r border-outline-variant">Resource Node</th>
                       <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-secondary text-left border-r border-outline-variant">Operation</th>
                       <th className="p-4 text-[10px] font-mono font-bold uppercase tracking-widest text-secondary text-left">Result</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-outline-variant">
                    {rules.map(rule => (
                       <tr key={rule.id} className="hover:bg-surface-container transition-colors group">
                          <td className="p-4 border-r border-outline-variant">
                             <span className="text-[11px] font-bold uppercase text-on-surface italic tracking-tight">{rule.role?.name}</span>
                          </td>
                          <td className="p-4 border-r border-outline-variant">
                             <span className="text-[11px] font-mono font-medium text-secondary uppercase bg-surface-container px-1.5 py-0.5 border border-outline-variant">{rule.resource}</span>
                          </td>
                          <td className="p-4 border-r border-outline-variant">
                             <div className="flex items-center gap-2">
                                <Key size={12} className="text-outline" />
                                <span className="text-[11px] font-bold uppercase text-secondary group-hover:text-on-surface transition-colors">{rule.action}</span>
                             </div>
                          </td>
                          <td className="p-4">
                             <span className={cn(
                               "px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight",
                               rule.effect === 'ALLOW' ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-rose-100 text-rose-800 border border-rose-200"
                             )}>
                                {rule.effect}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
              {rules.length === 0 && (
                 <div className="p-16 text-center bg-surface-container-lowest">
                    <Shield size={32} className="text-outline-variant mx-auto mb-4" />
                    <p className="text-[11px] font-mono font-bold uppercase text-outline">Null_Policy_Set</p>
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
