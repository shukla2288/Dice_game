"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function BettingInterface() {
  const [mode, setMode] = useState<"Manual" | "Auto">("Manual")
  const [betAmount, setBetAmount] = useState("0.00")
  const [profitOnWin, setProfitOnWin] = useState("0.00")
  const [sliderValue, setSliderValue] = useState(68.71)
  const [multiplier, setMultiplier] = useState("2.0000")
  const [rollOver, setRollOver] = useState("50.50")
  const [winChance, setWinChance] = useState("49.5000")

  const presetValues = [88.02, 58.35, 68.71]

  return (
    <div className="flex h-screen bg-[#1a2634] text-white">
      {/* Left Panel */}
      <div className="w-[400px] p-6 border-r border-gray-700">
        {/* Mode Toggle */}
        <div className="bg-[#1e2c3a] rounded-full p-1 flex mb-6">
          <button
            className={`flex-1 py-2 px-4 rounded-full text-center ${mode === "Manual" ? "bg-[#2a3a4a]" : ""}`}
            onClick={() => setMode("Manual")}
          >
            Manual
          </button>
          <button
            className={`flex-1 py-2 px-4 rounded-full text-center ${mode === "Auto" ? "bg-[#2a3a4a]" : ""}`}
            onClick={() => setMode("Auto")}
          >
            Auto
          </button>
          <button className="ml-2 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 3L3 21"></path>
              <path d="M21 21L3 3"></path>
            </svg>
          </button>
        </div>

        {/* Bet Amount */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Bet Amount</span>
            <span className="text-gray-400">₹0.00</span>
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
            <button className="bg-[#1e2c3a] px-4 border-l border-gray-700 text-gray-300">½</button>
            <button className="bg-[#1e2c3a] px-4 border-l border-gray-700 text-gray-300">2×</button>
          </div>
        </div>

        {/* Profit on Win */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">Profit on Win</span>
            <span className="text-gray-400">₹0.00</span>
          </div>
          <div className="relative">
            <Input
              type="text"
              value={profitOnWin}
              onChange={(e) => setProfitOnWin(e.target.value)}
              className="bg-[#1e2c3a] border-none h-12 pl-4 pr-10 text-white"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-yellow-400 text-lg">₹</span>
            </div>
          </div>
        </div>

        {/* Bet Button */}
        <Button className="w-full h-14 text-lg font-medium bg-[#5ceb71] hover:bg-[#4bd95f] text-black">Bet</Button>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 flex flex-col">
        {/* Top Buttons */}
        <div className="flex justify-end mb-20">
          {presetValues.map((value) => (
            <button
              key={value}
              onClick={() => setSliderValue(value)}
              className={`ml-2 px-6 py-2 rounded-full bg-[#5ceb71] text-black font-medium`}
            >
              {value.toFixed(2)}
            </button>
          ))}
        </div>

        {/* Slider Section */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Slider Labels */}
          <div className="flex justify-between mb-4">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>

          {/* Custom Slider */}
          <div className="relative h-16 mb-20">
            {/* Slider Track */}
            <div className="absolute inset-0 bg-[#2a3a4a] rounded-full overflow-hidden">
              {/* Red Section */}
              <div className="absolute h-full bg-[#ff3b5c]" style={{ width: `${sliderValue}%` }}></div>
              {/* Green Section */}
              <div className="absolute h-full bg-[#5ceb71]" style={{ left: `${sliderValue}%`, right: 0 }}></div>
            </div>

            {/* Slider Handle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-[#4a7bff] rounded flex items-center justify-center text-white"
              style={{ left: `calc(${sliderValue}% - 24px)` }}
            >
              |||
            </div>

            {/* Value Indicator */}
            <div
              className="absolute -top-16 transform -translate-x-1/2 bg-white text-[#1a2634] font-bold text-xl p-4 rounded-lg"
              style={{ left: `${sliderValue}%` }}
            >
              <div className="relative">
                {sliderValue.toFixed(2)}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="grid grid-cols-3 gap-4 mt-auto">
            <div>
              <div className="text-gray-400 mb-2">Multiplier</div>
              <div className="relative">
                <Input
                  type="text"
                  value={multiplier}
                  onChange={(e) => setMultiplier(e.target.value)}
                  className="bg-[#1e2c3a] border-none h-12 pl-4 pr-10 text-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">x</div>
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-2">Roll Over</div>
              <div className="relative">
                <Input
                  type="text"
                  value={rollOver}
                  onChange={(e) => setRollOver(e.target.value)}
                  className="bg-[#1e2c3a] border-none h-12 pl-4 text-white"
                />
                <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                    <path d="M16 21h5v-5"></path>
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-2">Win Chance</div>
              <div className="relative">
                <Input
                  type="text"
                  value={winChance}
                  onChange={(e) => setWinChance(e.target.value)}
                  className="bg-[#1e2c3a] border-none h-12 pl-4 pr-10 text-white"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

