import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Bookmark, 
  PlusCircle, 
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  Info,
  Trash2Icon,
  Edit2Icon,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useAuthDialog } from "@/hooks/use-auth-dialog";
import { 
  useSavedIdeas,
  SavedIdea, 
  SavedIdeaInput, 
  SavedIdeaUpdate 
} from "@/hooks/use-saved-ideas";

type SortOption = "newest" | "oldest" | "alphabetical";

export default function SavedIdeasPage() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { openAuthDialog } = useAuthDialog();
  const { toast } = useToast();
  
  const {
    savedIdeas,
    isLoading,
    createSavedIdea,
    updateSavedIdea,
    deleteSavedIdea,
    setSelectedIdea,
    isCreating,
    isUpdating,
    isDeleting
  } = useSavedIdeas();
  
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [newIdeaDialogOpen, setNewIdeaDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ideaType, setIdeaType] = useState("general");
  const [notes, setNotes] = useState("");
  
  // Current idea being edited or deleted
  const [currentIdea, setCurrentIdea] = useState<SavedIdea | null>(null);
  
  // Filter and sort ideas
  const filteredIdeas = savedIdeas
    .filter(idea => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        idea.title.toLowerCase().includes(query) ||
        idea.description.toLowerCase().includes(query) ||
        (idea.notes && idea.notes.toLowerCase().includes(query))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  
  // Handle form submission for creating new idea
  const handleCreateIdea = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for your idea",
        variant: "destructive",
      });
      return;
    }
    
    const newIdea: SavedIdeaInput = {
      title: title.trim(),
      description: description.trim(),
      ideaType: ideaType,
      notes: notes.trim()
    };
    
    createSavedIdea(newIdea);
    setNewIdeaDialogOpen(false);
    resetForm();
  };
  
  // Handle form submission for editing idea
  const handleUpdateIdea = () => {
    if (!currentIdea || !title.trim()) return;
    
    const updates: SavedIdeaUpdate = {};
    if (title !== currentIdea.title) updates.title = title;
    if (description !== currentIdea.description) updates.description = description;
    if (ideaType !== currentIdea.ideaType) updates.ideaType = ideaType;
    if (notes !== currentIdea.notes) updates.notes = notes;
    
    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      updateSavedIdea({
        id: currentIdea.id,
        updates
      });
    }
    
    setEditDialogOpen(false);
  };
  
  // Handle idea deletion
  const handleDeleteIdea = () => {
    if (!currentIdea) return;
    deleteSavedIdea(currentIdea.id);
    setDeleteDialogOpen(false);
  };
  
  // Open edit dialog and populate form
  const openEditDialog = (idea: SavedIdea) => {
    setCurrentIdea(idea);
    setTitle(idea.title);
    setDescription(idea.description);
    setIdeaType(idea.ideaType || "general");
    setNotes(idea.notes || "");
    setEditDialogOpen(true);
  };
  
  // Open delete confirmation dialog
  const openDeleteDialog = (idea: SavedIdea) => {
    setCurrentIdea(idea);
    setDeleteDialogOpen(true);
  };
  
  // Reset form state
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIdeaType("general");
    setNotes("");
  };
  
  // Navigate to analysis with selected idea
  const viewIdeaAnalysis = (idea: SavedIdea) => {
    setSelectedIdea(idea);
    navigate(`/analysis?saved=${idea.id}`);
  };
  
  // If user is not logged in, show auth dialog
  if (!user) {
    setTimeout(() => {
      openAuthDialog({ defaultTab: "login", returnTo: "/saved-ideas" });
    }, 100);
    
    return (
      <div className="container max-w-7xl mx-auto py-8 px-4 min-h-screen flex flex-col items-center justify-center">
        <div className="text-center">
          <Bookmark className="w-16 h-16 mx-auto mb-6 text-primary opacity-50" />
          <h1 className="text-3xl font-bold mb-2">Saved Ideas</h1>
          <p className="text-muted-foreground mb-6">Please log in to view your saved ideas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-primary" />
            Saved Ideas
          </h1>
          <p className="text-muted-foreground mt-1">Manage your collection of startup ideas</p>
        </div>
        
        <Button 
          onClick={() => {
            resetForm();
            setNewIdeaDialogOpen(true);
          }}
          className="shrink-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Save New Idea
        </Button>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex shrink-0 gap-3">
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(value as SortOption)}
            >
              <SelectTrigger className="w-40">
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  <span>Sort by</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="alphabetical">Alphabetical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Ideas Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="bg-card overflow-hidden border-border">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-between w-full">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : savedIdeas.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No saved ideas yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start saving your startup ideas to manage them in one place and easily analyze them with our AI tools.
          </p>
          <Button 
            onClick={() => {
              resetForm();
              setNewIdeaDialogOpen(true);
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Save Your First Idea
          </Button>
        </div>
      ) : filteredIdeas.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium mb-2">No matching ideas</h3>
          <p className="text-muted-foreground mb-6">
            No saved ideas match your search. Try different keywords or clear the search.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setSearchQuery("")}
          >
            Clear Search
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map((idea) => (
            <Card 
              key={idea.id} 
              className="bg-card border-border hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{idea.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                      <span>
                        {new Date(idea.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Filter className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(idea)}>
                        <Edit2Icon className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(idea)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2Icon className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <Badge variant="outline" className="mt-2 w-fit bg-primary/10 border-primary/20">
                  {idea.ideaType || "General"}
                </Badge>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {idea.description}
                </p>
                
                {idea.notes && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-start gap-2 text-xs">
                      <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-muted-foreground line-clamp-2">
                        {idea.notes}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-between gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEditDialog(idea)}
                >
                  <Edit2Icon className="h-3.5 w-3.5 mr-2" /> Edit
                </Button>
                
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => viewIdeaAnalysis(idea)}
                  disabled={!idea.resultsSnapshot}
                >
                  {idea.resultsSnapshot ? "View Analysis" : "Analyze Now"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* New Idea Dialog */}
      <Dialog open={newIdeaDialogOpen} onOpenChange={setNewIdeaDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Save New Idea</DialogTitle>
            <DialogDescription>
              Add a new startup idea to your collection.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your idea a memorable name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your startup idea"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="type">Idea Type</Label>
              <Select value={ideaType} onValueChange={setIdeaType}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select idea type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="mobile-app">Mobile App</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="social">Social Platform</SelectItem>
                  <SelectItem value="ai">AI/ML</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or thoughts"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNewIdeaDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateIdea} 
              disabled={!title.trim() || isCreating}
            >
              {isCreating ? "Saving..." : "Save Idea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Idea Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Saved Idea</DialogTitle>
            <DialogDescription>
              Update details for your saved idea.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your idea a memorable name"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your startup idea"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-type">Idea Type</Label>
              <Select value={ideaType} onValueChange={setIdeaType}>
                <SelectTrigger id="edit-type">
                  <SelectValue placeholder="Select idea type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="saas">SaaS</SelectItem>
                  <SelectItem value="mobile-app">Mobile App</SelectItem>
                  <SelectItem value="marketplace">Marketplace</SelectItem>
                  <SelectItem value="hardware">Hardware</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                  <SelectItem value="social">Social Platform</SelectItem>
                  <SelectItem value="ai">AI/ML</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-notes">Notes (Optional)</Label>
              <Textarea
                id="edit-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or thoughts"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateIdea} 
              disabled={!title.trim() || isUpdating}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Saved Idea</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this idea? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {currentIdea && (
              <div className="bg-card/50 border border-border rounded-lg p-4">
                <h3 className="font-medium mb-1">{currentIdea.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {currentIdea.description}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteIdea}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Idea"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}