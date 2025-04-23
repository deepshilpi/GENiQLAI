import { useState, useContext } from "react";
import { AnalysisResults } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { SaveIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSavedIdeas } from "@/hooks/use-saved-ideas";
import { AuthContext } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface SaveIdeaButtonProps {
  startupIdea: string;
  analysisResults: AnalysisResults;
  className?: string;
}

export function SaveIdeaButton({ startupIdea, analysisResults, className }: SaveIdeaButtonProps) {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const { toast } = useToast();
  const { createSavedIdea, isCreating } = useSavedIdeas();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(startupIdea);
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your saved idea",
        variant: "destructive",
      });
      return;
    }

    createSavedIdea({
      title,
      description,
      notes,
      resultsSnapshot: analysisResults,
    });

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle("");
    setDescription(startupIdea);
    setNotes("");
  };

  // If user is not logged in, don't show the button
  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="default" 
          size="sm" 
          className={`flex items-center gap-2 ${className}`}
        >
          <SaveIcon className="h-4 w-4" />
          Save Idea
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Your Idea</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your idea a memorable name"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your startup idea"
              rows={3}
            />
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
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isCreating || !title.trim()}
          >
            {isCreating ? "Saving..." : "Save Idea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}