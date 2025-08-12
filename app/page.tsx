import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Map, Upload, LogOut, LogIn } from "lucide-react";

export default async function HomePage() {
  const { auth } = await import("@/lib/auth/authConfig");
  const { handleSignOut } = await import("@/lib/auth/signOutServerAction");
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen  flex flex-col md:flex-row">

      {user && (
        <aside className="w-full md:w-56 bg-white backdrop-blur-sm border-b md:border-b-0 md:border-r flex md:flex-col items-center md:items-start justify-between md:justify-start px-6 py-4">
          <div className="w-full">
            <span className="text-lg font-bold tracking-tight text-slate-800 block mb-6">MapLoc</span>

            <div className="mb-8">
              <p className="text-md font-semibold text-slate-700">Welcome Back</p>
              <p className="text-sm text-slate-800 truncate mt-2">{user.name || user.email}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>

          <form action={handleSignOut} className="mt-auto w-full">
            <Button
              type="submit"
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Sign Out
            </Button>
          </form>
        </aside>
      )}

      {/* Main content area */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {user ? (
          <div className="flex flex-col items-start">
            <div className="w-full">
              <span className="text-slate-700 text-xl font-semibold mb-6 block">Quick Actions</span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <Link href="/map" passHref className="group">
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:bg-white/90 transition-all cursor-pointer group-hover:scale-[1.02] transform">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                        <Map className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">Interactive Map</h3>
                        <p className="text-sm text-slate-600">View and Add locations</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href="/upload" passHref className="group">
                  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:bg-white/90 transition-all cursor-pointer group-hover:scale-[1.02] transform">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                        <Upload className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800 mb-1">Upload Locations</h3>
                        <p className="text-sm text-slate-600">Bulk upload locations from a ZIP file</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center md:mt-14 ">
            <div className="bg-white/70 backdrop-blur-sm p-12 rounded-2xl shadow-sm border border-gray-100 max-w-md">
              <div className="mb-6">
                <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome to MapLoc</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Your personal location management platform. Sign in to start organizing and visualizing your places on interactive maps.
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="font-semibold cursor-pointer hover:shadow-md transition-all  rounded-md">
                  Sign In <LogIn className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
