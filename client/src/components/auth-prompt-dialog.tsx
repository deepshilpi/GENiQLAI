import { MouseEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

interface AuthPromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: string;
}

export function AuthPromptDialog({
  isOpen,
  onClose,
  onConfirm,
  action
}: AuthPromptDialogProps) {
  const handleConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center">
            <LogIn className="h-5 w-5 mr-2 text-blue-400" />
            Login Required
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Please login to {action.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <p className="text-white/80 text-sm">
            Your analysis data will be preserved while you log in. You'll be able to continue where you left off.
          </p>
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-vision-primary-gradient/20 border border-vision-purple-200/30">
              <LogIn className="h-10 w-10 text-blue-400" />
            </div>
          </div>
          <div className="text-center text-white/70 text-sm">
            You'll be redirected to our secure login page.
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            className="border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20 hover:text-white"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button 
            className="bg-vision-primary-gradient hover:bg-vision-primary-gradient/90"
            onClick={handleConfirm}
          >
            Continue to Login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}