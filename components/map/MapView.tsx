"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

type Props = {
  coords: [number, number];
  mapQ?: string;
  label?: string;
  height?: number;
};

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const Marker = dynamic(
  () => import("react-leaflet").then((m) => m.Marker),
  { ssr: false },
);
const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false },
);

export default function MapView({ coords, mapQ, label, height = 200 }: Props) {
  const [mounted, setMounted] = useState(false);
  const [icon, setIcon] = useState<unknown>(null);

  useEffect(() => {
    setMounted(true);
    import("leaflet").then((L) => {
      setIcon(
        L.icon({
          iconUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41],
        }),
      );
    });
  }, []);

  if (!mounted) {
    return (
      <div
        className="w-full rounded-lg bg-bg-2"
        style={{ height }}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      className="w-full overflow-hidden rounded-lg border border-line"
      style={{ height }}
    >
      <MapContainer
        center={coords}
        zoom={14}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {icon ? (
          // @ts-expect-error icon type lazy-loaded
          <Marker position={coords} icon={icon}>
            {(label || mapQ) && <Popup>{label || mapQ}</Popup>}
          </Marker>
        ) : null}
      </MapContainer>
    </div>
  );
}
