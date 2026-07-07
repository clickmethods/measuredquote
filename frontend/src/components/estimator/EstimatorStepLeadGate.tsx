import { useState, useEffect, useRef } from 'react';
import type { Language } from '@/data/translations';
import { t } from '@/data/translations';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';

export interface LeadFormData {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Props {
  lang: Language;
  onSubmit: (data: LeadFormData) => void;
}

export default function EstimatorStepLeadGate({ lang, onSubmit }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [form, setForm] = useState<LeadFormData>({
    fullName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LeadFormData, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LeadFormData, boolean>>>({});
  const [placesReady, setPlacesReady] = useState(false);
  const [addressLocked, setAddressLocked] = useState(false);
  const [showManual, setShowManual] = useState(false);

  // ── Entrance animation ──
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

  // ── Initialize Google Places Autocomplete ──
  useEffect(() => {
    let mounted = true;

    async function initAutocomplete() {
      try {
        // Wait for Google Maps (loaded by shared loader with Places library)
        const maps = await loadGoogleMaps();
        if (!mounted || !addressInputRef.current) return;

        // Check that the Places library was loaded
        if (!maps.places) {
          console.warn('[Measured Quote] Places library not available — autocomplete disabled');
          setShowManual(true);
          return;
        }

        const autocomplete = new maps.places.Autocomplete(addressInputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address'],
        });
        autocompleteRef.current = autocomplete;

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (!place.address_components) return;

          let streetNumber = '';
          let route = '';
          let city = '';
          let state = '';
          let zip = '';

          for (const component of place.address_components) {
            const type = component.types[0];
            switch (type) {
              case 'street_number':
                streetNumber = component.long_name;
                break;
              case 'route':
                route = component.long_name;
                break;
              case 'locality':
              case 'sublocality':
              case 'sublocality_level_1':
                if (!city) city = component.long_name;
                break;
              case 'administrative_area_level_1':
                state = component.short_name;
                break;
              case 'postal_code':
                zip = component.long_name;
                break;
            }
          }

          const streetAddress = `${streetNumber} ${route}`.trim();

          setForm((prev) => ({
            ...prev,
            streetAddress: streetAddress || prev.streetAddress,
            city: city || prev.city,
            state: state || prev.state,
            zipCode: zip || prev.zipCode,
          }));

          // Lock address when all parts are filled
          if (streetAddress && city && state && zip) {
            setAddressLocked(true);
            setShowManual(false);
          }

          // Clear errors
          setErrors((prev) => ({
            ...prev,
            streetAddress: undefined,
            city: undefined,
            state: undefined,
            zipCode: undefined,
          }));
        });

        setPlacesReady(true);
      } catch (err) {
        console.warn('[Measured Quote] Google Places init failed:', err);
        setShowManual(true);
      }
    }

    initAutocomplete();
    return () => { mounted = false; };
  }, []);

  function validateField(field: keyof LeadFormData, value: string): string | undefined {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return t(lang, 'lead.required');
        if (value.trim().length < 2) return t(lang, 'lead.nameMin');
        return undefined;
      case 'email':
        if (!value.trim()) return t(lang, 'lead.required');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return t(lang, 'lead.emailInvalid');
        return undefined;
      case 'phone':
        if (!value.trim()) return t(lang, 'lead.required');
        if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) return t(lang, 'lead.phoneInvalid');
        return undefined;
      case 'streetAddress':
        if (!value.trim()) return t(lang, 'lead.addressSearchRequired');
        return undefined;
      case 'city':
        if (!value.trim()) return t(lang, 'lead.required');
        return undefined;
      case 'state':
        if (!value.trim()) return t(lang, 'lead.required');
        return undefined;
      case 'zipCode':
        if (!value.trim()) return t(lang, 'lead.required');
        if (!/^\d{5}$/.test(value.trim())) return t(lang, 'lead.zipInvalid');
        return undefined;
      default:
        return undefined;
    }
  }

  function handleChange(field: keyof LeadFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'streetAddress' && addressLocked) {
      setAddressLocked(false);
    }
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
  }

  function handleBlur(field: keyof LeadFormData) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Partial<Record<keyof LeadFormData, string>> = {};
    const newTouched: Partial<Record<keyof LeadFormData, boolean>> = {};
    (Object.keys(form) as (keyof LeadFormData)[]).forEach((field) => {
      newTouched[field] = true;
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    setTouched(newTouched);
    if (Object.keys(newErrors).length === 0) {
      onSubmit(form);
    }
  }

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function handleUnlockAddress() {
    setAddressLocked(false);
    setShowManual(true);
    setTimeout(() => addressInputRef.current?.focus(), 100);
  }

  const addressComplete = form.streetAddress && form.city && form.state && form.zipCode;

  return (
    <div ref={ref} className="py-4">
      <h3 className="text-2xl font-bold text-[#0F172A] mb-1">
        {t(lang, 'lead.title')}
      </h3>
      <p className="text-[#475569] text-sm mb-6">
        {t(lang, 'lead.subtitle')}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1.5">
            {t(lang, 'lead.fullName')}
          </label>
          <input
            type="text"
            value={form.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            placeholder={t(lang, 'lead.fullNamePlaceholder')}
            className={
              'w-full h-12 px-4 rounded-md border-[1.5px] bg-white text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all ' +
              (errors.fullName && touched.fullName
                ? 'border-[#DC2626] focus:ring-3 focus:ring-[#FEE2E2]'
                : 'border-[#CBD5E1] focus:border-[#3B82F6] focus:ring-3 focus:ring-[#DBEAFE]')
            }
          />
          {errors.fullName && touched.fullName && (
            <p className="text-[#DC2626] text-xs mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">
              {t(lang, 'lead.email')}
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder={t(lang, 'lead.emailPlaceholder')}
              className={
                'w-full h-12 px-4 rounded-md border-[1.5px] bg-white text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all ' +
                (errors.email && touched.email
                  ? 'border-[#DC2626] focus:ring-3 focus:ring-[#FEE2E2]'
                  : 'border-[#CBD5E1] focus:border-[#3B82F6] focus:ring-3 focus:ring-[#DBEAFE]')
              }
            />
            {errors.email && touched.email && (
              <p className="text-[#DC2626] text-xs mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#334155] mb-1.5">
              {t(lang, 'lead.phone')}
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
              onBlur={() => handleBlur('phone')}
              placeholder={t(lang, 'lead.phonePlaceholder')}
              className={
                'w-full h-12 px-4 rounded-md border-[1.5px] bg-white text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all ' +
                (errors.phone && touched.phone
                  ? 'border-[#DC2626] focus:ring-3 focus:ring-[#FEE2E2]'
                  : 'border-[#CBD5E1] focus:border-[#3B82F6] focus:ring-3 focus:ring-[#DBEAFE]')
              }
            />
            {errors.phone && touched.phone && (
              <p className="text-[#DC2626] text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* HERO: Google Places Address Search */}
        <div>
          <label className="block text-sm font-medium text-[#334155] mb-1.5">
            {t(lang, 'lead.addressSearchLabel')}
          </label>

          {/* Prominent search bar with map pin icon */}
          <div className="relative">
            {/* Map pin icon */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={addressLocked ? '#16A34A' : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>

            {/* The autocomplete input */}
            <input
              ref={addressInputRef}
              type="text"
              value={form.streetAddress}
              onChange={(e) => handleChange('streetAddress', e.target.value)}
              onBlur={() => handleBlur('streetAddress')}
              placeholder={t(lang, 'lead.addressSearchPlaceholder')}
              autoComplete="off"
              className={
                'w-full h-14 pl-12 pr-12 rounded-xl border-[2px] bg-white text-[#0F172A] text-base placeholder:text-[#94A3B8] outline-none transition-all ' +
                (addressLocked
                  ? 'border-[#16A34A] focus:border-[#16A34A] focus:ring-4 focus:ring-[#DCFCE7]'
                  : errors.streetAddress && touched.streetAddress
                    ? 'border-[#DC2626] focus:ring-4 focus:ring-[#FEE2E2]'
                    : 'border-[#CBD5E1] focus:border-[#3B82F6] focus:ring-4 focus:ring-[#DBEAFE]')
              }
            />

            {/* Right-side icon */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
              {addressLocked ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : placesReady ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              ) : null}
            </div>
          </div>

          {errors.streetAddress && touched.streetAddress && (
            <p className="text-[#DC2626] text-xs mt-1.5">{errors.streetAddress}</p>
          )}

          {!addressLocked && placesReady && (
            <p className="text-[#94A3B8] text-xs mt-1.5">
              {t(lang, 'lead.addressHint')}
            </p>
          )}

          {/* Confirmed address chip */}
          {addressLocked && addressComplete && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#F0FDF4] border border-[#BBF7D0] rounded-lg px-3 py-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-sm text-[#15803D] font-medium">{form.city}, {form.state} {form.zipCode}</span>
              </div>
              <button
                type="button"
                onClick={handleUnlockAddress}
                className="text-xs text-[#3B82F6] hover:text-[#1A3A6B] font-medium underline underline-offset-2 transition-colors"
              >
                {t(lang, 'lead.editAddress')}
              </button>
            </div>
          )}

          {/* Manual entry mode */}
          {showManual && (
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  {t(lang, 'lead.city')}
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  onBlur={() => handleBlur('city')}
                  placeholder={t(lang, 'lead.cityPlaceholder')}
                  className={
                    'w-full h-11 px-3 rounded-lg border-[1.5px] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all ' +
                    (errors.city && touched.city ? 'border-[#DC2626]' : 'border-[#CBD5E1] focus:border-[#3B82F6]')
                  }
                />
                {errors.city && touched.city && (
                  <p className="text-[#DC2626] text-[10px] mt-0.5">{errors.city}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  {t(lang, 'lead.state')}
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => handleChange('state', e.target.value.toUpperCase().slice(0, 2))}
                  onBlur={() => handleBlur('state')}
                  placeholder="CA"
                  maxLength={2}
                  className={
                    'w-full h-11 px-3 rounded-lg border-[1.5px] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all uppercase ' +
                    (errors.state && touched.state ? 'border-[#DC2626]' : 'border-[#CBD5E1] focus:border-[#3B82F6]')
                  }
                />
                {errors.state && touched.state && (
                  <p className="text-[#DC2626] text-[10px] mt-0.5">{errors.state}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#64748B] mb-1">
                  {t(lang, 'lead.zipCode')}
                </label>
                <input
                  type="text"
                  value={form.zipCode}
                  onChange={(e) => handleChange('zipCode', e.target.value.replace(/\D/g, '').slice(0, 5))}
                  onBlur={() => handleBlur('zipCode')}
                  placeholder="90210"
                  className={
                    'w-full h-11 px-3 rounded-lg border-[1.5px] bg-white text-sm text-[#0F172A] placeholder:text-[#94A3B8] outline-none transition-all ' +
                    (errors.zipCode && touched.zipCode ? 'border-[#DC2626]' : 'border-[#CBD5E1] focus:border-[#3B82F6]')
                  }
                />
                {errors.zipCode && touched.zipCode && (
                  <p className="text-[#DC2626] text-[10px] mt-0.5">{errors.zipCode}</p>
                )}
              </div>
            </div>
          )}

          {!addressLocked && !showManual && (
            <button
              type="button"
              onClick={() => setShowManual(true)}
              className="text-xs text-[#3B82F6] hover:text-[#1A3A6B] font-medium underline underline-offset-2 transition-colors mt-1.5"
            >
              {t(lang, 'lead.enterManually')}
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-[#2563EB] text-white font-semibold text-base py-3.5 px-6 rounded-full transition-all duration-200 hover:bg-[#1A3A6B] hover:-translate-y-0.5 hover:shadow-lg mt-2"
        >
          {t(lang, 'lead.continue')}
        </button>

        <p className="text-[#94A3B8] text-xs text-center mt-1">
          {t(lang, 'lead.privacy')}
        </p>
      </form>
    </div>
  );
}
