import { useEffect, useState } from "react";
import {
  getRandomAnimation,
  getRandomFloatingAnimation,
  getRandomTextAnimation,
  getAnimationClass,
  getFloatingAnimationClass,
  getTextAnimationClass,
  getRandomStaggerDelay,
  AnimationType,
  FloatingAnimation,
  TextAnimation,
} from "@/lib/animationUtils";

/**
 * Hook for managing page entrance animations
 */
export function usePageAnimation() {
  const [animation, setAnimation] = useState<AnimationType>("fade-scale");

  useEffect(() => {
    setAnimation(getRandomAnimation());
  }, []);

  return {
    animation,
    className: getAnimationClass(animation),
  };
}

/**
 * Hook for managing card animations with stagger
 */
export function useCardAnimations(count: number = 4) {
  const [animations, setAnimations] = useState<string[]>([]);

  useEffect(() => {
    const newAnimations = Array.from({ length: count }).map(() => {
      const animation = getRandomAnimation();
      const stagger = getRandomStaggerDelay();
      return `${getAnimationClass(animation)} ${stagger}`;
    });
    setAnimations(newAnimations);
  }, [count]);

  return animations;
}

/**
 * Hook for managing floating animations
 */
export function useFloatingAnimation() {
  const [animation, setAnimation] = useState<FloatingAnimation>("float");

  useEffect(() => {
    setAnimation(getRandomFloatingAnimation());
  }, []);

  return {
    animation,
    className: getFloatingAnimationClass(animation),
  };
}

/**
 * Hook for managing text animations
 */
export function useTextAnimation() {
  const [animation, setAnimation] = useState<TextAnimation>("text-fade");

  useEffect(() => {
    setAnimation(getRandomTextAnimation());
  }, []);

  return {
    animation,
    className: getTextAnimationClass(animation),
  };
}

/**
 * Hook for managing element visibility with animation
 */
export function useAnimatedVisibility(initialVisible: boolean = false) {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [animation, setAnimation] = useState<AnimationType>("fade-scale");

  useEffect(() => {
    if (isVisible) {
      setAnimation(getRandomAnimation());
    }
  }, [isVisible]);

  return {
    isVisible,
    setIsVisible,
    className: isVisible ? getAnimationClass(animation) : "",
  };
}

/**
 * Hook for managing scroll-triggered animations
 */
export function useScrollAnimation(ref: React.RefObject<HTMLElement>) {
  const [isVisible, setIsVisible] = useState(false);
  const [animation, setAnimation] = useState<AnimationType>("fade-scale");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          setAnimation(getRandomAnimation());
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref]);

  return {
    isVisible,
    className: isVisible ? getAnimationClass(animation) : "",
  };
}

/**
 * Hook for managing sequential animations
 */
export function useSequentialAnimations(items: unknown[]) {
  const [animations, setAnimations] = useState<string[]>([]);

  useEffect(() => {
    const newAnimations = items.map((_, index) => {
      const animation = getRandomAnimation();
      const delay = index * 100;
      return `${getAnimationClass(animation)} stagger-${Math.min(Math.floor(delay / 100) + 1, 6)}`;
    });
    setAnimations(newAnimations);
  }, [items.length]);

  return animations;
}

/**
 * Hook for managing hover animations
 */
export function useHoverAnimation() {
  const [isHovered, setIsHovered] = useState(false);

  return {
    isHovered,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    className: isHovered ? "animate-button-hover" : "",
  };
}

/**
 * Hook for managing click animations
 */
export function useClickAnimation() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200);
  };

  return {
    isClicked,
    onClick: handleClick,
    className: isClicked ? "animate-button-press" : "",
  };
}

/**
 * Hook for managing continuous floating animations
 */
export function useContinuousAnimation(animationType: "float" | "pulse" | "glow" = "float") {
  return {
    className: `animate-${animationType}`,
  };
}
