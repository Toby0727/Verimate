"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Polygon } from "geojson";
import type { ExpressionSpecification, Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { AREA_SHAPES, CAMPUSES } from "@/lib/waitlist/map-shapes";
import type { Area } from "@/lib/waitlist/options";

const INK = "#111111";
const CAMPUS_FILL = "#f8672e"; // --verified-fill
const CAMPUS_LINE = "#bf4306"; // --verified

// OpenFreeMap's light style: free, no API key, OpenStreetMap data. Its text
// layers are hidden so only our area names show.
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";
// MapLibre runs tile decoding in a worker it loads by URL; this copy in
// public/vendor must match the pinned maplibre-gl version in package.json.
const WORKER_URL = "/vendor/maplibre-gl-worker-6.14.0.mjs";

type Ring = [number, number][];

// Our outlines are [lat, lng]; GeoJSON wants closed rings of [lng, lat].
function polygons(
  shapes: { ring: Ring; id: string }[],
): FeatureCollection<Polygon, { id: string }> {
  return {
    type: "FeatureCollection",
    features: shapes.map(({ ring, id }) => {
      const coords = ring.map(([lat, lng]) => [lng, lat]);
      return {
        type: "Feature",
        properties: { id },
        geometry: { type: "Polygon", coordinates: [[...coords, coords[0]]] },
      };
    }),
  };
}

function center(ring: Ring): [number, number] {
  const lats = ring.map(([lat]) => lat);
  const lngs = ring.map(([, lng]) => lng);
  return [
    (Math.min(...lngs) + Math.max(...lngs)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2,
  ];
}

function label(text: string, className: string): HTMLElement {
  const el = document.createElement("span");
  el.className = className;
  el.textContent = text;
  return el;
}

// Map of Syracuse with SU and ESF shaded and each housing area as a tappable
// zone. MapLibre touches `window`, so it loads after mount.
export function AreaMap({
  value,
  onToggle,
}: {
  value: Area[] | null;
  onToggle: (area: Area) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  const labels = useRef(new Map<string, HTMLElement>());
  const toggle = useRef(onToggle);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    toggle.current = onToggle;
  });

  useEffect(() => {
    let cancelled = false;
    import("maplibre-gl").then((lib) => {
      const el = container.current;
      if (cancelled || !el) return;
      lib.setWorkerUrl(WORKER_URL);
      const bounds = new lib.LngLatBounds();
      for (const shape of AREA_SHAPES) {
        for (const [lat, lng] of shape.ring) bounds.extend([lng, lat]);
      }
      const m = new lib.Map({
        container: el,
        style: STYLE_URL,
        bounds,
        fitBoundsOptions: { padding: 6 },
        attributionControl: { compact: true },
        scrollZoom: false,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
      });
      m.touchZoomRotate.disableRotation();
      map.current = m;

      m.on("load", () => {
        // The compact credit starts open; keep it to its ⓘ button.
        el.querySelector(".maplibregl-compact-show")?.classList.remove(
          "maplibregl-compact-show",
        );
        for (const layer of m.getStyle().layers) {
          if (layer.type === "symbol") {
            m.setLayoutProperty(layer.id, "visibility", "none");
          }
        }

        const selected: ExpressionSpecification = [
          "boolean",
          ["feature-state", "selected"],
          false,
        ];
        m.addSource("zones", {
          type: "geojson",
          data: polygons(
            AREA_SHAPES.map((s) => ({ ring: s.ring, id: s.area })),
          ),
          promoteId: "id",
        });
        m.addLayer({
          id: "zones-fill",
          type: "fill",
          source: "zones",
          paint: {
            "fill-color": INK,
            "fill-opacity": ["case", selected, 0.85, 0.05],
          },
        });
        m.addLayer({
          id: "zones-line",
          type: "line",
          source: "zones",
          paint: {
            "line-color": INK,
            "line-width": 1,
            "line-opacity": ["case", selected, 1, 0.35],
          },
        });
        m.addSource("campuses", {
          type: "geojson",
          data: polygons(CAMPUSES.map((c) => ({ ring: c.ring, id: c.label }))),
        });
        m.addLayer({
          id: "campuses-fill",
          type: "fill",
          source: "campuses",
          paint: { "fill-color": CAMPUS_FILL, "fill-opacity": 0.35 },
        });
        m.addLayer({
          id: "campuses-line",
          type: "line",
          source: "campuses",
          paint: { "line-color": CAMPUS_LINE, "line-width": 1 },
        });

        for (const shape of AREA_SHAPES) {
          const tag = label(shape.label, "map-label");
          labels.current.set(shape.area, tag);
          new lib.Marker({ element: tag })
            .setLngLat(center(shape.ring))
            .addTo(m);
        }
        for (const campus of CAMPUSES) {
          new lib.Marker({
            element: label(campus.label, "map-label map-label-campus"),
          })
            .setLngLat(center(campus.ring))
            .addTo(m);
        }

        m.on("click", "zones-fill", (e) => {
          const area = e.features?.[0]?.properties?.id as Area | undefined;
          if (area) toggle.current(area);
        });
        m.on("mouseenter", "zones-fill", () => {
          m.getCanvas().style.cursor = "pointer";
        });
        m.on("mouseleave", "zones-fill", () => {
          m.getCanvas().style.cursor = "";
        });
        setReady(true);
      });
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      labels.current.clear();
    };
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!ready || !m) return;
    for (const shape of AREA_SHAPES) {
      const on = value?.includes(shape.area) ?? false;
      m.setFeatureState({ source: "zones", id: shape.area }, { selected: on });
      labels.current.get(shape.area)?.classList.toggle("map-label-on", on);
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
