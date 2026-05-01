'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';

interface SectionTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale';
  duration?: number;
}

export function SectionTransition({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up',
  duration = 0.8
}: SectionTransitionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const getInitialVariants = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 60 };
      case 'down':
        return { opacity: 0, y: -60 };
      case 'left':
        return { opacity: 0, x: -60 };
      case 'right':
        return { opacity: 0, x: 60 };
      case 'fade':
        return { opacity: 0 };
      case 'scale':
        return { opacity: 0, scale: 0.95 };
      default:
        return { opacity: 0, y: 60 };
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialVariants()}
      animate={isInView ? { opacity: 1, y: 0, x: 0, scale: 1 } : getInitialVariants()}
      transition={{
        duration,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredChildrenProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  childDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
}

export function StaggeredChildren({ 
  children, 
  className = '', 
  staggerDelay = 0.1,
  childDelay = 0.2,
  direction = 'up'
}: StaggeredChildrenProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const getInitialVariants = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: 40 };
      case 'down':
        return { opacity: 0, y: -40 };
      case 'left':
        return { opacity: 0, x: -40 };
      case 'right':
        return { opacity: 0, x: 40 };
      case 'fade':
        return { opacity: 0 };
      default:
        return { opacity: 0, y: 40 };
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: childDelay
      }
    }
  };

  const childVariants: Variants = {
    hidden: getInitialVariants(),
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {children.map((child, index) => (
        <motion.div key={index} variants={childVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
