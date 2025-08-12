import DashboardLayout from "@/components/DashLayout";
import MapPageClient from "@/components/map/MapPageClient";
import { redirect } from "next/navigation";

export default async function MapPageWrap() {
  const { auth } = await import("@/lib/auth/authConfig");
  const session = await auth();
  const user = session!.user!;

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout title="Interactive Map">
      <MapPageClient userId={user.id!} />
    </DashboardLayout>
  );
}
