"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import gsap from "gsap"

interface AnimatedTextProps {
  children: string
  className?: string
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span"
  delay?: number
  duration?: number
  staggerChildren?: number
  type?: "chars" | "words" | "lines" | "reveal"
  threshold?: number
}

export function AnimatedText({
  children,
  className = "",
  tag: Tag = "div",
  delay = 0,
  duration = 1.2,
  staggerChildren = 0.04,
  type = "chars",
  threshold = 0.5,
}: AnimatedTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)
  const [content, setContent] = useState<React.ReactNode>(children)

  useEffect(() => {
    if (!containerRef.current || hasAnimated.current) return

    const element = containerRef.current

    // Create observer to trigger animation when element is in view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true
            prepareAndAnimateText()
            observer.unobserve(element)
          }
        })
      },
      { threshold },
    )

    observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [children, threshold, type])

  const prepareAndAnimateText = () => {
    if (!containerRef.current) return

    // Different animation types
    if (type === "reveal") {
      // Simple reveal animation
      gsap.fromTo(
        containerRef.current,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          ease: "easeOut",
        },
      )
      return
    }

    // For character, word, or line animations, split text manually
    const text = children.toString()
    const elements: HTMLElement[] = []

    // Clear the container
    if (containerRef.current) {
      containerRef.current.innerHTML = ""

      if (type === "chars") {
        // Split into characters
        const chars = text.split("")

        chars.forEach((char, index) => {
          const span = document.createElement("span")
          span.textContent = char
          span.style.display = "inline-block"
          span.style.opacity = "0"
          span.style.transform = "translateY(20px) rotateX(-40deg)"
          span.style.transformOrigin = "0% 50% -50px"
          containerRef.current?.appendChild(span)
          elements.push(span)
        })
      } else if (type === "words") {
        // Split into words
        const words = text.split(/\s+/)

        words.forEach((word, index) => {
          const span = document.createElement("span")
          span.textContent = word
          span.style.display = "inline-block"
          span.style.opacity = "0"
          span.style.transform = "translateY(20px)"
          containerRef.current?.appendChild(span)
          elements.push(span)

          // Add space after word (except last word)
          if (index < words.length - 1) {
            const space = document.createElement("span")
            space.textContent = " "
            space.style.display = "inline-block"
            containerRef.current?.appendChild(space)
          }
        })
      } else if (type === "lines") {
        // For simplicity, we'll just treat each line as a separate element
        // In a real implementation, you'd need to calculate actual line breaks
        const lines = text.split("\n")

        lines.forEach((line, index) => {
          const div = document.createElement("div")
          div.textContent = line
          div.style.opacity = "0"
          div.style.transform = "translateY(20px)"
          containerRef.current?.appendChild(div)
          elements.push(div)
        })
      }

      // Animate the elements
      gsap.to(elements, {
        y: 0,
        opacity: 1,
        rotationX: 0,
        stagger: staggerChildren,
        duration: duration * 0.7,
        delay,
        ease: "easeOut",
      })
    }
  }

  return (
    <Tag ref={containerRef} className={`animated-text ${className}`}>
      {children}
    </Tag>
  )
}
