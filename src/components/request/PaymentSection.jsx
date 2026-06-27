import React, { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Lock } from 'lucide-react';

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Cash', sub: 'Pay driver on delivery', icon: Banknote },
  { value: 'card', label: 'Card', sub: 'Visa, Mastercard', icon: CreditCard },
  { value: 'wallet', label: 'Wallet / EFT', sub: 'SnapScan, Zapper, EFT', icon: Smartphone },
];

export default function PaymentSection({ value, onChange, cardDetails, onCardChange }) {
  const [focused, setFocused] = useState('');

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">Payment Method</p>

      <div className="grid grid-cols-3 gap-2">
        {PAYMENT_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-all
              ${value === opt.value
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40'
              }`}
          >
            <opt.icon className="h-5 w-5" />
            <span className="text-xs font-semibold">{opt.label}</span>
            <span className="text-[10px] text-center leading-tight opacity-70">{opt.sub}</span>
          </button>
        ))}
      </div>

      {value === 'card' && (
        <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Card Details</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" /> Secure
            </div>
          </div>

          {/* Card number */}
          <div className="relative">
            <input
              type="text"
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              value={cardDetails.number || ''}
              onChange={e => onCardChange('number', formatCardNumber(e.target.value))}
              onFocus={() => setFocused('number')}
              onBlur={() => setFocused('')}
              className={`w-full h-11 rounded-xl border bg-background px-4 text-sm font-mono tracking-widest transition-all
                ${focused === 'number' ? 'border-primary ring-1 ring-primary/30' : 'border-border'}
                focus:outline-none`}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-4 object-contain opacity-70" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="MC" className="h-4 object-contain opacity-70" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                value={cardDetails.expiry || ''}
                onChange={e => onCardChange('expiry', formatExpiry(e.target.value))}
                onFocus={() => setFocused('expiry')}
                onBlur={() => setFocused('')}
                className={`w-full h-11 rounded-xl border bg-background px-4 text-sm font-mono transition-all
                  ${focused === 'expiry' ? 'border-primary ring-1 ring-primary/30' : 'border-border'}
                  focus:outline-none`}
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="CVV"
                maxLength={4}
                value={cardDetails.cvv || ''}
                onChange={e => onCardChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                onFocus={() => setFocused('cvv')}
                onBlur={() => setFocused('')}
                className={`w-full h-11 rounded-xl border bg-background px-4 text-sm font-mono transition-all
                  ${focused === 'cvv' ? 'border-primary ring-1 ring-primary/30' : 'border-border'}
                  focus:outline-none`}
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Name on card"
            value={cardDetails.name || ''}
            onChange={e => onCardChange('name', e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused('')}
            className={`w-full h-11 rounded-xl border bg-background px-4 text-sm transition-all
              ${focused === 'name' ? 'border-primary ring-1 ring-primary/30' : 'border-border'}
              focus:outline-none`}
          />
        </div>
      )}

      {value === 'wallet' && (
        <div className="bg-muted/40 border border-border rounded-2xl p-4 text-sm text-muted-foreground text-center">
          💳 You'll receive payment instructions after your request is confirmed.
        </div>
      )}
    </div>
  );
}