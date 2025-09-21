import { useSpring, useTransition, useTrail, animated, config } from '@react-spring/web';
import { useState, useEffect } from 'react';

export const useAnimations = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Page entrance animation
  const pageAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(20px)' },
    to: { 
      opacity: isLoaded ? 1 : 0, 
      transform: isLoaded ? 'translateY(0px)' : 'translateY(20px)' 
    },
    config: config.gentle,
    delay: 100
  });

  // Card hover animation
  const cardHover = useSpring({
    from: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    to: { scale: 1, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    config: config.wobbly
  });

  // Button press animation
  const buttonPress = useSpring({
    from: { scale: 1 },
    to: { scale: 1 },
    config: config.stiff
  });

  // Success animation
  const successAnimation = useSpring({
    from: { scale: 0, rotate: -180 },
    to: { scale: 1, rotate: 0 },
    config: config.wobbly
  });

  // Error shake animation
  const errorShake = useSpring({
    from: { x: 0 },
    to: { x: 0 },
    config: config.stiff
  });

  // Number counter animation
  const counterAnimation = useSpring({
    from: { number: 0 },
    to: { number: 0 },
    config: config.slow
  });

  // List item stagger animation
  const listStagger = useTrail(0, {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: { opacity: 1, transform: 'translateX(0px)' },
    config: config.gentle
  });

  // Modal backdrop animation
  const modalBackdrop = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: config.fast
  });

  // Modal content animation
  const modalContent = useSpring({
    from: { opacity: 0, transform: 'scale(0.9) translateY(-20px)' },
    to: { opacity: 1, transform: 'scale(1) translateY(0px)' },
    config: config.gentle
  });

  // Loading spinner animation
  const spinnerAnimation = useSpring({
    from: { rotate: 0 },
    to: { rotate: 360 },
    loop: true,
    config: config.slow
  });

  // Progress bar animation
  const progressAnimation = useSpring({
    from: { width: '0%' },
    to: { width: '100%' },
    config: config.slow
  });

  // Floating action button animation
  const fabAnimation = useSpring({
    from: { scale: 0, rotate: -45 },
    to: { scale: 1, rotate: 0 },
    config: config.wobbly,
    delay: 500
  });

  // Notification slide animation
  const notificationSlide = useSpring({
    from: { transform: 'translateX(100%)', opacity: 0 },
    to: { transform: 'translateX(0%)', opacity: 1 },
    config: config.gentle
  });

  // Form field focus animation
  const fieldFocus = useSpring({
    from: { scale: 1, borderColor: '#e5e7eb' },
    to: { scale: 1, borderColor: '#2563eb' },
    config: config.gentle
  });

  // Chart animation
  const chartAnimation = useSpring({
    from: { scaleY: 0 },
    to: { scaleY: 1 },
    config: config.gentle
  });

  // Skeleton loading animation
  const skeletonPulse = useSpring({
    from: { opacity: 0.6 },
    to: { opacity: 1 },
    loop: { reverse: true },
    config: config.slow
  });

  // Tooltip animation
  const tooltipAnimation = useSpring({
    from: { opacity: 0, transform: 'translateY(-10px)' },
    to: { opacity: 1, transform: 'translateY(0px)' },
    config: config.gentle
  });

  // Accordion animation
  const accordionAnimation = useSpring({
    from: { height: 0, opacity: 0 },
    to: { height: 'auto', opacity: 1 },
    config: config.gentle
  });

  // Toggle switch animation
  const toggleAnimation = useSpring({
    from: { x: 0 },
    to: { x: 0 },
    config: config.stiff
  });

  // Drag and drop animation
  const dragAnimation = useSpring({
    from: { scale: 1, rotate: 0 },
    to: { scale: 1, rotate: 0 },
    config: config.gentle
  });

  // Parallax scroll animation
  const parallaxAnimation = useSpring({
    from: { transform: 'translateY(0px)' },
    to: { transform: 'translateY(0px)' },
    config: config.gentle
  });

  return {
    // Animations
    pageAnimation,
    cardHover,
    buttonPress,
    successAnimation,
    errorShake,
    counterAnimation,
    listStagger,
    modalBackdrop,
    modalContent,
    spinnerAnimation,
    progressAnimation,
    fabAnimation,
    notificationSlide,
    fieldFocus,
    chartAnimation,
    skeletonPulse,
    tooltipAnimation,
    accordionAnimation,
    toggleAnimation,
    dragAnimation,
    parallaxAnimation,
    
    // Animated components
    animated,
    
    // Utilities
    setIsLoaded
  };
};
