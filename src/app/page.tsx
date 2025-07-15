"use client";

import { useEffect, useState } from "react";
import { Post } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth-provider";
import PostCard from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Spinner from "@/components/Spinner";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      if (!accessToken) {
        setLoading(false);
        setPosts([]);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://127.0.0.1:5000/read", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch posts. Please check your connection or try logging in again.");
        }
        const fetchedPosts = await response.json();
        const formattedPosts = fetchedPosts.map((post: any) => ({
            ...post,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
        }));
        setPosts(formattedPosts);
      } catch (e: any) {
        setError("Failed to connect to the backend. Please ensure the server is running and that it is configured to accept requests from this application (CORS).");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [accessToken]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-center text-4xl font-bold text-transparent font-headline sm:text-5xl">
        Welcome to NextBlog
      </h1>
      <p className="mb-12 text-center text-lg text-muted-foreground">
        Explore ideas, stories, and insights from our community.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-8">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center">
            <Spinner />
        </div>
      ) : posts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <Card className="flex items-center justify-center py-20">
          <CardContent>
            <div className="text-center">
              <h2 className="text-2xl font-headline font-semibold">No Posts Yet</h2>
              <p className="mt-2 text-muted-foreground">
                {accessToken ? "No posts found or unable to connect." : "Log in to see your posts."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
