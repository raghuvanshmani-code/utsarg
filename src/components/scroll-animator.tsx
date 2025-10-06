'use client';
import { useEffect } from 'react';

export function ScrollAnimator() {
  useEffect(() => {
    const scrollElements = document.querySelectorAll('[data-scroll]');

    const elementInView = (el: Element, percentageScroll = 100) => {
      const elementTop = el.getBoundingClientRect().top;
      return (
        elementTop <=
        (window.innerHeight || document.documentElement.clientHeight) * (percentageScroll / 100)
      );
    };

    const displayScrollElement = (element: Element) => {
      element.setAttribute('data-scroll', 'in');
    };

    const hideScrollElement = (element: Element) => {
      element.setAttribute('data-scroll', 'out');
    };

    const handleScrollAnimation = () => {
      scrollElements.forEach((el) => {
        if (elementInView(el, 100)) {
          displayScrollElement(el);
        } else {
          hideScrollElement(el);
        }
      });
    };

    // Initialize all elements to be "out" of view
    scrollElements.forEach((el) => {
        el.setAttribute('data-scroll', 'out');
    });

    // Run on initial load
    handleScrollAnimation();

    window.addEventListener('scroll', handleScrollAnimation);

    return () => {
      window.removeEventListener('scroll', handleScrollAnimation);
    };
  }, []);

  return null;
}
