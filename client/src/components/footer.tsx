import { Link } from "wouter";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="p-6 border-t border-border">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
              <i className="fas fa-brain text-white"></i>
            </div>
            <span className="font-bold text-xl text-white">GENIQL</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Generative Execution Network for Intelligent Query Learning
          </div>
        </div>
        
        <div className="flex space-x-6">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
            <Twitter className="w-5 h-5" />
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
            <Github className="w-5 h-5" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
        
        <div className="text-xs text-muted-foreground mt-4 md:mt-0">
          © {new Date().getFullYear()} GENIQL. All rights reserved.
        </div>
      </div>
      <div className="mt-4 text-center text-xs text-muted-foreground">
        <div className="flex justify-center space-x-4">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}
