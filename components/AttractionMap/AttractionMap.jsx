"use client";
// components/AttractionMap.jsx
// ---------------------------------------------------------------------------
// CLIENT COMPONENT — Leaflet browser-only hai (window object use karta hai),
// is liye react-leaflet ko dynamic import + ssr:false ke sath load kiya
// jata hai, warna Next.js server-render pe crash karega.
// ---------------------------------------------------------------------------

import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";

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

export default function AttractionMap({ lat, lng, title, nearby = [] }) {
    const [icon, setIcon] = useState(null);

    // Leaflet ke default marker icon Next.js/webpack ke sath break ho jate
    // hain (image paths resolve nahi hotay) — isliye CDN se manually set
    // kar rahe hain, sirf client-side pe (window available hone ke baad).
    useEffect(() => {
        import("leaflet").then((L) => {
            setIcon(
                new L.Icon({
                    iconUrl:
                        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                    shadowUrl:
                        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                }),
            );
        });
    }, []);

    if (lat == null || lng == null || !icon) {
        return (
            <div style={{ height: 420, background: "#e5e5e5", borderRadius: 12 }} />
        );
    }

    return (
        <MapContainer
            center={[lat, lng]}
            zoom={14}
            style={{ height: 420, width: "100%", borderRadius: 12, zIndex: 0 }}
            scrollWheelZoom={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={[lat, lng]} icon={icon}>
                <Popup>{title}</Popup>
            </Marker>

            {nearby
                .filter((item) => item.lat != null && item.lng != null)
                .map((item) => (
                    <Marker key={item.id} position={[item.lat, item.lng]} icon={icon}>
                        <Popup>{item.title}</Popup>
                    </Marker>
                ))}
        </MapContainer>
    );
}