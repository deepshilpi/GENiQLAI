import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { X, Sparkles, Hash, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }).max(100, {
    message: "Title must not exceed 100 characters."
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }).max(1000, {
    message: "Description must not exceed 1000 characters."
  }),
  tags: z.array(z.string()).min(1, {
    message: "Add at least one tag."
  }).max(5, {
    message: "Maximum 5 tags allowed."
  }),
});

interface PostFormProps {
  onComplete: () => void;
}

export function PostForm({ onComplete }: PostFormProps) {
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
    },
  });
  
  const createPostMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      await apiRequest("POST", "/api/posts", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post created!",
        description: "Your startup idea has been shared with the community.",
      });
      onComplete();
    },
    onError: (error) => {
      toast({
        title: "Error creating post",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    const currentTags = form.getValues().tags;
    if (currentTags.includes(tagInput.trim())) {
      toast({
        title: "Tag already exists",
        variant: "destructive",
      });
      return;
    }
    
    if (currentTags.length >= 5) {
      toast({
        title: "Maximum 5 tags allowed",
        variant: "destructive",
      });
      return;
    }
    
    form.setValue("tags", [...currentTags, tagInput.trim()]);
    setTagInput("");
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues().tags;
    form.setValue(
      "tags",
      currentTags.filter(tag => tag !== tagToRemove)
    );
  };
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPostMutation.mutate(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-vision-purple-900/20 backdrop-blur-sm rounded-lg p-5 border border-vision-purple-200/20 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-5 w-5 text-vision-purple-400" />
            <p className="text-sm text-vision-purple-200">
              Share your innovative startup idea with the GENIQL community to receive AI-powered analysis and feedback.
            </p>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter a catchy title for your startup idea" 
                  className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90 focus-visible:bg-vision-purple-100/10"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-vision-purple-200/70">
                This will be the main headline for your post.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your startup idea in detail..." 
                  rows={6}
                  className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90 resize-none focus-visible:bg-vision-purple-100/10"
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-vision-purple-200/70">
                Explain your idea, target market, and why it's unique.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white flex items-center gap-2">
                <Hash className="h-4 w-4 text-vision-purple-400" /> Tags
              </FormLabel>
              <div className="flex mb-2">
                <FormControl>
                  <Input 
                    placeholder="Add tags (e.g., AI, SaaS)" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90 focus-visible:bg-vision-purple-100/10"
                  />
                </FormControl>
                <Button 
                  type="button" 
                  className="ml-2 bg-vision-primary-gradient hover:brightness-110" 
                  onClick={handleAddTag}
                >
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((tag, index) => (
                  <Badge key={index} className="bg-vision-purple-900/50 hover:bg-vision-purple-900/70 text-white py-1 px-3">
                    #{tag}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-vision-purple-200/70 hover:text-white transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              
              <FormDescription className="text-vision-purple-200/70">
                Add up to 5 tags to categorize your startup idea.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onComplete}
            className="border-vision-purple-200/30 text-vision-purple-200 hover:bg-vision-purple-900/50"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={createPostMutation.isPending}
            className="bg-vision-primary-gradient hover:brightness-110 gap-2"
          >
            {createPostMutation.isPending ? (
              <>Posting...</>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Post
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
