import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-base font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        accent: "bg-accent text-accent-foreground shadow-xs hover:bg-accent/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-2 hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        glass:
          "bg-primary/15 backdrop-blur-lg border text-primary hover:bg-primary/20 dark:bg-black/10 dark:border-black/20 dark:text-white w-full",
        accentGlass:
          "bg-accent/15 backdrop-blur-lg border text-accent hover:bg-accent/20  dark:border-black/20 dark:text-white w-full",
        successGlass:
          "bg-green-500/15 backdrop-blur-lg border text-green-700 hover:bg-green-500/20  dark:border-black/20 dark:text-white w-full",
        gradientGlass:
          "bg-gradient-to-tr from-primary to-accent/15 backdrop-blur-lg text-primary-foreground hover:bg-gradient-to-tr hover:from-primary hover:to-accent/50 dark:border-black/20 dark:text-white w-full  transition-all duration-300 ",
        alert:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 relative",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {variant === "alert" && (
        <div className='absolute inset-0 rounded-md border-2 border-primary md:animate-ping -z-10'></div>
      )}
      {props.children}
    </Comp>
  );
}

export { Button, buttonVariants };
