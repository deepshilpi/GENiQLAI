import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader,
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Edit, 
  Plus, 
  Trash2, 
  MoreVertical, 
  Filter, 
  Calendar, 
  Search,
  BrainCircuit
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { SavedIdea, insertSavedIdeaSchema } from "@shared/schema";
import { format } from "date-fns";

type SortOption = "newest" | "oldest" | "alphabetical";
type FilterOption = "all" | "general" | "product" | "service" | "tech";

export default function SavedIdeasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  
  const [isNewIdeaDialogOpen, setIsNewIdeaDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<SavedIdea | null>(null);
  
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create a schema for the saved idea form
  const savedIdeaFormSchema = insertSavedIdeaSchema.omit({ userId: true }).extend({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    ideaType: z.enum(["general", "product", "service", "tech"]),
    notes: z.string().optional(),
  });
  
  type SavedIdeaFormValues = z.infer<typeof savedIdeaFormSchema>;
  type SavedIdeaInput = z.infer<typeof insertSavedIdeaSchema>;
  type SavedIdeaUpdate = Partial<SavedIdeaInput>;
  
  // Form for creating a new saved idea
  const newIdeaForm = useForm<SavedIdeaFormValues>({
    resolver: zodResolver(savedIdeaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      ideaType: "general",
      notes: "",
    },
  });
  
  // Form for editing an existing saved idea
  const editIdeaForm = useForm<SavedIdeaFormValues>({
    resolver: zodResolver(savedIdeaFormSchema),
    defaultValues: {
      title: "",
      description: "",
      ideaType: "general",
      notes: "",
    },
  });
  
  // Fetch saved ideas
  const { data: savedIdeas = [], isLoading } = useQuery<SavedIdea[]>({
    queryKey: ["/api/saved-ideas"],
    enabled: !!user,
  });
  
  // Filter and sort ideas
  const filteredAndSortedIdeas = useMemo(() => {
    let filtered = savedIdeas;
    
    // Apply filter
    if (filterBy !== "all") {
      filtered = filtered.filter(idea => idea.ideaType === filterBy);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(idea => 
        idea.title.toLowerCase().includes(query) || 
        idea.description.toLowerCase().includes(query) ||
        (idea.notes && idea.notes.toLowerCase().includes(query))
      );
    }
    
    // Apply sort
    return [...filtered].sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });
  }, [savedIdeas, sortBy, filterBy, searchQuery]);
  
  // Create a new saved idea
  const createSavedIdeaMutation = useMutation({
    mutationFn: async (formData: SavedIdeaFormValues) => {
      const newIdea: SavedIdeaInput = {
        ...formData,
        userId: user!.id,
        resultsSnapshot: null,
      };
      
      const response = await apiRequest("POST", "/api/saved-ideas", newIdea);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-ideas"] });
      toast({
        title: "Idea saved",
        description: "Your startup idea has been saved successfully",
      });
      newIdeaForm.reset();
      setIsNewIdeaDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to save idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update an existing saved idea
  const updateSavedIdeaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: SavedIdeaUpdate }) => {
      const response = await apiRequest("PATCH", `/api/saved-ideas/${id}`, updates);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-ideas"] });
      toast({
        title: "Idea updated",
        description: "Your startup idea has been updated successfully",
      });
      editIdeaForm.reset();
      setIsEditDialogOpen(false);
      setCurrentIdea(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Delete a saved idea
  const deleteSavedIdeaMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/saved-ideas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/saved-ideas"] });
      toast({
        title: "Idea deleted",
        description: "Your startup idea has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setCurrentIdea(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onCreateIdeaSubmit = (data: SavedIdeaFormValues) => {
    createSavedIdeaMutation.mutate(data);
  };
  
  const onEditIdeaSubmit = (data: SavedIdeaFormValues) => {
    if (!currentIdea) return;
    
    const updates: SavedIdeaUpdate = {};
    
    if (data.title !== currentIdea.title) {
      updates.title = data.title;
    }
    
    if (data.description !== currentIdea.description) {
      updates.description = data.description;
    }
    
    if (data.ideaType !== currentIdea.ideaType) {
      updates.ideaType = data.ideaType;
    }
    
    if (data.notes !== currentIdea.notes) {
      updates.notes = data.notes;
    }
    
    // Only update if there are changes
    if (Object.keys(updates).length > 0) {
      updateSavedIdeaMutation.mutate({ id: currentIdea.id, updates });
    } else {
      setIsEditDialogOpen(false);
    }
  };
  
  const onDeleteIdeaConfirm = () => {
    if (currentIdea) {
      deleteSavedIdeaMutation.mutate(currentIdea.id);
    }
  };
  
  const openEditDialog = (idea: SavedIdea) => {
    setCurrentIdea(idea);
    editIdeaForm.reset({
      title: idea.title,
      description: idea.description,
      ideaType: idea.ideaType as any,
      notes: idea.notes || "",
    });
    setIsEditDialogOpen(true);
  };
  
  const openDeleteDialog = (idea: SavedIdea) => {
    setCurrentIdea(idea);
    setIsDeleteDialogOpen(true);
  };
  
  const viewIdeaAnalysis = (idea: SavedIdea) => {
    // If the idea has a resultsSnapshot, navigate to analysis page with this idea's data
    if (idea.resultsSnapshot) {
      navigate(`/analysis?fromSavedIdea=${idea.id}`);
    } else {
      // Otherwise, navigate to analysis page with the idea's title and description pre-filled
      navigate(`/?idea=${encodeURIComponent(idea.title)}&description=${encodeURIComponent(idea.description)}`);
    }
  };
  
  const renderIdeaCards = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }
    
    if (filteredAndSortedIdeas.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-white/60">
          <div className="mb-4 p-4 rounded-full bg-vision-purple-200/10">
            <Search className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No saved ideas found</h3>
          {searchQuery || filterBy !== "all" ? (
            <p>Try changing your search or filter criteria</p>
          ) : (
            <p>Create your first idea by clicking the "New Idea" button</p>
          )}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedIdeas.map(idea => (
          <Card key={idea.id} className="border border-vision-purple-200/20 bg-vision-card/60 backdrop-blur-md overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg font-semibold text-white">{idea.title}</CardTitle>
                  <CardDescription className="text-white/60 text-sm flex items-center mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {format(new Date(idea.createdAt), "MMM d, yyyy")}
                  </CardDescription>
                </div>
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4 text-white/70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 text-white/80">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-vision-purple-200/10" />
                      <DropdownMenuItem 
                        className="cursor-pointer hover:bg-vision-purple-100/10"
                        onClick={() => openEditDialog(idea)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer hover:bg-vision-purple-100/10"
                        onClick={() => openDeleteDialog(idea)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-vision-purple-200/20 text-vision-purple-100">
                  {idea.ideaType}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-white/80 text-sm line-clamp-3">{idea.description}</p>
              {idea.notes && (
                <div className="mt-4 bg-vision-purple-300/10 p-2.5 rounded-md">
                  <p className="text-xs text-white/70 line-clamp-2 italic">{idea.notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                variant="default" 
                className="w-full bg-vision-primary-gradient hover:opacity-90"
                onClick={() => viewIdeaAnalysis(idea)}
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                {idea.resultsSnapshot ? "View Analysis" : "Analyze This Idea"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <div className="vision-page-container py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Saved Ideas</h1>
            <p className="text-white/60 mt-1">
              Manage your collection of startup ideas
            </p>
          </div>
          <Button 
            onClick={() => setIsNewIdeaDialogOpen(true)}
            className="mt-4 md:mt-0 bg-vision-primary-gradient hover:opacity-90"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Idea
          </Button>
        </div>
        
        {/* Filters and search */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-white/50" />
            </div>
            <Input
              type="text"
              placeholder="Search ideas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90 pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <div className="w-40">
              <Select 
                value={filterBy} 
                onValueChange={(value: FilterOption) => setFilterBy(value)}
              >
                <SelectTrigger className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 text-white/80">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="tech">Technology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-40">
              <Select 
                value={sortBy} 
                onValueChange={(value: SortOption) => setSortBy(value)}
              >
                <SelectTrigger className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90">
                  <div className="flex items-center">
                    <ChevronDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 text-white/80">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="alphabetical">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="mb-8">
          {renderIdeaCards()}
        </div>
      </div>
      
      {/* New Idea Dialog */}
      <Dialog open={isNewIdeaDialogOpen} onOpenChange={setIsNewIdeaDialogOpen}>
        <DialogContent className="bg-vision-card/95 backdrop-blur-lg border-vision-purple-200/20 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Create New Idea</DialogTitle>
            <DialogDescription className="text-white/60">
              Save your startup idea for future reference or analysis
            </DialogDescription>
          </DialogHeader>
          
          <Form {...newIdeaForm}>
            <form onSubmit={newIdeaForm.handleSubmit(onCreateIdeaSubmit)} className="space-y-4">
              <FormField
                control={newIdeaForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter a catchy title for your idea" 
                        className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newIdeaForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe your startup idea in detail" 
                        className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90 min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newIdeaForm.control}
                name="ideaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 text-white/80">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={newIdeaForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Add any additional notes or thoughts" 
                        className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewIdeaDialogOpen(false)}
                  className="border-vision-purple-200/20 text-white/80 hover:bg-vision-purple-100/10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-vision-primary-gradient hover:opacity-90"
                  disabled={createSavedIdeaMutation.isPending}
                >
                  {createSavedIdeaMutation.isPending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/90 border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    "Save Idea"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Idea Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-vision-card/95 backdrop-blur-lg border-vision-purple-200/20 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Idea</DialogTitle>
            <DialogDescription className="text-white/60">
              Update the details of your saved idea
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editIdeaForm}>
            <form onSubmit={editIdeaForm.handleSubmit(onEditIdeaSubmit)} className="space-y-4">
              <FormField
                control={editIdeaForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter a catchy title for your idea" 
                        className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editIdeaForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe your startup idea in detail" 
                        className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90 min-h-[100px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editIdeaForm.control}
                name="ideaType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 text-white/80">
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="product">Product</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editIdeaForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Add any additional notes or thoughts" 
                        className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-vision-purple-200/20 text-white/80 hover:bg-vision-purple-100/10"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-vision-primary-gradient hover:opacity-90"
                  disabled={updateSavedIdeaMutation.isPending}
                >
                  {updateSavedIdeaMutation.isPending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/90 border-t-transparent rounded-full" />
                      Updating...
                    </>
                  ) : (
                    "Update Idea"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-vision-card/95 backdrop-blur-lg border-vision-purple-200/20 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Delete Idea</DialogTitle>
            <DialogDescription className="text-white/60">
              Are you sure you want to delete this idea? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {currentIdea && (
            <div className="p-4 bg-vision-purple-500/10 rounded-md my-4">
              <h4 className="font-semibold text-white/90">{currentIdea.title}</h4>
              <p className="text-sm text-white/70 mt-1 line-clamp-2">{currentIdea.description}</p>
            </div>
          )}
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-vision-purple-200/20 text-white/80 hover:bg-vision-purple-100/10"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={onDeleteIdeaConfirm}
              disabled={deleteSavedIdeaMutation.isPending}
              className="bg-red-600/80 hover:bg-red-600"
            >
              {deleteSavedIdeaMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white/90 border-t-transparent rounded-full" />
                  Deleting...
                </>
              ) : (
                "Delete Idea"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}