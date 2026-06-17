/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-lg border bg-background px-3 text-sm transition-all outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:border-ring aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
  {
    variants: {
      size: {
        default: "h-10 py-2",
        sm: "h-9 py-1.5 text-xs",
        lg: "h-12 py-3 text-base",
      },
      variant: {
        default: "border-border",
        ghost: "border-transparent bg-muted/50 focus-visible:bg-background",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">,
    VariantProps<typeof inputVariants> {
  /** Icon or element rendered to the left of the input */
  prefix?: React.ReactNode
  /** Icon or element rendered to the right of the input */
  suffix?: React.ReactNode
  /** Wrapper className (used when prefix/suffix is present) */
  wrapperClassName?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      size,
      prefix,
      suffix,
      wrapperClassName,
      type = "text",
      ...props
    },
    ref
  ) => {
    if (prefix || suffix) {
      return (
        <div
          className={cn(
            "relative flex items-center w-full",
            wrapperClassName
          )}
        >
          {prefix && (
            <span className="absolute left-3 flex items-center text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              inputVariants({ size, variant }),
              prefix && "pl-9",
              suffix && "pr-9",
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 flex items-center text-muted-foreground [&_svg]:size-4 [&_svg]:shrink-0">
              {suffix}
            </span>
          )}
        </div>
      )
    }

    return (
      <input
        ref={ref}
        type={type}
        className={cn(inputVariants({ size, variant }), className)}
        {...props}
      />
    )
  }
)

Input.displayName = "Input"

export { Input, inputVariants }
export default Input
