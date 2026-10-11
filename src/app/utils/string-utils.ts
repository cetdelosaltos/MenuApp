/**
 * String utilities for flexible text search and comparison.
 * Ignores case, diacritics/accents (á, é, í, ó, ú, ü, ñ), and special characters/symbols.
 */

/**
 * Normalizes a string by:
 * 1. Converting to lowercase
 * 2. Decomposing Unicode and removing all diacritical marks (accents, tildes, umlauts)
 * 3. Replacing non-alphanumeric characters with spaces
 * 4. Collapsing consecutive spaces and trimming
 */
export function normalizeText(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritical marks
    .replace(/[^a-z0-9]/g, ' ')       // replace symbols, punctuation, and non-alphanumerics with space
    .replace(/\s+/g, ' ')            // collapse multiple spaces into single space
    .trim();
}

/**
 * Checks if target string matches query string flexibly:
 * - Case-insensitive
 * - Diacritics/accents insensitive (á, é, í, ó, ú, ü, ñ, etc.)
 * - Special characters/punctuation insensitive
 * - Multi-token / multi-word search (each query token must be present in target)
 * - Compact matching (e.g. "cocacola" matching "coca-cola", "extravirgen" matching "extra-virgen")
 */
export function matchesSearch(target: string | null | undefined, query: string | null | undefined): boolean {
  if (!query) return true;
  const normQuery = normalizeText(query);
  if (!normQuery) return true;

  const normTarget = normalizeText(target);
  if (!normTarget) return false;

  // 1. Direct substring match on normalized text
  if (normTarget.includes(normQuery)) {
    return true;
  }

  // 2. Token-based / multi-word search: every word in the query must be found in target
  const queryTokens = normQuery.split(' ').filter(Boolean);
  if (queryTokens.length > 1) {
    const allFound = queryTokens.every(token => normTarget.includes(token));
    if (allFound) {
      return true;
    }
  }

  // 3. Compact matching (ignoring spaces) for hyphenated/compound terms (e.g., "cocacola" vs "coca cola")
  const compactTarget = normTarget.replace(/\s+/g, '');
  const compactQuery = normQuery.replace(/\s+/g, '');
  if (compactTarget === compactQuery || (compactQuery.length >= 4 && compactTarget.includes(compactQuery))) {
    return true;
  }

  return false;
}

/**
 * Checks if two strings are equivalent ignoring case, accents, and special characters.
 * Useful for duplicate detection and exact auto-match.
 */
export function isSameText(a: string | null | undefined, b: string | null | undefined): boolean {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA && !normB) return true;
  if (!normA || !normB) return false;
  return normA === normB || normA.replace(/\s+/g, '') === normB.replace(/\s+/g, '');
}

