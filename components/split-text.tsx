"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"

interface SplitTextProps {
  children: string
  className?: string
}

export function SplitText({ children, className = "" }: SplitTextProps) {
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!textRef.current) return

    const text = textRef.current
    const chars = text.innerText.split("")

    // Clear the text element
    text.innerHTML = ""

    // Create spans for each character
    chars.forEach((char, index) => {
      const span = document.createElement("span")
      span.innerText = char
      span.style.display = "inline-block"
      span.style.opacity = "0"
      span.style.transform = "translateY(20px)"
      text.appendChild(span)
    })

    // Animate each character
    gsap.to(text.children, {
      opacity: 1,
      y: 0,
      stagger: 0.03,
      delay: 0.5,
      ease: "easeOut",
      duration: 0.8,
    })

    return () => {
      // Cleanup
    }
  }, [children])

  return (
    <div ref={textRef} className={className}>
      {children}
    </div>
  )
}
