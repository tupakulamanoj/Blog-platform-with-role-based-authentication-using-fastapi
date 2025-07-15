// This file would ideally be on the server, but due to limitations
// with server-side Firebase auth without a library, some parts are designed
// to be called from client-side handlers or need user context passed in.
// For a production app, use Firebase Admin SDK on a dedicated backend or secure cloud functions.

"use server";

import {
  collection,
  getDocs,
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
    const postsCollection = collection(db, "posts");
    const q = query(postsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Post)
    );
  } catch (error) {
    console.error("Error fetching posts: ", error);
    return [];
  }
}

export async function getPost(id: string): Promise<Post | null> {
  try {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Post;
    }
    return null;
  } catch (error) {
    console.error("Error fetching post: ", error);
    return null;
  }
}
