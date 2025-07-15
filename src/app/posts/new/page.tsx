"use client";

import { useState } from "react";
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
import { createPost } from "@/app/posts/actions";

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  body: z.string().min(1, "Content is required."),
});

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, loading: authLoading } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to create a post.",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await createPost(accessToken, values);

      if (result?.error) {
        throw new Error(result.error);
      }
      
      toast({
        title: "Post Created",
        description: "Your new post has been published.",
      });
      // The redirect is handled in the server action, but we push here as a fallback
      router.push('/');
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to Create Post",
        description: error.message || "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  }
  
  if (!accessToken) {
      router.push('/login');
      return null;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create a New Post</CardTitle>
              <CardDescription>Fill out the details below to publish your article.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Your post title" {...field} />
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
                      <Textarea
                        placeholder="Write your story here..."
                        className="min-h-[250px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardContent className="flex justify-end pt-0">
               <Button type="submit" disabled={isLoading}>
                {isLoading && <Spinner className="mr-2" />}
                Publish Post
              </Button>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
