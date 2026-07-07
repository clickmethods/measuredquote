// Address-only step — replaces the full lead gate at the front of the flow.
// Conversion strategy: ask ONLY for the project address up front (needed for
// the satellite map), show a rough range after drawing, and gate the itemized
// estimate behind name + phone on the results screen.

import { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';

export interface AddressData {
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Props {
  onSubmit: (data: AddressData) => void;
}

export default function EstimatorStepAddress({ onSubmit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [form, setForm] = useState<AddressData>({ streetAddress: '', city: '', state: '', zipCode: '' });
  const [error, setError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.opacity = '0';
      ref.current.style.transform = 'translateX(30px)';
      requestAnimationFrame(() => {
        if (ref.current) {
          ref.current.style.transition = 'opacity 400ms ease-out, transform 400ms ease-out';
          ref.current.style.opacity = '1';
          ref.current.style.transform = 'translateX(0)';
        }
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const maps = await loadGoogleMaps();
        if (!mounted || !addressInputRef.current) return;
        if (!maps.places) {
          setShowManual(true);
          return;
        }
        const ac = new maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address'],
        });
        autocompleteRef.current = ac;
        ac.addListener('place_changed', () => {
          const place = ac.getPlace();
          if (!place.address_components) return;
          let streetNumber = '', route = '', city = '', state = '', zip = '';
          for (const c of place.address_components) {
            const type = c.types[0];
            if (type === 'street_number') streetNumber = c.long_name;
            else if (type === 'route') route = c.long_name;
            else if ((type === 'locality' || type === 'sublocality' || type === 'sublocality_level_1') && !city) city = c.long_name;
            else if (type === 'administrative_area_level_1') state = c.short_name;
            else if (type === 'postal_code') zip = c.long_name;
          }
          setForm({
            streetAddress: `${streetNumber} ${route}`.trim(),
            city,
            state,
            zipCode: zip,
          });
          setSelected(true);
          setError(null);
        });
      } catch {
        setShowManual(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.streetAddress || form.streetAddress.length < 5) {
      setError('Please search and select your project address.');
      return;
    }
    onSubmit(form);
  }

  const inputCls =
    'w-full rounded-xl border border-[#E2E8F0] px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]';

  return (
    <div ref={ref} className="py-4">
      <h2 className="text-2xl font-bold text-[#0F172A] text-center mb-1">Where's the project?</h2>
      <p className="text-[#64748B] text-sm text-center mb-6">
        Enter the property address so we can measure it from satellite view. No contact info needed yet.
      </p>

      <form onSubmit={submit} className="max-w-[440px] mx-auto space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#0F172A]">Project Address</label>
          <input
            ref={addressInputRef}
            type="text"
            placeholder="123 Main Street, City, State…"
            className={inputCls}
            defaultValue=""
            onChange={() => setSelected(false)}
          />
          {selected && (
            <p className="text-xs text-[#16A34A]">
              ✓ {form.streetAddress}, {form.city}, {form.state} {form.zipCode}
            </p>
          )}
        </div>

        {!showManual && (
          <button type="button" className="text-xs text-[#64748B] underline" onClick={() => setShowManual(true)}>
            Enter address manually
          </button>
        )}

        {showManual && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input
                className={inputCls}
                placeholder="Street address"
                value={form.streetAddress}
                onChange={(e) => setForm({ ...form, streetAddress: e.target.value })}
              />
            </div>
            <input
              className={inputCls}
              placeholder="City"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                className={inputCls}
                placeholder="State"
                maxLength={2}
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
              />
              <input
                className={inputCls}
                placeholder="ZIP"
                maxLength={5}
                value={form.zipCode}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full bg-[#2563EB] text-white font-semibold text-base py-3.5 px-6 rounded-full transition-all duration-200 hover:bg-[#1D4ED8] hover:-translate-y-0.5 hover:shadow-lg"
        >
          Show My Property
        </button>
        <p className="text-center text-xs text-[#94A3B8]">Free instant estimate. No signup required.</p>
      </form>
    </div>
  );
}
