/**
 * Supported Ethereum network configurations
 */

/**
 * Supported network mapping
 * Key: Chain ID (hexadecimal format)
 * Value: Network name
 */
/* eslint-disable @typescript-eslint/naming-convention */
export const SUPPORTED_NETWORKS: Record<string, string> = {
    '0x1': 'Ethereum Mainnet',
    '0x5': 'Goerli Testnet',
    '0xaa36a7': 'Sepolia Testnet',
    '0x89': 'Polygon Mainnet',
    '0x13881': 'Mumbai Testnet',
    '0x38': 'BSC Mainnet',
    '0x61': 'BSC Testnet',
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * Check if network is supported
 * @param chainId Network Chain ID (hexadecimal)
 * @returns Whether the network is supported
 */
export function isNetworkSupported(chainId: string): boolean {
    return chainId in SUPPORTED_NETWORKS;
}

/**
 * Get network name
 * @param chainId Network Chain ID (hexadecimal)
 * @returns Network name, or 'Unsupported Network' if not supported
 */
export function getNetworkName(chainId: string): string {
    return SUPPORTED_NETWORKS[chainId] || 'Unsupported Network';
}
