"use server";

export async function createPost(data: { title: string; content: string }) {
  console.log("Creating post:", data);
  return { success: true, message: "Post created!" };
}