/* eslint-disable no-unused-vars */
import React, { useMemo, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal({
  children,
  scrollContainerRef,        // optional: pass a ref to a custom scrollable element
  enableBlur = true,
  baseOpacity = 0.1,
  baseRotation = 3,
  blurStrength = 4,
  containerClassName = "",
  textClassName = "",
  rotationEnd = "bottom bottom",
  wordAnimationEnd = "bottom bottom",
  as: Tag = "h2",            // semantic container tag (h2 by default)
}) {
  const containerRef = useRef(null);

  // Build a safe string from children (handles multiline JSX text)
  const textString = useMemo(() => {
    return React.Children.toArray(children)
      .map((node) => (typeof node === "string" || typeof node === "number" ? String(node) : ""))
      .join("");
  }, [children]);

  // Split into spans, preserving spaces
  const split = useMemo(() => {
    return textString.split(/(\s+)/).map((chunk, i) =>
      /^\s+$/.test(chunk)
        ? <span key={`s-${i}`}>{chunk}</span> // spaces kept as is
        : <span key={`w-${i}`} className="inline-block word">{chunk}</span>
    );
  }, [textString]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Build base ScrollTrigger config
    const stBase = {
      trigger: el,
      start: "top bottom",
      scrub: true,
    };
    const stWords = {
      trigger: el,
      start: "top bottom-=20%",
      scrub: true,
    };

    // Only set scroller if a custom container is provided
    if (scrollContainerRef?.current) {
      stBase.scroller = scrollContainerRef.current;
      stWords.scroller = scrollContainerRef.current;
    }

    const ctx = gsap.context(() => {
      // Rotation of the entire block
      gsap.fromTo(
        el,
        { transformOrigin: "0% 50%", rotate: baseRotation },
        {
          rotate: 0,
          ease: "none",
          scrollTrigger: { ...stBase, end: rotationEnd },
        }
      );

      const words = el.querySelectorAll(".word");

      // Set initial styles once (more performant)
      gsap.set(words, { opacity: baseOpacity, willChange: "opacity, filter" });
      if (enableBlur) gsap.set(words, { filter: `blur(${blurStrength}px)` });

      // Create a timeline for word reveal (opacity + optional blur)
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { ...stWords, end: wordAnimationEnd },
      });

      tl.to(words, {
        opacity: 1,
        stagger: 0.05,
      });

      if (enableBlur) {
        tl.to(words, {
          filter: "blur(0px)",
          stagger: 0.05,
        }, 0); // align with opacity start
      }
    }, containerRef);

    // Proper cleanup (kills only what we created here)
    return () => ctx.revert();
  }, [scrollContainerRef, enableBlur, baseRotation, baseOpacity, rotationEnd, wordAnimationEnd, blurStrength]);

  return (
    <Tag ref={containerRef} className={`my-5 ${containerClassName}`}>
      {/* Put spans directly in the heading; responsive font with Tailwind */}
      <span className={`block text-[clamp(1.6rem,4vw,2.5rem)] leading-[1.5] font-semibold ${textClassName}`}>
        {split}
      </span>
    </Tag>
  );
}
