import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 text-slate-950 px-4 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-md border border-amber-400">
      <span className="relative flex h-2.5 w-2.5 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-slate-950"></span>
      </span>
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Tryb offline — aplikacja i stoper działają w pełni bez dostępu do sieci.</span>
    </div>
  );
};
