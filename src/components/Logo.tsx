import Link from "next/link";
import { Feather } from "lucide-react";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-2xl font-bold font-headline text-primary transition-opacity hover:opacity-80"
    >
      <Feather className="h-7 w-7" />
      <span>NextBlog</span>
    </Link>
  );
}
