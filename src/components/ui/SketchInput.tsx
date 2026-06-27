import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const SketchInput = forwardRef<HTMLInputElement, Props>(
  function SketchInput({ label, className = '', id, ...rest }, ref) {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            htmlFor={id}
            className="font-sketch text-sm text-ink leading-none"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          {...rest}
          className={`bg-paper border-2 border-ink px-3 py-2 font-body text-sm text-ink
            placeholder:text-gray-sketch focus:outline-none focus:ring-1 focus:ring-ink
            shadow-sketch-sm ${className}`}
        />
      </div>
    )
  },
)
