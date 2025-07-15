
"use client";

import { useEffect, useState } from "react";
import { Post } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth-provider";
import PostCard from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import Spinner from "@/components/Spinner";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { accessToken, user } = useAuth();
  const { toast } = useToast();

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
        const response = await fetch("http://localhost:5000/read", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        if (!response.ok) {
            throw new Error("Failed to fetch posts. Please check your connection or try logging in again.");
        }
        const responseData = await response.json();
        
        if (responseData && Array.isArray(responseData.data)) {
            const formattedPosts = responseData.data.map((post: any) => ({
                id: post.blog_id?.toString(),
                title: post.title,
                content: post.body,
                authorId: post.user_id?.toString(),
                tags: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }));
            setPosts(formattedPosts);
        } else {
            console.error("API did not return an array of posts in the 'data' field:", responseData);
            setPosts([]);
        }
      } catch (e: any) {
        setError("Failed to connect to the backend. Please ensure the server is running and that it is configured to accept requests from this application (CORS).");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
        fetchPosts();
    } else {
        setLoading(false);
    }
  }, [accessToken]);
  
  const handleDelete = async (postId: string) => {
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to delete a post.",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/delete?blog_id=${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete post.');
      }
      
      setPosts(posts.filter(p => p.id !== postId));
      
      toast({
        title: "Post Deleted",
        description: "The post has been successfully deleted.",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "An unknown error occurred.",
      });
    }
  };

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
            <PostCard 
              key={post.id} 
              post={post}
              user={user}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="flex items-center justify-center py-20">
          <CardContent>
            <div className="text-center">
              <h2 className="text-2xl font-headline font-semibold">No Posts Yet</h2>
              <p className="mt-2 text-muted-foreground">
                {accessToken ? "No blogs found." : "Log in to see your posts."}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
