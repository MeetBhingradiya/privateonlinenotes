import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Icon } from "@iconify/react"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

const buttonVariants = cva(
  "glass-button inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm",
  {
    variants: {
      variant: {
        default: "bg-primary/80 text-primary-foreground hover:bg-primary/90 border-primary/30",
        destructive:
          "bg-destructive/80 text-destructive-foreground hover:bg-destructive/90 border-destructive/30",
        outline:
          "border-white/30 bg-white/10 hover:bg-white/20 hover:text-accent-foreground",
        secondary:
          "bg-secondary/80 text-secondary-foreground hover:bg-secondary/90 border-secondary/30",
        ghost: "border-transparent hover:bg-white/20 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline border-transparent bg-transparent",
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

export interface IconButtonProps extends ButtonProps {
  icon?: string
  tooltip?: string
  iconPosition?: "left" | "right"
  iconSize?: number
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

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      variant,
      size,
      icon,
      tooltip,
      iconPosition = "left",
      iconSize = 16,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"

    const buttonContent = (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {icon && iconPosition === "left" && (
          <Icon
            icon={`material-symbols:${icon}`}
            width={iconSize}
            height={iconSize}
            className={children ? "mr-2" : ""}
          />
        )}
        {children}
        {icon && iconPosition === "right" && (
          <Icon
            icon={`material-symbols:${icon}`}
            width={iconSize}
            height={iconSize}
            className={children ? "ml-2" : ""}
          />
        )}
      </Comp>
    )

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return buttonContent
  }
)
IconButton.displayName = "IconButton"

export { Button, IconButton, buttonVariants }
