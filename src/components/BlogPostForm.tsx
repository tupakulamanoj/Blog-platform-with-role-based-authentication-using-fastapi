"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth-provider";
import { Post } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X, Wand2 } from "lucide-react";
import Spinner from "@/components/Spinner";
import { suggestPostTags, createPost, updatePost } from "@/app/posts/actions";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long."),
  content: z.string().min(20, "Content must be at least 20 characters long."),
});

interface BlogPostFormProps {
  post?: Post;
}

export default function BlogPostForm({ post }: BlogPostFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
    },
  });

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
  
  const handleSuggestTags = async () => {
    const content = form.getValues("content");
    if (!content || content.length < 50) {
      toast({
        variant: "destructive",
        title: "Content too short",
        description: "Please write at least 50 characters to get tag suggestions.",
      });
      return;
    }
    setIsSuggesting(true);
    try {
      const suggested = await suggestPostTags({ blogPostContent: content });
      const newTags = Array.from(new Set([...tags, ...suggested.tags]));
      setTags(newTags);
    } catch (error) {
       toast({ variant: "destructive", title: "Failed to suggest tags." });
    } finally {
      setIsSuggesting(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!accessToken) {
      toast({ variant: "destructive", title: "You must be logged in." });
      return;
    }
    setIsSubmitting(true);
    try {
      if (post) {
        await updatePost({ ...values, id: post.id, tags });
        toast({ title: "Post updated successfully!" });
        router.push(`/posts/${post.id}`);
      } else {
        // NOTE: In a real app, you would decode the JWT to get the user ID and name
        // instead of hardcoding it. This is a temporary solution.
        const author = { id: "user-id-from-jwt", name: "User from JWT" };
        const newPostId = await createPost({ ...values, tags }, author);
        toast({ title: "Post created successfully!" });
        router.push(`/posts/${newPostId}`);
      }
      router.refresh();
    } catch (error) {
      toast({ variant: "destructive", title: "An error occurred." });
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
              {post ? "Edit Post" : "Create a New Post"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Your amazing blog post title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your story here..."
                      className="min-h-[300px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormItem>
                <div className="flex items-center justify-between">
                    <FormLabel>Tags</FormLabel>
                    <Button type="button" variant="ghost" size="sm" onClick={handleSuggestTags} disabled={isSuggesting}>
                        {isSuggesting ? <Spinner className="h-4 w-4 mr-2" /> : <Wand2 className="h-4 w-4 mr-2" />}
                        Suggest Tags
                    </Button>
                </div>
                <FormControl>
                    <Input 
                        placeholder="Add tags and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                    />
                </FormControl>
                <div className="flex flex-wrap gap-2 pt-2">
                    {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="pl-3 pr-1">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="ml-1 rounded-full p-0.5 hover:bg-destructive/20">
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    ))}
                </div>
            </FormItem>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
              {post ? "Save Changes" : "Publish Post"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
