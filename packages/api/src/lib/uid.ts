const DEFAULT_ALPHABET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

/**
 * Branded type for prefixes. Use a type alias or branded string in your codebase
 * to mirror Go's `Prefix` named type.
 */
export type Prefix = string

/**
 * Generates a prefixed random identifier.
 *
 * The identifier consists of the prefix, an underscore separator, and random
 * alphanumeric characters. Default random portion is 8 characters; pass a
 * custom length to override.
 *
 * Pass an empty prefix to generate an identifier without a prefix.
 *
 * Uses Math.random() which is NOT cryptographically secure. Do not use for
 * API keys, tokens, or security-sensitive purposes.
 */
export function newId(prefix: Prefix, length = 8): string {
  if (length === 0 && prefix === "") {
    return ""
  }

  const randomPart = generateRandom(length)

  if (prefix === "") {
    return randomPart
  }

  return `${prefix}_${randomPart}`
}

function generateRandom(n: number): string {
  let result = ""
  // oxlint-disable-next-line no-plusplus
  for (let i = 0; i < n; i++) {
    result += DEFAULT_ALPHABET.charAt(
      Math.floor(Math.random() * DEFAULT_ALPHABET.length)
    )
  }
  return result
}
