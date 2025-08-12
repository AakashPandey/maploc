"use client";

import React from "react";
import { Button } from "../ui/button";
import { handleGoogleSignIn } from "@/lib/auth/googleSignInServerAction";



export const GoogleLoginButton: React.FC = () => {


  return (
    <Button variant="outline" className="w-full" onClick={() => handleGoogleSignIn()}>
      Login with Google
    </Button>
  );

};
