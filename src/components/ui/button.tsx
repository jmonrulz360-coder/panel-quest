import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-display uppercase tracking-wide transition-transform duration-150 ease-out active:not-disabled:scale-[0.96] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
  {
    variants: {
      variant: {
        primary: "neon-cta bg-cyan text-cyan-fg hover:brightness-110",
        ghost: "bg-ink-2 text-paper border-2 border-cyan/40 hover:border-cyan hover:text-cyan",
        paper: "bg-paper-2 text-ink border-2 border-ink hover:bg-amber",
        danger: "bg-tension text-paper hover:brightness-110",
        amber: "bg-amber text-amber-fg hover:brightness-110",
      },
      size: {
        sm: "h-11 px-4 text-[13px] rounded-xl",
        md: "h-14 px-5 text-[15px] rounded-xl",
        lg: "h-16 px-6 text-[17px] rounded-2xl",
        icon: "size-12 rounded-xl",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
