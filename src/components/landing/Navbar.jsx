import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, Menu, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const handleRequestPickup = () => {
    base44.auth.isAuthenticated().then(auth => {
      if (auth) window.location.href = '/request';
      else base44.auth.redirectToLogin('/request');
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">CMP</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#for-drivers" className="text-sm text-muted-foreground hover:text-foreground transition-colors">For Drivers</a>
            <Link to="/track" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Track</Link>
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">Dashboard</Button>
            </Link>
            <Button size="sm" className="rounded-full px-5" onClick={handleRequestPickup}>Request Pickup</Button>
          </div>

          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#how-it-works" className="block py-2 text-sm text-muted-foreground" onClick={() => setOpen(false)}>How it works</a>
            <a href="#for-drivers" className="block py-2 text-sm text-muted-foreground" onClick={() => setOpen(false)}>For Drivers</a>
            <Link to="/track" className="block py-2 text-sm text-muted-foreground" onClick={() => setOpen(false)}>Track Parcel</Link>
            <Link to="/dashboard" className="block py-2 text-sm" onClick={() => setOpen(false)}>Dashboard</Link>
            <Button size="sm" className="w-full rounded-full" onClick={() => { setOpen(false); handleRequestPickup(); }}>Request Pickup</Button>
          </div>
        )}
      </div>
    </nav>
  );
}