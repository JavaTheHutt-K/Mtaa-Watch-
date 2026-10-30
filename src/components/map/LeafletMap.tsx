import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CommunityReport, SeverityLevel } from '../../types';

interface LeafletMapProps {
  reports: CommunityReport[];
  selectedReport?: CommunityReport | null;
  onSelectReport?: (report: CommunityReport) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const SEVERITY_COLORS: Record<SeverityLevel, { bg: string; border: string; text: string }> = {
  Critical: { bg: '#ef4444', border: '#b91c1c', text: '#ffffff' },
  High: { bg: '#f97316', border: '#c2410c', text: '#ffffff' },
  Medium: { bg: '#eab308', border: '#a16207', text: '#000000' },
  Low: { bg: '#10b981', border: '#047857', text: '#ffffff' },
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  center = [-1.18, 36.92], // Centered between Nairobi, Ruiru, Juja & Thika
  zoom = 11,
  height = '500px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when reports or selection changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    reports.forEach((report) => {
      const colors = SEVERITY_COLORS[report.severity] || SEVERITY_COLORS.Medium;
      const isSelected = selectedReport?.id === report.id;

      // Custom pulse marker for Critical
      const isCritical = report.severity === 'Critical';

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer group">
          ${
            isCritical
              ? `<span class="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75"></span>`
              : ''
          }
          <div style="background-color: ${colors.bg}; border: 2.5px solid ${isSelected ? '#1e293b' : colors.border};" 
               class="relative inline-flex items-center justify-center w-7 h-7 rounded-full shadow-lg text-xs font-bold text-white transition-transform transform ${
                 isSelected ? 'scale-125 ring-4 ring-slate-900/40' : 'hover:scale-110'
               }">
            ${report.priorityScore}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-mtaawatch-marker',
        html: customHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -14],
      });

      const marker = L.marker([report.location.lat, report.location.lng], { icon: customIcon });

      const popupContent = `
        <div style="min-width: 220px; font-family: system-ui, sans-serif; font-size: 13px;" class="p-1">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 6px; border-radius: 4px;">
              ${report.id}
            </span>
            <span style="font-size: 11px; font-weight: 700; color: ${colors.bg};">
              ${report.severity} (${report.priorityScore} pts)
            </span>
          </div>
          <h4 style="font-weight: 700; font-size: 14px; margin: 0 0 4px 0; color: #0f172a; line-height: 1.2;">
            ${report.title}
          </h4>
          <p style="color: #64748b; font-size: 12px; margin: 0 0 6px 0;">
            📍 ${report.location.name}, ${report.location.subCounty}
          </p>
          <div style="display: flex; gap: 4px; margin-bottom: 8px;">
            <span style="font-size: 10px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #334155;">
              ${report.category}
            </span>
            <span style="font-size: 10px; background: #fef3c7; color: #b45309; padding: 2px 6px; border-radius: 4px;">
              ${report.status}
            </span>
          </div>
          ${
            report.isDemoRecord
              ? `<div style="font-size: 10px; color: #94a3b8; font-style: italic; margin-bottom: 4px;">Verified Demonstration Record</div>`
              : `<div style="font-size: 10px; color: #059669; font-weight: 600; margin-bottom: 4px;">Live Citizen Report</div>`
          }
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectReport) {
          onSelectReport(report);
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [reports, selectedReport, onSelectReport]);

  // Pan to selected report if changed
  useEffect(() => {
    if (selectedReport && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedReport.location.lat, selectedReport.location.lng], 14, {
        duration: 1.2,
      });
    }
  }, [selectedReport]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-10" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200/80 shadow-md text-xs flex items-center gap-3">
        <span className="font-semibold text-slate-700">Risk Score:</span>
        <span className="flex items-center gap-1 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Critical (80+)
        </span>
        <span className="flex items-center gap-1 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> High (60-79)
        </span>
        <span className="flex items-center gap-1 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Med (30-59)
        </span>
        <span className="flex items-center gap-1 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Low (&lt;30)
        </span>
      </div>
    </div>
  );
};
