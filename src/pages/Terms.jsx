import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Terms & Privacy</h1>
            <p className="text-sm text-muted-foreground">Collect My Parcel</p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">
          <section>
            <h2 className="text-lg font-bold mb-3">Terms of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using Collect My Parcel (CMP), you agree to these terms. CMP is a platform connecting customers who need parcel pickup and delivery with independent drivers. We act as an intermediary and are not liable for the parcels or their contents.
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground list-disc list-inside">
              <li>You must be 18 years or older to use this service.</li>
              <li>You are responsible for the accuracy of addresses and parcel information.</li>
              <li>CMP reserves the right to cancel any request that violates our policies.</li>
              <li>Prices are estimates and may vary based on actual distance and conditions.</li>
              <li>Drivers are independent contractors, not employees of CMP.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">For Drivers</h2>
            <p className="text-muted-foreground leading-relaxed">
              By registering as a driver, you confirm that you have a valid ID, are legally permitted to work, and will handle parcels with care. CMP may revoke your access at any time for policy violations.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Privacy Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect your name, email address, phone number, and location data to facilitate deliveries. We do not sell your data to third parties.
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground list-disc list-inside">
              <li>Your email is used for delivery notifications only.</li>
              <li>Location data is used to calculate routes and match nearby drivers.</li>
              <li>Driver documents are stored securely and reviewed by our team only.</li>
              <li>You may request deletion of your data by contacting us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">Contact</h2>
            <p className="text-muted-foreground">
              Questions? Email us at <a href="mailto:support@collectmyparcel.com" className="text-primary underline">support@collectmyparcel.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}