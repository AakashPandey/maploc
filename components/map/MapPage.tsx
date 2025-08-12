"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLocationsByUser } from "@/lib/actions/getLocationsByUser";
import { createLocation } from "@/lib/actions/createLocation";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
// Custom Lucide icons for Leaflet
const mapPinIcon = L.divIcon({
  html: `<span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; color: #2563eb;"><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='#2563eb' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-map-pin' viewBox='0 0 24 24'><path d='M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z'/><circle cx='12' cy='11' r='2'/></svg></span>`,
  className: "custom-map-pin",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const activeMapPinIcon = L.divIcon({
  html: `<span style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; color: #d97706;"><svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='#d97706' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='lucide lucide-map-pin' viewBox='0 0 24 24'><path d='M12 21s-6-5.686-6-10A6 6 0 0 1 18 11c0 4.314-6 10-6 10Z'/><circle cx='12' cy='11' r='2'/></svg></span>`,
  className: "custom-map-pin-active",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});
import type { Map } from "leaflet";
import "leaflet/dist/leaflet.css";
import { PlusCircleIcon, RefreshCcwIcon } from "lucide-react";

type MapPageProps = {
  userId: string;
};


interface LocationType {
    id: string;
    name: string;
    latitude: string;
    longitude: string;
    created_at: Date | null;
}


export default function MapPage({ userId }: MapPageProps) {
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<{ name: string; latitude: string; longitude: string }>({ name: "", latitude: "", longitude: "" });
    const [selected, setSelected] = useState<string | null>(null);
    const mapRef = useRef<Map | null>(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        getLocationsByUser().then((locs: LocationType[]) => {
            if (mounted) {
                setLocations(locs);
                setLoading(false);
            }
        });
        return () => { mounted = false; };
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const lat = parseFloat(form.latitude);
        const lng = parseFloat(form.longitude);
        if (!form.name || isNaN(lat) || isNaN(lng)) return;
        setLoading(true);
        await createLocation({ name: form.name, latitude: lat, longitude: lng });
        const updated = await getLocationsByUser();
        setLocations(updated as LocationType[]);
        setForm({ name: "", latitude: "", longitude: "" });
        setLoading(false);
        // Focus map on the newly added location
        if (mapRef.current && updated.length > 0) {
            const lastLoc = updated[updated.length - 1];
            mapRef.current.setView([parseFloat(lastLoc.latitude), parseFloat(lastLoc.longitude)], 13);
            setSelected(lastLoc.id);
        }
    };

    const handleRowClick = (loc: LocationType) => {
        setSelected(loc.id);
        if (mapRef.current) {
            mapRef.current.setView([parseFloat(loc.latitude), parseFloat(loc.longitude)], 13);
        }
    };

    // Memoize locations and bounds for performance
    const memoLocations = useMemo(() => locations, [locations]);
    const memoBounds = useMemo(() => {
        if (memoLocations.length > 0) {
            return L.latLngBounds(memoLocations.map((loc: LocationType) => [parseFloat(loc.latitude), parseFloat(loc.longitude)]));
        }
        return null;
    }, [memoLocations]);

    return (
        <div className="flex flex-col md:flex-row gap-6 p-6">
            <div className="md:w-2/3 w-full h-[500px]">
                <div className="flex justify-end mb-2">
                    <Button
                        className="cursor-pointer"
                        variant="secondary"
                        onClick={() => {
                            if (mapRef.current) {
                                if (memoBounds) {
                                    mapRef.current.fitBounds(memoBounds, { padding: [50, 50] });
                                } else {
                                    mapRef.current.setView([20, 0], 2);
                                }
                                setSelected(null);
                            }
                        }}
                    >
                        <RefreshCcwIcon className="" />
                        Reset Map
                    </Button>
                </div>
                {loading ? (
                    <Skeleton className="w-full h-[500px] rounded" />
                ) : (
                    <MapContainer
                        center={memoLocations[0] ? [parseFloat(memoLocations[0].latitude), parseFloat(memoLocations[0].longitude)] : [20, 0]}
                        zoom={memoLocations[0] ? 13 : 2}
                        style={{ height: "100%", width: "100%" }}
                        ref={instance => { if (instance) mapRef.current = instance; }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {memoLocations.map((loc: LocationType) => (
                            <Marker
                                key={loc.id}
                                position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                                icon={selected === loc.id ? activeMapPinIcon : mapPinIcon}
                                eventHandlers={{ click: () => setSelected(loc.id) }}
                            >
                                <Popup>{loc.name}</Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
            <div className="md:w-1/3 w-full flex flex-col gap-4">
                <h2 className="text-lg font-bold mb-4">Add New Location</h2>
                <Card className="p-4">
                    {loading ? (
                        <Skeleton className="w-full h-40 mb-2" />
                    ) : (
                        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                            <Input
                                placeholder="Location Name"
                                value={form.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, name: e.target.value }))}
                                required
                            />
                            <Input
                                placeholder="Latitude"
                                type="number"
                                step="any"
                                value={form.latitude}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, latitude: e.target.value }))}
                                required
                            />
                            <Input
                                placeholder="Longitude"
                                type="number"
                                step="any"
                                value={form.longitude}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, longitude: e.target.value }))}
                                required
                            />
                            <Button type="submit">
                                <PlusCircleIcon className="mr-1" />
                                Add Location</Button>
                        </form>
                    )}
                </Card>
                <Card className="p-4">
                    <div className="font-bold mb-2">Your Locations (Click to select)</div>
                    {loading ? (
                        <Skeleton className="w-full h-32" />
                    ) : (
                        <ul className="flex flex-col gap-2">
                            {memoLocations.map((loc: LocationType, idx: number) => (
                                <li
                                    key={loc.id}
                                    className={`cursor-pointer p-2 rounded ${selected === loc.id ? "bg-blue-100" : "hover:bg-gray-100"}`}
                                    onClick={() => handleRowClick(loc)}
                                >
                                    <span className="font-bold mr-2 text-sm">{idx + 1}.</span> {loc.name} ({loc.latitude}, {loc.longitude})
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
        </div>
    );
}
