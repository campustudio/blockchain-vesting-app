import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { getContractAddresses, CONTRACT_ABIS } from '@lib/constants/contracts.constant';
import type { VestingSchedule } from '@lib/interfaces/vesting.interface';
import { VestingStatus } from '@lib/interfaces/vesting.interface';

/**
 * Blockchain Service
 * Handles interactions with smart contracts
 */
@Injectable({
    providedIn: 'root',
})
export class BlockchainService {
    private _provider: ethers.providers.Web3Provider | null = null;
    private _vestingContract: ethers.Contract | null = null;
    private _currentChainId: string | null = null;

    /**
     * Initialize provider and contracts
     */
    async initialize(ethereum: unknown): Promise<void> {
        // Initialize provider
        this._provider = new ethers.providers.Web3Provider(ethereum as ethers.providers.ExternalProvider);

        // Get current network
        const network = await this._provider.getNetwork();
        this._currentChainId = `0x${network.chainId.toString(16)}`;
        console.log('🌐 Current network chainId:', this._currentChainId);

        // Get contract addresses for current network
        const addresses = getContractAddresses(this._currentChainId);
        console.log('📋 Using contract addresses:', addresses);

        const signer = this._provider.getSigner();
        this._vestingContract = new ethers.Contract(addresses.vesting, CONTRACT_ABIS.vesting, signer);

        console.log('✅ BlockchainService initialized');
    }

    /**
     * Get all vesting schedules for a beneficiary
     */
    async getVestingSchedules(beneficiary: string): Promise<VestingSchedule[]> {
        if (!this._vestingContract || !this._provider) {
            throw new Error('Contract not initialized');
        }

        try {
            // Get all schedule IDs for beneficiary
            const scheduleIds: string[] = await this._vestingContract['getBeneficiarySchedules'](beneficiary);
            console.log('📋 Got schedule IDs from contract:', scheduleIds, 'Count:', scheduleIds.length);

            const schedules: VestingSchedule[] = [];

            // Fetch each schedule
            for (const rawScheduleId of scheduleIds) {
                // Convert to proper bytes32 format (66 chars: 0x + 64 hex digits)
                // First handle odd-length hex strings
                let hexValue = String(rawScheduleId);
                if (hexValue.startsWith('0x') && hexValue.length % 2 !== 0) {
                    // Odd length: insert '0' after '0x'
                    hexValue = '0x0' + hexValue.slice(2);
                }

                const scheduleId = ethers.utils.hexZeroPad(hexValue, 32);
                console.log('📋 Processing scheduleId:', scheduleId, 'Length:', scheduleId.length);

                const result = await this._vestingContract['getVestingSchedule'](scheduleId);

                console.log('🔍 Raw contract result for schedule:', scheduleId);
                console.log('🔍 Result indices:');
                console.log('  [0]:', result[0]);
                console.log('  [1]:', result[1]);
                console.log('  [2]:', result[2]);
                console.log('  [3]:', result[3]);
                console.log('  [4]:', result[4]);
                console.log('  [5]:', result[5]);
                console.log('  [6]:', result[6]);
                console.log('  [7]:', result[7]);
                console.log('  [8]:', result[8]);

                // Use array indices - named properties are incorrectly mapped by ethers.js
                const scheduleBeneficiary = result[0];
                const token = result[1];
                const totalAmount = result[2];
                const released = result[3];
                const startTime = result[4];
                const cliff = result[5];
                const duration = result[6];
                const revocable = result[7];
                const revoked = result[8];

                console.log('📋 Schedule details:', {
                    scheduleId,
                    beneficiary: scheduleBeneficiary,
                    requestedBeneficiary: beneficiary,
                    match: String(scheduleBeneficiary).toLowerCase() === beneficiary.toLowerCase(),
                });

                // Convert token address to string (in case it's not)
                const tokenAddress = String(token);

                // Get token info with signer to avoid ENS lookups
                const signer = this._provider.getSigner();
                const tokenContract = new ethers.Contract(tokenAddress, CONTRACT_ABIS.token, signer);

                // Use try-catch for token info to handle ENS errors gracefully
                let symbol = 'UNKNOWN';
                let name = 'Unknown Token';
                let decimals = 18;

                try {
                    symbol = await tokenContract['symbol']();
                    name = await tokenContract['name']();
                    decimals = await tokenContract['decimals']();
                } catch (tokenError) {
                    console.warn('⚠️ Failed to fetch token info (using defaults):', tokenError);
                    // Use defaults - schedules will still load
                }

                // Safely convert to numbers (handle both BigNumber and plain numbers)
                const startTimeNum =
                    startTime && typeof startTime.toNumber === 'function' ? startTime.toNumber() : Number(startTime);
                const cliffNum = cliff && typeof cliff.toNumber === 'function' ? cliff.toNumber() : Number(cliff);
                const durationNum =
                    duration && typeof duration.toNumber === 'function' ? duration.toNumber() : Number(duration);

                // Calculate status
                const currentTime = Math.floor(Date.now() / 1000);
                let status: VestingStatus;

                console.log('⏰ Status calculation:', {
                    currentTime,
                    startTime: startTimeNum,
                    cliff: cliffNum,
                    cliffEndTime: startTimeNum + cliffNum,
                    duration: durationNum,
                    endTime: startTimeNum + durationNum,
                    revoked,
                    isBeforeStart: currentTime < startTimeNum,
                    isInCliff: currentTime < startTimeNum + cliffNum,
                    isCompleted: currentTime >= startTimeNum + durationNum,
                });

                if (revoked) {
                    status = VestingStatus.REVOKED;
                } else if (currentTime < startTimeNum) {
                    // Not started yet
                    status = VestingStatus.PENDING;
                } else if (currentTime < startTimeNum + cliffNum) {
                    // Started but still in cliff period
                    status = VestingStatus.PENDING;
                } else if (currentTime >= startTimeNum + durationNum) {
                    // Fully vested
                    status = VestingStatus.COMPLETED;
                } else {
                    // Past cliff, before completion
                    status = VestingStatus.ACTIVE;
                }

                console.log('💾 Saving schedule with ID:', scheduleId, 'Length:', scheduleId.length);
                console.log('💰 totalAmount:', totalAmount, 'toString:', totalAmount.toString());
                console.log('💰 released:', released, 'toString:', released.toString());
                console.log('💰 decimals:', decimals);

                schedules.push({
                    id: scheduleId,
                    beneficiary,
                    token: {
                        address: tokenAddress as string,
                        symbol,
                        name,
                        decimals,
                    },
                    totalAmount: totalAmount.toString(),
                    released: released.toString(),
                    startTime: startTimeNum,
                    cliff: cliffNum,
                    duration: durationNum,
                    revocable,
                    revoked,
                    status,
                });
            }

            return schedules;
        } catch (error) {
            console.error('Error fetching vesting schedules:', error);
            throw error;
        }
    }

    /**
     * Get releasable amount for a schedule
     */
    async getReleasableAmount(scheduleId: string): Promise<string> {
        if (!this._vestingContract) {
            throw new Error('Contract not initialized');
        }

        try {
            // Ensure scheduleId is properly formatted as bytes32
            // First handle odd-length hex strings
            let hexValue = scheduleId;
            if (hexValue.startsWith('0x') && hexValue.length % 2 !== 0) {
                // Odd length: insert '0' after '0x'
                hexValue = '0x0' + hexValue.slice(2);
            }

            const formattedScheduleId = ethers.utils.hexZeroPad(hexValue, 32);

            const amount = await this._vestingContract['computeReleasableAmount'](formattedScheduleId);
            return amount.toString();
        } catch (error) {
            console.error('Error computing releasable amount:', error);
            throw error;
        }
    }

    /**
     * Claim vested tokens
     * Note: Optimized contract version - token parameter removed for security
     */
    async claimTokens(scheduleId: string, tokenAddress: string): Promise<string> {
        if (!this._vestingContract || !this._provider) {
            throw new Error('Contract not initialized');
        }

        try {
            // Ensure scheduleId is properly formatted as bytes32
            let hexValue = scheduleId;
            if (hexValue.startsWith('0x') && hexValue.length % 2 !== 0) {
                // Odd length: insert '0' after '0x'
                hexValue = '0x0' + hexValue.slice(2);
            }

            const formattedScheduleId = ethers.utils.hexZeroPad(hexValue, 32);

            console.log('🎯 claimTokens called with:', {
                originalScheduleId: scheduleId,
                formattedScheduleId,
                scheduleIdLength: formattedScheduleId.length,
                tokenAddress: tokenAddress + ' (not used in optimized contract)',
            });

            const signer = this._provider.getSigner();
            const contractWithSigner = this._vestingContract.connect(signer);

            // Optimized contract: release(bytes32 vestingId) - token parameter removed
            const tx = await contractWithSigner['release'](formattedScheduleId);
            const receipt = await tx.wait();

            return receipt.transactionHash as string;
        } catch (error) {
            console.error('Error claiming tokens:', error);
            throw error;
        }
    }

    /**
     * Get contract provider
     */
    getProvider(): ethers.providers.Web3Provider | null {
        return this._provider;
    }
}
