import { ReactNode } from "react";
// This component has been modified to always show content without any premium restrictions

// Creating a content wrapper rather than an overlay that blocks access
export function ContentWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="h-full w-full">
      {children}
    </div>
  );
}

// Keep this export for backward compatibility, but now it just passes through content
export function PremiumFeatureOverlay({
  title,
  description,
  icon,
  requiredPlan,
  children,
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  requiredPlan?: string;
  children: ReactNode;
}) {
  return (
    <ContentWrapper>
      {children}
    </ContentWrapper>
  );
}