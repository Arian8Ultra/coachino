import * as React from "react";

import { cn } from "@/lib/utils";
interface Props extends React.ComponentProps<"input"> {
  label?: string;
  className?: string;
  wrapperClassName?: string;
}
function Input({ className, label, type, wrapperClassName, ...props }: Props) {
  return label ? (
    <div className={`flex flex-col group ${wrapperClassName}`}>
      <label
        htmlFor={props.id}
        className='font-medium duration-200 pe-3 group-focus-within:opacity-100 translate-y-1/2 group-focus-within:-translate-y-0 text-sm px-2 bg-glass rounded-full w-fit backdrop-blur-sm ms-2'
      >
        {label}
      </label>
      <input
        type={type}
        data-slot='input'
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-auto w-full min-w-0 rounded-lg border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive p-3",
          className,
        )}
        {...props}
      />
    </div>
  ) : (
    <input
      type={type}
      data-slot='input'
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-base",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[1px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
