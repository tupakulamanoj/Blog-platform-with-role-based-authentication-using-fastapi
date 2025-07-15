
import Link from "next/link";
import { Post, User } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil } from "lucide-react";

interface PostCardProps {
  post: Post;
  user: User | null;
  onDelete: (postId: string) => void;
}

export default function PostCard({ post, user, onDelete }: PostCardProps) {
  const contentSnippet = post.content.substring(0, 100) + "...";
  const isAdmin = user?.email === 'admin@gmail.com';

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(post.id);
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  }

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 group">
        <CardHeader>
          <Link href={`/posts/${post.id}`} className="group-hover:text-primary">
            <CardTitle className="font-headline text-xl leading-tight">
              {post.title}
            </CardTitle>
          </Link>
        </CardHeader>
        <CardContent className="flex-grow">
           <Link href={`/posts/${post.id}`} className="block">
            <p className="text-sm">{contentSnippet}</p>
          </Link>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          {isAdmin && (
              <div className="flex items-center">
                  <Button 
                    asChild
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-primary"
                    onClick={handleEditClick}
                    aria-label="Edit post"
                  >
                    <Link href={`/posts/${post.id}/edit`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-destructive"
                    onClick={handleDeleteClick}
                    aria-label="Delete post"
                  >
                      <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
          )}
        </CardFooter>
    </Card>
  );
}
