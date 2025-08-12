"use client";

import dynamic from "next/dynamic";
const MapPageUpload = dynamic(() => import("@/components/map/MapPageUpload"), { ssr: false });

export default function MapPageUploadClient({ userId }: { userId: string }) {
  return <MapPageUpload userId={userId} />;
}
