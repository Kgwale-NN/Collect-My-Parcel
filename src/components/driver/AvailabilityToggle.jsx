import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Wifi, WifiOff } from 'lucide-react';

export default function AvailabilityToggle({ user, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const isAvailable = user?.is_available === true;

  const toggle = async () => {
    setLoading(true);
    await base44.auth.updateMe({ is_available: !isAvailable });
    toast.success(isAvailable ? 'You are now offline' : 'You are now online — ready for jobs!');
    if (onUpdate) onUpdate();
    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all
        ${isAvailable
          ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
          : 'bg-muted border-border text-muted-foreground hover:bg-muted/80'
        }`}
    >
      {loading ? (
        <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isAvailable ? (
        <Wifi className="h-3.5 w-3.5" />
      ) : (
        <WifiOff className="h-3.5 w-3.5" />
      )}
      {isAvailable ? 'Online' : 'Offline'}
    </button>
  );
}