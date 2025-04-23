import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full border-t border-vision-purple-200/30 mt-auto py-4 px-4 text-white/70 text-sm bg-gradient-to-r from-vision-purple-900/50 to-vision-purple-800/50 backdrop-blur-sm shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <div className="mb-2 md:mb-0 font-semibold">
          &copy; {currentYear} Geniql.com
        </div>
        <div className="flex space-x-6">
          <Link href="/terms">
            <a className="hover:text-white hover:underline transition-colors">Terms of Service</a>
          </Link>
          <Link href="/privacy">
            <a className="hover:text-white hover:underline transition-colors">Privacy Policy</a>
          </Link>
        </div>
      </div>
    </footer>
  );
}