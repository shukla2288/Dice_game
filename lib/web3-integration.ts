// Optional Web3 integration
import { ethers } from "ethers"

// Check if window is defined (browser) or not (SSR)
const isBrowser = typeof window !== "undefined"

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed")
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
    return accounts[0]
  } catch (error) {
    console.error("Error connecting to MetaMask", error)
    throw error
  }
}

/**
 * Get current wallet balance
 */
export async function getWalletBalance(address: string) {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed")
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error("Error getting balance", error)
    throw error
  }
}

/**
 * Listen for account changes
 */
export function listenForAccountChanges(callback: (accounts: string[]) => void) {
  if (isBrowser && window.ethereum) {
    window.ethereum.on("accountsChanged", callback)
    return () => {
      window.ethereum.removeListener("accountsChanged", callback)
    }
  }
  return () => {}
}

/**
 * Listen for chain changes
 */
export function listenForChainChanges(callback: () => void) {
  if (isBrowser && window.ethereum) {
    window.ethereum.on("chainChanged", callback)
    return () => {
      window.ethereum.removeListener("chainChanged", callback)
    }
  }
  return () => {}
}

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled() {
  return isBrowser && !!window.ethereum
}

// Add TypeScript interface for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

