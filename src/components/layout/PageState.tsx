import React from 'react';
import { Loader2, AlertCircle, Inbox } from 'lucide-react';
import { PageStatus } from '../../types/common';

interface PageStateProps {
  status: PageStatus;
  children: React.ReactNode;
  onRetry?: () => void;
  message?: string;
}

export default function PageState({ status, children, onRetry, message }: PageStateProps) {
  if (status === PageStatus.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
        <p className="text-sm font-medium">{message || 'Loading resources...'}</p>
      </div>
    );
  }

  if (status === PageStatus.ERROR) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center shadow-inner">
          <AlertCircle size={32} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Operation Failed</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
            {message || 'An unexpected error occurred while fetching data.'}
          </p>
        </div>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Retry Connection
          </button>
        )}
      </div>
    );
  }

  if (status === PageStatus.EMPTY) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4 text-center">
        <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
          <Inbox size={32} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-slate-400">No content found</h3>
          <p className="text-sm text-slate-300">Try adjusting your filters or creating a new entry.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
