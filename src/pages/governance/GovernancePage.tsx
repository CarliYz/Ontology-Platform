import { useState } from "react";
import { 
  ShieldCheck, 
  Users, 
  Fingerprint, 
  AlertCircle, 
  Activity, 
  Database,
  RefreshCcw,
  Zap,
  Settings,
  User
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { NavLink, useLocation, Outlet } from "react-router-dom";

export default function GovernancePage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [showIdentitySwitcher, setShowIdentitySwitcher] = useState(false);
  const [currentRole, setCurrentRole] = useState(localStorage.getItem('gov_actor_role') || 'ADMIN');
  const location = useLocation();

  const startScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 800);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const switchRole = (role: string) => {
    localStorage.setItem('gov_actor_role', role);
    setCurrentRole(role);
    window.location.reload(); // Quick way to reset all states and headers
  };

  const navItems = [
    { to: '/governance/usage', label: 'Analytics', icon: Activity },
    { to: '/governance/permissions', label: 'Permissions', icon: Users },
    { to: '/governance/audit', label: 'Audit Log', icon: Fingerprint },
    { to: '/governance/alerts', label: 'Alerts', icon: AlertCircle },
    { to: '/governance/oqcm', label: 'OQCM', icon: Database },
    { to: '/governance/config', label: 'Configuration', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden font-sans">
      {/* Header Overlay for Scanning */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-[100] bg-primary-container text-white px-8 py-3 flex items-center justify-between shadow-lg border-b border-primary"
          >
            <div className="flex items-center gap-4">
               <RefreshCcw size={16} className="animate-spin" />
               <span className="text-[11px] font-mono font-bold uppercase tracking-widest">Compliance_Scan_In_Progress: {scanProgress}%</span>
            </div>
            <div className="w-64 h-1 bg-white/20 overflow-hidden">
               <motion.div 
                 className="h-full bg-white" 
                 initial={{ width: 0 }}
                 animate={{ width: `${scanProgress}%` }}
               />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Identity Switcher Modal */}
      <AnimatePresence>
        {showIdentitySwitcher && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setShowIdentitySwitcher(false)}
               className="absolute inset-0 bg-on-surface/40 backdrop-blur-[2px]"
             />
             <motion.div 
               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
               className="bg-white border border-outline w-full max-w-sm p-0 relative z-10 shadow-2xl"
             >
                <div className="p-6 border-b border-outline-variant bg-surface-container-low">
                   <h3 className="text-[16px] font-bold uppercase tracking-tight text-on-surface italic">Switch Context</h3>
                </div>
                <div className="p-2 bg-surface-container-lowest">
                   {['ADMIN', 'DATA_STEWARD', 'USER_VIEWER', 'ANALYST'].map(role => (
                      <button 
                         key={role}
                         onClick={() => switchRole(role)}
                         className={cn(
                           "w-full p-4 text-left transition-all flex items-center justify-between group border border-transparent",
                           currentRole === role ? "bg-primary-container text-white" : "hover:bg-surface-container hover:border-outline-variant"
                         )}
                      >
                         <span className="text-[12px] font-mono font-medium uppercase tracking-wider">{role}</span>
                         {currentRole === role && <ShieldCheck size={16} />}
                      </button>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <header className="bg-white border-b border-outline-variant px-8 pt-8 shrink-0 relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary text-white flex items-center justify-center border border-primary-container">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-[20px] font-bold tracking-tight text-on-surface uppercase italic leading-none">GOVERNANCE_SYSTEM</h1>
              <div className="flex items-center gap-3 mt-1.5 font-mono text-[11px] font-medium tracking-[0.05em]">
                 <span className="bg-surface-container px-2 py-0.5 border border-outline-variant text-secondary">V6.0.0_STABLE</span>
                 <button 
                  onClick={() => setShowIdentitySwitcher(true)}
                  className="flex items-center gap-1.5 px-2 py-0.5 bg-primary-container text-white uppercase hover:bg-primary transition-colors"
                 >
                   <User size={10} /> ACTOR: {currentRole}
                 </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-[1px] bg-outline-variant border border-outline-variant shadow-sm">
            <button 
              onClick={startScan} 
              disabled={isScanning}
              className="h-10 px-5 bg-white text-on-surface font-bold text-[11px] uppercase tracking-wider hover:bg-surface-container transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCcw size={14} className={cn(isScanning && "animate-spin")} /> 
              {isScanning ? "SCAN_ACTIVE..." : "INITIALIZE_SCAN"}
            </button>
            <button 
              onClick={() => alert("系统节点状态: 正常 (Healthy)\n计算资源: 42%\n存储负载: 18%")}
              className="h-10 px-5 bg-primary-container text-white font-bold text-[11px] uppercase tracking-wider hover:bg-primary transition-all flex items-center gap-2 group"
            >
              <Zap size={14} className="group-hover:fill-current" /> NODE_HEALTH
            </button>
          </div>
        </div>

        <nav className="flex gap-px bg-outline-variant border-x border-t border-outline-variant">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "px-6 py-3 text-[11px] font-mono font-medium uppercase tracking-[0.05em] flex items-center gap-2 transition-all relative border-t-2 border-transparent",
                isActive ? "bg-white text-primary border-t-primary-container" : "bg-surface-container-low text-secondary hover:bg-surface-container hover:text-on-surface"
              )}
            >
              <item.icon size={14} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-surface relative">
         <Outlet />
      </main>
    </div>
  );
}
