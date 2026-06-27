import React from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">Collect My Parcel</span>
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
            <Link to="/request" className="hover:text-foreground transition-colors">Request Pickup</Link>
            <Link to="/driver-signup" className="hover:text-foreground transition-colors">Become a Driver</Link>
            <Link to="/track" className="hover:text-foreground transition-colors">Track Parcel</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms & Privacy</Link>
            <a href="mailto:support@collectmyparcel.com" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Copyright {new Date().getFullYear()} Collect My Parcel. All rights reserved. Drivers are independent contractors.
          </p>
        </div>
      </div>
    </footer>
  );
}
