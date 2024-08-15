"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Home() {
  const { user } = useAuth();

  return (
    <main className="py-10 px-5 w-full max-w-4xl mx-auto flex flex-col gap-5">
      <h1 className="text-4xl font-bold text-center">
        How to add One-Time Password Phone Authentication
      </h1>

      {user ? (
        <h2 className="text-xl font-medium text-center">
          Welcome to the app, your ID is {user.uid}
        </h2>
      ) : (
        <h2 className="text-xl font-medium text-center">
          You are not logged in!
        </h2>
      )}

      <div className="flex items-center justify-center">
        {user ? (
          <Button variant="destructive" onClick={() => signOut(auth)}>
            Sign Out
          </Button>
        ) : (
          <Link className={cn(buttonVariants())} href="/login">
            Sign In
          </Link>
        )}
      </div>
    </main>
  );
}
