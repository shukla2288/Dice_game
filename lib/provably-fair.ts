/**
 * Generates a random server seed
 * In a real implementation, this would be generated on the server
 */
export function generateServerSeed(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Generates a random client seed
 */
export function generateClientSeed(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Hashes the input using SHA-256
 */
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Verifies a roll using the provably fair algorithm
 * Returns a number between 0 and 1
 */
export function verifyRoll(serverSeed: string, clientSeed: string, nonce: number): number {
  // Add timestamp to ensure randomness
  const timestamp = Date.now().toString()
  const combinedSeed = serverSeed + clientSeed + nonce.toString() + timestamp

  // Use a more robust hash function
  let hash = 0
  for (let i = 0; i < combinedSeed.length; i++) {
    const char = combinedSeed.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }

  // Normalize to 0-1 range
  return Math.abs((hash % 10000) / 10000)
}

/**
 * Verifies that a roll is fair
 */
export function verifyFairness(serverSeed: string, clientSeed: string, nonce: number, roll: number): boolean {
  const expectedRoll = Math.floor(verifyRoll(serverSeed, clientSeed, nonce) * 6) + 1
  return expectedRoll === roll
}

