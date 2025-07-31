"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { withScrollSafety } from "./motion-wrapper"

interface ParallaxSectionProps {
  children: React.ReactNode
  speed?: number
  className?: string
  direction?: "up" | "down"
  overflow?: "visible" | "hidden"
}

function ParallaxSectionComponent({
  children,
  speed = 0.2,
  className = "",
  direction = "up",
  overflow = "hidden",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Always call hooks, but provide fallback values
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })

  // Calculate parallax effect based on direction
  const factor = direction === "up" ? -1 : 1
  const y = useTransform(scrollYProgress, [0, 1], [0, 100 * speed * factor])

  // If not mounted, render static version
  if (!isMounted) {
    return (
      <div 
        className={`relative ${overflow === "hidden" ? "overflow-hidden" : ""} ${className}`}
        suppressHydrationWarning
      >
        {children}
      </div>
    )
  }

  return (
    <div ref={ref} className={`relative ${overflow === "hidden" ? "overflow-hidden" : ""} ${className}`}>
      <motion.div 
        style={{ y }} 
        className="w-full h-full"
        initial={{ y: 0 }}
      >
        {children}
      </motion.div>
    </div>
  )
}

export const ParallaxSection = withScrollSafety(ParallaxSectionComponent)
