
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { useAuth } from "@/hooks/use-auth-provider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Spinner from "@/components/Spinner";
import { Post } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  body: z.string().min(1, "Content is required."),
});

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const { accessToken, user, loading: authLoading } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  useEffect(() => {
    const fetchPost = async (token: string) => {
      setLoadingPost(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:5000/read", {
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch post data.");
        }
        
        const responseData = await response.json();
        const posts = responseData.data;
        
        if (Array.isArray(posts)) {
            const fetchedPost = posts.find((p: any) => p.blog_id?.toString() === params.id);
            if (fetchedPost) {
                const loadedPost = {
                    id: fetchedPost.blog_id?.toString(),
                    title: fetchedPost.title,
                    content: fetchedPost.body,
                    authorId: fetchedPost.user_id?.toString(),
                    tags: [],
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                setPost(loadedPost);
                form.reset({ title: loadedPost.title, body: loadedPost.content });
            } else {
              setError("Post not found.");
            }
        } else {
            setError("Post data is not in the expected format.");
        }
      } catch (e: any) {
        setError(e.message || "Failed to connect to the backend.");
      } finally {
        setLoadingPost(false);
      }
    };

    if (!authLoading && accessToken) {
      if (user?.email === 'admin@gmail.com') {
        fetchPost(accessToken);
      } else {
        setError("You do not have permission to edit this post.");
        setLoadingPost(false);
      }
    } else if (!authLoading && !accessToken) {
        toast({ variant: "destructive", title: "Authentication required" });
        router.push("/login");
    }
  }, [params.id, router, toast, accessToken, authLoading, form, user]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!accessToken) {
        toast({ variant: "destructive", title: "Authentication Error" });
        return;
    }
    
    setIsLoading(true);
    try {
        const queryParams = new URLSearchParams({
            blog_id: params.id,
            title: values.title,
            body: values.body,
        }).toString();

        const response = await fetch(`http://localhost:5000/update?${queryParams}`, {
            method: 'PUT',
            headers: {
                'accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to update post.');
        }

        toast({
            title: "Post Updated",
            description: "Your post has been successfully updated.",
        });
        router.push("/");
        router.refresh();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (loadingPost || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
     return (
      <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
            <CardHeader>
                <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
            </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.email !== 'admin@gmail.com') {
      return (
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to edit posts.</p>
                </CardContent>
            </Card>
        </div>
      );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                <CardTitle className="font-headline text-2xl">Edit Post</CardTitle>
                <CardDescription>Update the details of your blog post.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                        <Input placeholder="Your Post Title" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="body"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                        <Textarea placeholder="Write your thoughts here..." className="min-h-[200px]" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                </CardContent>
                <CardContent className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                    {isLoading && <Spinner className="mr-2" />}
                    Update Post
                </Button>
                </CardContent>
            </form>
            </Form>
        </Card>
    </div>
  );
}
