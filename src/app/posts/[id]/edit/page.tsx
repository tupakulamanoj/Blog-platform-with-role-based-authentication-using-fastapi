"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPost } from "@/lib/actions";
import { Post } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth-provider";

import BlogPostForm from "@/components/BlogPostForm";
import Spinner from "@/components/Spinner";
import { useToast } from "@/hooks/use-toast";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async (token: string) => {
      try {
        const fetchedPost = await getPost(params.id, token);

        if (fetchedPost) {
          setPost(fetchedPost);
        } else {
          router.push("/404");
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error fetching post.", description: "You may not have permission to edit this post or it may not exist." });
         router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
        if(!accessToken) {
            router.push('/login');
        } else {
            fetchPost(accessToken);
        }
    }
  }, [params.id, router, accessToken, authLoading, toast]);

  if (loading || authLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {post ? <BlogPostForm post={post} /> : <p>Post not found or you do not have permission to edit it.</p>}
    </div>
  );
}
