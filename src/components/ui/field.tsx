import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const fieldVariants = cva("space-y-2", {
    variants: {
        variant: {
            default: "",
            horizontal: "flex items-center gap-4",
        },
    },
    defaultVariants: {
        variant: "default",
    },
})

interface FieldProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof fieldVariants> { }

const Field = React.forwardRef<HTMLDivElement, FieldProps>(
    ({ className, variant, ...props }, ref) => (
        <div ref={ref} className={cn(fieldVariants({ variant }), className)} {...props} />
    )
)
Field.displayName = "Field"

const FieldGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-4", className)} {...props} />
))
FieldGroup.displayName = "FieldGroup"

const FieldLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
        {...props}
    />
))
FieldLabel.displayName = "FieldLabel"

const FieldContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
))
FieldContent.displayName = "FieldContent"

const FieldDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
FieldDescription.displayName = "FieldDescription"

const FieldError = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm font-medium text-destructive", className)}
        {...props}
    />
))
FieldError.displayName = "FieldError"

const FieldSeparator = React.forwardRef<
    HTMLHRElement,
    React.HTMLAttributes<HTMLHRElement>
>(({ className, ...props }, ref) => (
    <hr ref={ref} className={cn("my-4 border-border", className)} {...props} />
))
FieldSeparator.displayName = "FieldSeparator"

export {
    Field,
    FieldGroup,
    FieldLabel,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldSeparator,
}
