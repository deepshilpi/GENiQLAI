import { useState } from 'react';
import { 
  FileDown, 
  FileText, 
  Table, 
  Share2, 
  Mail, 
  Copy, 
  Download, 
  Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { exportAnalysisToPDF, downloadCSV, captureAndExportElement } from '@/lib/export-utils';
import { AnalysisResults } from '@shared/schema';
import { useAuth } from '@/hooks/use-auth';

interface ExportOptionsProps {
  analysisResults: AnalysisResults;
  startupIdea: string;
  analysisId?: string;
}

export function ExportOptions({ 
  analysisResults, 
  startupIdea,
  analysisId 
}: ExportOptionsProps) {
  const [exportTab, setExportTab] = useState('pdf');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      await exportAnalysisToPDF(analysisResults, startupIdea, user?.username || 'Anonymous');
      toast({
        title: 'Export Complete',
        description: 'Your analysis has been exported as a PDF',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your analysis',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      downloadCSV(analysisResults, startupIdea);
      toast({
        title: 'Export Complete',
        description: 'Your analysis has been exported as a CSV file',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error exporting your analysis',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleScreenshotExport = async () => {
    try {
      setIsExporting(true);
      const result = await captureAndExportElement('analysis-results', 'GENIQL-Analysis-Screenshot');
      if (result) {
        toast({
          title: 'Export Complete',
          description: 'Your analysis has been exported as a PDF screenshot',
        });
      } else {
        throw new Error('Failed to capture screenshot');
      }
    } catch (error) {
      console.error('Error exporting screenshot:', error);
      toast({
        title: 'Export Failed',
        description: 'There was an error capturing your analysis',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    // In a real implementation, this would generate a shareable link based on the analysis ID
    const shareableLink = `https://geniql.com/share/${analysisId || 'demo'}`;
    setShareUrl(shareableLink);
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
    
    toast({
      title: 'Link Copied',
      description: 'Shareable link has been copied to clipboard',
    });
  };
  
  const handleEmailShare = () => {
    // Create email subject and body
    const subject = 'GENIQL Startup Analysis';
    const body = `Check out my startup analysis from GENIQL:\n\n${startupIdea}\n\nView the full analysis here: https://geniql.com/share/${analysisId || 'demo'}`;
    
    // Open email client
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline"
          className="text-white/70 border-vision-purple-200/20 hover:bg-vision-purple-100/10"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-vision-card border-vision-purple-200/20">
        <DialogHeader>
          <DialogTitle className="text-white">Export Analysis</DialogTitle>
          <DialogDescription className="text-white/70">
            Choose how you want to export or share your startup analysis
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="pdf" value={exportTab} onValueChange={setExportTab} className="mt-4">
          <TabsList className="grid grid-cols-3 bg-vision-purple-100/10">
            <TabsTrigger 
              value="pdf" 
              className="text-white data-[state=active]:bg-vision-purple-500 data-[state=active]:text-white"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </TabsTrigger>
            <TabsTrigger 
              value="csv" 
              className="text-white data-[state=active]:bg-vision-purple-500 data-[state=active]:text-white"
            >
              <Table className="w-4 h-4 mr-2" />
              CSV
            </TabsTrigger>
            <TabsTrigger 
              value="share" 
              className="text-white data-[state=active]:bg-vision-purple-500 data-[state=active]:text-white"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pdf" className="space-y-4 mt-4">
            <div className="p-4 bg-vision-purple-100/5 rounded-md">
              <h4 className="text-white font-medium mb-2">PDF Export Options</h4>
              <p className="text-white/70 text-sm mb-4">
                Export your analysis as a professionally formatted PDF document
              </p>
              
              <div className="flex space-x-3">
                <Button 
                  onClick={handleExportPDF}
                  className="bg-vision-primary-gradient hover:brightness-110 text-white flex-1"
                  disabled={isExporting}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isExporting ? 'Exporting...' : 'Export as PDF'}
                </Button>
                
                <Button 
                  onClick={handleScreenshotExport}
                  variant="outline"
                  className="text-white border-vision-purple-200/20 hover:bg-vision-purple-100/10"
                  disabled={isExporting}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Screenshot
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="csv" className="space-y-4 mt-4">
            <div className="p-4 bg-vision-purple-100/5 rounded-md">
              <h4 className="text-white font-medium mb-2">CSV Export</h4>
              <p className="text-white/70 text-sm mb-4">
                Export your analysis data as a CSV file for spreadsheet analysis
              </p>
              
              <Button 
                onClick={handleExportCSV}
                className="bg-vision-primary-gradient hover:brightness-110 text-white w-full"
                disabled={isExporting}
              >
                <Table className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export as CSV'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="share" className="space-y-4 mt-4">
            <div className="p-4 bg-vision-purple-100/5 rounded-md">
              <h4 className="text-white font-medium mb-2">Share Analysis</h4>
              <p className="text-white/70 text-sm mb-4">
                Create a shareable link or send your analysis to others
              </p>
              
              <div className="flex items-center space-x-2 mb-4">
                <Input 
                  value={shareUrl || 'Click "Copy Link" to generate a shareable URL'}
                  readOnly
                  className="bg-vision-card/80 border-vision-purple-200/20 text-white"
                />
                <Button 
                  onClick={handleCopyLink}
                  variant="outline"
                  className="flex-shrink-0 text-white border-vision-purple-200/20 hover:bg-vision-purple-100/10"
                >
                  {copied ? (
                    <Check className="w-4 h-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copied ? 'Copied' : 'Copy Link'}
                </Button>
              </div>
              
              <Button 
                onClick={handleEmailShare}
                variant="outline"
                className="w-full text-white border-vision-purple-200/20 hover:bg-vision-purple-100/10"
              >
                <Mail className="w-4 h-4 mr-2" />
                Share via Email
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              className="text-white/70 hover:text-white hover:bg-vision-purple-100/10"
            >
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}