import DashboardLayout from "@/components/DashLayout";
import MapPageUploadClient from "@/components/map/MapPageUploadClient";
import { redirect } from "next/navigation";


export default async function MapPageWrap() {

  const { auth } = await import("@/lib/auth/authConfig");
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <DashboardLayout title="Interactive Map">
      <MapPageUploadClient userId={user.id!} />
    </DashboardLayout>
  );
}
