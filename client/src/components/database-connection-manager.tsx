import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Database, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DatabaseConnection {
  name: string;
  time?: string;
  status: 'connected' | 'error';
}

export function DatabaseConnectionManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isConnectionsLoading, setIsConnectionsLoading] = useState(false);
  const [defaultDbStatus, setDefaultDbStatus] = useState<null | 'connected' | 'error'>(null);
  const [statusTime, setStatusTime] = useState<string | null>(null);
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    connectionString: ''
  });

  // Check default database status
  const checkDefaultStatus = async () => {
    if (!user) return;
    
    try {
      setIsStatusLoading(true);
      
      const response = await fetch('/api/database/status');
      
      if (response.ok) {
        const data = await response.json();
        setDefaultDbStatus('connected');
        setStatusTime(data.time);
      } else {
        setDefaultDbStatus('error');
        setStatusTime(null);
      }
    } catch (error) {
      console.error('Error checking database status:', error);
      setDefaultDbStatus('error');
      setStatusTime(null);
    } finally {
      setIsStatusLoading(false);
    }
  };

  // Fetch active connections
  const fetchConnections = async () => {
    if (!user) return;
    
    try {
      setIsConnectionsLoading(true);
      
      const response = await fetch('/api/database/connections');
      
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections.map((name: string) => ({
          name,
          status: 'connected'
        })));
      } else {
        console.error('Failed to fetch connections:', await response.text());
        setConnections([]);
      }
    } catch (error) {
      console.error('Error fetching database connections:', error);
      setConnections([]);
    } finally {
      setIsConnectionsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    if (user) {
      checkDefaultStatus();
      fetchConnections();
    }
  }, [user]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Connect to a new database
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.connectionString) {
      toast({
        title: "Missing fields",
        description: "Please provide both a name and connection string",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/database/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        toast({
          title: "Connection successful",
          description: `Connected to ${formData.name} database`,
          variant: "default"
        });
        
        // Reset form and refresh connections
        setFormData({ name: '', connectionString: '' });
        setIsOpen(false);
        fetchConnections();
      } else {
        const errorData = await response.json();
        
        toast({
          title: "Connection failed",
          description: errorData.message || "Failed to connect to database",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error connecting to database:', error);
      
      toast({
        title: "Connection error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Close a connection
  const handleCloseConnection = async (name: string) => {
    try {
      const response = await fetch(`/api/database/connections/${name}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: "Connection closed",
          description: `Closed connection to ${name}`,
          variant: "default"
        });
        
        // Refresh connections
        fetchConnections();
      } else {
        const errorData = await response.json();
        
        toast({
          title: "Failed to close connection",
          description: errorData.message || "Error closing database connection",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error closing database connection:', error);
      
      toast({
        title: "Connection error",
        description: "An unexpected error occurred while closing the connection",
        variant: "destructive"
      });
    }
  };

  // Authentication check - only authenticated users can access
  if (!user) {
    return (
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>
            Please sign in to manage database connections
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <span>Database Connection Manager</span>
            </div>
            <Button 
              onClick={() => {
                checkDefaultStatus();
                fetchConnections();
              }} 
              variant="outline" 
              size="sm"
            >
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>
            Manage connections to PostgreSQL databases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default database status */}
          <div>
            <h3 className="text-sm font-medium mb-2">Default Database Status</h3>
            <div className="bg-card rounded-md p-3 border">
              {isStatusLoading ? (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking database connection...
                </div>
              ) : defaultDbStatus === 'connected' ? (
                <div className="flex items-center text-sm text-success">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span>Connected</span>
                  {statusTime && <span className="ml-2 text-xs text-muted-foreground">(last checked: {new Date(statusTime).toLocaleTimeString()})</span>}
                </div>
              ) : defaultDbStatus === 'error' ? (
                <div className="flex items-center text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>Connection error</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Database className="h-4 w-4 mr-2" />
                  <span>Status unknown</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Secondary connections */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Additional Connections</h3>
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">Add Connection</Button>
                </DialogTrigger>
                <DialogContent>
                  <form onSubmit={handleConnect}>
                    <DialogHeader>
                      <DialogTitle>Add Database Connection</DialogTitle>
                      <DialogDescription>
                        Connect to a PostgreSQL database
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Connection Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="analytics"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="connectionString">Connection String</Label>
                        <Input
                          id="connectionString"
                          name="connectionString"
                          placeholder="postgresql://user:password@host/database"
                          value={formData.connectionString}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Connect
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            {isConnectionsLoading ? (
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Loading connections...
              </div>
            ) : connections.length > 0 ? (
              <div className="space-y-2">
                {connections.map((conn) => (
                  <div key={conn.name} className="bg-card rounded-md p-3 border flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-4 w-4 mr-2 text-primary" />
                      <span className="font-medium">{conn.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCloseConnection(conn.name)}
                    >
                      Close
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 rounded-md p-6 flex flex-col items-center justify-center">
                <Database className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No additional database connections</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Alert className="flex-1">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Security Note</AlertTitle>
            <AlertDescription>
              Connection strings contain sensitive information. Only connect to trusted databases.
            </AlertDescription>
          </Alert>
        </CardFooter>
      </Card>
    </div>
  );
}