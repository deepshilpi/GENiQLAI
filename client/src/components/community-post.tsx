import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  ThumbsUp, 
  Heart, 
  Lightbulb, 
  Flame, 
  Smile 
} from "lucide-react";
import { Post, User } from "@shared/schema";
import { timeAgo, truncateText } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Extended post type with author information
interface ExtendedPost extends Post {
  author?: {
    username: string;
  };
  commentsCount?: number;
  reactions?: {
    like: number;
    love: number;
    idea: number;
    fire: number;
    smile: number;
  };
  currentUserReactions?: string[];
}

interface CommunityPostProps {
  post: ExtendedPost;
  onVote: (postId: number, voteType: string) => void;
  currentUser: User | null;
}

export function CommunityPost({ post, onVote, currentUser }: CommunityPostProps) {
  const authorUsername = useMemo(() => post.author?.username || "User", [post.author]);
  const createdAt = useMemo(() => new Date(post.createdAt), [post.createdAt]);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Initialize reactions if they don't exist
  const reactions = post.reactions || { like: 0, love: 0, idea: 0, fire: 0, smile: 0 };
  const userReactions = post.currentUserReactions || [];
  
  const handlePump = () => {
    if (!currentUser) {
      // Redirect to auth page
      navigate('/auth');
      return;
    }
    onVote(post.id, "pump");
  };
  
  const handleDump = () => {
    if (!currentUser) {
      // Redirect to auth page
      navigate('/auth');
      return;
    }
    onVote(post.id, "dump");
  };
  
  const handleReaction = (reactionType: string) => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    // This would normally connect to your API endpoint
    // For now, we'll just show a toast message
    toast({
      title: "Reaction added",
      description: `You reacted with ${reactionType} to this post`,
    });
    
    // In real implementation, you would call your backend API
    // Something like:
    // apiRequest('POST', `/api/posts/${post.id}/reaction`, { reactionType })
    //   .then(() => queryClient.invalidateQueries(['/api/posts']))
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
        
        <div className="flex flex-wrap gap-2 mb-3">
          {post.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-accent text-muted-foreground px-2 py-1 rounded">
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex flex-col space-y-3 border-t border-border pt-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Emoji Reactions */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`flex items-center p-1.5 rounded-full text-sm bg-accent/50 hover:bg-accent ${userReactions.includes('like') ? 'text-blue-400 border border-blue-400/30' : 'text-muted-foreground'}`}
                    onClick={() => handleReaction('like')}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span className="ml-1 text-xs">{reactions.like || 0}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Like</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`flex items-center p-1.5 rounded-full text-sm bg-accent/50 hover:bg-accent ${userReactions.includes('love') ? 'text-pink-400 border border-pink-400/30' : 'text-muted-foreground'}`}
                    onClick={() => handleReaction('love')}
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span className="ml-1 text-xs">{reactions.love || 0}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Love</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`flex items-center p-1.5 rounded-full text-sm bg-accent/50 hover:bg-accent ${userReactions.includes('idea') ? 'text-yellow-400 border border-yellow-400/30' : 'text-muted-foreground'}`}
                    onClick={() => handleReaction('idea')}
                  >
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span className="ml-1 text-xs">{reactions.idea || 0}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Great Idea</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`flex items-center p-1.5 rounded-full text-sm bg-accent/50 hover:bg-accent ${userReactions.includes('fire') ? 'text-orange-400 border border-orange-400/30' : 'text-muted-foreground'}`}
                    onClick={() => handleReaction('fire')}
                  >
                    <Flame className="w-3.5 h-3.5" />
                    <span className="ml-1 text-xs">{reactions.fire || 0}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fire</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className={`flex items-center p-1.5 rounded-full text-sm bg-accent/50 hover:bg-accent ${userReactions.includes('smile') ? 'text-green-400 border border-green-400/30' : 'text-muted-foreground'}`}
                    onClick={() => handleReaction('smile')}
                  >
                    <Smile className="w-3.5 h-3.5" />
                    <span className="ml-1 text-xs">{reactions.smile || 0}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Smile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
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
            </div>
            
            <Link href={`/post/${post.id}`}>
              <a className="flex items-center text-muted-foreground text-sm">
                <MessageSquare className="mr-1 w-4 h-4" />
                <span>{post.commentsCount || 0}</span>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
