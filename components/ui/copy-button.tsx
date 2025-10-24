import * as React from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { VariantProps } from "class-variance-authority";

type ButtonBaseProps = React.ComponentProps<"button"> &
  VariantProps<typeof import("@/components/ui/button").buttonVariants> & {
    asChild?: boolean;
  };

interface CopyButtonProps extends ButtonBaseProps {
  value: string;
  onCopied?: () => void;
}

const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ className, value, onCopied, ...props }, ref) => {
    const [hasCopied, setHasCopied] = React.useState(false);

    React.useEffect(() => {
      if (!hasCopied) return;

      const timer = setTimeout(() => {
        setHasCopied(false);
      }, 2000);

      return () => clearTimeout(timer);
    }, [hasCopied]);

    return (
      <Button
        size="sm"
        variant="outline"
        className={cn("w-10 px-0", className)}
        onClick={() => {
          navigator.clipboard.writeText(value);
          setHasCopied(true);
          onCopied?.();
        }}
        {...props}
        ref={ref}
      >
        <span className="sr-only">Copy</span>
        {hasCopied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    );
  }
);
CopyButton.displayName = "CopyButton";

export { CopyButton };
