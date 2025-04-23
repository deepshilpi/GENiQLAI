import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export type SavedIdea = {
  id: number;
  userId: number;
  title: string;
  description: string;
  ideaType: string;
  notes: string;
  resultsSnapshot: any | null;
  createdAt: string;
};

export type SavedIdeaInput = {
  title: string;
  description: string;
  ideaType?: string;
  notes?: string;
  resultsSnapshot?: any;
};

export type SavedIdeaUpdate = Partial<SavedIdeaInput>;

export function useSavedIdeas() {
  const { toast } = useToast();
  const [selectedIdea, setSelectedIdea] = useState<SavedIdea | null>(null);

  const {
    data: savedIdeas = [],
    isLoading,
    error,
    refetch,
  } = useQuery<SavedIdea[]>({
    queryKey: ["/api/saved-ideas"],
    enabled: true,
  });

  const createSavedIdeaMutation = useMutation({
    mutationFn: async (idea: SavedIdeaInput) => {
      const response = await fetch("/api/saved-ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(idea),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save idea");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Idea saved",
        description: "Your idea has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-ideas"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSavedIdeaMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: SavedIdeaUpdate }) => {
      const response = await fetch(`/api/saved-ideas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update idea");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Idea updated",
        description: "Your idea has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-ideas"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSavedIdeaMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/saved-ideas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete idea");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Idea deleted",
        description: "Your idea has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-ideas"] });
      if (selectedIdea) {
        setSelectedIdea(null);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    savedIdeas,
    isLoading,
    error,
    refetch,
    selectedIdea,
    setSelectedIdea,
    createSavedIdea: createSavedIdeaMutation.mutate,
    updateSavedIdea: updateSavedIdeaMutation.mutate,
    deleteSavedIdea: deleteSavedIdeaMutation.mutate,
    isCreating: createSavedIdeaMutation.isPending,
    isUpdating: updateSavedIdeaMutation.isPending,
    isDeleting: deleteSavedIdeaMutation.isPending,
  };
}