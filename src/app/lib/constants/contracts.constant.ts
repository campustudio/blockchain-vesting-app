/**
 * Smart Contract Addresses and Configuration
 */

// Import ABIs
import TokenVestingABI from '@lib/contracts/TokenVesting.json';
import MockTokenABI from '@lib/contracts/MockToken.json';

// Contract Addresses by Network
export const CONTRACT_ADDRESSES = {
    // Hardhat Local Network (chainId: 0x7a69 / 31337)
    local: {
        vesting: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
        tokens: {
            PROJ: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
            TEAM: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
            EARLY: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
            ADVISOR: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
            SEED: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
        },
    },
    // Sepolia Testnet (chainId: 0xaa36a7 / 11155111)
    // Using Optimized TokenVesting Contract with Diverse Test Data
    sepolia: {
        vesting: '0x186FBa7B212C5aCCAe3f264178f28922080Bf5a5', // Optimized version
        tokens: {
            PROJ: '0x10FDc7A86a2EB3864b18e26B5a204134DD85Cb1c',
            TEAM: '', // Not deployed yet
            EARLY: '', // Not deployed yet
            ADVISOR: '', // Not deployed yet
            SEED: '', // Not deployed yet
        },
    },
} as const;

// Get contract addresses for current network
export function getContractAddresses(chainId: string) {
    if (chainId === '0x7a69' || chainId === '31337') {
        return CONTRACT_ADDRESSES.local;
    } else if (chainId === '0xaa36a7' || chainId === '11155111') {
        return CONTRACT_ADDRESSES.sepolia;
    }
    // Default to local for development
    return CONTRACT_ADDRESSES.local;
}

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
