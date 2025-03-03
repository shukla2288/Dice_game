import { type NextRequest, NextResponse } from "next/server"
import { generateServerSeed, verifyRoll } from "@/lib/provably-fair"

// Store server seeds for verification
// In a real app, this would be in a database
const serverSeeds = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientSeed, nonce } = body

    if (!clientSeed) {
      return NextResponse.json({ error: "Client seed is required" }, { status: 400 })
    }

    // Get or generate server seed
    let serverSeed = serverSeeds.get(clientSeed)
    if (!serverSeed) {
      serverSeed = generateServerSeed()
      serverSeeds.set(clientSeed, serverSeed)
    }

    // Generate roll using provably fair algorithm
    // Add timestamp to ensure randomness on each roll
    const timestamp = Date.now().toString()
    const randomValue = verifyRoll(serverSeed + timestamp, clientSeed, nonce)
    const roll = Math.floor(randomValue * 6) + 1 // 1-6

    // Determine if win (4, 5, or 6)
    const isWin = roll > 3

    return NextResponse.json({
      roll,
      isWin,
      // Only reveal server seed after 100 rolls for security
      serverSeed: nonce >= 100 ? serverSeed : undefined,
      // Hash of server seed for verification
      serverSeedHash: await crypto.subtle.digest("SHA-256", new TextEncoder().encode(serverSeed)).then((hash) =>
        Array.from(new Uint8Array(hash))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
      ),
    })
  } catch (error) {
    console.error("Error processing roll:", error)
    return NextResponse.json({ error: "Failed to process roll" }, { status: 500 })
  }
}

