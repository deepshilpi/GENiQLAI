import { useState } from "react";
import { useLocation } from "wouter";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  ThumbsUp, 
  Heart, 
  Lightbulb, 
  Flame, 
  Smile,
  Share,
  MoreHorizontal,
  Send,
  UserIcon
} from "lucide-react";
// Helper function for time formatting
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + " years ago";
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months ago";
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days ago";
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours ago";
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes ago";
  }
  
  return Math.floor(seconds) + " seconds ago";
}
import { useToast } from "@/hooks/use-toast";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { Post } from "@shared/schema";
import type { User } from "@shared/schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Extended post interface with additional properties
interface ExtendedPost extends Post {
  author?: {
    username: string;
    profilePic?: string;
  };
  commentsCount?: number;
  comments?: PostComment[];
  reactions?: {
    like: number;
    love: number;
    idea: number;
    fire: number;
    smile: number;
  };
  currentUserReactions?: string[];
  currentUserVote?: 'pump' | 'dump' | null;
}

interface PostComment {
  id: number;
  content: string;
  userId: number;
  username: string;
  profilePic?: string;
  createdAt: string;
}

interface XStylePostProps {
  post: ExtendedPost;
  onVote: (postId: number, voteType: string) => void;
  onReact: (postId: number, reactionType: string) => void;
  onComment: (postId: number, comment: string) => void;
  currentUser: User | null;
}

export function XStylePost({ 
  post, 
  onVote, 
  onReact, 
  onComment,
  currentUser 
}: XStylePostProps) {
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [showUserProfile, setShowUserProfile] = useState(false);
  // Use location for navigation
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const { openAuthDialog } = useAuthDialog();
  
  // Initialize reactions if they don't exist
  const reactions = post.reactions || { like: 0, love: 0, idea: 0, fire: 0, smile: 0 };
  const userReactions = post.currentUserReactions || [];
  const comments = post.comments || [];
  
  const authorUsername = post.author?.username || "Anonymous";
  const authorInitial = authorUsername.charAt(0).toUpperCase();
  const postDate = new Date(post.createdAt);
  
  const handlePump = () => {
    if (!currentUser) {
      openAuthDialog({ defaultTab: "login" });
      return;
    }
    onVote(post.id, "pump");
  };
  
  const handleDump = () => {
    if (!currentUser) {
      openAuthDialog({ defaultTab: "login" });
      return;
    }
    onVote(post.id, "dump");
  };
  
  const handleReaction = (reactionType: string) => {
    if (!currentUser) {
      openAuthDialog({ defaultTab: "login" });
      return;
    }
    onReact(post.id, reactionType);
  };
  
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return;
    
    if (!currentUser) {
      openAuthDialog({ defaultTab: "login" });
      return;
    }
    
    onComment(post.id, newComment);
    setNewComment("");
  };
  
  const handleUserClick = () => {
    if (!post.author?.username) return;
    setShowUserProfile(true);
  };
  
  const handleFollow = () => {
    if (!currentUser) {
      openAuthDialog({ defaultTab: "login" });
      return;
    }
    
    toast({
      title: "Following user",
      description: `You are now following ${post.author?.username}`,
    });
  };
  
  const handleMessage = () => {
    if (!currentUser) {
      openAuthDialog({ defaultTab: "login" });
      return;
    }
    
    setLocation(`/messages?user=${post.author?.username}`);
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/post/${post.id}`);
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard",
    });
  };
  
  const totalReactions = 
    reactions.like + 
    reactions.love + 
    reactions.idea + 
    reactions.fire + 
    reactions.smile;
  
  return (
    <>
      <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none opacity-50"></div>
        
        <div className="relative z-10 flex">
          {/* Left vote column */}
          <div className="w-12 sm:w-16 bg-accent/30 flex flex-col items-center justify-start py-4 border-r border-border text-center">
            <button 
              className={`flex items-center justify-center w-8 h-8 rounded-full hover:bg-vision-purple-100/20 ${post.currentUserVote === 'pump' ? 'text-green-500' : 'text-white/70'}`}
              onClick={handlePump}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            
            <span className="text-sm font-medium my-1">
              {post.pumpCount && post.dumpCount
                ? post.pumpCount - post.dumpCount
                : 0}
            </span>
            
            <button 
              className={`flex items-center justify-center w-8 h-8 rounded-full hover:bg-vision-purple-100/20 ${post.currentUserVote === 'dump' ? 'text-red-500' : 'text-white/70'}`}
              onClick={handleDump}
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-4">
            {/* Post header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center cursor-pointer" onClick={handleUserClick}>
                <Avatar className="h-10 w-10 bg-vision-purple-900 border border-primary/30 mr-3">
                  <AvatarFallback className="bg-vision-purple-100/10 text-white">
                    {authorInitial}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <div className="font-semibold text-white hover:underline">{authorUsername}</div>
                  <div className="text-xs text-white/50">Posted {timeAgo(postDate)}</div>
                </div>
              </div>
              
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Post title and content */}
            <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
            <p className={`text-white/90 text-sm mb-3 ${expanded ? '' : 'line-clamp-3'}`}>
              {post.description}
            </p>
            
            {post.description.length > 250 && !expanded && (
              <button 
                className="text-primary text-xs mb-3 hover:underline"
                onClick={() => setExpanded(true)}
              >
                Show more
              </button>
            )}
            
            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag, index) => (
                  <Badge 
                    key={index}
                    className="bg-vision-purple-900/50 hover:bg-vision-purple-900/70 text-white"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Reaction and comment stats */}
            <div className="flex items-center justify-between text-white/60 text-xs my-3 pb-3 border-b border-border">
              <div className="flex items-center">
                {totalReactions > 0 && (
                  <div className="flex items-center mr-4">
                    <div className="flex -space-x-1 mr-1">
                      {reactions.like > 0 && <ThumbsUp className="w-3 h-3 text-blue-400" />}
                      {reactions.love > 0 && <Heart className="w-3 h-3 text-pink-400" />}
                      {reactions.idea > 0 && <Lightbulb className="w-3 h-3 text-yellow-400" />}
                    </div>
                    <span>{totalReactions}</span>
                  </div>
                )}
                
                {(post.commentsCount ?? 0) > 0 && (
                  <div>
                    <span>{post.commentsCount} comments</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className={`flex items-center rounded-full p-2 text-sm ${userReactions.includes('like') ? 'text-blue-400 bg-blue-400/10' : 'text-white/70 hover:bg-vision-purple-100/10'}`}
                        onClick={() => handleReaction('like')}
                      >
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Like</span>
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
                        className={`flex items-center rounded-full p-2 text-sm ${userReactions.includes('love') ? 'text-pink-400 bg-pink-400/10' : 'text-white/70 hover:bg-vision-purple-100/10'}`}
                        onClick={() => handleReaction('love')}
                      >
                        <Heart className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Love</span>
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
                        className={`flex items-center rounded-full p-2 text-sm ${userReactions.includes('idea') ? 'text-yellow-400 bg-yellow-400/10' : 'text-white/70 hover:bg-vision-purple-100/10'}`}
                        onClick={() => handleReaction('idea')}
                      >
                        <Lightbulb className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">Idea</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Great Idea</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/70 hover:bg-vision-purple-100/10 rounded-full"
                  onClick={() => setShowComments(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Comment</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/70 hover:bg-vision-purple-100/10 rounded-full"
                  onClick={handleShare}
                >
                  <Share className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="sm:max-w-[600px] bg-vision-dark border border-vision-purple-200/20">
          <DialogTitle className="text-xl font-bold text-white">Comments</DialogTitle>
          
          <div className="h-80 overflow-y-auto py-4">
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 bg-vision-purple-900 border border-primary/30">
                      <AvatarFallback className="bg-vision-purple-100/10 text-white">
                        {comment.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-vision-purple-900/30 rounded-lg p-3">
                        <div className="font-medium text-sm text-white">{comment.username}</div>
                        <p className="text-white/90 text-sm">{comment.content}</p>
                      </div>
                      <div className="text-xs text-white/50 mt-1">
                        {timeAgo(new Date(comment.createdAt))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/50">
                <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-vision-purple-200/20">
            <Avatar className="h-8 w-8 bg-vision-purple-900 border border-primary/30">
              <AvatarFallback className="bg-vision-purple-100/10 text-white">
                {currentUser?.username?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea 
                placeholder="Write a comment..." 
                className="flex-1 resize-none bg-vision-purple-100/10 border-vision-purple-200/20 text-white min-h-[2.5rem] py-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCommentSubmit();
                  }
                }}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary hover:bg-primary/10 rounded-full"
                onClick={handleCommentSubmit}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white" />
        </DialogContent>
      </Dialog>
      
      {/* User Profile Dialog */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="sm:max-w-[400px] bg-vision-dark border border-vision-purple-200/20">
          <div className="flex flex-col items-center">
            <Avatar className="h-20 w-20 bg-vision-purple-900 border-2 border-primary/50">
              <AvatarFallback className="bg-vision-purple-100/10 text-white text-xl">
                {authorInitial}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-bold text-white mt-4">{authorUsername}</h2>
            <p className="text-white/60 text-sm mb-4">Member since {new Date(post.createdAt).toLocaleDateString()}</p>
            
            <div className="flex gap-3 mt-2 mb-6">
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={handleFollow}
              >
                Follow
              </Button>
              <Button 
                variant="outline" 
                className="border-vision-purple-200/30 text-white hover:bg-vision-purple-100/10"
                onClick={handleMessage}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Message
              </Button>
            </div>
            
            <div className="grid grid-cols-3 w-full text-center border-y border-vision-purple-200/10 py-4">
              <div>
                <div className="text-lg font-bold text-white">0</div>
                <div className="text-xs text-white/60">Posts</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">0</div>
                <div className="text-xs text-white/60">Followers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">0</div>
                <div className="text-xs text-white/60">Following</div>
              </div>
            </div>
            
            <div className="w-full pt-4">
              <h3 className="font-medium text-white mb-2">About</h3>
              <p className="text-white/70 text-sm">
                No bio available yet.
              </p>
            </div>
          </div>
          
          <DialogClose className="absolute right-4 top-4 text-white/70 hover:text-white" />
        </DialogContent>
      </Dialog>
    </>
  );
}