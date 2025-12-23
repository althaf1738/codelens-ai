import { chunkText } from "./utils";

// Placeholder embedding generator. Swap with real model call (OpenAI, Voyage, etc.).
export function embedText(text: string): number[] {
  const parts = chunkText(text, 16);
  const vector = new Array(32).fill(0);
  parts.forEach((part, idx) => {
    const hash = Array.from(part).reduce((sum, ch, i) => sum + ch.charCodeAt(0) * (i + 1), 0);
    vector[idx % vector.length] += hash % 997;
  });
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}
