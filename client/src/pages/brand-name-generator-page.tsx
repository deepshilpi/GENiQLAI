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
import { LoaderCircle, ListPlus, X, Star, ChevronDown, Plus, Sparkles } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";

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

// Default number of brand names to display initially
const INITIAL_DISPLAY_COUNT = 3;

const BrandNameGeneratorPage: React.FC = () => {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [category, setCategory] = useState<string>("");
  const [audienceType, setAudienceType] = useState<string>("");
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);
  
  // State for form validation
  const [isValid, setIsValid] = useState({
    keywords: true,
    category: true,
    audienceType: true
  });

  // Mutation for generating brand names
  const brandNameMutation = useMutation({
    mutationFn: async (params: { keywords: string[], category: string, audienceType: string, count?: number }) => {
      const res = await apiRequest("POST", "/api/brand-names", {
        ...params,
        count: 10 // Request more names for the "Show More" functionality
      });
      return res.json() as Promise<BrandNameResponse>;
    },
    onSuccess: () => {
      // Reset display count when new names are generated
      setDisplayCount(INITIAL_DISPLAY_COUNT);
      
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

  // Handle "Show More" button click
  const handleShowMore = () => {
    const totalNames = brandNameMutation.data?.brandNames?.length || 0;
    setDisplayCount(Math.min(displayCount + 3, totalNames));
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

  // Get visible brand names based on current display count
  const visibleBrandNames = brandNameMutation.data?.brandNames?.slice(0, displayCount) || [];
  const hasMoreToShow = (brandNameMutation.data?.brandNames?.length || 0) > displayCount;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent inline-flex items-center">
            <Sparkles className="w-8 h-8 mr-2 text-purple-500" />
            Brand Name Generator
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Create memorable, distinctive brand names for your startup using AI. Enter your 
            keywords, business category, and target audience to generate tailored suggestions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form */}
          <Card className="col-span-1 md:col-span-1 shadow-md hover:shadow-lg transition-shadow border-primary/10">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/5 border-b border-primary/10">
              <CardTitle className="flex items-center">
                <span className="bg-primary/10 p-2 rounded-lg mr-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </span>
                Generate Names
              </CardTitle>
              <CardDescription>
                Enter details to create your perfect brand name
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  {/* Keywords */}
                  <div className="space-y-2">
                    <Label htmlFor="keywords" className="text-sm font-medium flex items-center">
                      Keywords
                      <span className="text-xs ml-2 text-muted-foreground">(min. 1)</span>
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
                        className={`${!isValid.keywords ? "border-red-500" : ""} focus-visible:ring-purple-500`}
                      />
                      <Button 
                        type="button" 
                        onClick={addKeyword}
                        variant="secondary"
                        className="shrink-0"
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                    
                    {/* Keywords list */}
                    <div className="flex flex-wrap gap-2 mt-2 min-h-[40px]">
                      <AnimatePresence>
                        {keywords.map((keyword) => (
                          <motion.div
                            key={keyword}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                          >
                            <Badge variant="secondary" className="flex items-center bg-primary/10 hover:bg-primary/20 transition-colors">
                              {keyword}
                              <button
                                type="button"
                                onClick={() => removeKeyword(keyword)}
                                className="ml-1 p-1 hover:bg-primary/20 rounded-full"
                              >
                                <X size={12} />
                              </button>
                            </Badge>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
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
                        className={`${!isValid.category ? "border-red-500" : ""} focus-visible:ring-purple-500`}
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
                    <Label htmlFor="audience" className="text-sm font-medium">
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
                        className={`${!isValid.audienceType ? "border-red-500" : ""} focus-visible:ring-purple-500`}
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
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300" 
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
          <Card className="col-span-1 md:col-span-2 shadow-md border-primary/10">
            <CardHeader className="border-b border-primary/10">
              <CardTitle className="flex items-center">
                <span className="bg-primary/10 p-2 rounded-lg mr-2">
                  <Star className="h-5 w-5 text-amber-500" />
                </span>
                Brand Name Suggestions
              </CardTitle>
              <CardDescription>
                {brandNameMutation.data ? (
                  "AI-generated brand names tailored to your business"
                ) : (
                  "Your brand name suggestions will appear here"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {brandNameMutation.isPending ? (
                <div className="flex flex-col items-center justify-center p-12">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                    <div className="absolute inset-3 rounded-full border-2 border-transparent border-t-2 border-purple-300 animate-spin animation-delay-150"></div>
                  </div>
                  <p className="text-center text-muted-foreground max-w-sm">
                    Our AI is crafting creative, memorable brand names for your business. 
                    This typically takes 5-10 seconds...
                  </p>
                </div>
              ) : brandNameMutation.data?.brandNames?.length ? (
                <div className="space-y-6">
                  {/* Message */}
                  <div className="bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-4 rounded-lg border border-purple-200/20">
                    <p className="text-sm">{brandNameMutation.data.message}</p>
                  </div>
                  
                  {/* Brand name cards */}
                  <div className="grid grid-cols-1 gap-5">
                    <AnimatePresence>
                      {visibleBrandNames.map((brand, index) => (
                        <motion.div
                          key={brand.name}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Card className="overflow-hidden border-primary/20 transition-all hover:border-primary/80 hover:shadow-md hover:shadow-primary/5">
                            <CardHeader className="pb-2 bg-gradient-to-r from-purple-500/5 to-blue-500/5">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
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
                            <CardContent className="pt-4">
                              <p className="text-sm leading-relaxed">{brand.description}</p>
                              <div className="flex justify-between mt-4 pt-3 border-t border-primary/10 text-xs text-muted-foreground">
                                <div className="flex items-center">
                                  <span className="h-2 w-2 rounded-full inline-block mr-1 bg-amber-500"></span>
                                  Appeal: {brand.appealRating}/10
                                </div>
                                <div className="flex items-center">
                                  <span className="h-2 w-2 rounded-full inline-block mr-1 bg-purple-500"></span>
                                  Memorability: {brand.memorabilityRating}/10
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* Show More button */}
                  {hasMoreToShow && (
                    <div className="flex justify-center pt-4">
                      <Button 
                        variant="outline" 
                        onClick={handleShowMore}
                        className="group border-purple-500/30 hover:border-purple-500/80 hover:bg-purple-500/5"
                      >
                        <ChevronDown className="mr-2 h-4 w-4 group-hover:animate-bounce" />
                        Show More Names
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="bg-primary/10 p-4 rounded-full mb-4">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Ready to Name Your Brand?</h3>
                  <p className="text-muted-foreground max-w-md">
                    Fill out the form and click "Generate Brand Names" to get AI-powered 
                    brand name suggestions tailored to your business idea.
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