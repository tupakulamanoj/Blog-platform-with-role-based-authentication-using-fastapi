
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

const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  body: z.string().min(1, "Content is required."),
});

export default function NewPostPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { accessToken, user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  if (user?.email !== 'admin@gmail.com') {
      return (
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to create a new post.</p>
                </CardContent>
            </Card>
        </div>
      );
  }

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
        const response = await fetch('http://localhost:5000/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                title: values.title,
                body: values.body,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create post.');
        }

        toast({
            title: "Post Created",
            description: "Your new post has been successfully created.",
        });
        router.push("/");
        router.refresh();

    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Creation Failed",
            description: error.message || "An unknown error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                <CardTitle className="font-headline text-2xl">Create a New Post</CardTitle>
                <CardDescription>Fill out the details below to publish your new blog post.</CardDescription>
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
                    Publish Post
                </Button>
                </CardContent>
            </form>
            </Form>
        </Card>
    </div>
  );
}
