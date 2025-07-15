"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createPost(
  accessToken: string,
  formData: { title: string; body: string }
) {
  if (!accessToken) {
    return { success: false, error: "Authentication required." };
  }

  try {
    const response = await fetch("http://localhost:5000/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        title: formData.title,
        body: formData.body,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.detail || "Failed to create post.",
      };
    }
  } catch (error) {
    console.error("Create post error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }

  revalidatePath("/");
  redirect("/");
}
