
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-provider";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { LogOut, PlusCircle } from "lucide-react";

export default function Header() {
  const { accessToken, user, logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.push("/");
    router.refresh();
  };

  const isAdmin = user?.email === 'admin@gmail.com';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {accessToken ? (
              <>
                {isAdmin && (
                  <Button asChild>
                    <Link href="/posts/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      New Post
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
