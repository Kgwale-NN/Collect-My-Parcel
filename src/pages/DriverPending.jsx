import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DriverPending() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkStatus = async () => {
      try {
        const user = await base44.auth.me();
        if (!mounted) return;
        if (user?.driver_status === 'approved') {
          toast.success('You are approved. Welcome to CMP Driver.');
          navigate('/dashboard');
        }
      } catch (error) {
        base44.auth.redirectToLogin('/driver-pending');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-card rounded-3xl shadow-xl border border-border p-10 text-center">
        <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-5">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Your driver application is under review. Our team will verify your documents and notify you by email within <strong>24 hours</strong>.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left mb-6">
          <p className="font-semibold mb-1">What happens next?</p>
          <ul className="space-y-1 text-amber-700 list-disc list-inside">
            <li>We review your ID and documents</li>
            <li>You'll receive an approval or feedback email</li>
            <li>Once approved, you can start accepting jobs</li>
          </ul>
        </div>
        <Link to="/dashboard">
          <Button className="w-full rounded-full">
            <Package className="h-4 w-4 mr-2" /> Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
