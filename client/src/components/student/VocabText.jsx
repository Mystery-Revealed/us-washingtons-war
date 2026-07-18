// VocabText.jsx — the tap-for-plain-words vocabulary layer (spec §2). Any of
// the four required terms, wherever it appears in student-visible text, is
// underlined and made tappable; tapping reveals a 5th-grade-level definition.
//
// It underlines the FIRST occurrence of each distinct term within a given block
// of text (a plain, render-stable rule — no cross-render state to glitch). A
// term that returns in a later campaign is underlined again there too.

import { useState } from 'react';

// Plain-words definitions (spec §2), at a 5th grade reading level.
export const VOCAB = {
  siege:     { term: 'siege',     def: 'Surrounding a place to starve it out.' },
  militia:   { term: 'militia',   def: 'Part-time citizen soldiers, not full-time trained troops.' },
  mercenary: { term: 'mercenary', def: 'A soldier paid to fight for a foreign country (the Hessians).' },
  forage:    { term: 'forage',    def: 'Searching the countryside for food and supplies.' },
};

// Ordered so the alternation is unambiguous — no term is a prefix of another here.
const PATTERNS = [
  { key: 'siege',     re: /siege/i },
  { key: 'militia',   re: /militia/i },
  { key: 'mercenary', re: /mercenar(?:y|ies)/i },
  { key: 'forage',    re: /forag(?:e|ing)/i },
];

const COMBINED = new RegExp(PATTERNS.map((p) => `(?:${p.re.source})`).join('|'), 'gi');

function keyForMatch(matched) {
  const lower = matched.toLowerCase();
  if (lower.startsWith('siege')) return 'siege';
  if (lower.startsWith('militia')) return 'militia';
  if (lower.startsWith('mercenar')) return 'mercenary';
  if (lower.startsWith('forag')) return 'forage';
  return null;
}

export default function VocabText({ text, className }) {
  if (!text) return null;
  const nodes = [];
  const usedKeys = new Set();
  let last = 0;
  let m;
  COMBINED.lastIndex = 0;
  while ((m = COMBINED.exec(text)) !== null) {
    const matched = m[0];
    const key = keyForMatch(matched);
    // Only the first occurrence of each distinct term in this block is a bubble.
    if (key && !usedKeys.has(key)) {
      usedKeys.add(key);
      if (m.index > last) nodes.push(text.slice(last, m.index));
      nodes.push(<VocabBubble key={`${key}-${m.index}`} matched={matched} entry={VOCAB[key]} />);
      last = m.index + matched.length;
    }
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <span className={className}>{nodes}</span>;
}

function VocabBubble({ matched, entry }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="vocab-wrap">
      <button
        type="button"
        className="vocab-term"
        aria-expanded={open}
        title={entry.def}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
      >
        {matched}
      </button>
      {open && (
        <span className="vocab-bubble" role="tooltip">
          <b>{entry.term}</b> — {entry.def}
          <button type="button" className="vocab-close" aria-label="Close" onClick={(e) => { e.stopPropagation(); setOpen(false); }}>×</button>
        </span>
      )}
    </span>
  );
}
