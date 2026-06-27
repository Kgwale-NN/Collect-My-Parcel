import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DriverRating({ parcel, onRated }) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) { toast.error('Please select a star rating'); return; }
    setLoading(true);

    // Save rating on parcel
    await base44.entities.Parcel.update(parcel.id, {
      driver_rating: selected,
      driver_rating_comment: comment || undefined
    });

    // Update driver's average rating
    const drivers = await base44.entities.User.filter({ email: parcel.driver_email });
    if (drivers.length > 0) {
      const driver = drivers[0];
      const deliveries = driver.total_deliveries || 1;
      const currentRating = driver.rating || 5;
      // Rolling average
      const newRating = Math.round(((currentRating * (deliveries - 1)) + selected) / deliveries * 10) / 10;
      await base44.entities.User.update(driver.id, { rating: newRating });
    }

    toast.success('Thanks for your feedback!');
    setLoading(false);
    onRated();
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
      <p className="text-sm font-semibold text-amber-900 mb-1">Rate your driver</p>
      <p className="text-xs text-amber-700 mb-3">How was your experience with {parcel.driver_name}?</p>

      {/* Stars */}
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setSelected(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="focus:outline-none"
          >
            <Star
              className="h-7 w-7 transition-colors"
              fill={(hovered || selected) >= star ? '#f59e0b' : 'none'}
              stroke={(hovered || selected) >= star ? '#f59e0b' : '#d1d5db'}
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={2}
        className="text-sm mb-3 bg-white"
      />

      <Button size="sm" onClick={handleSubmit} disabled={loading || !selected} className="rounded-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit Rating'}
      </Button>
    </div>
  );
}