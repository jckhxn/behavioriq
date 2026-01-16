import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search, X } from "lucide-react";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  label?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, error, label, hint, leftIcon, rightIcon, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-background px-4 py-2 text-base transition-all duration-200 text-foreground",
              "placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
              error
                ? "border-red-500 focus:ring-red-500"
                : "border-border hover:border-muted-foreground/50",
              leftIcon && "pl-10",
              (rightIcon || isPassword) && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          )}
          {rightIcon && !isPassword && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || hint) && (
          <p
            className={cn(
              "mt-2 text-sm",
              error ? "text-red-500" : "text-muted-foreground"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// Search Input variant
interface SearchInputProps extends Omit<InputProps, "leftIcon" | "type"> {
  onClear?: () => void;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={value}
          className={cn(
            "flex h-10 w-full rounded-xl border border-border bg-background pl-10 pr-10 py-2 text-sm text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "hover:border-muted-foreground/50 transition-all duration-200",
            className
          )}
          ref={ref}
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

// Textarea
interface TextareaProps extends React.ComponentProps<"textarea"> {
  error?: string;
  label?: string;
  hint?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, hint, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border bg-background px-4 py-3 text-base transition-all duration-200 resize-none text-foreground",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-border hover:border-muted-foreground/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {(error || hint) && (
          <p
            className={cn(
              "mt-2 text-sm",
              error ? "text-red-500" : "text-muted-foreground"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// Select
interface SelectProps extends React.ComponentProps<"select"> {
  error?: string;
  label?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, label, hint, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <select
          className={cn(
            "flex h-11 w-full rounded-xl border bg-background px-4 py-2 text-base transition-all duration-200 text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted",
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-border hover:border-muted-foreground/50",
            className
          )}
          ref={ref}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {(error || hint) && (
          <p
            className={cn(
              "mt-2 text-sm",
              error ? "text-red-500" : "text-muted-foreground"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

// Checkbox
interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string;
  description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, ...props }, ref) => {
    return (
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          className={cn(
            "mt-0.5 h-5 w-5 rounded border-border text-primary",
            "focus:ring-2 focus:ring-primary focus:ring-offset-0",
            "transition-colors cursor-pointer",
            className
          )}
          ref={ref}
          {...props}
        />
        <div className="flex-1">
          {label && (
            <span className="text-sm font-medium text-foreground group-hover:text-foreground">
              {label}
            </span>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Input, SearchInput, Textarea, Select, Checkbox };
