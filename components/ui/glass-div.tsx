import { cn } from '@/lib/utils'
import React from 'react'

const GlassDiv = ({ className, ...props }: React.ComponentProps<"div">) => {
  return (
    <div
      data-slot="glass-div"
      className={cn(
        "bg-glass backdrop-blur-sm border border-glass-border rounded-md p-4",
        className
      )}
      {...props}
    >
      {props.children}
    </div>
  )
}

export default GlassDiv