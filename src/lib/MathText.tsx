import { useEffect, useRef } from "react";
import katex from "katex";

interface MathTextProps {
  text: string;
}

export default function MathText({ text }: MathTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$)/g);

    parts.forEach((part) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const math = part.slice(2, -2);

        const element = document.createElement("div");

        katex.render(math, element, {
          displayMode: true,
          throwOnError: false,
        });

        containerRef.current?.appendChild(element);
      } else if (part.startsWith("$") && part.endsWith("$")) {
        const math = part.slice(1, -1);

        const element = document.createElement("span");

        katex.render(math, element, {
          displayMode: false,
          throwOnError: false,
        });

        containerRef.current?.appendChild(element);
      } else {
        const textNode = document.createTextNode(part);
        containerRef.current?.appendChild(textNode);
      }
    });
  }, [text]);

  return <span ref={containerRef} />;
}