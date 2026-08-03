import React from 'react';

const FURIGANA_REGEX = /([^[]+)\[([^\]]+)\]/g;

export function parseFurigana(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  FURIGANA_REGEX.lastIndex = 0;

  while ((match = FURIGANA_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const kanji = match[1];
    const reading = match[2];
    nodes.push(
      <ruby key={`ruby-${match.index}`} className="ruby-furigana">
        {kanji}
        <rt>{reading}</rt>
      </ruby>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

export function hasFurigana(text: string): boolean {
  return /[^[]+\[[^\]]+\]/.test(text);
}
