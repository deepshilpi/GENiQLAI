import { useState, useEffect } from 'react';
import { Search, X, Tag, User, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'wouter';

type SearchResult = {
  type: 'post' | 'user' | 'tag';
  id: number | string;
  text: string;
  subtext?: string;
  url: string;
};

interface SearchBarProps {
  onSearch: (query: string, type: 'all' | 'posts' | 'users' | 'tags') => void;
  results: SearchResult[];
  isSearching: boolean;
  className?: string;
}

export function SearchBar({ onSearch, results, isSearching, className = '' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'posts' | 'users' | 'tags'>('all');
  const [showResults, setShowResults] = useState(false);
  
  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), searchType);
      setShowResults(true);
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setQuery('');
    setShowResults(false);
  };
  
  // Get icon based on result type
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post':
        return <FileText className="w-4 h-4 mr-2 text-blue-400" />;
      case 'user':
        return <User className="w-4 h-4 mr-2 text-green-400" />;
      case 'tag':
        return <Tag className="w-4 h-4 mr-2 text-amber-400" />;
      default:
        return <FileText className="w-4 h-4 mr-2" />;
    }
  };

  return (
    <div className={`search-container relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={`Search ${searchType === 'all' ? 'everything' : searchType}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowResults(true)}
            className="pl-10 pr-10 bg-background border-input"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-2">
              {searchType.charAt(0).toUpperCase() + searchType.slice(1)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSearchType('all')}>
              All
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType('posts')}>
              Posts
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType('users')}>
              Users
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSearchType('tags')}>
              Tags
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button type="submit" className="ml-2">
          Search
        </Button>
      </form>
      
      {/* Search Results */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-md border bg-background shadow-md z-10">
          <div className="p-4">
            {isSearching ? (
              <div className="text-center py-3">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <Tabs defaultValue="all">
                  <TabsList className="w-full">
                    <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                    <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
                    <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
                    <TabsTrigger value="tags" className="flex-1">Tags</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="max-h-80 overflow-y-auto">
                    {results.map((result, index) => (
                      <Link 
                        key={`${result.type}-${result.id}-${index}`} 
                        href={result.url}
                        onClick={() => setShowResults(false)}
                      >
                        <a className="flex items-start p-3 hover:bg-accent rounded-md transition-colors">
                          {getResultIcon(result.type)}
                          <div>
                            <div className="font-medium">{result.text}</div>
                            {result.subtext && (
                              <div className="text-sm text-muted-foreground">{result.subtext}</div>
                            )}
                          </div>
                        </a>
                      </Link>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="posts" className="max-h-80 overflow-y-auto">
                    {results.filter(r => r.type === 'post').length > 0 ? (
                      results
                        .filter(r => r.type === 'post')
                        .map((result, index) => (
                          <Link 
                            key={`post-${result.id}-${index}`} 
                            href={result.url}
                            onClick={() => setShowResults(false)}
                          >
                            <a className="flex items-start p-3 hover:bg-accent rounded-md transition-colors">
                              {getResultIcon(result.type)}
                              <div>
                                <div className="font-medium">{result.text}</div>
                                {result.subtext && (
                                  <div className="text-sm text-muted-foreground">{result.subtext}</div>
                                )}
                              </div>
                            </a>
                          </Link>
                        ))
                    ) : (
                      <p className="text-center py-3 text-muted-foreground">No posts found</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="users" className="max-h-80 overflow-y-auto">
                    {results.filter(r => r.type === 'user').length > 0 ? (
                      results
                        .filter(r => r.type === 'user')
                        .map((result, index) => (
                          <Link 
                            key={`user-${result.id}-${index}`} 
                            href={result.url}
                            onClick={() => setShowResults(false)}
                          >
                            <a className="flex items-start p-3 hover:bg-accent rounded-md transition-colors">
                              {getResultIcon(result.type)}
                              <div>
                                <div className="font-medium">{result.text}</div>
                                {result.subtext && (
                                  <div className="text-sm text-muted-foreground">{result.subtext}</div>
                                )}
                              </div>
                            </a>
                          </Link>
                        ))
                    ) : (
                      <p className="text-center py-3 text-muted-foreground">No users found</p>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="tags" className="max-h-80 overflow-y-auto">
                    {results.filter(r => r.type === 'tag').length > 0 ? (
                      results
                        .filter(r => r.type === 'tag')
                        .map((result, index) => (
                          <Link 
                            key={`tag-${result.id}-${index}`} 
                            href={result.url}
                            onClick={() => setShowResults(false)}
                          >
                            <a className="flex items-start p-3 hover:bg-accent rounded-md transition-colors">
                              {getResultIcon(result.type)}
                              <div>
                                <div className="font-medium">#{result.text}</div>
                                {result.subtext && (
                                  <div className="text-sm text-muted-foreground">{result.subtext}</div>
                                )}
                              </div>
                            </a>
                          </Link>
                        ))
                    ) : (
                      <p className="text-center py-3 text-muted-foreground">No tags found</p>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              query.trim() ? (
                <p className="text-center py-3 text-muted-foreground">No results found</p>
              ) : (
                <p className="text-center py-3 text-muted-foreground">Enter a search term</p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}