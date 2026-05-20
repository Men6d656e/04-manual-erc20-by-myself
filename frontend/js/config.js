/**
 * Configuration and ABI for ManualToken
 */

const CONFIG = {
  // IMPORTANT: Replace this with your actual deployed contract address on your target network
  // CONTRACT_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Default Anvil address for first deployed contract
  CONTRACT_ADDRESS: "0xA84abf88F319cc5685d3eb934159d45357e28A7d", // deployed contract address

  // Networks configuration
  NETWORKS: {
    31337: "Anvil Local",
    11155111: "Sepolia Testnet",
    1: "Ethereum Mainnet",
  },
};

const TOKEN_ABI = [
  // Read Functions
  "function name() public view returns (string)",
  "function symbol() public view returns (string)",
  "function decimals() public view returns (uint8)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address _owner) public view returns (uint256 balance)",
  "function allowance(address _owner, address _spender) public view returns (uint256 remaining)",

  // Write Functions
  "function transfer(address _to, uint256 _value) public returns (bool success)",
  "function approve(address _spender, uint256 _value) public returns (bool success)",
  "function transferFrom(address _from, address _to, uint256 _value) public returns (bool success)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];
