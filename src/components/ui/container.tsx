import type { ComponentPropsWithoutRef } from "react";
import { cn } from "./utils";

export type ContainerSize = "page" | "wide" | "text" | "narrow";

const sizeClasses: Record<ContainerSize, string> = {
  page: "max-w-page",
  wide: "max-w-wide",
  text: "max-w-text",
  narrow: "max-w-narrow",
};

export type ContainerProps = ComponentPropsWithoutRef<"div"> & {
  size?: ContainerSize;
};

export function Container({ size = "page", className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full px-margin", sizeClasses[size], className)}
      {...props}
    />
  );
}
