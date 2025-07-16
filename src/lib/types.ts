
export interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  email: string;
}
