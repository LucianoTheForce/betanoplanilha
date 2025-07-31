"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface MotionWrapperProps {
  children: React.ReactNode
}

export function MotionWrapper({ children }: MotionWrapperProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return <div suppressHydrationWarning>{children}</div>
  }

  return <AnimatePresence mode="wait">{children}</AnimatePresence>
}

// HOC para componentes que usam useScroll
export function withScrollSafety<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ScrollSafeComponent(props: P) {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
      // Delay para garantir que a hidratação está completa
      const timer = setTimeout(() => {
        setIsReady(true)
      }, 100)

      return () => clearTimeout(timer)
    }, [])

    if (!isReady) {
      return <div suppressHydrationWarning />
    }

    return <Component {...props} />
  }
}