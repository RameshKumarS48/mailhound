/* Motion constants that mirror the CSS custom properties in globals.css
   (--dur-*, --ease-*), so the `motion` JS layer animates on exactly the same
   durations and easings as CSS transitions. Change both together. */
export const DUR = { fast: 0.16, base: 0.32, slow: 0.64 } as const

// cubic-bezier control points, as motion's array easing form
export const EASE_OUT = [0.22, 1, 0.36, 1] as const
export const EASE_EMPHASIZED = [0.2, 0.8, 0.2, 1] as const
