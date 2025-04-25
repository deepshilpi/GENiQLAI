import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-vision-dark/70 backdrop-blur-md border-t border-vision-purple-200/10 py-3 px-4 flex flex-col sm:flex-row items-center justify-between text-white/60 text-xs fixed bottom-0 z-50 mt-auto">
      <div className="mb-2 sm:mb-0">
        © 2025 Geniql.com • All rights reserved
      </div>
      
      <div className="flex items-center space-x-4">
        <a href="/terms" className="hover:text-white transition-colors">Terms</a>
        <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
        <span className="flex items-center">
          Made with <Heart className="h-3 w-3 mx-1 text-red-400" /> for founders
        </span>
      </div>
    </footer>
  );
}