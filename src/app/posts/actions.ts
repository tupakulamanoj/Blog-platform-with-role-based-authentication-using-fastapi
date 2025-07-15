"use server";

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { auth, db } from "@/lib/firebase";
import { suggestTags } from "@/ai/flows/suggest-tags";

type PostInput = {
  title: string;
  content: string;
  tags: string[];
};

export async function createPost(data: PostInput) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to create a post.");

  const postData = {
    ...data,
    authorId: user.uid,
    authorName: user.email || "Anonymous",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "posts"), postData);
  revalidatePath("/");
  revalidatePath(`/posts/${docRef.id}`);
  return docRef.id;
}

export async function updatePost(data: PostInput & { id: string }) {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be logged in to update a post.");
  
  const { id, ...postData } = data;
  const postRef = doc(db, "posts", id);
  
  // In a real app, you'd verify ownership here using security rules or admin SDK
  
  await updateDoc(postRef, {
    ...postData,
    updatedAt: serverTimestamp(),
  });

  revalidatePath("/");
  revalidatePath(`/posts/${id}`);
}

export async function suggestPostTags(input: { blogPostContent: string }) {
  return await suggestTags(input);
}
