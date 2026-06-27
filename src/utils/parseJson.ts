/**
 * Parse seguro de JSON devolvido pela IA.
 * Remove fences ```json ... ``` se existirem antes de fazer JSON.parse.
 */
export function parseAiJson<T>(raw: string): T {
  let cleaned = raw.trim()

  // Remove fences markdown
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '')

  // Remove eventual prefixo de texto antes do primeiro {
  const firstBrace = cleaned.indexOf('{')
  const firstBracket = cleaned.indexOf('[')
  let start = -1
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    start = firstBrace
  } else if (firstBracket !== -1) {
    start = firstBracket
  }
  if (start > 0) cleaned = cleaned.slice(start)

  return JSON.parse(cleaned) as T
}
