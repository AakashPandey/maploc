"use client";

import { redirect } from "next/navigation";
import { JSX, Suspense } from "react";
import { LoginForm } from "@/components/login/loginForm";

export default function Login(): JSX.Element {

  const isAuthenticated = false;
  if (isAuthenticated) {
    redirect("/");
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md mx-auto rounded-2xl bg-card shadow-xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center gap-6 backdrop-blur-md relative">
        {/* <Logo size={100} className="rounded-xl mx-auto mb-2" /> */}
        <div className="text-center w-full">
          <p className="font-bold text-inherit mb-2 text-2xl md:text-3xl">
            <span className="text-gray-500 dark:text-gray-400 font-light">Sign in to</span> MapLoc
          </p>
          <p className="text-balance text-muted-foreground mb-4">
            Use your Google account to sign in
          </p>
        </div>
        <div className="w-full">
          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
        {/* Terms and conditions disclaimer */}
        <div className="text-xs text-center text-muted-foreground w-full mt-2">
          By signing in you agree to our{' '}
          <a
            href="#"
            className="underline text-foreground hover:text-primary transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms and Conditions
          </a>
        </div>
        
      </div>
    </div>
  )
}
