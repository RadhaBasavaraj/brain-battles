import { useEffect, useRef } from "react";
import katex from "katex";

interface MathTextProps {
  text: string;
}

export default function MathTest({ text }: MathTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g);

    parts.forEach((part) => {
      if (part.startsWith("$$") && part.endsWith("$$")) {
        const math = part.slice(2, -2);
        const element = document.createElement("div");

        element.setAttribute("data-latex-source", part);

        katex.render(math, element, {
          displayMode: true,
          throwOnError: false,
        });

        container.appendChild(element);
      } else if (part.startsWith("$") && part.endsWith("$")) {
        const math = part.slice(1, -1);
        const element = document.createElement("span");

        element.setAttribute("data-latex-source", part);

        katex.render(math, element, {
          displayMode: false,
          throwOnError: false,
        });

        container.appendChild(element);
      } else {
        container.appendChild(document.createTextNode(part));
      }
    });

    const getSelectedText = (node: Node, range: Range): string => {
      // Return the original LaTeX whenever the selection intersects a
      // rendered equation, rather than copying KaTeX's generated text.
      if (node instanceof Element) {
        const latexSource = node.getAttribute("data-latex-source");

        if (latexSource !== null && range.intersectsNode(node)) {
          return latexSource;
        }
      }

      if (node.nodeType === Node.TEXT_NODE) {
        if (!range.intersectsNode(node)) return "";

        const nodeText = node.textContent ?? "";
        const startOffset =
          range.startContainer === node ? range.startOffset : 0;
        const endOffset =
          range.endContainer === node ? range.endOffset : nodeText.length;

        return nodeText.slice(startOffset, endOffset);
      }

      let selectedText = "";

      node.childNodes.forEach((child) => {
        if (range.intersectsNode(child)) {
          selectedText += getSelectedText(child, range);
        }
      });

      return selectedText;
    };

    const handleCopy = (event: ClipboardEvent) => {
      if (event.defaultPrevented) return;

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        return;
      }

      const range = selection.getRangeAt(0);

      // Only handle selections entirely inside this MathTest instance, so
      // separate MathTest components do not compete to write to the clipboard.
      if (
        !container.contains(range.startContainer) ||
        !container.contains(range.endContainer)
      ) {
        return;
      }

      const selectedText = getSelectedText(container, range);
      if (!selectedText) return;

      event.preventDefault();
      event.clipboardData?.setData("text/plain", selectedText);
    };

    document.addEventListener("copy", handleCopy);

    return () => {
      document.removeEventListener("copy", handleCopy);
    };
  }, [text]);

  return (
    <span
      ref={containerRef}
      style={{ whiteSpace: "pre-line", textAlign: "left" }}
    />
  );
}