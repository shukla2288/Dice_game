🎲 Provably Fair Dice Game

🚀 Overview

This is a simple Provably Fair Dice Game built using Next.js (React) for the frontend and Node.js/Express for the backend. The game allows players to bet an amount and roll a dice (1-6). If the roll is 4, 5, or 6, they win 2x their bet; otherwise, they lose their bet. The fairness is ensured using SHA-256 hashing.

🎮 Game Mechanics

Players enter a bet amount.

Click "Roll Dice" → A random number between 1-6 is generated.

If the roll is 4, 5, or 6, the player wins (2x payout).

If the roll is 1, 2, or 3, the player loses (bet amount deducted).

The player's balance is updated accordingly.

🛠️ Tech Stack

Frontend (Next.js/React)

Next.js 14 – Server-side rendering & API routes.

Tailwind CSS – Modern styling.

Radix UI – UI components.

Recharts – Data visualization (optional).

React Hook Form – Form handling.

Backend (Node.js/Express)

Express.js – API endpoints.

SHA-256 hashing – Provably fair mechanism.

Ethers.js – Web3 integration .

LocalStorage – Store player balance.

📦 Installation & Setup

1️⃣ Clone the Repository

git clone https://github.com/shukla2288/Dice_game.git
cd Dice_game

2️⃣ Install Dependencies

npm install  # or yarn install

3️⃣ Start the Development Server

npm run dev  # or yarn dev

This runs the frontend & backend locally.

🎲 API Endpoint

POST /roll-dice

Request Body:

{
  "betAmount": 100
}

Response:

{
  "roll": 5,
  "win": true,
  "newBalance": 2000,
  "serverHash": "e3b0c44298fc1c14..."
}

roll – The random dice roll (1-6).

win – true if the player wins.

newBalance – Updated player balance.

serverHash – Hash used to verify fairness.

🏆 Web3 Integration (Bonus Feature)

Uses Ethers.js to simulate a crypto wallet balance.



🚀 Deployment

1️⃣ Build the Project

npm run build



Set the build command: npm run build.



📝 License

This project is open-source and free to use. Feel free to modify and expand on it.

🔥 Author

👤 Shukla2288🔗 GitHub
