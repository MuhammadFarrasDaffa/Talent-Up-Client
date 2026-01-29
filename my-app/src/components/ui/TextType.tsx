"use client";

import { useEffect, useState } from "react";

interface TextTypeProps {
  texts: string[]; // Array of texts to rotate through
  speed?: number;
  cursorChar?: string;
  className?: string;
  waitTime?: number; // Time to wait after typing before deleting (ms)
  deleteSpeed?: number;
  loop?: boolean;
}

export default function TextType({
  texts,
  speed = 100,
  cursorChar = "|",
  className = "",
  waitTime = 2000,
  deleteSpeed = 50,
  loop = true,
}: TextTypeProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isWaiting || isComplete) return;

    const currentText = texts[textIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (charIndex < currentText.length) {
          setDisplayedText(currentText.substring(0, charIndex + 1));
          setCharIndex((prev) => prev + 1);
        } else {
          // Finished typing current text
          const isLastText = textIndex === texts.length - 1;

          if (isLastText && !loop) {
            // Jika sudah teks terakhir dan tidak loop, berhenti
            setIsComplete(true);
            return;
          }

          // Masih ada teks lain atau loop aktif, lanjut delete
          if (loop || textIndex < texts.length - 1) {
            setIsWaiting(true);
            setTimeout(() => {
              setIsWaiting(false);
              setIsDeleting(true);
            }, waitTime);
          }
        }
      } else {
        // Deleting
        if (charIndex > 0) {
          setDisplayedText(currentText.substring(0, charIndex - 1));
          setCharIndex((prev) => prev - 1);
        } else {
          // Finished deleting - move to next text
          setIsDeleting(false);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    };

    const timeout = setTimeout(handleTyping, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [
    charIndex,
    isDeleting,
    textIndex,
    texts,
    speed,
    deleteSpeed,
    loop,
    waitTime,
    isWaiting,
    isComplete,
  ]);

  return (
    <span className={className}>
      {displayedText}
      {!isComplete && <span className="animate-blink">{cursorChar}</span>}
    </span>
  );
}
