import { Injectable } from '@angular/core';
import type {
    ClaimTransaction,
    VestingRelease,
    VestingSchedule,
    VestingStats,
} from '@lib/interfaces/vesting.interface';
import { TransactionStatus, VestingStatus } from '@lib/interfaces/vesting.interface';
import { getCurrentTimestamp, MOCK_VESTING_SCHEDULES, MOCK_WALLET_ADDRESS } from '@lib/constants/mock-data.constant';
import { calculateVestingRelease, getVestingStatus } from '@lib/utils/vesting.util';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Vesting Service
 * Manages vesting schedules, calculations, and claim operations
 */
@Injectable({
    providedIn: 'root',
})
export class VestingService {
    // State management
    private readonly _vestingSchedules$ = new BehaviorSubject<VestingSchedule[]>([]);
    private readonly _stats$ = new BehaviorSubject<VestingStats | null>(null);
    private readonly _claimHistory$ = new BehaviorSubject<ClaimTransaction[]>([]);
    private readonly _loading$ = new BehaviorSubject<boolean>(false);
    private readonly _error$ = new BehaviorSubject<string | null>(null);

    // Public observables
    public readonly vestingSchedules$: Observable<VestingSchedule[]> = this._vestingSchedules$.asObservable();
    public readonly stats$: Observable<VestingStats | null> = this._stats$.asObservable();
    public readonly claimHistory$: Observable<ClaimTransaction[]> = this._claimHistory$.asObservable();
    public readonly loading$: Observable<boolean> = this._loading$.asObservable();
    public readonly error$: Observable<string | null> = this._error$.asObservable();

    // Current wallet address
    private _currentAddress: string | null = null;

    constructor() {
        // Initialize with mock data
        this._loadMockData();
    }

    /**
     * Load vesting schedules for a wallet address
     * @param address Wallet address
     */
    public async loadVestingSchedules(address: string): Promise<void> {
        this._loading$.next(true);
        this._error$.next(null);
        this._currentAddress = address;

        try {
            // Simulate API call delay
            await this._delay(500);

            // In a real app, this would fetch from blockchain/API
            // For now, use mock data
            const schedules = this._filterSchedulesByAddress(address);

            // Update statuses based on current time
            const currentTime = getCurrentTimestamp();
            const updatedSchedules = schedules.map((schedule) => ({
                ...schedule,
                status: getVestingStatus(schedule, currentTime),
            }));

            this._vestingSchedules$.next(updatedSchedules);
            this._updateStats(updatedSchedules);
        } catch (error) {
            this._handleError(error);
        } finally {
            this._loading$.next(false);
        }
    }

    /**
     * Get vesting release calculation for a specific schedule
     * @param scheduleId Vesting schedule ID
     * @returns Vesting release calculation
     */
    public getVestingRelease(scheduleId: string): VestingRelease | null {
        const schedule = this._vestingSchedules$.value.find((s) => s.id === scheduleId);
        if (!schedule) {
            return null;
        }

        const currentTime = getCurrentTimestamp();
        return calculateVestingRelease(schedule, currentTime);
    }

    /**
     * Claim vested tokens
     * @param scheduleId Vesting schedule ID
     * @returns Transaction hash
     */
    public async claimTokens(scheduleId: string): Promise<string> {
        this._loading$.next(true);
        this._error$.next(null);

        try {
            const schedule = this._vestingSchedules$.value.find((s) => s.id === scheduleId);
            if (!schedule) {
                throw new Error('Vesting schedule not found');
            }

            const release = this.getVestingRelease(scheduleId);
            if (!release || parseFloat(release.claimable) === 0) {
                throw new Error('No tokens available to claim');
            }

            // Simulate blockchain transaction
            await this._delay(2000);

            // Generate mock transaction
            const txHash = `0x${Math.random().toString(16).substring(2)}`;
            const transaction: ClaimTransaction = {
                id: txHash,
                vestingId: scheduleId,
                amount: release.claimable,
                timestamp: getCurrentTimestamp(),
                status: TransactionStatus.CONFIRMED,
            };

            // Update claim history
            const history = [...this._claimHistory$.value, transaction];
            this._claimHistory$.next(history);

            // Update released amount in schedule
            const currentTime = getCurrentTimestamp();
            const updatedSchedules = this._vestingSchedules$.value.map((s) => {
                if (s.id === scheduleId) {
                    const claimed = BigInt(s.released);
                    const vested = this._calculateVestedAmount(s, currentTime);
                    const claimable = vested - claimed;
                    const newReleased = (claimed + (claimable > 0n ? claimable : 0n)).toString();
                    return { ...s, released: newReleased };
                }
                return s;
            });

            this._vestingSchedules$.next(updatedSchedules);
            this._updateStats(updatedSchedules);

            return txHash;
        } catch (error) {
            this._handleError(error);
            throw error;
        } finally {
            this._loading$.next(false);
        }
    }

    /**
     * Get vesting schedules by status
     * @param status Vesting status
     * @returns Filtered vesting schedules
     */
    public getSchedulesByStatus(status: VestingStatus): VestingSchedule[] {
        return this._vestingSchedules$.value.filter((s) => s.status === status);
    }

    /**
     * Load mock data for demonstration
     */
    private _loadMockData(): void {
        const currentTime = getCurrentTimestamp();
        const schedules = MOCK_VESTING_SCHEDULES.map((schedule) => ({
            ...schedule,
            status: getVestingStatus(schedule, currentTime),
        }));

        this._vestingSchedules$.next(schedules);
        this._updateStats(schedules);
        this._currentAddress = MOCK_WALLET_ADDRESS;
    }

    /**
     * Filter schedules by beneficiary address
     * @param address Wallet address
     * @returns Filtered schedules
     */
    private _filterSchedulesByAddress(address: string): VestingSchedule[] {
        return MOCK_VESTING_SCHEDULES.filter(
            (schedule) => schedule.beneficiary.toLowerCase() === address.toLowerCase(),
        );
    }

    /**
     * Update statistics based on current schedules
     * @param schedules Current vesting schedules
     */
    private _updateStats(schedules: VestingSchedule[]): void {
        const currentTime = getCurrentTimestamp();

        let totalLocked = 0n;
        let totalVested = 0n;
        let totalClaimed = 0n;
        let activeSchedules = 0;
        let completedSchedules = 0;

        schedules.forEach((schedule) => {
            const total = BigInt(schedule.totalAmount);
            const claimed = BigInt(schedule.released);
            const vested = this._calculateVestedAmount(schedule, currentTime);
            const claimable = vested - claimed;

            totalLocked += total;
            totalVested += claimable > 0n ? claimable : 0n; // Only count claimable (not yet claimed)
            totalClaimed += claimed;

            if (schedule.status === VestingStatus.ACTIVE) {
                activeSchedules++;
            } else if (schedule.status === VestingStatus.COMPLETED) {
                completedSchedules++;
            }
        });

        const stats: VestingStats = {
            totalLocked: totalLocked.toString(),
            totalVested: totalVested.toString(),
            totalClaimed: totalClaimed.toString(),
            totalRemaining: (totalLocked - totalVested).toString(),
            activeSchedules,
            completedSchedules,
        };

        this._stats$.next(stats);
    }

    /**
     * Handle errors
     * @param error Error object
     */
    private _handleError(error: unknown): void {
        let errorMessage = 'An unknown error occurred.';

        if (error instanceof Error) {
            errorMessage = error.message;
        }

        this._error$.next(errorMessage);
        console.error('❌ Vesting Service Error:', errorMessage);
    }

    /**
     * Calculate vested amount for a schedule at current time
     * @param schedule Vesting schedule
     * @param currentTime Current timestamp
     * @returns Vested amount in wei
     */
    private _calculateVestedAmount(schedule: VestingSchedule, currentTime: number): bigint {
        const total = BigInt(schedule.totalAmount);
        const startTime = schedule.startTime;
        const duration = schedule.duration;
        const cliff = schedule.cliff;

        if (currentTime < startTime + cliff) {
            // Before cliff: nothing vested
            return 0n;
        }

        if (currentTime >= startTime + duration) {
            // After duration: everything vested
            return total;
        }

        // During vesting: linear calculation
        const timeElapsed = currentTime - startTime;
        return (total * BigInt(timeElapsed)) / BigInt(duration);
    }

    /**
     * Simulate async delay
     * @param ms Milliseconds to delay
     */
    private _delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
