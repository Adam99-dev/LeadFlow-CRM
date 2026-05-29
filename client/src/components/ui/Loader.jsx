import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export function Spinner({ className, size = "md" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <Loader2
      className={cn("animate-spin text-blue-500", sizes[size], className)}
      aria-hidden
    />
  );
}

export function PageLoader({ label = "Loading..." }) {
  return (
    <div
      className="flex min-h-[280px] flex-col items-center justify-center gap-3 py-16"
      role="status"
      aria-live="polite"
    >
      <Spinner size="lg" />
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

export function FullPageLoader({ label = "Loading..." }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040a18]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-gray-400">{label}</p>
      </div>
    </div>
  );
}

export function InlineLoader({ label, className }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-8", className)}>
      <Spinner size="sm" />
      {label && <span className="text-sm text-gray-400">{label}</span>}
    </div>
  );
}
