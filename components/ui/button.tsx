import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary via-primary to-primary/95 text-primary-foreground hover:from-primary/95 hover:via-primary hover:to-primary shadow-md hover:shadow-lg ring-2 ring-primary/20",
        destructive:
          "bg-gradient-to-r from-destructive via-destructive to-destructive/95 text-destructive-foreground hover:from-destructive/95 hover:via-destructive hover:to-destructive shadow-md hover:shadow-lg ring-2 ring-destructive/20",
        outline:
          "border-2 border-input bg-background hover:bg-accent/80 hover:text-accent-foreground hover:border-accent shadow-sm hover:shadow-md",
        secondary:
          "bg-gradient-to-r from-secondary via-secondary to-secondary/95 text-secondary-foreground hover:from-secondary/90 hover:via-secondary hover:to-secondary shadow-md hover:shadow-lg",
        ghost: "hover:bg-accent/70 hover:text-accent-foreground hover:shadow-sm",
        link: "text-primary underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

