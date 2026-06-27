import React from 'react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const statusColors = {
  requested: 'bg-amber-100 text-amber-800 border-amber-200',
  accepted: 'bg-blue-100 text-blue-800 border-blue-200',
  collected: 'bg-purple-100 text-purple-800 border-purple-200',
  in_transit: 'bg-orange-100 text-orange-800 border-orange-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-gray-100 text-gray-600 border-gray-200',
};

const statusLabels = {
  requested: 'Requested',
  accepted: 'Accepted',
  collected: 'Collected',
  in_transit: 'In Transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function AdminParcelRow({ parcel }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/30 transition-colors">
      <td className="p-3 font-medium">{parcel.store_name}</td>
      <td className="p-3 text-muted-foreground hidden sm:table-cell">{parcel.customer_name || parcel.customer_email}</td>
      <td className="p-3 text-muted-foreground hidden md:table-cell">{parcel.driver_name || '—'}</td>
      <td className="p-3">
        <Badge variant="outline" className={`${statusColors[parcel.status]} border text-xs`}>
          {statusLabels[parcel.status]}
        </Badge>
      </td>
      <td className="p-3 font-semibold text-primary hidden sm:table-cell">
        {parcel.price ? `${parcel.currency || '$'}${parcel.price}` : '—'}
      </td>
      <td className="p-3 hidden lg:table-cell">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          parcel.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
        }`}>
          {parcel.payment_method === 'cash' ? '💵 Cash' : '💳 Card'} · {parcel.payment_status || 'pending'}
        </span>
      </td>
      <td className="p-3 text-xs text-muted-foreground hidden xl:table-cell">
        {parcel.created_date ? format(new Date(parcel.created_date), 'dd MMM, HH:mm') : '—'}
      </td>
    </tr>
  );
}