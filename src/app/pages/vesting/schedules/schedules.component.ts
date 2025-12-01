import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { VestingRelease, VestingSchedule } from '@lib/interfaces';
import { VestingStatus } from '@lib/interfaces';
import { VestingService } from '@lib/services/vesting/vesting.service';
import {
    calculateVestingRelease,
    formatDate,
    formatDuration,
    formatTokenAmount,
    getNextClaimDate,
} from '@lib/utils/vesting.util';
import { getCurrentTimestamp } from '@lib/constants/mock-data.constant';
import { Subject, takeUntil } from 'rxjs';

/**
 * Vesting Schedules List Component
 * Displays detailed list of vesting schedules with claim functionality
 */
@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './schedules.component.html',
})
export class SchedulesComponent implements OnInit, OnDestroy {
    // Services
    private readonly _vestingService = inject(VestingService);
    private readonly _destroy$ = new Subject<void>();

    // State
    schedules: VestingSchedule[] = [];
    selectedSchedule: VestingSchedule | null = null;
    loading = false;
    claiming = false;
    error: string | null = null;
    successMessage: string | null = null;

    // Filters
    filterStatus: VestingStatus | 'all' = 'all';

    // Utility functions exposed to template
    formatDate = formatDate;
    formatDuration = formatDuration;
    formatTokenAmount = formatTokenAmount;
    getCurrentTimestamp = getCurrentTimestamp;
    getNextClaimDate = getNextClaimDate;
    parseFloat = parseFloat; // Expose global parseFloat to template
    // eslint-disable-next-line @typescript-eslint/naming-convention
    VestingStatus = VestingStatus;

    ngOnInit(): void {
        // Subscribe to vesting schedules
        this._vestingService.vestingSchedules$.pipe(takeUntil(this._destroy$)).subscribe((schedules) => {
            this.schedules = schedules;
        });

        // Subscribe to loading state
        this._vestingService.loading$.pipe(takeUntil(this._destroy$)).subscribe((loading) => {
            this.loading = loading;
        });

        // Subscribe to errors
        this._vestingService.error$.pipe(takeUntil(this._destroy$)).subscribe((error) => {
            this.error = error;
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    /**
     * Get filtered schedules based on status filter
     */
    get filteredSchedules(): VestingSchedule[] {
        if (this.filterStatus === 'all') {
            return this.schedules;
        }
        return this.schedules.filter((s) => s.status === this.filterStatus);
    }

    /**
     * Get vesting release calculation for a schedule
     */
    getRelease(schedule: VestingSchedule): VestingRelease {
        return calculateVestingRelease(schedule, getCurrentTimestamp());
    }

    /**
     * Check if schedule has claimable tokens
     * Using threshold of 1 token to avoid showing button for tiny amounts
     */
    hasClaimable(schedule: VestingSchedule): boolean {
        const release = this.getRelease(schedule);
        const claimableAmount = parseFloat(release.claimable);
        // Only show button if claimable is at least 1 token
        return claimableAmount >= 1;
    }

    /**
     * Claim tokens from a vesting schedule
     */
    async claimTokens(schedule: VestingSchedule): Promise<void> {
        if (!this.hasClaimable(schedule)) {
            return;
        }

        this.claiming = true;
        this.error = null;
        this.successMessage = null;

        try {
            const txHash = await this._vestingService.claimTokens(schedule.id);
            const release = this.getRelease(schedule);

            // release.claimable is already formatted, just format the number display
            const formattedAmount = parseFloat(release.claimable).toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            });

            this.successMessage = `Successfully claimed ${formattedAmount} ${
                schedule.token.symbol
            }. Transaction: ${txHash.substring(0, 10)}...`;

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                this.successMessage = null;
            }, 5000);
        } catch (error) {
            console.error('Claim error:', error);
            this.error = error instanceof Error ? error.message : 'Failed to claim tokens';
        } finally {
            this.claiming = false;
        }
    }

    /**
     * Get status badge color
     */
    getStatusColor(status: VestingStatus): string {
        switch (status) {
            case VestingStatus.ACTIVE:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case VestingStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case VestingStatus.COMPLETED:
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case VestingStatus.REVOKED:
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    }

    /**
     * Set filter status
     */
    setFilter(status: VestingStatus | 'all'): void {
        this.filterStatus = status;
    }

    /**
     * Check if filter is active
     */
    isFilterActive(status: VestingStatus | 'all'): boolean {
        return this.filterStatus === status;
    }
}
