import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { X, Upload, Image, Trash2 } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";

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
  imageUrl: z.string().optional(),
});

interface PostFormProps {
  onComplete: () => void;
}

export function PostForm({ onComplete }: PostFormProps) {
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
      imageUrl: "",
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
        description: "Your post has been shared with the community.",
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
  
  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    // Check file size and type
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "Image too large",
        description: "Please choose an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please choose an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a base64 version of the image for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImagePreview(base64);
        // In a real app, you would upload to server/storage service here
        // and get back a URL to set in the form
        
        // For demo purposes, we'll just use the base64 as the URL
        form.setValue("imageUrl", base64);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const removeImage = () => {
    setImagePreview(null);
    form.setValue("imageUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createPostMutation.mutate(values);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter a catchy title for your startup idea" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your startup idea in detail..." 
                  rows={5}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
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
              <FormLabel>Tags</FormLabel>
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
                  />
                </FormControl>
                <Button 
                  type="button" 
                  className="ml-2" 
                  onClick={handleAddTag}
                >
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2">
                {field.value.map((tag, index) => (
                  <div key={index} className="bg-accent rounded-full px-3 py-1 text-sm flex items-center">
                    {tag}
                    <button 
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              
              <FormDescription>
                Add up to 5 tags to categorize your startup idea.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Image Upload */}
        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (Optional)</FormLabel>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file);
                  }
                }}
              />

              {!imagePreview ? (
                <Card 
                  className="border-dashed border-2 cursor-pointer hover:border-primary transition-colors"
                  onClick={triggerFileInput}
                >
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground text-center">
                      Click to upload an image<br />
                      <span className="text-xs">PNG, JPG, GIF up to 5MB</span>
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="relative overflow-hidden">
                  <CardContent className="p-0">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-full h-auto object-cover max-h-64"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 rounded-full h-8 w-8"
                      onClick={removeImage}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )}
              <FormDescription>
                Add an image to make your post more engaging.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onComplete}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={createPostMutation.isPending}
          >
            {createPostMutation.isPending ? "Posting..." : "Post"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
