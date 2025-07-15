import { getPosts } from "@/lib/actions";
import { Post } from "@/lib/types";
import PostCard from "@/components/PostCard";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function Home() {
  let posts: Post[] = [];
  let error = null;

  try {
    posts = await getPosts();
  } catch (e) {
    error = e;
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-center text-4xl font-bold text-transparent font-headline sm:text-5xl">
        Welcome to NextBlog
      </h1>
      <p className="mb-12 text-center text-lg text-muted-foreground">
        Explore ideas, stories, and insights from our community.
      </p>

      {error && (
         <Alert variant="destructive" className="mb-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Could not connect to the backend service. Please make sure it is running and accessible.
            </AlertDescription>
        </Alert>
      )}

      {posts.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <Card className="flex items-center justify-center py-20">
          <CardContent>
            <div className="text-center">
              <h2 className="text-2xl font-headline font-semibold">No Posts Yet</h2>
              <p className="mt-2 text-muted-foreground">
                Be the first to share your story!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
