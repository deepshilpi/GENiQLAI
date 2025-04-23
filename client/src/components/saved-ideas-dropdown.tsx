import { useState } from "react";
import { useLocation } from "wouter";
import { SaveIcon, BookmarkIcon, Trash2Icon, Edit2Icon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSavedIdeas, SavedIdea, SavedIdeaUpdate } from "@/hooks/use-saved-ideas";
import { useAuth } from "@/hooks/use-auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface SavedIdeasDropdownProps {
  className?: string;
  trigger?: React.ReactNode;
  asMenuItem?: boolean;
}

export function SavedIdeasDropdown({ className, trigger, asMenuItem = false }: SavedIdeasDropdownProps) {
  const { user } = useAuth();
  const { savedIdeas, isLoading, setSelectedIdea, updateSavedIdea, deleteSavedIdea } = useSavedIdeas();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<SavedIdea | null>(null);
  const [deletingIdea, setDeletingIdea] = useState<SavedIdea | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [, navigate] = useLocation();

  // If user is not logged in, don't show anything
  if (!user) {
    return null;
  }

  const openEditDialog = (idea: SavedIdea) => {
    setEditingIdea(idea);
    setTitle(idea.title);
    setDescription(idea.description);
    setNotes(idea.notes || "");
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (idea: SavedIdea) => {
    setDeletingIdea(idea);
    setDeleteDialogOpen(true);
  };

  const handleUpdate = () => {
    if (!editingIdea || !title.trim()) return;

    const updates: SavedIdeaUpdate = {};
    if (title !== editingIdea.title) updates.title = title;
    if (description !== editingIdea.description) updates.description = description;
    if (notes !== editingIdea.notes) updates.notes = notes;

    // Only update if there are actual changes
    if (Object.keys(updates).length > 0) {
      updateSavedIdea({
        id: editingIdea.id,
        updates
      });
    }

    setEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deletingIdea) return;
    deleteSavedIdea(deletingIdea.id);
    setDeleteDialogOpen(false);
  };

  const handleViewIdea = (idea: SavedIdea) => {
    setSelectedIdea(idea);
    
    // If the idea has analysis results, navigate to the analysis page
    if (idea.resultsSnapshot) {
      navigate(`/analysis?saved=${idea.id}`);
    }
  };

  const DefaultTrigger = (
    <Button 
      variant="ghost" 
      size="sm" 
      className="flex items-center gap-2"
    >
      <BookmarkIcon className="h-4 w-4" />
      <span className="hidden md:inline">Saved Ideas</span>
    </Button>
  );

  const dropdownContent = (
    <DropdownMenuContent className="w-64">
      <DropdownMenuLabel>Saved Ideas</DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      {isLoading ? (
        <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
      ) : savedIdeas.length === 0 ? (
        <DropdownMenuItem disabled>No saved ideas</DropdownMenuItem>
      ) : (
        <ScrollArea className="h-[300px]">
          {savedIdeas.map((idea) => (
            <DropdownMenuGroup key={idea.id}>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <div className="flex items-start">
                    <SaveIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="truncate">{idea.title}</span>
                  </div>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  <DropdownMenuItem onSelect={() => handleViewIdea(idea)}>
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{idea.title}</span>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {idea.description.length > 50 
                          ? `${idea.description.slice(0, 50)}...` 
                          : idea.description}
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => openEditDialog(idea)}>
                    <Edit2Icon className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onSelect={() => openDeleteDialog(idea)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuGroup>
          ))}
        </ScrollArea>
      )}
      
    </DropdownMenuContent>
  );

  // Edit Dialog
  const editDialog = (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Saved Idea</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your idea a memorable name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your startup idea"
              rows={3}
            />
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
            onClick={handleUpdate} 
            disabled={!title.trim()}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Delete Confirmation Dialog
  const deleteDialog = (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Delete Saved Idea</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p>Are you sure you want to delete "{deletingIdea?.title}"?</p>
          <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
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
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Render as dropdown menu item if specified
  if (asMenuItem) {
    return (
      <>
        {dropdownContent}
        {editDialog}
        {deleteDialog}
      </>
    );
  }

  // Default rendering as its own dropdown
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || DefaultTrigger}
        </DropdownMenuTrigger>
        {dropdownContent}
      </DropdownMenu>
      
      {editDialog}
      {deleteDialog}
    </>
  );
}