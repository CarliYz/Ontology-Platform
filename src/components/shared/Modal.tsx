import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'warning' | 'error' | 'success' | 'confirm';
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  type = 'info',
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl",
                    type === 'error' ? "bg-red-50 text-red-500" :
                    type === 'warning' ? "bg-amber-50 text-amber-500" :
                    type === 'success' ? "bg-emerald-50 text-emerald-500" :
                    type === 'confirm' ? "bg-blue-50 text-blue-500" :
                    "bg-slate-50 text-slate-500"
                  )}>
                    {type === 'error' && <AlertCircle size={24} />}
                    {type === 'warning' && <AlertCircle size={24} />}
                    {type === 'success' && <CheckCircle2 size={24} />}
                    {type === 'confirm' && <HelpCircle size={24} />}
                    {type === 'info' && <CheckCircle2 size={24} />}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="text-sm text-slate-600 leading-relaxed font-medium">
                {children}
              </div>

              <div className="flex gap-4 pt-4">
                {(type === 'confirm' || onConfirm) && (
                  <button
                    onClick={onClose}
                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs hover:bg-slate-200 transition-all"
                  >
                    {cancelText}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (onConfirm) onConfirm();
                    onClose();
                  }}
                  className={cn(
                    "flex-1 py-4 rounded-2xl font-bold text-xs transition-all shadow-xl",
                    type === 'error' ? "bg-red-600 text-white shadow-red-100" :
                    type === 'warning' ? "bg-amber-600 text-white shadow-amber-100" :
                    type === 'success' ? "bg-emerald-600 text-white shadow-emerald-100" :
                    type === 'confirm' ? "bg-blue-600 text-white shadow-blue-100" :
                    "bg-slate-900 text-white shadow-slate-200"
                  )}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
