
export interface TextSegment {
  type: "text";
  content: string;
}

export interface MathSegment {
  type: "math";
  content: string;
  source: string;
  displayMode: boolean;
}

export type MathEditorSegment = TextSegment | MathSegment;

/**
 * Splits text into ordinary text and LaTeX expressions.
 *
 * Examples:
 * "The rate is $k[A]^2$"
 * becomes:
 * - Text: "The rate is "
 * - Math: "$k[A]^2$"
 *
 * The original LaTeX source is preserved for database storage.
 */
export function splitMathSegments(
  text: string
): MathEditorSegment[] {
  const segments: MathEditorSegment[] = [];

  const pattern = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;

  let lastIndex = 0;

  for (const match of text.matchAll(pattern)) {
    const source = match[0];
    const index = match.index ?? 0;

    // Preserve ordinary text before the equation.
    if (index > lastIndex) {
      segments.push({
        type: "text",
        content: text.slice(lastIndex, index),
      });
    }

    const displayMode = source.startsWith("$$");

    segments.push({
      type: "math",
      content: displayMode
        ? source.slice(2, -2)
        : source.slice(1, -1),
      source,
      displayMode,
    });

    lastIndex = index + source.length;
  }

  // Preserve any remaining ordinary text.
  if (lastIndex < text.length) {
    segments.push({
      type: "text",
      content: text.slice(lastIndex),
    });
  }

  return segments;
}
