"use client";

import React, { useState, useTransition } from "react";
import { Button } from "../ui/button";
import { handleGoogleSignIn } from "@/lib/auth/googleSignInServerAction";
import { KeyRound } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

export const LoginForm: React.FC = () => {
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState({ email: "" as string });
    const searchParams = useSearchParams();
    const returnUrl = searchParams.get("returnUrl");

    return (

        <Button
            variant="outline"
            className="cursor-pointer w-full bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-neutral-900 border-gray-200 dark:border-gray-800 rounded-xl shadow-md flex items-center justify-center gap-2 py-2 text-base font-semibold transition-colors"
            onClick={() => handleGoogleSignIn(returnUrl)}
        >
            {/* <Image src="/google.svg" alt="Google" width={20} height={20} className="mr-2" /> */}
            <span className="font-medium">Continue with Google</span>
        </Button>


    );
};


