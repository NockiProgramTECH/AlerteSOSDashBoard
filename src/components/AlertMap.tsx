import React, { useEffect, useRef } from 'react';
import type { FC } from 'react';
import { EmergencyAlert } from '../types';

// Couleurs par statut
const STATUS_COLORS: Record<string, string> = {
  PENDING: '#E11D48',
  ASSIGNED: '#F97316',
  IN_PROGRESS: '#3B82F6',
  RESOLVED: '#22C55E',
  REJECTED: '#6B7280',
};

interface AlertMapProps {
  alerts: EmergencyAlert[];
  selectedAlert: EmergencyAlert | null;
  onAlertSelect: (alert: EmergencyAlert) => void;
}

const AlertMap: React.FC<AlertMapProps> = ({
  alerts: alertsData,
  selectedAlert: selectedAlertData,
  onAlertSelect: handleAlertSelect,
}: AlertMapProps): React.ReactElement => {
  const alerts = alertsData;
  const selectedAlert = selectedAlertData;
  const onAlertSelect = handleAlertSelect;
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    // Import dynamique de Leaflet (évite les erreurs SSR)
    const initMap = async () => {
      const L = (await import('leaflet')) as any;

      if (!mapRef.current || mapInstanceRef.current) return;

      // Centré sur le Burkina Faso : Ouagadougou
      const map = L.map(mapRef.current, {
        center: [12.3645, -1.5353],
        zoom: 12,
        zoomControl: false,
      });

      // Tuile sombre CartoDB
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Contrôle zoom custom (en bas à droite)
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mise à jour des marqueurs quand les alertes changent
  useEffect(() => {
    const updateMarkers = async () => {
      const L = (await import('leaflet')) as any;
      const map = mapInstanceRef.current;
      if (!map) return;

      // Supprimer anciens marqueurs
      markersRef.current.forEach((m: any) => m.remove());
      markersRef.current = [];

      alerts.forEach((alert: any) => {
        const [lon, lat] = alert.location.coordinates;
        const color = STATUS_COLORS[alert.statut] || '#E11D48';
        const isPending = alert.statut === 'PENDING';
        const isSelected = selectedAlert?.id === alert.id;

        // SVG marqueur personnalisé
        const svgIcon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:${isSelected ? 48 : 36}px;height:${isSelected ? 56 : 44}px">
              ${isPending ? `<div style="
                position:absolute;top:50%;left:50%;
                transform:translate(-50%,-50%);
                width:${isSelected ? 64 : 48}px;height:${isSelected ? 64 : 48}px;
                border-radius:50%;
                background:${color}33;
                animation:pulse 1.5s ease-in-out infinite;
              "></div>` : ''}
              <svg viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg" 
                   width="${isSelected ? 48 : 36}" height="${isSelected ? 56 : 44}"
                   style="filter:drop-shadow(0 2px 8px ${color}88)">
                <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" 
                      fill="${color}"/>
                <circle cx="18" cy="18" r="8" fill="white" opacity="0.9"/>
                <text x="18" y="22" text-anchor="middle" font-size="10" font-weight="bold" fill="${color}">!</text>
              </svg>
            </div>
          `,
          iconSize: [isSelected ? 48 : 36, isSelected ? 56 : 44],
          iconAnchor: [isSelected ? 24 : 18, isSelected ? 56 : 44],
        });

        const marker = L.marker([lat, lon], { icon: svgIcon })
          .addTo(map)
          .on('click', () => onAlertSelect(alert));

        marker.bindTooltip(
          `<div style="background:#1E293B;color:#fff;border:1px solid ${color};padding:6px 10px;border-radius:6px;font-size:12px">
            <strong style="color:${color}">${alert.type_nom}</strong><br/>
            ${alert.statut_label}
          </div>`,
          { permanent: false, className: 'leaflet-tooltip-custom' }
        );

        markersRef.current.push(marker);
      });

      // Centrer sur alerte sélectionnée
      if (selectedAlert) {
        const [lon, lat] = selectedAlert.location.coordinates;
        map.flyTo([lat, lon], 15, { animate: true, duration: 1 });
      }
    };

    updateMarkers();
  }, [alerts, selectedAlert]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0.2; }
        }
        .leaflet-tooltip-custom { background: transparent !important; border: none !important; box-shadow: none !important; }
        .leaflet-control-zoom { border: none !important; }
        .leaflet-control-zoom a { background: #1E293B !important; color: #fff !important; border: 1px solid #334155 !important; }
        .leaflet-control-zoom a:hover { background: #E11D48 !important; }
      `}</style>
      <div ref={mapRef} className="w-full h-full" />
      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg p-3 z-[1000]">
        <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Légende</p>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-300">{status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertMap;
