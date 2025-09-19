"use client";

import { useState } from "react";
import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  const { data: session, isPending } = useSession();
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (isPending || session) {
    return null;
  }

  const handleSignIn = async () => {
    if (isSigningIn) return;
    
    setIsSigningIn(true);
    
    try {
      // Add timeout for mobile devices
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign in timeout')), 10000);
      });
      
      // Try the normal sign in first
      const signInPromise = signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
      
      await Promise.race([signInPromise, timeoutPromise]);
      
    } catch (error) {
      console.error("Sign in error:", error);
      
      // Fallback: direct redirect for mobile
      if (error instanceof Error && error.message === 'Sign in timeout') {
        const authUrl = `${window.location.origin}/api/auth/signin/google?callbackUrl=${encodeURIComponent('/dashboard')}`;
        window.location.href = authUrl;
        return;
      }
      
      setIsSigningIn(false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
    // Prevent default to avoid zoom/double-tap issues
    e.preventDefault();
    // Add small delay for better touch response
    setTimeout(() => handleSignIn(), 50);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleSignIn();
  };

  // iOS specific handling - sometimes iOS needs both touch and click
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === 'touch') {
      e.preventDefault();
      setTimeout(() => handleSignIn(), 100);
    }
  };

  return (
    <Button
      size="sm"
      className="h-10 px-4 text-sm min-w-[100px] touch-manipulation prevent-tap-zoom touch-feedback"
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      onPointerDown={handlePointerDown}
      disabled={isSigningIn}
    >
      {isSigningIn ? "Signing in..." : "Sign in"}
    </Button>
  );
}
