import * as React from "react";
import { cn } from "@/lib/utils";

// Create a special Input component just for the auth page that guarantees white text
// Important: Don't use internal state as it will conflict with react-hook-form's controlled inputs
const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[#6f42c1]/30 bg-[#25135a]/40 px-3 py-2 text-base text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7551FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      style={{ color: "white !important", caretColor: "white", WebkitTextFillColor: "white" }}
      {...props}
    />
  );
});

AuthInput.displayName = "AuthInput";

export { AuthInput };