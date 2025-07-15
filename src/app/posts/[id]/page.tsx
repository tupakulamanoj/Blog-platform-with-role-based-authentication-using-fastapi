"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { getPosts } from "@/lib/actions";
import { Post } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth-provider";
import { useToast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/Spinner";
import { Calendar, User } from "lucide-react";

export default function PostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async (token: string) => {
      try {
        const posts = await getPosts(token);
        const fetchedPost = posts.find(p => p.id === params.id);
        if (fetchedPost) {
          setPost(fetchedPost);
        } else {
          router.push("/404");
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error fetching post." });
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && accessToken) {
        fetchPost(accessToken);
    } else if (!authLoading && !accessToken) {
        toast({ variant: "destructive", title: "Authentication required", description: "You need to be logged in to view this page."});
        router.push("/login");
    }

  }, [params.id, router, toast, accessToken, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Post not found.</p>
      </div>
    );
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <h1 className="font-headline text-4xl font-bold leading-tight md:text-5xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{post.authorName}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
             <time dateTime={new Date(post.createdAt).toISOString()}>
                {format(new Date(post.createdAt), "MMMM d, yyyy")}
            </time>
          </div>
        </div>
      </div>

      <div className="prose prose-lg dark:prose-invert max-w-none break-words">
        {post.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-2 border-t pt-6">
        {post.tags.map((tag) => (
          <Badge key={tag} variant="default">
            {tag}
          </Badge>
        ))}
      </div>
    </article>
  );
}
