import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowUp, 
  ArrowDown, 
  MessageSquare, 
  Heart, 
  Share2,
  MoreHorizontal,
  Send,
  User,
  MessageCircle,
  ExternalLink
} from "lucide-react";
import { Post } from "@shared/schema";
import type { User as UserType } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

// Helper function for time formatting
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) {
    return Math.floor(interval) + "y";
  }
  
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + "mo";
  }
  
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + "d";
  }
  
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + "h";
  }
  
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + "m";
  }
  
  return Math.floor(seconds) + "s";
}

// Extended post interface with additional properties
interface ExtendedPost extends Post {
  author?: {
    username: string;
    profilePic?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
  };
  commentsCount?: number;
  comments?: PostComment[];
  likesCount?: number;
  currentUserLiked?: boolean;
  currentUserVote?: 'pump' | 'dump' | null;
  isFollowingAuthor?: boolean;
}

interface PostComment {
  id: number;
  content: string;
  userId: number;
  username: string;
  profilePic?: string;
  createdAt: string;
  likesCount?: number;
  currentUserLiked?: boolean;
}

interface ThreadsStylePostProps {
  post: ExtendedPost;
  onVote: (postId: number, voteType: string) => void;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
  onFollow?: (userId: number) => void;
  onShareProfile?: (username: string) => void;
  onSendMessage?: (userId: number) => void;
  currentUser: UserType | null;
  isDetailView?: boolean;
}

export function ThreadsStylePost({ 
  post, 
  onVote, 
  onLike,
  onComment,
  onFollow,
  onShareProfile,
  onSendMessage,
  currentUser,
  isDetailView = false
}: ThreadsStylePostProps) {
  const [showComments, setShowComments] = useState(isDetailView);
  const [newComment, setNewComment] = useState("");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSharingOpen, setIsSharingOpen] = useState(false);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  
  // Use location for navigation
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // Auto-expand text in detail view
  useEffect(() => {
    if (isDetailView) {
      setIsExpanded(true);
    }
  }, [isDetailView]);

  // Focus on comment input when comments are opened
  useEffect(() => {
    if (showComments && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 100);
    }
  }, [showComments]);

  const handleVote = (voteType: 'pump' | 'dump') => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    // Don't allow voting again with the same option
    if (post.currentUserVote === voteType) return;
    
    onVote(post.id, voteType);
  };

  const handleLike = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    onLike(post.id);
  };

  const handleComment = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    if (!showComments) {
      setShowComments(true);
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment before submitting",
        variant: "destructive"
      });
      return;
    }
    
    onComment(post.id, newComment);
    setNewComment("");
  };

  const handleFollow = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    if (post.author?.username === currentUser.username) {
      toast({
        title: "Can't follow yourself",
        description: "You cannot follow your own profile",
        variant: "destructive"
      });
      return;
    }
    
    if (onFollow && post.authorId) {
      onFollow(post.authorId);
    }
  };

  const handleSendMessage = () => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    
    if (post.author?.username === currentUser.username) {
      toast({
        title: "Can't message yourself",
        description: "You cannot send a message to yourself",
        variant: "destructive"
      });
      return;
    }
    
    if (onSendMessage && post.authorId) {
      onSendMessage(post.authorId);
    }
  };

  const handleShareProfile = () => {
    if (post.author?.username && onShareProfile) {
      onShareProfile(post.author.username);
    }
  };

  const viewProfile = () => {
    setShowUserProfile(true);
  };

  const navigateToDetailView = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons, avatars, or links
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('a') ||
      (e.target as HTMLElement).tagName === 'BUTTON' ||
      (e.target as HTMLElement).tagName === 'A'
    ) {
      return;
    }
    
    if (!isDetailView) {
      navigate(`/community/post/${post.id}`);
    }
  };

  // Calculate post date
  const postDate = new Date(post.createdAt || Date.now());
  const formattedDate = timeAgo(postDate);
  
  // Process post description and tags
  let description = post.description;
  const tags = (post.tags as string[]) || [];
  
  // Limit description length and add expand/collapse functionality
  const shouldTruncate = description.length > 280 && !isExpanded && !isDetailView;
  const truncatedDescription = shouldTruncate
    ? description.substring(0, 280) + "..."
    : description;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`border-b border-gray-200 dark:border-gray-800 ${isDetailView ? 'pt-4' : 'py-4'} px-4 bg-white dark:bg-gray-950 rounded-lg mb-2 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-all`}
      onClick={navigateToDetailView}
    >
      {/* Post Header */}
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <Avatar 
            className="h-10 w-10 rounded-full cursor-pointer ring-2 ring-offset-2 ring-gray-100 dark:ring-gray-800" 
            onClick={(e) => {
              e.stopPropagation();
              viewProfile();
            }}
          >
            {post.author?.profilePic ? (
              <AvatarImage src={post.author.profilePic} alt={post.author.username} />
            ) : (
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                {post.author?.username ? post.author.username.substring(0, 2).toUpperCase() : "UN"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="w-0.5 flex-grow mt-2 bg-gray-200 dark:bg-gray-800"></div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span 
                className="font-semibold text-sm dark:text-gray-200 cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  viewProfile();
                }}
              >
                {post.author?.username || "Anonymous"}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">• {formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setIsSharingOpen(true);
                  }}>
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    viewProfile();
                  }}>
                    View profile
                  </DropdownMenuItem>
                  {post.author?.username !== currentUser?.username && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleFollow();
                    }}>
                      {post.isFollowingAuthor ? "Unfollow" : "Follow"} @{post.author?.username}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Post Content */}
          <div className="mt-2">
            {post.title && (
              <h3 className="font-semibold text-base mb-1 dark:text-white">{post.title}</h3>
            )}
            <p className="text-gray-800 dark:text-gray-300 whitespace-pre-line mb-1">
              {truncatedDescription}
              {shouldTruncate && (
                <button 
                  className="text-primary hover:underline text-sm ml-1 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(true);
                  }}
                >
                  Show more
                </button>
              )}
              {isExpanded && !isDetailView && (
                <button
                  className="text-primary hover:underline text-sm ml-1 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                >
                  Show less
                </button>
              )}
            </p>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-xs py-0 px-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Post Actions */}
          <div className="flex items-center gap-4 mt-3">
            <TooltipProvider>
              <div className="flex items-center text-sm">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 rounded-full ${post.currentUserVote === 'pump' ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-gray-500 dark:text-gray-400'} hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote('pump');
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Pump</TooltipContent>
                </Tooltip>
                
                <span className="text-gray-600 dark:text-gray-400 mx-0.5">{post.pumpCount || 0}</span>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 rounded-full ${post.currentUserVote === 'dump' ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-500 dark:text-gray-400'} hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote('dump');
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Dump</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${showComments ? 'text-primary bg-primary/10' : 'text-gray-500 dark:text-gray-400'} hover:text-primary hover:bg-primary/10`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{post.commentsCount || 0}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${post.currentUserLiked ? 'text-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'text-gray-500 dark:text-gray-400'} hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20`}
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
            >
              <Heart className={`h-4 w-4 ${post.currentUserLiked ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                setIsSharingOpen(true);
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 mt-2">
                  {/* Comment input */}
                  <div className="flex gap-2">
                    <Avatar className="h-8 w-8">
                      {currentUser?.profilePictureUrl ? (
                        <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.username} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-purple-400 to-violet-500 text-white text-xs">
                          {currentUser?.username ? currentUser.username.substring(0, 2).toUpperCase() : "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 relative">
                      <Textarea
                        ref={commentInputRef}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[80px] bg-white dark:bg-gray-800 resize-none focus:border-primary border-gray-200 dark:border-gray-700 text-sm w-full pr-10"
                      />
                      <Button
                        size="icon"
                        className={`absolute bottom-2 right-2 h-7 w-7 rounded-full ${newComment.trim() ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}
                        disabled={!newComment.trim()}
                        onClick={handleComment}
                      >
                        <Send className="h-3.5 w-3.5 text-white" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Comments display */}
                  {post.comments && post.comments.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-2">
                          <Avatar className="h-6 w-6">
                            {comment.profilePic ? (
                              <AvatarImage src={comment.profilePic} alt={comment.username} />
                            ) : (
                              <AvatarFallback className="bg-gray-400 text-white text-xs">
                                {comment.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-lg">
                              <div className="flex items-center">
                                <span className="font-medium text-xs dark:text-gray-200">{comment.username}</span>
                                <span className="text-[10px] text-gray-500 ml-1">• {timeAgo(new Date(comment.createdAt))}</span>
                              </div>
                              <p className="text-sm text-gray-800 dark:text-gray-300 mt-0.5">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-2 mt-1">
                              <button className="text-[10px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">Reply</button>
                              <button className="text-[10px] text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">Like</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-sm text-gray-500 dark:text-gray-400">
                      No comments yet. Be the first to comment!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Sharing Dialog */}
      <Dialog open={isSharingOpen} onOpenChange={setIsSharingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share this post</DialogTitle>
            <DialogDescription>
              Choose how you want to share this startup idea
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-24 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`);
                  toast({
                    title: "Link copied",
                    description: "Post link has been copied to clipboard",
                  });
                  setIsSharingOpen(false);
                }}
              >
                <ExternalLink className="h-6 w-6 mb-2" />
                <span>Copy link</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-24 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title || '')}&url=${encodeURIComponent(`${window.location.origin}/community/post/${post.id}`)}`, '_blank');
                  setIsSharingOpen(false);
                }}
              >
                <svg className="h-6 w-6 mb-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Twitter</span>
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button 
              variant="secondary" 
              onClick={() => setIsSharingOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Profile Dialog */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {post.author?.profilePic ? (
                    <AvatarImage src={post.author.profilePic} alt={post.author.username} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                      {post.author?.username ? post.author.username.substring(0, 2).toUpperCase() : "UN"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>@{post.author?.username || "Anonymous"}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2">
            <p className="text-gray-700 dark:text-gray-300">
              {post.author?.bio || "No bio available."}
            </p>
            
            <div className="flex items-center gap-6 mt-4">
              <div className="flex flex-col">
                <span className="font-medium dark:text-white">{post.author?.followersCount || 0}</span>
                <span className="text-xs text-gray-500">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium dark:text-white">{post.author?.followingCount || 0}</span>
                <span className="text-xs text-gray-500">Following</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
            {post.author?.username !== currentUser?.username && (
              <>
                <Button 
                  className="flex-1"
                  onClick={handleFollow}
                >
                  {post.isFollowingAuthor ? "Unfollow" : "Follow"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleSendMessage}
                >
                  Message
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              className="w-10"
              onClick={handleShareProfile}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}