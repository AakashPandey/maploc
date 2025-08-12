"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getLocationsByUser } from "@/lib/actions/getLocationsByUser";
import { createLocationsBatch } from "@/lib/actions/createLocationsBatch";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import JSZip from "jszip";
import { AlertCircleIcon, CheckCircle2Icon, RefreshCcwIcon, UploadIcon } from "lucide-react";
import "leaflet/dist/leaflet.css";

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

interface LocationType {
  id: string;
  name: string;
  latitude: string;
  longitude: string;
  created_at: Date | null;
}

interface ParsedLocation {
  name: string;
  latitude: number;
  longitude: number;
}

type MapPageProps = {
  userId: string;
};

export default function MapPageUpload({ userId }: MapPageProps) {
  const router = useRouter();
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ message: string; type: "success" | "error" | "confirm"; locations?: ParsedLocation[] } | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!userId) {
      router.replace("/auth/login");
      return;
    }
    setLoading(true);
    getLocationsByUser()
      .then((locs: LocationType[]) => {
        if (mounted) {
          setLocations(locs);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setPopup({ message: "Failed to load locations", type: "error" });
          setLoading(false);
        }
      });
    return () => {
      mounted = false;
    };
  }, [userId, router]);

  useEffect(() => {
    if (popup?.type === "confirm" && popup.locations) {
      const timer = setTimeout(async () => {
        try {
          setLoading(true);
          await createLocationsBatch(popup.locations!);
          const updated = await getLocationsByUser();
          setLocations(updated as LocationType[]);
          setPopup({ message: `${popup.locations!.length} locations added successfully`, type: "success" });
          if (mapRef.current && updated.length > 0) {
            // Add a small delay to ensure map is ready
            setTimeout(() => {
              if (mapRef.current && updated.length > 0) {
                const bounds = L.latLngBounds(
                  updated.map(loc => [parseFloat(loc.latitude), parseFloat(loc.longitude)]),
                );
                mapRef.current.fitBounds(bounds, { padding: [50, 50] });
                setSelected(null);
              }
            }, 100);
          }
        } catch (error) {
         console.log(error);
          setPopup({ message: "Error adding locations: " + (error as Error).message, type: "error" });
        } finally {
          setLoading(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    } else if (popup) {
      const timer = setTimeout(() => setPopup(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== "application/zip") {
      setPopup({ message: "Please upload a valid .zip file", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const zip = await JSZip.loadAsync(file);
      const files = Object.values(zip.files);
      if (files.length !== 1 || !files[0].name.endsWith(".txt")) {
        setPopup({ message: "ZIP must contain exactly one .txt file", type: "error" });
        setLoading(false);
        return;
      }

      const textContent = await files[0].async("string");
      const lines = textContent.trim().split("\n").slice(1); // Skip header
      const parsedLocations: ParsedLocation[] = lines
        .map((line, index) => {
          const [name, latitude, longitude] = line.split(",").map(s => s.trim());
          const lat = parseFloat(latitude);
          const lng = parseFloat(longitude);
          if (!name || isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            throw new Error(`Invalid data at line ${index + 2}: Name=${name}, Lat=${latitude}, Lng=${longitude}`);
          }
          return { name, latitude: lat, longitude: lng };
        })
        .filter(loc => loc.name && !isNaN(loc.latitude) && !isNaN(loc.longitude));

      if (parsedLocations.length === 0) {
        setPopup({ message: "No valid locations found in the file", type: "error" });
        setLoading(false);
        return;
      }

      setPopup({
        message: `Confirm adding ${parsedLocations.length} locations?`,
        type: "confirm",
        locations: parsedLocations,
      });
    } catch (error) {
      setPopup({ message: "Error processing file: " + (error as Error).message, type: "error" });
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleRowClick = (loc: LocationType) => {
    const lat = parseFloat(loc.latitude);
    const lng = parseFloat(loc.longitude);
    if (isNaN(lat) || isNaN(lng)) return;
    setSelected(loc.id);
    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 13);
    }
  };

  // Memoize locations and bounds for performance
  const memoLocations = useMemo(() => locations.filter(loc => !isNaN(parseFloat(loc.latitude)) && !isNaN(parseFloat(loc.longitude))), [locations]);
  const memoBounds = useMemo(() => {
    if (memoLocations.length > 0) {
      return L.latLngBounds(memoLocations.map((loc: LocationType) => [parseFloat(loc.latitude), parseFloat(loc.longitude)]));
    }
    return null;
  }, [memoLocations]);

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 relative">
      {/* Popup for success/error/confirm messages */}
      {popup && (
        <div
          className={`fixed top-4 right-4 p-4 rounded shadow-lg z-50 max-w-xs ${
            popup.type === "success" ? "bg-green-100 text-green-800" : popup.type === "error" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
          }`}
        >
          <div className="flex items-start gap-2">
            {popup.type === "success" ? (
              <CheckCircle2Icon className="w-5 h-5 flex-shrink-0" />
            ) : popup.type === "error" ? (
              <AlertCircleIcon className="w-5 h-5 flex-shrink-0" />
            ) : (
              <CheckCircle2Icon className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm break-words">{popup.message}</span>
          </div>
          {popup.type === "confirm" && popup.locations && (
            <ul className="mt-2 max-h-32 overflow-auto text-xs">
              {popup.locations.slice(0, 5).map((loc, idx) => (
                <li key={idx} className="truncate">
                  {idx + 1}. {loc.name} ({loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)})
                </li>
              ))}
              {popup.locations.length > 5 && (
                <li className="text-gray-600">... and {popup.locations.length - 5} more</li>
              )}
            </ul>
          )}
        </div>
      )}
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
            <RefreshCcwIcon className="mr-1" />
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
            ref={instance => {
              if (instance) mapRef.current = instance;
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {memoLocations.map((loc: LocationType) => {
              const lat = parseFloat(loc.latitude);
              const lng = parseFloat(loc.longitude);
              if (isNaN(lat) || isNaN(lng)) return null; // Skip invalid coordinates
              return (
                <Marker
                  key={loc.id}
                  position={[lat, lng]}
                  icon={selected === loc.id ? activeMapPinIcon : mapPinIcon}
                  eventHandlers={{ click: () => setSelected(loc.id) }}
                >
                  <Popup>{loc.name}</Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>
      <div className="md:w-1/3 w-full flex flex-col gap-4">
        <h2 className="text-lg font-bold mb-4">Upload Locations</h2>
        <Card className="p-4">
          {loading ? (
            <Skeleton className="w-full h-20 mb-2" />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  type="file"
                  accept=".zip"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="zip-upload"
                />
                <label htmlFor="zip-upload">
                  <Button
                    asChild
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                  >
                    <span className="flex items-center gap-2">
                      <UploadIcon className="w-5 h-5" />
                      Upload Locations (.zip)
                    </span>
                  </Button>
                </label>
              </div>
              <p className="text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
                Upload a <strong>.zip</strong> file containing a single <strong>.txt</strong> file in the format: <br />
                <code className="bg-gray-200 px-1 py-0.5 rounded">Name,Latitude,Longitude</code>
                <br />
                <code className="bg-gray-200 px-1 py-0.5 rounded">Suria KLCC,3.157324409,101.7121981</code>
                <br />
                <a
                  href="#"
                  className="text-blue-500 hover:underline text-sm"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(
                      "Example format:\nName,Latitude,Longitude\nSuria KLCC,3.157324409,101.7121981\nZoo Negara,3.21054160,101.75920504",
                    );
                  }}
                >
                  View sample file format
                </a>
              </p>
            </div>
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
                  <span className="font-bold text-sm">{idx + 1}.</span> <span className="text-xs">{loc.name} ({loc.latitude}, {loc.longitude}</span>)
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}