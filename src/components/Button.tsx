import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "text" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

const variantClass: Record<Variant, string> = {
  primary: "btn btn-primary",
  outline: "btn btn-outline",
  text: "btn btn-text",
  ghost: "btn btn-ghost",
  danger: "btn btn-danger",
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`${variantClass[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
