import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-vision-purple-200/10 bg-[#11083C]/80 backdrop-blur-md py-4 px-6 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
          <p className="text-sm text-white/60">© {currentYear} Geniql.com</p>
          <p className="text-xs text-white/40 mt-1">Generative Execution Network for Intelligent Query Learning</p>
        </div>
        
        <div className="flex gap-6">
          <Link href="/terms" className="text-xs text-white/60 hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-xs text-white/60 hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}