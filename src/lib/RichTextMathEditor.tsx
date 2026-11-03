
import { useEffect, useRef, useState } from "react";
import katex from "katex";
import { splitMathSegments } from "../lib/mathEditorUtils";

interface RichTextMathEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  onLimitReached?: () => void;
}

function createMathNode(
  source: string,
  content: string,
  displayMode: boolean
): HTMLElement {
  const element = document.createElement("span");

  element.setAttribute("data-latex-source", source);
  element.contentEditable = "false";

  katex.render(content, element, {
    displayMode,
    throwOnError: false,
  });

  return element;
}

function createEditorContent(value: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const segments = splitMathSegments(value);

  segments.forEach((segment) => {
    if (segment.type === "text") {
      fragment.appendChild(
        document.createTextNode(segment.content)
      );
    } else {
      fragment.appendChild(
        createMathNode(
          segment.source,
          segment.content,
          segment.displayMode
        )
      );
    }
  });

  return fragment;
}

/**
 * Converts editor DOM back into a plain string.
 * Math nodes are serialized using their original LaTeX source.
 */


function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  const latexSource = node.getAttribute("data-latex-source");

  if (latexSource !== null) {
    return latexSource;
  }

  if (node.tagName === "BR") {
    return "\n";
  }

  const isBlock =
    node.tagName === "DIV" || node.tagName === "P";

  let result = "";

  node.childNodes.forEach((child) => {
    result += serializeNode(child);
  });

  if (isBlock) {
    // A block represents a separate line.
    if (node.previousSibling && !result.startsWith("\n")) {
      result = "\n" + result;
    }

    if (!result.endsWith("\n")) {
      result += "\n";
    }
  }

  return result;
}



function getEditorValue(editor: HTMLElement): string {
    return Array.from(editor.childNodes)
    .map((child) => serializeNode(child))
    .join("");
}

export default function RichTextMathEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  disabled = false,
  maxLength = 5000,
  className = "",
  onLimitReached,
}: RichTextMathEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEmpty, setIsEmpty] = useState(!value);

  // Sync external changes without unnecessarily replacing the DOM
  // while the user is typing.
  useEffect(() => {
    const editor = editorRef.current;

    if (!editor) return;

    const currentValue = getEditorValue(editor);

    if (currentValue !== value) {
      editor.replaceChildren(createEditorContent(value));
    }

    setIsEmpty(!value);
  }, [value]);

  function handleInput() {
    const editor = editorRef.current;

    if (!editor) return;

    const content = getEditorValue(editor);

   


    setIsEmpty(!content);
    onChange(content);
  }


function handleBeforeInput(
  event: React.FormEvent<HTMLDivElement>
) {
  const nativeEvent = event.nativeEvent as InputEvent;
  const editor = editorRef.current;


  if (!editor) return;

  // Handle Enter and Shift+Enter ourselves.
  if (
     nativeEvent.data === "\n" ||
    nativeEvent.inputType === "insertParagraph" ||
    nativeEvent.inputType === "insertLineBreak"
  ) {

    event.preventDefault();

    const selection = window.getSelection();

    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) return;

    const selectedLength = selection.toString().length;
    const currentLength = getEditorValue(editor).length;

    const nextLength = currentLength - selectedLength + 1;

    if (nextLength > maxLength) {
      onLimitReached?.();
      return;
    }

    range.deleteContents();

    const newline = document.createTextNode("\n");
    range.insertNode(newline);

    // Place the cursor immediately after the newline.
    range.setStartAfter(newline);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    handleInput();
    return;
  }

  // Preserve the existing maximum-length protection.
  if (typeof nativeEvent.data !== "string") {
    return;
  }

  const selection = window.getSelection();
  const selectedLength =
    selection && !selection.isCollapsed
      ? selection.toString().length
      : 0;

  const currentLength = getEditorValue(editor).length;

  const nextLength =
    currentLength - selectedLength + nativeEvent.data.length;

  if (nextLength > maxLength) {
    event.preventDefault();
    onLimitReached?.();
  }
}


  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault();

    const editor = editorRef.current;

    if (!editor) return;

    // We intentionally support plain-text clipboard content only.
    // External HTML/MathML clipboard conversion is deferred.
    const pastedText = event.clipboardData.getData("text/plain");

    if (!pastedText) return;

    const selection = window.getSelection();

    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);

    if (!editor.contains(range.commonAncestorContainer)) return;

    const selectedLength = selection.toString().length;
    const currentLength = getEditorValue(editor).length;

    const nextLength =
      currentLength - selectedLength + pastedText.length;

    if (nextLength > maxLength) {
      onLimitReached?.();
      return;
    }

    range.deleteContents();

    const fragment = createEditorContent(pastedText);
    const lastNode = fragment.lastChild;

    if (!lastNode) return;

    range.insertNode(fragment);

    // Place the cursor immediately after the pasted content.
    range.setStartAfter(lastNode);
    range.collapse(true);

    selection.removeAllRanges();
    selection.addRange(range);

    handleInput();
  }

    return (
    <div className="relative">
      {isEmpty && !disabled && (
        <div className="pointer-events-none absolute left-3 top-2 text-sm text-muted-foreground">
          {placeholder}
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        role="textbox"
        aria-label={placeholder}
        aria-multiline="true"
        aria-disabled={disabled}
        onInput={handleInput}
        onBeforeInput={handleBeforeInput}
        onPaste={handlePaste}
        className={className}
        style={{
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          textAlign: "left",
        }}
      />
    </div>
  );
}
