"use server";

import { revalidatePath } from "next/cache";
import { suggestTags } from "@/ai/flows/suggest-tags";
import { Post } from "@/lib/types";

type PostInput = {
  title: string;
  content: string;
  tags: string[];
};

export async function createPost(post: PostInput, accessToken: string) {
  if (!accessToken) throw new Error("You must be logged in to create a post.");

  const response = await fetch("http://localhost:5000/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(post),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create post.");
  }

  const newPost = await response.json();
  revalidatePath("/");
  if (newPost.id) {
    revalidatePath(`/posts/${newPost.id}`);
  }
  return newPost.id;
}

export async function updatePost(
  post: PostInput & { id: string },
  accessToken: string
) {
  if (!accessToken) throw new Error("You must be logged in to update a post.");

  const { id, ...postData } = post;
  const response = await fetch(`http://localhost:5000/update/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
     const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to update post.");
  }
  
  revalidatePath("/");
  revalidatePath(`/posts/${id}`);
}

export async function deletePost(id: string, accessToken: string) {
  if (!accessToken) throw new Error("You must be logged in to delete a post.");

  const response = await fetch(`http://localhost:5000/delete/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to delete post.");
  }

  revalidatePath("/");
}


export async function suggestPostTags(input: { blogPostContent: string }) {
  return await suggestTags(input);
}
