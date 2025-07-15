export interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  createdAt: string; // Changed from Timestamp to string for API compatibility
  updatedAt: string; // Changed from Timestamp to string for API compatibility
}
