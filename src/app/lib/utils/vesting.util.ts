/**
 * Vesting calculation utility functions
 */

import type { VestingRelease, VestingSchedule, VestingStatus } from '@lib/interfaces/vesting.interface';
import { ethers } from 'ethers';

/**
 * Calculate vesting release amounts at current time
 * @param schedule Vesting schedule
 * @param currentTime Current timestamp (Unix seconds)
 * @returns Vesting release calculation result
 */
export function calculateVestingRelease(schedule: VestingSchedule, currentTime: number): VestingRelease {
    const { totalAmount, startTime, cliff, duration, released } = schedule;

    // totalAmount and released are already in wei format, just convert to BigInt
    const totalAmountWei = BigInt(totalAmount);
    const releasedWei = BigInt(released);

    // If current time is before start + cliff, nothing is vested
    if (currentTime < startTime + cliff) {
        return {
            total: ethers.utils.formatUnits(totalAmountWei, schedule.token.decimals),
            vested: '0',
            claimed: ethers.utils.formatUnits(releasedWei, schedule.token.decimals),
            claimable: '0',
            locked: ethers.utils.formatUnits(totalAmountWei, schedule.token.decimals),
            progress: 0,
        };
    }

    // If current time is after vesting end, everything is vested
    if (currentTime >= startTime + duration) {
        const claimableWei = totalAmountWei - releasedWei;
        return {
            total: ethers.utils.formatUnits(totalAmountWei, schedule.token.decimals),
            vested: ethers.utils.formatUnits(totalAmountWei, schedule.token.decimals),
            claimed: ethers.utils.formatUnits(releasedWei, schedule.token.decimals),
            claimable: ethers.utils.formatUnits(claimableWei, schedule.token.decimals),
            locked: '0',
            progress: 100,
        };
    }

    // Calculate vested amount based on time elapsed
    const timeElapsed = currentTime - startTime;
    const vestedWei = (totalAmountWei * BigInt(timeElapsed)) / BigInt(duration);
    const claimableWei = vestedWei - releasedWei;
    const lockedWei = totalAmountWei - vestedWei;
    const progress = (timeElapsed / duration) * 100;

    return {
        total: ethers.utils.formatUnits(totalAmountWei, schedule.token.decimals),
        vested: ethers.utils.formatUnits(vestedWei, schedule.token.decimals),
        claimed: ethers.utils.formatUnits(releasedWei, schedule.token.decimals),
        claimable: ethers.utils.formatUnits(claimableWei > 0n ? claimableWei : 0n, schedule.token.decimals),
        locked: ethers.utils.formatUnits(lockedWei, schedule.token.decimals),
        progress: Math.min(progress, 100),
    };
}

/**
 * Determine vesting status based on current time
 * @param schedule Vesting schedule
 * @param currentTime Current timestamp (Unix seconds)
 * @returns Vesting status
 */
export function getVestingStatus(schedule: VestingSchedule, currentTime: number): VestingStatus {
    if (schedule.revoked) {
        return 'revoked' as VestingStatus;
    }

    if (currentTime < schedule.startTime) {
        return 'pending' as VestingStatus;
    }

    if (currentTime >= schedule.startTime + schedule.duration) {
        return 'completed' as VestingStatus;
    }

    return 'active' as VestingStatus;
}

/**
 * Format timestamp to readable date string
 * @param timestamp Unix timestamp in seconds
 * @returns Formatted date string
 */
export function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format duration in seconds to readable string
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
    }
    if (months > 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
    }
    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''}`;
    }
    return 'Less than a day';
}

/**
 * Format token amount with proper decimals
 * @param amount Amount in wei/smallest unit
 * @param decimals Token decimals
 * @param displayDecimals Number of decimals to display (default 2)
 * @returns Formatted amount string
 */
export function formatTokenAmount(amount: string, decimals: number, displayDecimals = 2): string {
    const formatted = ethers.utils.formatUnits(amount, decimals);
    const num = parseFloat(formatted);
    return num.toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: displayDecimals,
    });
}

/**
 * Calculate next claim date
 * @param schedule Vesting schedule
 * @param currentTime Current timestamp (Unix seconds)
 * @returns Next claim timestamp, or null if fully vested
 */
export function getNextClaimDate(schedule: VestingSchedule, currentTime: number): number | null {
    if (currentTime >= schedule.startTime + schedule.duration) {
        return null; // Fully vested
    }

    if (currentTime < schedule.startTime + schedule.cliff) {
        return schedule.startTime + schedule.cliff; // Next claim at cliff end
    }

    // Already past cliff, calculate next claim (e.g., monthly)
    const monthInSeconds = 30 * 24 * 60 * 60;
    const timeSinceStart = currentTime - schedule.startTime;
    const monthsPassed = Math.floor(timeSinceStart / monthInSeconds);
    const nextClaimTime = schedule.startTime + (monthsPassed + 1) * monthInSeconds;

    if (nextClaimTime >= schedule.startTime + schedule.duration) {
        return schedule.startTime + schedule.duration; // Final claim
    }

    return nextClaimTime;
}
