# 🚀 Manual ERC-20 Token & dApp Workspace

This repository features a fully manual implementation of the ERC-20 token standard written in Solidity from scratch—without relying on any external libraries like OpenZeppelin. Paired with a beautiful, dark-themed vanilla JavaScript frontend, this project demonstrates core token mechanics, state management, and modern Web3 frontend integration.

## 🌟 Key Features

*   **Pure Solidity Implementation:** A completely manual ERC-20 contract (`ManualToken.sol`) demonstrating a fundamental understanding of Ethereum token standards.
*   **Fully Standard Compliant:** Implements all core ERC-20 functions (`transfer`, `approve`, `transferFrom`, `balanceOf`, `allowance`) and standard events.
*   **Vanilla JS Frontend:** A lightweight, professional dashboard utilizing **Ethers.js v6** for direct blockchain interaction without complex frontend frameworks.
*   **"Terminal Elegance" UI:** Dark-themed, glassmorphic design providing a premium developer experience.
*   **Comprehensive Testing:** Fully tested using **Foundry** to guarantee robust smart contract logic.
*   **Make Automation:** Easy-to-use Makefile targets for testing, compiling, and deploying to Anvil or Sepolia.

---

## 🏗️ Project Structure

```text
.
├── Makefile                   # Automation commands for tests and deployments
├── foundry.toml               # Foundry configuration
├── src/
│   └── ManualToken.sol        # Pure, manual ERC-20 contract
├── script/
│   └── DeployManualToken.s.sol# Foundry deployment script
├── test/
│   └── ManualToken.t.sol      # Foundry test cases
└── frontend/
    ├── index.html             # Landing Page
    ├── app.html               # dApp Dashboard
    ├── css/style.css          # Unified dark-theme styling
    └── js/
        ├── config.js          # ABI & Contract configurations
        └── app.js             # Vanilla JS Ethers.js integration
```

---

## 🛠️ Quick Start Guide

### 1. Prerequisites
*   [Foundry](https://book.getfoundry.sh/) installed.
*   Node.js (optional, for local HTTP serving).
*   MetaMask (or compatible Web3 wallet) installed in your browser.

### 2. Local Setup & Testing

Compile the smart contracts:
```bash
make build
```

Run the exhaustive test suite:
```bash
make test
```

### 3. Deploying to Local Anvil Node

1. Open a new terminal window and start the local Anvil chain:
   ```bash
   anvil
   ```
2. In your project directory, deploy the contract locally:
   ```bash
   make deploy-anvil
   ```
3. Copy the deployed contract address from the terminal output and paste it into `frontend/js/config.js` under `CONTRACT_ADDRESS`.

### 4. Deploying to Sepolia Testnet

Create a `.env` file in the root directory:
```env
PRIVATE_KEY=your_wallet_private_key
SEPOLIA_RPC_URL=your_alchemy_or_infura_rpc_url
ETHERSCAN_API_KEY=your_etherscan_api_key
```

Run the deployment target:
```bash
make deploy-sepolia
```

### 5. Running the Frontend

To avoid CORS issues and properly test wallet injections, serve the frontend directory via a local web server:

Using Python:
```bash
python3 -m http.server 8000 --directory frontend
```
Navigate to `http://localhost:8000` in your web browser. Ensure your wallet network matches your deployment target (Localhost 8545 or Sepolia)!

---

## 🛡️ License

This project is licensed under the **MIT License**.
