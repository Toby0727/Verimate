"use client";

import "leaflet/dist/leaflet.css";
import type { Polygon } from "leaflet";
import { useEffect, useRef, useState } from "react";
import { AREA_SHAPES, CAMPUSES } from "@/lib/waitlist/map-shapes";
import type { Area } from "@/lib/waitlist/options";

const INK = "#111111";
const CAMPUS_FILL = "#1fa463"; // --verified-fill
const CAMPUS_LINE = "#178a4c"; // --verified

// Map of Syracuse with SU and ESF shaded and each housing area as a tappable
// zone. Leaflet touches `window`, so it loads after mount.
export function AreaMap({
  value,
  onToggle,
}: {
  value: Area[] | null;
  onToggle: (area: Area) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const zones = useRef(new Map<Area, Polygon>());
  const toggle = useRef(onToggle);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    toggle.current = onToggle;
  });

  useEffect(() => {
    let cancelled = false;
    let remove: (() => void) | undefined;
    import("leaflet").then(({ default: L }) => {
      const el = container.current;
      if (cancelled || !el) return;
      const map = L.map(el, {
        scrollWheelZoom: false,
        zoomControl: false,
        zoomSnap: 0.1,
        attributionControl: false,
      });
      L.control.attribution({ prefix: false }).addTo(map);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        className: "map-tiles",
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      for (const shape of AREA_SHAPES) {
        const zone = L.polygon(shape.ring, { weight: 1, color: INK })
          .bindTooltip(shape.label, {
            permanent: true,
            direction: "center",
            className: "map-label",
          })
          .on("click", () => toggle.current(shape.area))
          .addTo(map);
        zones.current.set(shape.area, zone);
      }
      for (const campus of CAMPUSES) {
        L.polygon(campus.ring, {
          interactive: false,
          weight: 1,
          color: CAMPUS_LINE,
          fillColor: CAMPUS_FILL,
          fillOpacity: 0.35,
        })
          .bindTooltip(campus.label, {
            permanent: true,
            direction: "center",
            className: "map-label map-label-campus",
          })
          .addTo(map);
      }

      map.fitBounds(
        L.latLngBounds(AREA_SHAPES.flatMap((shape) => shape.ring)),
        { padding: [2, 2] },
      );
      remove = () => map.remove();
      setReady(true);
    });
    return () => {
      cancelled = true;
      remove?.();
      zones.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    for (const [area, zone] of zones.current) {
      const on = value?.includes(area) ?? false;
      zone.setStyle({
        fillColor: INK,
        fillOpacity: on ? 0.85 : 0.05,
        opacity: on ? 1 : 0.35,
      });
      zone.getTooltip()?.getElement()?.classList.toggle("map-label-on", on);
    }
  }, [ready, value]);

  return (
    <div
      ref={container}
      role="img"
      aria-label="Map of Syracuse with SU, ESF and the housing areas below"
      className="isolate h-[400px] overflow-hidden rounded-xl bg-white"
    />
  );
}
