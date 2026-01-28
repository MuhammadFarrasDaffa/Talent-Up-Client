"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import { cn } from "@/lib/utils"; // Pastikan Anda punya utilitas cn (clsx/tailwind-merge)

interface RotatingTextProps {
  texts: string[];
  transition?: Transition;
  initial?: any;
  animate?: any;
  exit?: any;
  animatePresenceMode?: "sync" | "wait" | "popLayout";
  staggerDuration?: number;
  rotationInterval?: number;
  splitBy?: "characters" | "words" | "lines" | string;
  onNext?: (index: number) => void;
  mainClassName?: string;
  splitLevelClassName?: string;
  elementLevelClassName?: string;
  [key: string]: any;
}

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  (props, ref) => {
    const {
      texts,
      transition = { type: "spring", damping: 25, stiffness: 300 },
      initial = { y: "100%", opacity: 0 },
      animate = { y: 0, opacity: 1 },
      exit = { y: "-120%", opacity: 0 },
      animatePresenceMode = "wait",
      splitBy = "characters",
      staggerDuration = 0,
      staggerFrom = "first",
      loop = true,
      auto = true,
      rotationInterval = 2000,
      onNext,
      mainClassName,
      splitLevelClassName,
      elementLevelClassName,
      ...rest
    } = props;

    const [currentTextIndex, setCurrentTextIndex] = useState(0);

    const splitIntoCharacters = (text: string): string[] => {
      if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
        return Array.from(segmenter.segment(text), (s) => s.segment);
      }
      return text.split("");
    };

    const elements = useMemo(() => {
      const currentText = texts[currentTextIndex];
      if (splitBy === "characters") {
        const words = currentText.split(" ");
        return words.map((word: string, i: number) => (
          <span key={i} className="inline-block whitespace-nowrap">
            {splitIntoCharacters(word).map((char, j) => (
              <motion.span
                key={j}
                initial={initial}
                animate={animate}
                exit={exit}
                transition={{ ...transition, delay: j * staggerDuration }}
                className={cn("inline-block", elementLevelClassName)}
              >
                {char}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </span>
        ));
      }
      return [
        <motion.span
          key={currentText}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
          className={cn("inline-block", elementLevelClassName)}
        >
          {currentText}
        </motion.span>,
      ];
    }, [
      texts,
      currentTextIndex,
      splitBy,
      initial,
      animate,
      exit,
      transition,
      staggerDuration,
      elementLevelClassName,
    ]);

    const next = useCallback(() => {
      setCurrentTextIndex((prev) =>
        prev === texts.length - 1 ? (loop ? 0 : prev) : prev + 1,
      );
      if (onNext) onNext(currentTextIndex);
    }, [texts.length, loop, onNext, currentTextIndex]);

    const previous = useCallback(() => {
      setCurrentTextIndex((prev) =>
        prev === 0 ? (loop ? texts.length - 1 : prev) : prev - 1,
      );
    }, [texts.length, loop]);

    const jumpTo = useCallback(
      (index: number) => {
        const validIndex = Math.max(0, Math.min(index, texts.length - 1));
        setCurrentTextIndex(validIndex);
      },
      [texts.length],
    );

    const reset = useCallback(() => setCurrentTextIndex(0), []);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }));

    useEffect(() => {
      if (!auto) return;
      const intervalId = setInterval(next, rotationInterval);
      return () => clearInterval(intervalId);
    }, [auto, next, rotationInterval]);

    return (
      <motion.span
        className={cn(
          "flex flex-wrap whitespace-pre-wrap relative",
          mainClassName,
        )}
        {...rest}
        layout
        transition={transition}
      >
        <span className="sr-only">{texts[currentTextIndex]}</span>
        <AnimatePresence mode={animatePresenceMode} initial={false}>
          <motion.div
            key={currentTextIndex}
            className={cn(
              "flex flex-wrap whitespace-pre-wrap",
              splitLevelClassName,
            )}
            layout
          >
            {elements}
          </motion.div>
        </AnimatePresence>
      </motion.span>
    );
  },
);

RotatingText.displayName = "RotatingText";
export default RotatingText;
