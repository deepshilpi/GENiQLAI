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
  ExternalLink,
  Check,
  UserPlus
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
      className={`border border-vision-purple-200/20 ${isDetailView ? 'pt-4' : 'py-4'} px-5 bg-[#111144] mb-4 mx-2 hover:bg-[#191970]/60 cursor-pointer transition-all rounded-lg shadow-md`}
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
              <span className="text-xs text-[#a09dd2]">• {formattedDate}</span>
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
              <h3 className="font-semibold text-base mb-1 text-white tracking-wide">{post.title}</h3>
            )}
            <p className="text-[#a09dd2] whitespace-pre-line mb-1">
              {truncatedDescription}
              {shouldTruncate && (
                <button 
                  className="text-[#CB9FFF] hover:text-[#A163F7] hover:underline text-sm ml-1 font-medium"
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
                  className="text-[#CB9FFF] hover:text-[#A163F7] hover:underline text-sm ml-1 font-medium"
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
                    className="bg-[#11083C]/70 hover:bg-[#11083C] text-[#CB9FFF] text-xs py-0.5 px-2.5 border border-[#A163F7]/30 rounded-full backdrop-blur-sm"
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
                      className={`h-9 w-9 rounded-full ${
                        post.currentUserVote === 'pump' 
                          ? 'text-green-400 bg-green-900/30 border border-green-500/30' 
                          : 'text-[#a09dd2] border border-[#a09dd2]/10'
                      } hover:text-green-400 hover:bg-green-900/20 hover:border-green-500/30 transition-all duration-200`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote('pump');
                      }}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[#11083C]/90 backdrop-blur-sm text-[#a09dd2] border-[#A163F7]/20">Pump</TooltipContent>
                </Tooltip>
                
                <span className="text-[#a09dd2] mx-0.5 min-w-[20px] text-center">{post.pumpCount || 0}</span>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-9 w-9 rounded-full ${
                        post.currentUserVote === 'dump' 
                          ? 'text-red-400 bg-red-900/30 border border-red-500/30' 
                          : 'text-[#a09dd2] border border-[#a09dd2]/10'
                      } hover:text-red-400 hover:bg-red-900/20 hover:border-red-500/30 transition-all duration-200`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote('dump');
                      }}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[#11083C]/90 backdrop-blur-sm text-[#a09dd2] border-[#A163F7]/20">Dump</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
            
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 rounded-full ${
                  showComments 
                    ? 'text-[#A163F7] bg-[#A163F7]/10 border border-[#A163F7]/30' 
                    : 'text-[#a09dd2] border border-[#a09dd2]/10'
                } hover:text-[#A163F7] hover:bg-[#A163F7]/10 hover:border-[#A163F7]/30 transition-all duration-200`}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
              <span className="text-sm text-[#a09dd2] ml-1">{post.commentsCount || 0}</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 rounded-full ${
                post.currentUserLiked 
                  ? 'text-pink-400 bg-pink-900/30 border border-pink-500/30' 
                  : 'text-[#a09dd2] border border-[#a09dd2]/10'
              } hover:text-pink-400 hover:bg-pink-900/20 hover:border-pink-500/30 transition-all duration-200`}
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
              className="h-9 w-9 rounded-full text-[#a09dd2] border border-[#a09dd2]/10 hover:text-white hover:bg-[#A163F7]/10 hover:border-[#A163F7]/30 transition-all duration-200"
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
                <div className="bg-[#11083C]/70 border border-[#A163F7]/20 backdrop-blur-md rounded-xl p-4 mt-2">
                  {/* Comment input */}
                  <div className="flex gap-3">
                    <Avatar className="h-9 w-9 ring-2 ring-[#A163F7]/40 ring-offset-1 ring-offset-[#11083C]">
                      {currentUser?.profilePictureUrl ? (
                        <AvatarImage src={currentUser.profilePictureUrl} alt={currentUser.username} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-[#7551FF] to-[#A163F7] text-white text-xs font-medium">
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
                        className="min-h-[80px] bg-[#0B1437]/50 resize-none focus:border-[#A163F7]/50 border-[#A163F7]/20 text-white text-sm w-full pr-10 rounded-xl"
                      />
                      <Button
                        size="icon"
                        className={`absolute bottom-2 right-2 h-8 w-8 rounded-full ${
                          newComment.trim() 
                            ? 'bg-gradient-to-r from-[#7551FF] to-[#A163F7] shadow-[0_0_15px_rgba(122,86,255,0.5)]' 
                            : 'bg-[#A163F7]/20'
                        }`}
                        disabled={!newComment.trim()}
                        onClick={handleComment}
                      >
                        <Send className="h-3.5 w-3.5 text-white" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Comments display */}
                  {post.comments && post.comments.length > 0 ? (
                    <div className="mt-4 space-y-4">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-7 w-7 ring-1 ring-[#A163F7]/30 ring-offset-1 ring-offset-[#11083C]">
                            {comment.profilePic ? (
                              <AvatarImage src={comment.profilePic} alt={comment.username} />
                            ) : (
                              <AvatarFallback className="bg-gradient-to-br from-[#7551FF] to-[#A163F7] text-white text-xs font-medium">
                                {comment.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-[#0B1437]/50 border border-[#A163F7]/10 backdrop-blur-md p-2.5 rounded-xl">
                              <div className="flex items-center">
                                <span className="font-medium text-xs text-white">{comment.username}</span>
                                <span className="text-[10px] text-[#a09dd2] ml-1.5">• {timeAgo(new Date(comment.createdAt))}</span>
                              </div>
                              <p className="text-sm text-[#a09dd2] mt-1">{comment.content}</p>
                            </div>
                            <div className="flex items-center gap-4 ml-2 mt-1.5">
                              <button className="text-[10px] text-[#a09dd2] hover:text-[#CB9FFF] transition-colors duration-200">Reply</button>
                              <button className="text-[10px] text-[#a09dd2] hover:text-[#CB9FFF] transition-colors duration-200">Like</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 mt-2 text-sm text-[#a09dd2] border border-[#A163F7]/10 rounded-xl bg-[#0B1437]/30 backdrop-blur-sm">
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
        <DialogContent className="sm:max-w-md bg-[#11083C]/95 backdrop-blur-xl border border-[#A163F7]/20 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Share this post</DialogTitle>
            <DialogDescription className="text-[#a09dd2] mt-2">
              Choose how you want to share this startup idea
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-28 border-[#A163F7]/20 bg-[#0B1437]/50 hover:bg-[#0B1437]/80 text-white rounded-xl group transition-all duration-200"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/community/post/${post.id}`);
                  toast({
                    title: "Link copied",
                    description: "Post link has been copied to clipboard",
                  });
                  setIsSharingOpen(false);
                }}
              >
                <div className="w-12 h-12 rounded-full bg-[#A163F7]/10 flex items-center justify-center mb-3 group-hover:bg-[#A163F7]/20 transition-all duration-200">
                  <ExternalLink className="h-5 w-5 text-[#CB9FFF]" />
                </div>
                <span className="font-medium">Copy link</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center h-28 border-[#A163F7]/20 bg-[#0B1437]/50 hover:bg-[#0B1437]/80 text-white rounded-xl group transition-all duration-200"
                onClick={() => {
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title || '')}&url=${encodeURIComponent(`${window.location.origin}/community/post/${post.id}`)}`, '_blank');
                  setIsSharingOpen(false);
                }}
              >
                <div className="w-12 h-12 rounded-full bg-[#A163F7]/10 flex items-center justify-center mb-3 group-hover:bg-[#A163F7]/20 transition-all duration-200">
                  <svg className="h-5 w-5 text-[#CB9FFF]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="font-medium">Twitter</span>
              </Button>
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button 
              variant="secondary" 
              className="bg-gradient-to-r from-[#7551FF]/20 to-[#A163F7]/20 hover:bg-gradient-to-r hover:from-[#7551FF]/30 hover:to-[#A163F7]/30 text-white border-[#A163F7]/20 transition-all duration-200"
              onClick={() => setIsSharingOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Profile Dialog */}
      <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
        <DialogContent className="sm:max-w-md bg-[#11083C]/95 backdrop-blur-xl border border-[#A163F7]/20 text-white rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 ring-2 ring-[#A163F7]/40 ring-offset-1 ring-offset-[#11083C]">
                  {post.author?.profilePic ? (
                    <AvatarImage src={post.author.profilePic} alt={post.author.username} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#7551FF] to-[#A163F7] text-white font-medium">
                      {post.author?.username ? post.author.username.substring(0, 2).toUpperCase() : "UN"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#7551FF] to-[#A163F7]">
                    @{post.author?.username || "Anonymous"}
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    {post.isFollowingAuthor && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#A163F7]/20 text-[#CB9FFF] border border-[#A163F7]/30">
                        Following
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DialogTitle>
            <DialogDescription className="text-[#a09dd2] mt-4">
              View user profile and interact
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3">
            <div className="p-3 rounded-xl bg-[#0B1437]/50 border border-[#A163F7]/10 backdrop-blur-md">
              <p className="text-[#a09dd2]">
                {post.author?.bio || "No bio available."}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-5">
              <div className="flex flex-col items-center p-3 rounded-xl bg-[#0B1437]/50 border border-[#A163F7]/10 backdrop-blur-md">
                <span className="font-medium text-xl text-white">{post.author?.followersCount || 0}</span>
                <span className="text-xs text-[#a09dd2] mt-1">Followers</span>
              </div>
              <div className="flex flex-col items-center p-3 rounded-xl bg-[#0B1437]/50 border border-[#A163F7]/10 backdrop-blur-md">
                <span className="font-medium text-xl text-white">{post.author?.followingCount || 0}</span>
                <span className="text-xs text-[#a09dd2] mt-1">Following</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-2">
            {post.author?.username !== currentUser?.username && (
              <>
                <Button 
                  className="flex-1 bg-gradient-to-r from-[#7551FF] to-[#A163F7] hover:brightness-110 text-white shadow-lg shadow-[#7551FF]/20"
                  onClick={handleFollow}
                >
                  {post.isFollowingAuthor ? (
                    <div className="flex items-center gap-1.5">
                      <Check className="h-4 w-4" />
                      <span>Following</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <UserPlus className="h-4 w-4" />
                      <span>Follow</span>
                    </div>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-[#A163F7]/20 bg-[#0B1437]/50 hover:bg-[#0B1437]/80 text-white"
                  onClick={handleSendMessage}
                >
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4" />
                    <span>Message</span>
                  </div>
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              className="w-10 h-10 text-[#a09dd2] hover:text-white hover:bg-[#A163F7]/10 rounded-full"
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