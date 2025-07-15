// This file would ideally be on the server, but due to limitations
// with server-side Firebase auth without a library, some parts are designed
// to be called from client-side handlers or need user context passed in.
// For a production app, use Firebase Admin SDK on a dedicated backend or secure cloud functions.

"use server";

import { Post } from "./types";

// Data Fetching
export async function getPosts(accessToken: string): Promise<Post[]> {
  if (!accessToken) {
    return [];
  }

  try {
    const response = await fetch("http://localhost:5000/read", {
      cache: "no-store", // Ensure we get fresh data on every request
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
    // Re-throw the error to be caught by the calling component
    throw error;
  }
}

export async function getPost(id: string, accessToken: string): Promise<Post | null> {
  if (!accessToken) {
    throw new Error("You must be logged in to view a post.");
  }
  try {
    // Fetch all posts and find the one with the matching ID
    const posts = await getPosts(accessToken);
    const post = posts.find((p) => p.id === id);
    return post || null;
  } catch (error)
  {
    console.error("Error fetching post: ", error);
    throw error;
  }
}
