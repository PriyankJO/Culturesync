import React from 'react';
import { motion } from 'framer-motion';

export default function TextAnimation({ children, animation = 'slideLeft', className = '', ...props }) {
  const isString = typeof children === 'string';
  
  if (!isString) {
    // Fallback if not string
    return (
      <motion.span
        className={className}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        {...props}
      >
        {children}
      </motion.span>
    );
  }

  const letters = children.split('');
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    }
  };
  
  const childVariant = {
    slideLeft: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } }
    },
    slideRight: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } }
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } }
    },
    slideDown: {
      hidden: { opacity: 0, y: -20 },
      visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } }
    }
  };

  const selectedVariant = childVariant[animation] || childVariant.slideLeft;

  return (
    <motion.span
      className={className}
      variants={container}
      initial="hidden"
      animate="visible"
      {...props}
      style={{ display: 'inline-block' }}
    >
      {letters.map((letter, index) => (
        <motion.span key={index} variants={selectedVariant} style={{ display: 'inline-block' }}>
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.span>
  );
}
