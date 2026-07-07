import { useState, useEffect, useRef, useCallback } from 'react';
import type { TradeConfig } from '@/data/tradeConfigs';
import type { Language } from '@/data/translations';
import { t } from '@/data/translations';
import { loadGoogleMaps } from '@/lib/googleMapsLoader';
import type { LeadFormData } from './EstimatorStepLeadGate';

interface Props {
  trade: TradeConfig;
  lang: Language;
  leadData: LeadFormData;
  onContinue: (measurement: number) => void;
}

export default function EstimatorStepMap({ trade, lang, leadData, onContinue }: Props) {
  const [measurement, setMeasurement] = useState<number>(0);
  const [manualValue, setManualValue] = useState<string>('');
  const [mapStatus, setMapStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [drawnShape, setDrawnShape] = useState<'polygon' | 'polyline' | null>(null);
  const [loadError, setLoadError] = useState<string>('');
  const ref = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const drawingManagerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const overlaysRef = useRef<Array<google.maps.Polygon | google.maps.Polyline>>([]);
  const isLinear = trade.measurementType === 'linear';

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

  // ── Geocode address using Google Geocoder ──
  const geocodeAddress = useCallback(async (address: string): Promise<google.maps.LatLngLiteral | null> => {
    try {
      const maps = await loadGoogleMaps();
      const geocoder = new maps.Geocoder();
      const result = await geocoder.geocode({ address });
      if (result.results.length > 0) {
        return result.results[0].geometry.location.toJSON();
      }
    } catch (err) {
      console.warn('[Measured Quote] Geocoding failed:', err);
    }
    return null;
  }, []);

  // ── Initialize map ──
  const initMap = useCallback(async () => {
    if (!mapContainerRef.current) return;

    try {
      setMapStatus('loading');
      const maps = await loadGoogleMaps();

      // Geocode the lead's address to center the map
      const fullAddress = `${leadData.streetAddress}, ${leadData.city}, ${leadData.state} ${leadData.zipCode}`;
      const center = await geocodeAddress(fullAddress) || { lat: 39.8283, lng: -98.5795 };

      const map = new maps.Map(mapContainerRef.current, {
        center,
        zoom: 20,
        mapTypeId: maps.MapTypeId.SATELLITE,
        tilt: 0,
        streetViewControl: false,
        mapTypeControl: true,
        mapTypeControlOptions: {
          style: maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: [maps.MapTypeId.SATELLITE, maps.MapTypeId.HYBRID, maps.MapTypeId.ROADMAP],
        },
        fullscreenControl: true,
        zoomControl: true,
      });
      mapInstanceRef.current = map;

      // ── Drawing Manager ──
      const drawingMode = isLinear
        ? maps.drawing.OverlayType.POLYLINE
        : maps.drawing.OverlayType.POLYGON;

      const drawingManager = new maps.drawing.DrawingManager({
        drawingMode,
        drawingControl: true,
        drawingControlOptions: {
          position: maps.ControlPosition.TOP_CENTER,
          drawingModes: isLinear
            ? [maps.drawing.OverlayType.POLYLINE]
            : [maps.drawing.OverlayType.POLYGON],
        },
        polygonOptions: {
          fillColor: '#2563EB',
          fillOpacity: 0.25,
          strokeColor: '#2563EB',
          strokeWeight: 3,
          clickable: true,
          editable: true,
          draggable: true,
          zIndex: 10,
        },
        polylineOptions: {
          strokeColor: '#2563EB',
          strokeWeight: 4,
          clickable: true,
          editable: true,
          draggable: true,
          zIndex: 10,
        },
      });
      drawingManager.setMap(map);
      drawingManagerRef.current = drawingManager;

      // ── Listen for completed shapes ──
      maps.event.addListener(drawingManager, 'overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
        // Clear previous overlays
        overlaysRef.current.forEach((o) => o.setMap(null));
        overlaysRef.current = [];

        // Disable drawing mode after shape is drawn
        drawingManager.setDrawingMode(null);

        if (event.type === google.maps.drawing.OverlayType.POLYGON) {
          const polygon = event.overlay as google.maps.Polygon;
          overlaysRef.current.push(polygon);
          const areaSqMeters = maps.geometry.spherical.computeArea(polygon.getPath());
          const areaSqFt = Math.round(areaSqMeters * 10.7639);
          setMeasurement(areaSqFt);
          setManualValue(areaSqFt.toLocaleString());
          setDrawnShape('polygon');

          // Fit bounds to the polygon
          const bounds = new maps.LatLngBounds();
          polygon.getPath().forEach((latLng) => bounds.extend(latLng));
          map.fitBounds(bounds, 20);
        }

        if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
          const polyline = event.overlay as google.maps.Polyline;
          overlaysRef.current.push(polyline);
          const lengthMeters = maps.geometry.spherical.computeLength(polyline.getPath());
          const lengthFt = Math.round(lengthMeters * 3.28084);
          setMeasurement(lengthFt);
          setManualValue(lengthFt.toLocaleString());
          setDrawnShape('polyline');
        }
      });

      setMapStatus('ready');
      setLoadError('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error loading map';
      console.error('[Measured Quote] Map init error:', message);
      setLoadError(message);
      setMapStatus('error');
    }
  }, [leadData, isLinear, geocodeAddress]);

  useEffect(() => {
    initMap();
    return () => {
      overlaysRef.current.forEach((o) => o.setMap(null));
      overlaysRef.current = [];
    };
  }, [initMap]);

  function clearDrawing() {
    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];
    setMeasurement(0);
    setManualValue('');
    setDrawnShape(null);
    // Re-enable drawing mode
    if (drawingManagerRef.current) {
      const maps = window.google.maps;
      if (maps) {
        drawingManagerRef.current.setDrawingMode(
          isLinear ? maps.drawing.OverlayType.POLYLINE : maps.drawing.OverlayType.POLYGON
        );
      }
    }
  }

  function handleManualInput(value: string) {
    setManualValue(value);
    const num = parseInt(value.replace(/\D/g, ''), 10);
    setMeasurement(isNaN(num) ? 0 : num);
    if (num > 0) setDrawnShape(null);
  }

  function handlePreset(preset: number) {
    setMeasurement(preset);
    setManualValue(preset.toLocaleString());
    setDrawnShape(null);
  }

  const presets = isLinear
    ? [50, 100, 150, 200]
    : [500, 1000, 1500, 2000];

  return (
    <div ref={ref} className="py-4">
      <h3 className="text-2xl font-bold text-[#0F172A] mb-1">
        {t(lang, isLinear ? 'map.title.linear' : 'map.title.area')}
      </h3>
      <p className="text-[#475569] text-sm mb-4">
        {t(lang, isLinear ? 'map.subtitle.linear' : 'map.subtitle.area')}
      </p>

      {/* Map container */}
      <div className="relative rounded-[16px] overflow-hidden border border-[#CBD5E1] mb-4">
        {/* Loading state */}
        {mapStatus === 'loading' && (
          <div className="flex items-center justify-center bg-[#F1F5F9]" style={{ minHeight: '400px' }}>
            <div className="text-center">
              <div className="w-10 h-10 border-3 border-[#DBEAFE] border-t-[#2563EB] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-[#475569] font-medium">{t(lang, 'map.loading')}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{t(lang, 'map.loadingSub')}</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {mapStatus === 'error' && (
          <div className="flex items-center justify-center bg-[#FEF2F2]" style={{ minHeight: '400px' }}>
            <div className="text-center px-6 max-w-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-sm text-[#DC2626] font-medium mb-1">{t(lang, 'map.error')}</p>
              <p className="text-xs text-[#94A3B8] mb-2">{t(lang, 'map.errorSub')}</p>
              {loadError && (
                <p className="text-[10px] text-[#94A3B8] bg-white/50 rounded px-2 py-1 mt-2 font-mono break-all">
                  {loadError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Real Google Map */}
        <div
          ref={mapContainerRef}
          style={{ width: '100%', height: mapStatus === 'ready' ? '400px' : '0px' }}
        />

        {/* Measurement badge */}
        {measurement > 0 && (
          <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-full shadow-lg z-10">
            <span className="text-lg font-semibold text-[#2563EB] font-mono">
              {isLinear
                ? `${t(lang, 'map.measurementLabel.linear')}: ${measurement.toLocaleString()} ${t(lang, 'map.measurementUnit.linear')}`
                : `${t(lang, 'map.measurementLabel.area')}: ${measurement.toLocaleString()} ${t(lang, 'map.measurementUnit.area')}`}
            </span>
          </div>
        )}

        {/* Shape drawn badge */}
        {drawnShape && (
          <div className="absolute top-4 left-4 bg-[#DCFCE7] text-[#15803D] px-3 py-1.5 rounded-full shadow-md z-10 flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-xs font-medium">
              {drawnShape === 'polygon' ? t(lang, 'map.drawnArea') : t(lang, 'map.drawnLine')}
            </span>
          </div>
        )}
      </div>

      {/* Drawing controls */}
      {mapStatus === 'ready' && (
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={clearDrawing}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md border border-[#CBD5E1] bg-white text-[#475569] hover:border-[#DC2626] hover:text-[#DC2626] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </svg>
            {t(lang, 'map.clearDrawing')}
          </button>
          <span className="text-xs text-[#94A3B8] flex items-center ml-auto">
            {t(lang, isLinear ? 'map.hint.linear' : 'map.hint.area')}
          </span>
        </div>
      )}

      {/* Manual measurement fallback */}
      <div className="bg-[#F1F5F9] rounded-[10px] p-4 mb-4">
        <label className="block text-sm font-medium text-[#334155] mb-2">
          {t(lang, 'map.enterManually')}
        </label>
        <div className="flex gap-3">
          <input
            type="text"
            value={manualValue}
            onChange={(e) => handleManualInput(e.target.value)}
            placeholder={isLinear ? 'e.g., 150' : 'e.g., 1000'}
            className="flex-1 h-12 px-4 rounded-md border-[1.5px] border-[#CBD5E1] bg-white text-[#0F172A] outline-none focus:border-[#3B82F6] focus:ring-3 focus:ring-[#DBEAFE]"
          />
          <span className="flex items-center text-sm text-[#64748B] shrink-0">
            {isLinear ? t(lang, 'map.measurementUnit.linear') : t(lang, 'map.measurementUnit.area')}
          </span>
        </div>
        <div className="flex gap-2 mt-3">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => handlePreset(preset)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-[#CBD5E1] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors"
            >
              {preset.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => onContinue(measurement)}
        disabled={measurement <= 0}
        className={
          'w-full font-semibold text-base py-3.5 px-6 rounded-full transition-all duration-200 mt-2 ' +
          (measurement > 0
            ? 'bg-[#2563EB] text-white hover:bg-[#1A3A6B] hover:-translate-y-0.5 hover:shadow-lg'
            : 'bg-[#CBD5E1] text-[#94A3B8] cursor-not-allowed')
        }
      >
        {t(lang, 'map.continue')}
      </button>
    </div>
  );
}
