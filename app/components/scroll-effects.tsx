"use client";

import { useEffect } from "react";

export function ScrollEffects() {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let observer: IntersectionObserver | undefined;
    if (!reducedMotion && "IntersectionObserver" in window) {
      document.documentElement.classList.add("has-reveal");
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-visible", "true");
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => observer.observe(node));
    }

    const header = document.querySelector<HTMLElement>(".site-header");
    const visual = document.querySelector<HTMLElement>("[data-parallax]");
    const progress = document.querySelector<HTMLElement>(".scroll-progress");
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        header?.classList.toggle("is-scrolled", window.scrollY > 16);
        const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        progress?.style.setProperty("transform", `scaleX(${Math.min(window.scrollY / scrollable, 1)})`);
        if (visual && !reducedMotion) {
          const heroHeight = Math.max(window.innerHeight, 1);
          const shift = Math.min(window.scrollY / heroHeight, 1);
          visual.style.setProperty("--scroll-shift", String(shift));
        }
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => { observer?.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", update); document.documentElement.classList.remove("has-reveal"); };
  }, []);

  return <div className="scroll-progress" aria-hidden="true" />;
}
