"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth-provider";
import BlogPostForm from "@/components/BlogPostForm";
import Spinner from "@/components/Spinner";

export default function NewPostPage() {
  const { accessToken, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !accessToken) {
      router.push("/login");
    }
  }, [accessToken, loading, router]);

  if (loading || !accessToken) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <BlogPostForm />
    </div>
  );
}
