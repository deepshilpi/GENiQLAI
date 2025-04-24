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
      className={`border-b border-vision-purple-200/10 ${isDetailView ? 'pt-4' : 'py-4'} px-4 bg-vision-card/70 backdrop-blur-sm rounded-lg mb-2 hover:bg-vision-card/90 cursor-pointer transition-all`}
      onClick={navigateToDetailView}
    >
      {/* Post Header */}
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <Avatar 
            className="h-10 w-10 rounded-full cursor-pointer ring-2 ring-offset-2 ring-vision-purple-500/30" 
            onClick={(e) => {
              e.stopPropagation();
              viewProfile();
            }}
          >
            {post.author?.profilePic ? (
              <AvatarImage src={post.author.profilePic} alt={post.author.username} />
            ) : (
              <AvatarFallback className="bg-vision-primary-gradient text-white">
                {post.author?.username ? post.author.username.substring(0, 2).toUpperCase() : "UN"}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="w-0.5 flex-grow mt-2 bg-vision-purple-200/20"></div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span 
                className="font-semibold text-sm text-white cursor-pointer hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  viewProfile();
                }}
              >
                {post.author?.username || "Anonymous"}
              </span>
              <span className="text-xs text-vision-purple-300">• {formattedDate}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-vision-purple-300 hover:text-white hover:bg-vision-purple-100/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 text-white">
                  <DropdownMenuItem 
                    className="hover:bg-vision-purple-100/10 focus:bg-vision-purple-100/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSharingOpen(true);
                    }}
                  >
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="hover:bg-vision-purple-100/10 focus:bg-vision-purple-100/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewProfile();
                    }}
                  >
                    View profile
                  </DropdownMenuItem>
                  {post.author?.username !== currentUser?.username && (
                    <DropdownMenuItem 
                      className="hover:bg-vision-purple-100/10 focus:bg-vision-purple-100/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollow();
                      }}
                    >
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
              <h3 className="font-semibold text-base mb-1 text-white">{post.title}</h3>
            )}
            <p className="text-vision-purple-300 whitespace-pre-line mb-1">
              {truncatedDescription}
              {shouldTruncate && (
                <button 
                  className="text-vision-purple-700 hover:underline text-sm ml-1 font-medium"
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
                  className="text-vision-purple-700 hover:underline text-sm ml-1 font-medium"
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
                    className="bg-vision-purple-100/10 hover:bg-vision-purple-100/20 text-vision-purple-300 text-xs py-0 px-2 border border-vision-purple-200/20"
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
                      className={`h-8 w-8 rounded-full ${post.currentUserVote === 'pump' ? 'text-green-400 bg-green-900/30' : 'text-vision-purple-300'} hover:text-green-400 hover:bg-green-900/20`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote('pump');
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-vision-card/90 text-vision-purple-300 border-vision-purple-200/20">Pump</TooltipContent>
                </Tooltip>
                
                <span className="text-vision-purple-300 mx-0.5">{post.pumpCount || 0}</span>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 rounded-full ${post.currentUserVote === 'dump' ? 'text-red-400 bg-red-900/30' : 'text-vision-purple-300'} hover:text-red-400 hover:bg-red-900/20`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote('dump');
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-vision-card/90 text-vision-purple-300 border-vision-purple-200/20">Dump</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 rounded-full ${showComments ? 'text-vision-purple-700 bg-vision-purple-100/20' : 'text-vision-purple-300'} hover:text-vision-purple-700 hover:bg-vision-purple-100/10`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <span className="text-sm text-vision-purple-300 ml-1">{post.commentsCount || 0}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-full ${post.currentUserLiked ? 'text-pink-400 bg-pink-900/30' : 'text-vision-purple-300'} hover:text-pink-400 hover:bg-pink-900/20`}
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
              className="h-8 w-8 rounded-full text-vision-purple-300 hover:text-white hover:bg-vision-purple-100/10"
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
                <div className="bg-vision-purple-100/10 border border-vision-purple-200/20 backdrop-blur-sm rounded-lg p-3 mt-2">
                  {/* Comment input */}
                  <div className="flex gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-vision-purple-500/30 ring-offset-1 ring-offset-vision-purple-900/50">
                      {currentUser?.profilePictureUrl ? (
                        <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.username} />
                      ) : (
                        <AvatarFallback className="bg-vision-primary-gradient text-white text-xs">
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
                        className="min-h-[80px] bg-vision-purple-100/5 resize-none focus:border-vision-purple-500/30 border-vision-purple-200/20 text-white text-sm w-full pr-10"
                      />
                      <Button
                        size="icon"
                        className={`absolute bottom-2 right-2 h-7 w-7 rounded-full ${newComment.trim() ? 'bg-vision-primary-gradient' : 'bg-vision-purple-100/10'}`}
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
                          <Avatar className="h-6 w-6 ring-1 ring-vision-purple-500/30 ring-offset-1 ring-offset-vision-purple-900/50">
                            {comment.profilePic ? (
                              <AvatarImage src={comment.profilePic} alt={comment.username} />
                            ) : (
                              <AvatarFallback className="bg-vision-primary-gradient text-white text-xs">
                                {comment.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-vision-purple-100/10 border border-vision-purple-200/10 backdrop-blur-sm p-2 rounded-lg">
                              <div className="flex items-center">
                                <span className="font-medium text-xs text-white">{comment.username}</span>
                                <span className="text-[10px] text-vision-purple-300 ml-1">• {timeAgo(new Date(comment.createdAt))}</span>
                              </div>
                              <p className="text-sm text-vision-purple-300 mt-0.5">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-3 ml-2 mt-1">
                              <button className="text-[10px] text-vision-purple-300 hover:text-white">Reply</button>
                              <button className="text-[10px] text-vision-purple-300 hover:text-white">Like</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-2 text-sm text-vision-purple-300">
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
        <DialogContent className="sm:max-w-md bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Share this post</DialogTitle>
            <DialogDescription className="text-vision-purple-300">
              Choose how you want to share this startup idea
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-24 border-vision-purple-200/20 bg-vision-purple-100/5 hover:bg-vision-purple-100/10 text-white"
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
                className="flex flex-col items-center justify-center h-24 border-vision-purple-200/20 bg-vision-purple-100/5 hover:bg-vision-purple-100/10 text-white"
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
              className="bg-vision-purple-100/10 hover:bg-vision-purple-100/20 text-white border-vision-purple-200/20"
              onClick={() => setIsSharingOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Profile Dialog */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="sm:max-w-md bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8 ring-2 ring-vision-purple-500/30 ring-offset-1 ring-offset-vision-purple-900/50">
                  {post.author?.profilePic ? (
                    <AvatarImage src={post.author.profilePic} alt={post.author.username} />
                  ) : (
                    <AvatarFallback className="bg-vision-primary-gradient text-white">
                      {post.author?.username ? post.author.username.substring(0, 2).toUpperCase() : "UN"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span>@{post.author?.username || "Anonymous"}</span>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2">
            <p className="text-vision-purple-300">
              {post.author?.bio || "No bio available."}
            </p>
            
            <div className="flex items-center gap-6 mt-4">
              <div className="flex flex-col">
                <span className="font-medium text-white">{post.author?.followersCount || 0}</span>
                <span className="text-xs text-vision-purple-300">Followers</span>
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-white">{post.author?.followingCount || 0}</span>
                <span className="text-xs text-vision-purple-300">Following</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-2">
            {post.author?.username !== currentUser?.username && (
              <>
                <Button 
                  className="flex-1 bg-vision-primary-gradient hover:bg-vision-primary-gradient/90 text-white"
                  onClick={handleFollow}
                >
                  {post.isFollowingAuthor ? "Unfollow" : "Follow"}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-vision-purple-200/20 bg-vision-purple-100/5 hover:bg-vision-purple-100/10 text-white"
                  onClick={handleSendMessage}
                >
                  Message
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              className="w-10 text-vision-purple-300 hover:text-white hover:bg-vision-purple-100/10"
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