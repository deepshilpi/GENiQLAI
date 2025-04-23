import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { X, Upload, ImageIcon, Loader2 } from "lucide-react";
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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif"
];

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
  imageUrl: z.string().optional(),
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      tags: [],
    },
  });
  
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) {
        try {
          const error = await response.json();
          throw new Error(error.message || 'Failed to upload image');
        } catch (e) {
          throw new Error('Failed to upload image');
        }
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      form.setValue('imageUrl', data.imageUrl);
      setImagePreview(data.imageUrl);
      setIsUploading(false);
      toast({
        title: "Image uploaded",
        description: "Your image has been successfully uploaded.",
      });
    },
    onError: (error) => {
      setIsUploading(false);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
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
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    // Check file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, WebP, and GIF images are supported",
        variant: "destructive",
      });
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload the image
    setIsUploading(true);
    uploadImageMutation.mutate(file);
  };
  
  const removeImage = () => {
    setImagePreview(null);
    form.setValue('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image (optional)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden">
                      <img 
                        src={imagePreview} 
                        alt="Upload preview" 
                        className="max-h-[300px] w-full object-cover"
                      />
                      <Button 
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 rounded-full p-0 w-8 h-8"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
                      <input
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        onChange={handleImageUpload}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="mt-2 text-sm text-muted-foreground">Uploading image...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                          <div className="mt-4">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Select Image
                            </Button>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            PNG, JPG, WebP or GIF (max. 5MB)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Add an image to make your post more engaging. This is optional.
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
