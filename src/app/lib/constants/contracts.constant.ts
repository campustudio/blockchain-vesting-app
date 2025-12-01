/**
 * Smart Contract Addresses and Configuration
 */

// Import ABIs
import TokenVestingABI from '@lib/contracts/TokenVesting.json';
import MockTokenABI from '@lib/contracts/MockToken.json';

// Contract Addresses (from deployment)
export const CONTRACT_ADDRESSES = {
    vesting: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    tokens: {
        PROJ: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
        TEAM: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        EARLY: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
        ADVISOR: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
        SEED: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    },
} as const;

// Contract ABIs
export const CONTRACT_ABIS = {
    vesting: TokenVestingABI.abi,
    token: MockTokenABI.abi,
} as const;

// Network Configuration
export const NETWORK_CONFIG = {
    local: {
        chainId: '0x7a69', // 31337 in hex
        rpcUrl: 'http://127.0.0.1:8545',
        name: 'Hardhat Local',
    },
    sepolia: {
        chainId: '0xaa36a7', // 11155111 in hex
        rpcUrl: 'https://rpc.sepolia.org',
        name: 'Sepolia Testnet',
    },
} as const;
