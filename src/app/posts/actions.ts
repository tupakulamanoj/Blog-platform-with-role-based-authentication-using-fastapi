"use server";

import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { suggestTags } from "@/ai/flows/suggest-tags";

type PostInput = {
  title: string;
  content: string;
  tags: string[];
};

// IMPORTANT: This createPost action is now insecure.
// It relies on client-side user information. In a real application,
// you would pass the access token to this server action and validate it
// on the backend to securely get the user's ID and name.
export async function createPost(data: PostInput, author: {id: string, name: string}) {
  if (!author || !author.id) throw new Error("You must be logged in to create a post.");

  const postData = {
    ...data,
    authorId: author.id,
    authorName: author.name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, "posts"), postData);
  revalidatePath("/");
  revalidatePath(`/posts/${docRef.id}`);
  return docRef.id;
}

// IMPORTANT: This updatePost action is now insecure.
// It does not verify post ownership. In a real application,
// you would pass the access token to this server action and validate
// on the backend that the authenticated user is the owner of the post.
export async function updatePost(data: PostInput & { id: string }) {
  const { id, ...postData } = data;
  const postRef = doc(db, "posts", id);
  
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
