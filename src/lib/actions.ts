"use server";

import { Post } from "./types";

// This function is kept for components that might still use it,
// but new implementations should fetch data directly on the client.
export async function getPosts(accessToken: string): Promise<Post[]> {
  if (!accessToken) {
    return [];
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/read", {
      cache: "no-store",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
      }
    });

    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized. Please log in again.");
        }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const posts = await response.json();
    return posts.map((post: any) => ({
      ...post,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    })) as Post[];
  } catch (error) {
    console.error("Error fetching posts: ", error);
    throw error;
  }
}
