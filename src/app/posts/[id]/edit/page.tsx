"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth-provider";

import BlogPostForm from "@/components/BlogPostForm";
import Spinner from "@/components/Spinner";
import { useToast } from "@/hooks/use-toast";

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, "posts", params.id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const postData = { id: docSnap.id, ...docSnap.data() } as Post;
          if (!authLoading && user?.uid !== postData.authorId) {
            toast({ variant: "destructive", title: "Unauthorized" });
            router.push("/");
          } else {
            setPost(postData);
          }
        } else {
          router.push("/404");
        }
      } catch (error) {
        toast({ variant: "destructive", title: "Error fetching post." });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
        if(!user) {
            router.push('/login');
        } else {
            fetchPost();
        }
    }
  }, [params.id, router, user, authLoading, toast]);

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
