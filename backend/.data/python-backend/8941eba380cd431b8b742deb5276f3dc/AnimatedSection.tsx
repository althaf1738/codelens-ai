"use client";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -20% 0px" });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.section>
  );
}
