import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { LoaderCircle, ListPlus, X, Star } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Interfaces for the brand name generator
interface BrandName {
  name: string;
  description: string;
  appealRating: number;
  memorabilityRating: number;
}

interface BrandNameResponse {
  brandNames: BrandName[];
  message: string;
}

// Categories and audience types
const businessCategories = [
  "Technology", "E-commerce", "Food & Beverage", "Health & Wellness", 
  "Finance", "Education", "Fashion", "Travel", "Entertainment", "Real Estate"
];

const audienceTypes = [
  "Young Adults", "Professionals", "Parents", "Seniors", "Teenagers", 
  "Small Business Owners", "Enterprise Customers", "Luxury Consumers", "Budget Shoppers"
];

const BrandNameGeneratorPage: React.FC = () => {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [category, setCategory] = useState<string>("");
  const [audienceType, setAudienceType] = useState<string>("");
  
  // State for form validation
  const [isValid, setIsValid] = useState({
    keywords: true,
    category: true,
    audienceType: true
  });

  // Mutation for generating brand names
  const brandNameMutation = useMutation({
    mutationFn: async (params: { keywords: string[], category: string, audienceType: string }) => {
      const res = await apiRequest("POST", "/api/brand-names", params);
      return res.json() as Promise<BrandNameResponse>;
    },
    onSuccess: () => {
      toast({
        title: "Brand names generated",
        description: "Your brand name suggestions are ready!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate brand names",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const keywordsValid = keywords.length > 0;
    const categoryValid = !!category;
    const audienceTypeValid = !!audienceType;
    
    setIsValid({
      keywords: keywordsValid,
      category: categoryValid,
      audienceType: audienceTypeValid
    });
    
    if (!keywordsValid || !categoryValid || !audienceTypeValid) {
      toast({
        title: "Please complete all fields",
        description: "Keywords, category, and audience type are required",
        variant: "destructive"
      });
      return;
    }
    
    // Submit form
    brandNameMutation.mutate({ 
      keywords, 
      category, 
      audienceType 
    });
  };

  // Handle keyword addition
  const addKeyword = () => {
    if (keywordInput.trim() === "") return;
    if (!keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
      setIsValid({ ...isValid, keywords: true });
    } else {
      toast({
        title: "Duplicate keyword",
        description: "This keyword is already in your list",
        variant: "destructive"
      });
    }
  };

  // Handle keyword removal
  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
    setIsValid({ ...isValid, keywords: keywords.length > 1 });
  };

  // Handle Enter key in keyword input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Brand Name Generator</h1>
        <p className="text-muted-foreground mb-8">
          Create memorable brand names for your startup using AI
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="col-span-1 md:col-span-1">
            <CardHeader>
              <CardTitle>Generate Brand Names</CardTitle>
              <CardDescription>
                Enter keywords, business category, and target audience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Keywords */}
                  <div className="space-y-2">
                    <Label htmlFor="keywords">
                      Keywords (min. 1)
                      {!isValid.keywords && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <div className="flex space-x-2">
                      <Input
                        id="keywords"
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Enter keyword and press Enter"
                        className={!isValid.keywords ? "border-red-500" : ""}
                      />
                      <Button 
                        type="button" 
                        onClick={addKeyword}
                        variant="secondary"
                      >
                        <ListPlus size={18} />
                      </Button>
                    </div>
                    
                    {/* Keywords list */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keywords.map((keyword) => (
                        <Badge key={keyword} variant="secondary" className="flex items-center">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => removeKeyword(keyword)}
                            className="ml-1 p-1 hover:bg-muted rounded-full"
                          >
                            <X size={12} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Business Category
                      {!isValid.category && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <Select 
                      value={category} 
                      onValueChange={(value) => {
                        setCategory(value);
                        setIsValid({ ...isValid, category: true });
                      }}
                    >
                      <SelectTrigger 
                        id="category"
                        className={!isValid.category ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessCategories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Audience Type */}
                  <div className="space-y-2">
                    <Label htmlFor="audience">
                      Target Audience
                      {!isValid.audienceType && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </Label>
                    <Select 
                      value={audienceType} 
                      onValueChange={(value) => {
                        setAudienceType(value);
                        setIsValid({ ...isValid, audienceType: true });
                      }}
                    >
                      <SelectTrigger
                        id="audience"
                        className={!isValid.audienceType ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select an audience" />
                      </SelectTrigger>
                      <SelectContent>
                        {audienceTypes.map((audience) => (
                          <SelectItem key={audience} value={audience}>
                            {audience}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full mt-6" 
                  disabled={brandNameMutation.isPending}
                  type="submit"
                >
                  {brandNameMutation.isPending ? (
                    <>
                      <LoaderCircle size={18} className="mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Brand Names"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Brand Name Suggestions</CardTitle>
              <CardDescription>
                {brandNameMutation.data ? (
                  "Here are some brand name ideas tailored to your inputs"
                ) : (
                  "Your brand name suggestions will appear here"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {brandNameMutation.isPending ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <LoaderCircle size={48} className="animate-spin mb-4 text-primary" />
                  <p className="text-center text-muted-foreground">
                    Our AI is generating creative brand names for your business...
                  </p>
                </div>
              ) : brandNameMutation.data?.brandNames?.length ? (
                <div className="space-y-6">
                  {/* Message */}
                  <div className="bg-muted/50 p-4 rounded-md">
                    <p className="text-sm">{brandNameMutation.data.message}</p>
                  </div>
                  
                  {/* Brand name cards */}
                  <div className="grid grid-cols-1 gap-4">
                    {brandNameMutation.data.brandNames.map((brand, index) => (
                      <Card key={index} className="overflow-hidden border-primary/20 transition-all hover:border-primary/80">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-bold text-primary">
                              {brand.name}
                            </CardTitle>
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center">
                                <span className="text-xs text-muted-foreground mr-1">Appeal:</span>
                                <div className="flex">
                                  {Array.from({ length: Math.round(brand.appealRating / 2) }).map((_, i) => (
                                    <Star key={i} size={14} className="fill-amber-500 text-amber-500" />
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{brand.description}</p>
                          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                            <div>Appeal: {brand.appealRating}/10</div>
                            <div>Memorability: {brand.memorabilityRating}/10</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <p className="text-muted-foreground">
                    Fill out the form and click "Generate Brand Names" to get AI-powered 
                    brand name suggestions for your business idea.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BrandNameGeneratorPage;