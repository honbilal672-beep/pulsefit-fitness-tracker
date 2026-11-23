import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Reusable React hook that applies GSAP ScrollTrigger reveal animations
 * to matching elements inside a container ref.
 */
export function useGsapScrollReveal(containerRef, selector = ".gsap-reveal", deps = []) {
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const elements = gsap.utils.toArray(selector, container);
      if (!elements.length) return;

      ScrollTrigger.batch(elements, {
        start: "top 90%",
        once: true,
        onEnter: (batch) => {
          gsap.fromTo(
            batch,
            { opacity: 0, y: 28, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.65,
              stagger: 0.1,
              ease: "power3.out",
              clearProps: "transform,opacity"
            }
          );
        }
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
