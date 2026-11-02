require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// RPC Sepolia public par défaut (peut être surchargé dans .env avec Alchemy / Infura)
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com";
const PRIVATE_KEY = process.env.PRIVATE_KEY ? process.env.PRIVATE_KEY.trim() : "";

const accounts = PRIVATE_KEY.length > 0 
  ? [(PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`)] 
  : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: accounts,
      chainId: 11155111,
    },
  },
};
