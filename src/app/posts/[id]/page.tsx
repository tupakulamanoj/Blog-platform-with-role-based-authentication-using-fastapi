
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Post } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth-provider";
import { useToast } from "@/hooks/use-toast";

import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/Spinner";
import { Calendar, User as UserIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function PostPage({ params: { id: postId } }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { accessToken, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async (token: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/read", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch posts. Please check your connection or try logging in again.");
        }
        
        const responseData = await response.json();
        const posts = responseData.data;
        
        if (Array.isArray(posts)) {
            const fetchedPost = posts.find((p: any) => p.blog_id?.toString() === postId);
            if (fetchedPost) {
              setPost({
                  id: fetchedPost.blog_id?.toString(),
                  title: fetchedPost.title,
                  content: fetchedPost.body,
                  authorId: fetchedPost.user_id?.toString(),
                  tags: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
              });
            } else {
              setError("Post not found.");
            }
        } else {
            console.error("API did not return an array of posts in the 'data' field:", posts);
            setError("Post data is not in the expected format.");
        }

      } catch (e: any) {
        setError("Failed to connect to the backend. Please ensure the server is running and that it is configured to accept requests from this application (CORS).");
        console.error(e);
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

  }, [postId, router, toast, accessToken, authLoading]);

  if (loading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
     return (
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
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

  const authorEmail = post.authorId === user?.email ? user.email : 'an unknown author';

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 space-y-4">
        <h1 className="font-headline text-4xl font-bold leading-tight md:text-5xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
           <div className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>{ user?.email ?? "Unknown Author"}</span>
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
