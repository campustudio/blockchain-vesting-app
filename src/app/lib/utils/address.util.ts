/**
 * Address handling utility functions
 */

/**
 * Shorten Ethereum address to readable format
 * @param address Full Ethereum address (e.g., 0x1234567890abcdef1234567890abcdef12345678)
 * @param prefixLength Prefix length to keep (default 6, including '0x')
 * @param suffixLength Suffix length to keep (default 4)
 * @returns Shortened address (e.g., 0x1234...5678)
 *
 * @example
 * shortenAddress('0x1234567890abcdef1234567890abcdef12345678')
 * // Returns: '0x1234...5678'
 */
export function shortenAddress(address: string, prefixLength = 6, suffixLength = 4): string {
    if (!address) {
        return '';
    }

    // Ensure address is long enough
    if (address.length <= prefixLength + suffixLength) {
        return address;
    }

    const prefix = address.substring(0, prefixLength);
    const suffix = address.substring(address.length - suffixLength);

    return `${prefix}...${suffix}`;
}

/**
 * Validate Ethereum address format
 * @param address Address to validate
 * @returns Whether it's a valid Ethereum address format
 */
export function isValidAddress(address: string): boolean {
    // Ethereum address: 0x + 40 hexadecimal characters (total 42 characters)
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
