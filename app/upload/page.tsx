import DashboardLayout from "@/components/DashLayout";
import MapPageUploadClient from "@/components/map/MapPageUploadClient";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";


export default async function MapPageWrap() {

  const { auth } = await import("@/lib/auth/authConfig");
  const session = await auth();
  const user = session?.user!;

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout title="Interactive Map">
      <MapPageUploadClient userId={user.id!} />
    </DashboardLayout>
  );
}
