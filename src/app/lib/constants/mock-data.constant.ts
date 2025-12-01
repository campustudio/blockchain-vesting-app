/**
 * Mock data for Vesting Platform demonstration
 */

import type { VestingSchedule } from '@lib/interfaces/vesting.interface';
import { VestingStatus } from '@lib/interfaces/vesting.interface';

/**
 * Mock vesting schedules for demonstration
 * These represent different vesting scenarios commonly used in token distribution
 */
export const MOCK_VESTING_SCHEDULES: VestingSchedule[] = [
    {
        id: '0x1',
        beneficiary: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        token: {
            symbol: 'PROJ',
            name: 'Project Token',
            address: '0x1234567890123456789012345678901234567890',
            decimals: 18,
        },
        totalAmount: '1000000000000000000000000', // 1,000,000 tokens
        startTime: Math.floor(Date.now() / 1000) - 180 * 24 * 60 * 60, // Started 6 months ago
        cliff: 180 * 24 * 60 * 60, // 6 months cliff
        duration: 730 * 24 * 60 * 60, // 24 months total (2 years)
        released: '250000000000000000000000', // 250,000 tokens claimed
        revocable: true,
        revoked: false,
        status: VestingStatus.ACTIVE,
    },
    {
        id: '0x2',
        beneficiary: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        token: {
            symbol: 'TEAM',
            name: 'Team Token',
            address: '0x2345678901234567890123456789012345678901',
            decimals: 18,
        },
        totalAmount: '500000000000000000000000', // 500,000 tokens
        startTime: Math.floor(Date.now() / 1000) - 90 * 24 * 60 * 60, // Started 3 months ago
        cliff: 365 * 24 * 60 * 60, // 1 year cliff
        duration: 1460 * 24 * 60 * 60, // 48 months total (4 years)
        released: '0', // Nothing claimed yet
        revocable: true,
        revoked: false,
        status: VestingStatus.ACTIVE,
    },
    {
        id: '0x3',
        beneficiary: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        token: {
            symbol: 'EARLY',
            name: 'Early Investor Token',
            address: '0x3456789012345678901234567890123456789012',
            decimals: 18,
        },
        totalAmount: '2000000000000000000000000', // 2,000,000 tokens
        startTime: Math.floor(Date.now() / 1000) - 800 * 24 * 60 * 60, // Started ~2.2 years ago
        cliff: 90 * 24 * 60 * 60, // 3 months cliff
        duration: 730 * 24 * 60 * 60, // 24 months total
        released: '2000000000000000000000000', // Fully claimed
        revocable: false,
        revoked: false,
        status: VestingStatus.COMPLETED,
    },
    {
        id: '0x4',
        beneficiary: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        token: {
            symbol: 'ADVISOR',
            name: 'Advisor Token',
            address: '0x4567890123456789012345678901234567890123',
            decimals: 18,
        },
        totalAmount: '100000000000000000000000', // 100,000 tokens
        startTime: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // Starts in 1 month
        cliff: 180 * 24 * 60 * 60, // 6 months cliff
        duration: 365 * 24 * 60 * 60, // 12 months total
        released: '0',
        revocable: true,
        revoked: false,
        status: VestingStatus.PENDING,
    },
    {
        id: '0x5',
        beneficiary: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        token: {
            symbol: 'SEED',
            name: 'Seed Investor Token',
            address: '0x5678901234567890123456789012345678901234',
            decimals: 18,
        },
        totalAmount: '750000000000000000000000', // 750,000 tokens
        startTime: Math.floor(Date.now() / 1000) - 270 * 24 * 60 * 60, // Started 9 months ago
        cliff: 180 * 24 * 60 * 60, // 6 months cliff
        duration: 730 * 24 * 60 * 60, // 24 months total
        released: '150000000000000000000000', // 150,000 tokens claimed
        revocable: false,
        revoked: false,
        status: VestingStatus.ACTIVE,
    },
];

/**
 * Get current timestamp in seconds
 */
export function getCurrentTimestamp(): number {
    return Math.floor(Date.now() / 1000);
}

/**
 * Mock wallet address for testing
 */
export const MOCK_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
