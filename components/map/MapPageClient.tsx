"use client";

import dynamic from "next/dynamic";
const MapPage = dynamic(() => import("@/components/map/MapPage"), { ssr: false });

export default function MapPageClient({ userId }: { userId: string }) {
  return <MapPage userId={userId} />;
}
