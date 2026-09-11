import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const variants = {
  solid: "commit text-fg",
  ghost: "well text-fg",
  danger: "well text-danger",
};

const sizes = {
  lg: "h-12 px-4 type-content",
  md: "h-11 px-3 type-chrome",
};

export function Button({
  variant = "solid",
  size = "lg",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      type="button"
      className={cn("press rounded-full", variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

export function buttonVariants({
  variant = "solid",
  size = "lg",
}: {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
} = {}) {
  return cn("press inline-flex items-center justify-center rounded-full", variants[variant], sizes[size]);
}
