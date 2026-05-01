import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        variant === "secondary" &&
          "border border-border bg-card text-foreground shadow-sm hover:bg-muted",
        variant === "ghost" && "text-foreground hover:bg-muted",
        className
      )}
      {...props}
    />
  );
}
