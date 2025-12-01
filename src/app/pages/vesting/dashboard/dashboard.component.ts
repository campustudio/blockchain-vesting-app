import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { VestingRelease, VestingSchedule, VestingStats } from '@lib/interfaces';
import { VestingStatus } from '@lib/interfaces';
import { VestingService } from '@lib/services/vesting/vesting.service';
import { Web3Service } from '@lib/services/web3/web3.service';
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
    private readonly _web3Service = inject(Web3Service);
    private readonly _destroy$ = new Subject<void>();

    // State
    stats: VestingStats | null = null;
    activeSchedules: VestingSchedule[] = [];
    pendingSchedules: VestingSchedule[] = [];
    completedSchedules: VestingSchedule[] = [];
    loading = false;
    private _allSchedules: VestingSchedule[] = [];

    // Utility functions and enums exposed to template
    formatDate = formatDate;
    formatDuration = formatDuration;
    formatTokenAmount = formatTokenAmount;
    parseFloat = parseFloat; // Expose global parseFloat to template
    // eslint-disable-next-line @typescript-eslint/naming-convention
    VestingStatus = VestingStatus;

    async ngOnInit(): Promise<void> {
        // Subscribe to stats
        this._vestingService.stats$.pipe(takeUntil(this._destroy$)).subscribe((stats) => {
            this.stats = stats;
        });

        // Subscribe to vesting schedules
        this._vestingService.vestingSchedules$.pipe(takeUntil(this._destroy$)).subscribe((schedules) => {
            console.log('📊 Dashboard received schedules:', schedules.length, schedules);
            this._allSchedules = schedules;
            this.activeSchedules = schedules.filter((s) => s.status === VestingStatus.ACTIVE);
            this.pendingSchedules = schedules.filter((s) => s.status === VestingStatus.PENDING);
            this.completedSchedules = schedules.filter((s) => s.status === VestingStatus.COMPLETED);
            console.log('📊 Dashboard filtered:', {
                active: this.activeSchedules.length,
                pending: this.pendingSchedules.length,
                completed: this.completedSchedules.length,
            });
        });

        // Subscribe to loading state
        this._vestingService.loading$.pipe(takeUntil(this._destroy$)).subscribe((loading) => {
            this.loading = loading;
        });

        // Check if wallet is already connected and reload data if needed
        const currentAddress = await new Promise<string | null>((resolve) => {
            this._web3Service.walletAddress$.pipe(takeUntil(this._destroy$)).subscribe((address) => {
                resolve(address);
            });
        });

        console.log('📊 Dashboard init - wallet address:', currentAddress, 'schedules:', this._allSchedules.length);

        // If wallet is connected but no schedules loaded, reload data
        if (currentAddress && this._allSchedules.length === 0) {
            console.log('📊 Dashboard reloading schedules for connected wallet');
            await this._vestingService.loadVestingSchedules(currentAddress);
        }
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
