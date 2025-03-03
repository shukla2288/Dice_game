"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { generateClientSeed } from "@/lib/provably-fair"
import {
  connectWallet,
  getWalletBalance,
  isMetaMaskInstalled,
  listenForAccountChanges,
  listenForChainChanges,
} from "@/lib/web3-integration"

const INITIAL_BALANCE = 1000

export default function DiceGame() {
  const [betAmount, setBetAmount] = useState("10.00")
  const [balance, setBalance] = useState(INITIAL_BALANCE)
  const [isRolling, setIsRolling] = useState(false)
  const [lastRoll, setLastRoll] = useState<number | null>(null)
  const [clientSeed, setClientSeed] = useState("")
  const [serverSeedHash, setServerSeedHash] = useState("")
  const [nonce, setNonce] = useState(0)
  const [gameHistory, setGameHistory] = useState<
    Array<{
      roll: number
      bet: number
      win: boolean
      nonce: number
    }>
  >([])
  const [walletAddress, setWalletAddress] = useState("")
  const [walletBalance, setWalletBalance] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Load balance from localStorage
    const savedBalance = localStorage.getItem("diceGameBalance")
    if (savedBalance) {
      setBalance(Number.parseFloat(savedBalance))
    }

    // Initialize client seed
    setClientSeed(generateClientSeed())

    // Check if wallet is already connected
    const checkWalletConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            const address = accounts[0]
            setWalletAddress(address)
            const balance = await getWalletBalance(address)
            setWalletBalance(balance)
          }
        } catch (error) {
          console.error("Error checking wallet connection:", error)
        }
      }
    }

    checkWalletConnection()
  }, [])

  useEffect(() => {
    // Save balance to localStorage whenever it changes
    localStorage.setItem("diceGameBalance", balance.toString())
  }, [balance])

  const handleRoll = async () => {
    const betValue = Number.parseFloat(betAmount)

    // Validate bet amount
    if (isNaN(betValue) || betValue <= 0) {
      toast({
        title: "Invalid bet amount",
        description: "Please enter a valid bet amount",
        variant: "destructive",
      })
      return
    }

    // Check if player has enough balance
    if (betValue > balance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough balance for this bet",
        variant: "destructive",
      })
      return
    }

    setIsRolling(true)

    try {
      // Add a small random delay to simulate dice rolling
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 500 + 500))

      // Call the backend API to get the roll result
      const response = await fetch("/api/roll-dice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientSeed,
          nonce,
          // Add timestamp to ensure randomness
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get roll result")
      }

      const result = await response.json()
      const roll = result.roll
      setLastRoll(roll)
      setServerSeedHash(result.serverSeedHash)

      // Determine win/loss
      const isWin = roll >= 4 // Win on 4, 5, or 6
      const newBalance = isWin ? balance + betValue : balance - betValue

      setBalance(newBalance)

      // Update game history
      setGameHistory((prev) => [
        {
          roll,
          bet: betValue,
          win: isWin,
          nonce,
        },
        ...prev.slice(0, 9), // Keep only last 10 rolls
      ])

      // Increment nonce
      setNonce((prev) => prev + 1)

      // Show result toast
      toast({
        title: isWin ? "You Won!" : "You Lost",
        description: `You rolled a ${roll}. ${isWin ? `You won $${betValue}` : `You lost $${betValue}`}`,
        variant: isWin ? "default" : "destructive",
      })

      // After 100 rolls, generate new client seed
      if (nonce >= 99) {
        setClientSeed(generateClientSeed())
        setNonce(0)
      }
    } catch (error) {
      console.error("Error rolling dice:", error)
      toast({
        title: "Error",
        description: "Something went wrong while rolling the dice",
        variant: "destructive",
      })
    } finally {
      setIsRolling(false)
    }
  }

  const handleHalfBet = () => {
    const currentBet = Number.parseFloat(betAmount)
    if (!isNaN(currentBet)) {
      setBetAmount((currentBet / 2).toFixed(2))
    }
  }

  const handleDoubleBet = () => {
    const currentBet = Number.parseFloat(betAmount)
    if (!isNaN(currentBet)) {
      const newBet = currentBet * 2
      if (newBet <= balance) {
        setBetAmount(newBet.toFixed(2))
      } else {
        setBetAmount(balance.toFixed(2))
      }
    }
  }

  const handleConnectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: "MetaMask not detected",
        description: "Please install MetaMask to use this feature",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    try {
      const address = await connectWallet()
      setWalletAddress(address)
      const balance = await getWalletBalance(address)
      setWalletBalance(balance)
      toast({
        title: "Wallet Connected",
        description: `Address: ${address.slice(0, 6)}...${address.slice(-4)}`,
      })
    } catch (error) {
      console.error("Error connecting wallet:", error)
      toast({
        title: "Failed to connect wallet",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnectWallet = useCallback(() => {
    setWalletAddress("")
    setWalletBalance("")
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }, [])

  useEffect(() => {
    if (!walletAddress) return

    const removeAccountsListener = listenForAccountChanges((accounts) => {
      if (accounts.length === 0) {
        handleDisconnectWallet()
      } else if (accounts[0] !== walletAddress) {
        setWalletAddress(accounts[0])
        getWalletBalance(accounts[0]).then(setWalletBalance).catch(console.error)
      }
    })

    const removeChainListener = listenForChainChanges(() => {
      getWalletBalance(walletAddress).then(setWalletBalance).catch(console.error)
    })

    return () => {
      removeAccountsListener()
      removeChainListener()
    }
  }, [walletAddress, handleDisconnectWallet])

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#1a2634] text-white">
      {/* Left Panel */}
      <div className="w-full md:w-[400px] p-6 border-r border-gray-700">
        {/* Balance Display */}
        <div className="mb-6 text-center">
          <h2 className="text-gray-400 mb-1">Balance</h2>
          <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
        </div>

        {/* Bet Amount */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Bet Amount</span>
            <span className="text-gray-400">₹{Number.parseFloat(betAmount).toFixed(2)}</span>
          </div>
          <div className="flex">
            <div className="relative flex-grow">
              <Input
                type="text"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="bg-[#1e2c3a] border-none h-12 pl-4 pr-10 text-white"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-yellow-400 text-lg">₹</span>
              </div>
            </div>
            <button className="bg-[#1e2c3a] px-4 border-l border-gray-700 text-gray-300" onClick={handleHalfBet}>
              ½
            </button>
            <button className="bg-[#1e2c3a] px-4 border-l border-gray-700 text-gray-300" onClick={handleDoubleBet}>
              2×
            </button>
          </div>
        </div>

        {/* Roll Button */}
        <Button
          className="w-full h-14 text-lg font-medium bg-[#5ceb71] hover:bg-[#4bd95f] text-black"
          onClick={handleRoll}
          disabled={isRolling}
        >
          {isRolling ? "Rolling..." : "Roll Dice"}
        </Button>

        {/* Last Roll Display */}
        {lastRoll !== null && (
          <div className="mt-6 text-center">
            <h3 className="text-gray-400 mb-2">Last Roll</h3>
            <div className={`text-4xl font-bold ${lastRoll >= 4 ? "text-green-500" : "text-red-500"}`}>{lastRoll}</div>
            <div className="mt-2 text-sm text-gray-400">{lastRoll >= 4 ? "You Won!" : "You Lost"}</div>
          </div>
        )}

        {/* Provably Fair Info */}
        <div className="mt-6 p-4 bg-[#1e2c3a] rounded-lg">
          <h3 className="font-medium mb-2">Provably Fair</h3>
          <div className="text-xs text-gray-400 mb-2">
            <div className="flex justify-between mb-1">
              <span>Server Seed Hash:</span>
            </div>
            <div className="truncate bg-[#2a3a4a] p-2 rounded">{serverSeedHash || "Not available yet"}</div>
          </div>
          <div className="text-xs text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Client Seed:</span>
            </div>
            <div className="truncate bg-[#2a3a4a] p-2 rounded">{clientSeed}</div>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <span>Nonce: {nonce}</span>
          </div>
          <div className="mt-2 text-xs text-gray-400">
            <p>
              The game uses a provably fair system. The server seed is hashed and combined with your client seed and
              nonce to generate each roll. You can verify the fairness of each roll after 100 games when the server seed
              is revealed.
            </p>
          </div>
        </div>

        {/* Web3 Integration */}
        <div className="mt-6">
          {!walletAddress ? (
            <Button className="w-full" onClick={handleConnectWallet} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          ) : (
            <>
              <div className="mb-2 text-sm">
                <p className="text-gray-400">
                  Address:{" "}
                  <span className="text-white">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                </p>
                <p className="text-gray-400">
                  Balance: <span className="text-white">{walletBalance} ETH</span>
                </p>
              </div>
              <Button className="w-full" onClick={handleDisconnectWallet}>
                Disconnect Wallet
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Dice Representation */}
        <div className="flex justify-center items-center mb-8">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              className={`w-16 h-16 m-2 rounded-lg flex items-center justify-center text-2xl font-bold
                ${num >= 4 ? "bg-green-500" : "bg-red-500"}`}
            >
              {num}
            </div>
          ))}
        </div>

        {/* Game Rules */}
        <div className="mb-8 text-center">
          <h3 className="text-xl font-bold mb-2">Game Rules</h3>
          <p>Roll 4, 5, or 6 to win. Roll 1, 2, or 3 to lose.</p>
          <p>Winning pays 2x your bet.</p>
        </div>

        {/* Game History */}
        {gameHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-medium mb-4">Game History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-4">Roll</th>
                    <th className="text-left py-2 px-4">Bet</th>
                    <th className="text-left py-2 px-4">Result</th>
                    <th className="text-left py-2 px-4">Nonce</th>
                  </tr>
                </thead>
                <tbody>
                  {gameHistory.map((game, index) => (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="py-2 px-4">{game.roll}</td>
                      <td className="py-2 px-4">₹{game.bet.toFixed(2)}</td>
                      <td className={`py-2 px-4 ${game.win ? "text-green-500" : "text-red-500"}`}>
                        {game.win ? "Win" : "Loss"}
                      </td>
                      <td className="py-2 px-4">{game.nonce}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}

