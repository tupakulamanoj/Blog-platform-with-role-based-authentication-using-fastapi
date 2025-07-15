// This file would ideally be on the server, but due to limitations
// with server-side Firebase auth without a library, some parts are designed
// to be called from client-side handlers or need user context passed in.
// For a production app, use Firebase Admin SDK on a dedicated backend or secure cloud functions.

"use server";

import {
  collection,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { db } from "./firebase";
import { Post } from "./types";

// Data Fetching
export async function getPosts(): Promise<Post[]> {
  try {
    const response = await fetch("http://localhost:5000/read", {
      cache: "no-store", // Ensure we get fresh data on every request
    });
    if (!response.ok) {
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
    // Return an empty array to prevent the app from crashing.
    // This could be due to the backend server not being available.
    return [];
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // The API doesn't expose a single post endpoint yet, so we keep using Firestore for now.
      // This will need to be updated to use the new API when available.
      const postData = docSnap.data();
      return { 
        id: docSnap.id,
        title: postData.title,
        content: postData.content,
        tags: postData.tags,
        authorId: postData.authorId,
        authorName: postData.authorName,
        createdAt: (postData.createdAt as Timestamp).toDate().toISOString(),
        updatedAt: (postData.updatedAt as Timestamp).toDate().toISOString(),
      } as Post;
    }
    return null;
  } catch (error) {
    console.error("Error fetching post: ", error);
    return null;
  }
}
