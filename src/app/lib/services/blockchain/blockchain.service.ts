import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@lib/constants/contracts.constant';
import type { VestingSchedule } from '@lib/interfaces/vesting.interface';

/**
 * Blockchain Service
 * Handles interactions with smart contracts
 */
@Injectable({
    providedIn: 'root',
})
export class BlockchainService {
    private provider: ethers.providers.Web3Provider | null = null;
    private vestingContract: ethers.Contract | null = null;

    /**
     * Initialize provider and contracts
     */
    async initialize(ethereum: any): Promise<void> {
        this.provider = new ethers.providers.Web3Provider(ethereum);
        this.vestingContract = new ethers.Contract(CONTRACT_ADDRESSES.vesting, CONTRACT_ABIS.vesting, this.provider);
    }

    /**
     * Get all vesting schedules for a beneficiary
     */
    async getVestingSchedules(beneficiary: string): Promise<VestingSchedule[]> {
        if (!this.vestingContract) {
            throw new Error('Contract not initialized');
        }

        try {
            // Get schedule count for beneficiary
            const count = await this.vestingContract.getVestingSchedulesCount(beneficiary);
            const schedules: VestingSchedule[] = [];

            // Fetch each schedule
            for (let i = 0; i < count.toNumber(); i++) {
                const scheduleId = await this.vestingContract.computeVestingScheduleId(beneficiary, i);
                const schedule = await this.vestingContract.getVestingSchedule(scheduleId);

                // Get token info
                const tokenContract = new ethers.Contract(schedule.token, CONTRACT_ABIS.token, this.provider!);
                const symbol = await tokenContract.symbol();
                const name = await tokenContract.name();
                const decimals = await tokenContract.decimals();

                schedules.push({
                    id: scheduleId,
                    beneficiary: schedule.beneficiary,
                    token: {
                        address: schedule.token,
                        symbol,
                        name,
                        decimals,
                    },
                    totalAmount: schedule.amountTotal.toString(),
                    released: schedule.released.toString(),
                    startTime: schedule.start.toNumber(),
                    cliff: schedule.cliff.toNumber(),
                    duration: schedule.duration.toNumber(),
                    revocable: schedule.revocable,
                    revoked: schedule.revoked,
                });
            }

            return schedules;
        } catch (error) {
            console.error('Error fetching vesting schedules:', error);
            throw error;
        }
    }

    /**
     * Claim vested tokens
     */
    async claimTokens(scheduleId: string, amount: string): Promise<string> {
        if (!this.vestingContract || !this.provider) {
            throw new Error('Contract not initialized');
        }

        try {
            const signer = this.provider.getSigner();
            const contractWithSigner = this.vestingContract.connect(signer);

            const tx = await contractWithSigner.release(scheduleId, amount);
            const receipt = await tx.wait();

            return receipt.transactionHash;
        } catch (error) {
            console.error('Error claiming tokens:', error);
            throw error;
        }
    }

    /**
     * Get contract provider
     */
    getProvider(): ethers.providers.Web3Provider | null {
        return this.provider;
    }
}
