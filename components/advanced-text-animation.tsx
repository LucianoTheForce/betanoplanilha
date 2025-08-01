"use client"

import { useRef, useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AdvancedTextAnimationProps {
  children: string
  className?: string
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span"
  delay?: number
  duration?: number
  type?: "reveal" | "slide" | "letter" | "word" | "fade" | "glitch"
  threshold?: number
  fontWeight?: "normal" | "bold" | "extrabold"
  staggerChildren?: number
  ease?: string
  direction?: "up" | "down" | "left" | "right"
  letterSpacing?: string
}

export function AdvancedTextAnimation({
  children,
  className = "",
  tag: Tag = "div",
  delay = 0,
  duration = 0.8,
  type = "reveal",
  threshold = 0.2,
  fontWeight = "normal",
  staggerChildren = 0.03,
  ease = "easeOut",
  direction = "up",
  letterSpacing = "normal",
}: AdvancedTextAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    setIsBrowser(true)

    if (!textRef.current || hasAnimated.current) return

    const element = textRef.current

    // Create observer to trigger animation when element is in view
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasAnimated.current) {
              hasAnimated.current = true
              setIsVisible(true)

            }
          })
        },
        { threshold },
      )

      observer.observe(element)

      return () => {
        if (element) observer.unobserve(element)
      }
    }
  }, [children, threshold, type, delay])

  // Apply font weight class
  const fontWeightClass =
    fontWeight === "bold" ? "font-bold" : fontWeight === "extrabold" ? "font-extrabold" : "font-normal"

  // Prepare animation variants based on type and direction
  const getDirectionValues = () => {
    switch (direction) {
      case "up":
        return { initial: 30, animate: 0 }
      case "down":
        return { initial: -30, animate: 0 }
      case "left":
        return { initial: 30, animate: 0 }
      case "right":
        return { initial: -30, animate: 0 }
      default:
        return { initial: 30, animate: 0 }
    }
  }

  const dirValues = getDirectionValues()

  // Animation variants for different types
  const variants = {
    reveal: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: duration,
          delay: delay,
          ease: ease,
        },
      },
    },
    slide: {
      hidden: {
        opacity: 0,
        y: direction === "up" || direction === "down" ? dirValues.initial : 0,
        x: direction === "left" || direction === "right" ? dirValues.initial : 0,
      },
      visible: {
        opacity: 1,
        y: direction === "up" || direction === "down" ? dirValues.animate : 0,
        x: direction === "left" || direction === "right" ? dirValues.animate : 0,
        transition: {
          duration: duration,
          delay: delay,
          ease: ease,
        },
      },
    },
    letter: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerChildren,
          delayChildren: delay,
        },
      },
    },
    word: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerChildren * 3,
          delayChildren: delay,
        },
      },
    },
    fade: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: duration * 1.5,
          delay: delay,
          ease: "linear",
        },
      },
    },
    glitch: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          duration: 0.1,
          delay: delay,
        },
      },
    },
  }

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: direction === "up" || direction === "down" ? dirValues.initial : 0,
      x: direction === "left" || direction === "right" ? dirValues.initial : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: duration * 0.6,
        ease: ease,
      },
    },
  }

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: direction === "up" || direction === "down" ? dirValues.initial : 0,
      x: direction === "left" || direction === "right" ? dirValues.initial : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: duration * 0.8,
        ease: ease,
      },
    },
  }

  // If not in browser, render static content
  if (!isBrowser) {
    return (
      <Tag
        ref={textRef}
        className={`advanced-text-animation ${fontWeightClass} ${className}`}
        style={{ whiteSpace: "pre-wrap" }}
      >
        {children}
      </Tag>
    )
  }

  // Render different animation types
  const renderContent = () => {
    switch (type) {
      case "letter":
        return (
          <motion.div
            variants={variants.letter}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="flex flex-wrap"
            style={{ letterSpacing }}
          >
            {children.split("").map((char, index) => (
              <motion.span
                key={index}
                variants={letterVariants}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.div>
        )

      case "word":
        return (
          <motion.div
            variants={variants.word}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="flex flex-wrap"
          >
            {children.split(" ").map((word, index) => (
              <motion.span
                key={index}
                variants={wordVariants}
                className="inline-block mr-[0.3em]"
              >
                {word}
              </motion.span>
            ))}
          </motion.div>
        )

      case "glitch":
        return (
          <motion.div
            variants={variants.glitch}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            className="relative"
          >
            <span className="glitch-text" data-text={children}>
              {children}
            </span>
          </motion.div>
        )

      default:
        return (
          <motion.div
            variants={variants[type]}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            style={{ letterSpacing }}
          >
            {children.toString().includes("19/05") ? (
              <span className="relative">
                {children}
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-white/40 rounded-full"></span>
              </span>
            ) : (
              children
            )}
          </motion.div>
        )
    }
  }

  return (
    <Tag
      ref={textRef}
      className={`advanced-text-animation ${fontWeightClass} ${className}`}
      style={{ whiteSpace: "pre-wrap" }}
    >
      {renderContent()}
    </Tag>
  )
}
