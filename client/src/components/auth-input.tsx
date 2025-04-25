import * as React from "react";
import { cn } from "@/lib/utils";

// Custom AuthInput component that doesn't rely on the shared Input component
const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-md border border-[#6f42c1]/30 bg-[#25135a]/40 px-3 py-2 text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7551FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    style={{
      color: "white",
      caretColor: "white"
    }}
    {...props}
  />
));

AuthInput.displayName = "AuthInput";

export { AuthInput };