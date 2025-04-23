import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-vision-purple-200/10 mt-auto py-3 px-4 text-white/50 text-sm">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0">
          &copy; {currentYear} Geniql.com
        </div>
        <div className="flex space-x-6">
          <Link href="/terms">
            <a className="hover:text-white transition-colors">Terms of Service</a>
          </Link>
          <Link href="/privacy">
            <a className="hover:text-white transition-colors">Privacy Policy</a>
          </Link>
        </div>
      </div>
    </footer>
  );
}