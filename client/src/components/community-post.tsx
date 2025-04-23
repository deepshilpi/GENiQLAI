import { useMemo, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUp, ArrowDown, MessageSquare, Image as ImageIcon } from "lucide-react";
import { Post, User } from "@shared/schema";
import { timeAgo, truncateText } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CommunityPostProps {
  post: Post;
  onVote: (postId: number, voteType: string) => void;
  currentUser: User | null;
}

export function CommunityPost({ post, onVote, currentUser }: CommunityPostProps) {
  const [authorUsername, setAuthorUsername] = useState<string>("");
  const createdAt = useMemo(() => new Date(post.createdAt), [post.createdAt]);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Fetch the author's username
  useEffect(() => {
    async function fetchAuthor() {
      try {
        const response = await fetch(`/api/users/${post.authorId}`);
        if (response.ok) {
          const author = await response.json();
          setAuthorUsername(author.username || "User");
        } else {
          // Use fallback if server returns error
          setAuthorUsername("User");
        }
      } catch (error) {
        console.error("Error fetching author:", error);
        // Use fallback if request fails
        setAuthorUsername("User");
      }
    }
    
    if (post.authorId) {
      fetchAuthor();
    } else {
      setAuthorUsername("User");
    }
  }, [post.authorId]);
  
  const handlePump = () => {
    if (!currentUser) {
      // Show toast and navigate to auth
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on community posts",
        variant: "default",
      });
      navigate('/auth');
      return;
    }
    onVote(post.id, "pump");
  };
  
  const handleDump = () => {
    if (!currentUser) {
      // Show toast and navigate to auth
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on community posts",
        variant: "default",
      });
      navigate('/auth');
      return;
    }
    onVote(post.id, "dump");
  };
  
  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-center mb-3">
          <Link href={`/profile/${authorUsername}`}>
            <a className="w-10 h-10 rounded-full bg-accent mr-3 flex items-center justify-center text-sm font-medium">
              {authorUsername.charAt(0).toUpperCase()}
            </a>
          </Link>
          <div>
            <Link href={`/profile/${authorUsername}`}>
              <a className="font-medium hover:underline">{authorUsername}</a>
            </Link>
            <div className="text-xs text-muted-foreground">Posted {timeAgo(createdAt)}</div>
          </div>
        </div>
        
        <h3 className="font-bold text-lg mb-2">{post.title}</h3>
        <p className="text-muted-foreground text-sm mb-3">
          {truncateText(post.description, 120)}
        </p>
        
        {post.imageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-auto max-h-[300px] object-cover"
              onError={(e) => {
                e.currentTarget.src = ""; 
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-accent text-muted-foreground px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex space-x-4 border-t border-border pt-3">
          <button 
            className={`flex items-center text-sm ${post.pumpCount > post.dumpCount ? "text-success" : "text-muted-foreground"}`}
            onClick={handlePump}
          >
            <ArrowUp className="mr-1 w-4 h-4" />
            <span>Pump ({post.pumpCount})</span>
          </button>
          <button 
            className={`flex items-center text-sm ${post.dumpCount > post.pumpCount ? "text-destructive" : "text-muted-foreground"}`}
            onClick={handleDump}
          >
            <ArrowDown className="mr-1 w-4 h-4" />
            <span>Dump ({post.dumpCount})</span>
          </button>
          <Link href={`/post/${post.id}`}>
            <a className="flex items-center text-muted-foreground text-sm ml-auto">
              <MessageSquare className="mr-1 w-4 h-4" />
              <span>{post.commentCount || 0}</span>
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
