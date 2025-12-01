/**
 * Vesting Platform Type Definitions
 */

/**
 * Token information interface
 */
export interface TokenInfo {
    symbol: string;         // Token symbol (e.g., "PROJ")
    name: string;           // Token name (e.g., "Project Token")
    address: string;        // Token contract address
    decimals: number;       // Token decimals
}

/**
 * Vesting schedule interface
 */
export interface VestingSchedule {
    id: string;                     // Unique identifier
    beneficiary: string;            // Beneficiary wallet address
    token: TokenInfo;               // Token information
    totalAmount: string;            // Total vesting amount (in wei/smallest unit)
    startTime: number;              // Start timestamp (Unix)
    cliff: number;                  // Cliff period in seconds
    duration: number;               // Total vesting duration in seconds
    released: string;               // Already released amount
    revocable: boolean;             // Whether the vesting can be revoked
    revoked: boolean;               // Whether the vesting has been revoked
    status: VestingStatus;          // Current status
}

/**
 * Vesting status enum
 */
export enum VestingStatus {
    PENDING = 'pending',            // Not started
    ACTIVE = 'active',              // Currently vesting
    COMPLETED = 'completed',        // Fully vested
    REVOKED = 'revoked'             // Revoked by admin
}

/**
 * Vesting statistics interface
 */
export interface VestingStats {
    totalLocked: string;            // Total locked amount
    totalVested: string;            // Total vested (claimable)
    totalClaimed: string;           // Total already claimed
    totalRemaining: string;         // Total still locked
    activeSchedules: number;        // Number of active schedules
    completedSchedules: number;     // Number of completed schedules
}

/**
 * Vesting release calculation result
 */
export interface VestingRelease {
    total: string;                  // Total vesting amount
    vested: string;                 // Amount vested so far
    claimed: string;                // Amount already claimed
    claimable: string;              // Amount available to claim now
    locked: string;                 // Amount still locked
    progress: number;               // Vesting progress percentage (0-100)
}

/**
 * Claim transaction interface
 */
export interface ClaimTransaction {
    id: string;                     // Transaction hash
    vestingId: string;              // Related vesting schedule ID
    amount: string;                 // Claimed amount
    timestamp: number;              // Claim timestamp
    status: TransactionStatus;      // Transaction status
}

/**
 * Transaction status enum
 */
export enum TransactionStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    FAILED = 'failed'
}
