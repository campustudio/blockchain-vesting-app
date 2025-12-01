/**
 * MetaMask and Web3 related interface definitions
 */

/**
 * Network information interface
 */
export interface NetworkInfo {
    chainId: string; // Hexadecimal format, e.g., "0x1"
    chainName: string; // Network name, e.g., "Ethereum Mainnet"
    isSupported: boolean; // Whether the network is supported
}

/**
 * Wallet state interface
 */
export interface WalletState {
    address: string | null; // Wallet address
    isConnected: boolean; // Connection status
    network: NetworkInfo | null; // Current network information
}

/**
 * MetaMask error type
 */
export interface MetaMaskError {
    code: number;
    message: string;
}

/**
 * MetaMask Ethereum Provider interface
 */
export interface EthereumProvider {
    isMetaMask?: boolean;
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    on: (event: string, callback: (...args: unknown[]) => void) => void;
    removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
}

/**
 * Extend Window object to include ethereum
 */
declare global {
    interface Window {
        ethereum?: EthereumProvider;
    }
}
