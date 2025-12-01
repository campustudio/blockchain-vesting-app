import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { VestingRelease, VestingSchedule, VestingStats } from '@lib/interfaces';
import { VestingStatus } from '@lib/interfaces';
import { VestingService } from '@lib/services/vesting/vesting.service';
import { calculateVestingRelease, formatDate, formatDuration, formatTokenAmount } from '@lib/utils/vesting.util';
import { getCurrentTimestamp } from '@lib/constants/mock-data.constant';
import { Subject, takeUntil } from 'rxjs';

/**
 * Vesting Dashboard Component
 * Displays overview of all vesting schedules and statistics
 */
@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
    // Services
    private readonly _vestingService = inject(VestingService);
    private readonly _destroy$ = new Subject<void>();

    // State
    stats: VestingStats | null = null;
    activeSchedules: VestingSchedule[] = [];
    pendingSchedules: VestingSchedule[] = [];
    completedSchedules: VestingSchedule[] = [];
    loading = false;

    // Utility functions and enums exposed to template
    formatDate = formatDate;
    formatDuration = formatDuration;
    formatTokenAmount = formatTokenAmount;
    parseFloat = parseFloat; // Expose global parseFloat to template
    // eslint-disable-next-line @typescript-eslint/naming-convention
    VestingStatus = VestingStatus;

    ngOnInit(): void {
        // Subscribe to stats
        this._vestingService.stats$.pipe(takeUntil(this._destroy$)).subscribe((stats) => {
            this.stats = stats;
        });

        // Subscribe to vesting schedules
        this._vestingService.vestingSchedules$.pipe(takeUntil(this._destroy$)).subscribe((schedules) => {
            this.activeSchedules = schedules.filter((s) => s.status === VestingStatus.ACTIVE);
            this.pendingSchedules = schedules.filter((s) => s.status === VestingStatus.PENDING);
            this.completedSchedules = schedules.filter((s) => s.status === VestingStatus.COMPLETED);
        });

        // Subscribe to loading state
        this._vestingService.loading$.pipe(takeUntil(this._destroy$)).subscribe((loading) => {
            this.loading = loading;
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    /**
     * Get vesting release calculation for a schedule
     */
    getRelease(schedule: VestingSchedule): VestingRelease {
        return calculateVestingRelease(schedule, getCurrentTimestamp());
    }

    /**
     * Calculate claimable percentage
     */
    getClaimablePercentage(schedule: VestingSchedule): number {
        const release = this.getRelease(schedule);
        if (!release || parseFloat(release.total) === 0) {
            return 0;
        }
        return (parseFloat(release.claimable) / parseFloat(release.total)) * 100;
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
}
