import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import type { NetworkInfo } from '@lib/interfaces';
import { ThemeService, Web3Service } from '@lib/services';
import type { AppTheme } from '@lib/services/theme';
import { shortenAddress } from '@lib/utils';
import { Subject, takeUntil } from 'rxjs';

@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, OnDestroy {
    // Theme related
    currentTheme!: AppTheme | null;

    // Web3 related state
    walletAddress: string | null = null;
    shortenedAddress = '';
    networkInfo: NetworkInfo | null = null;
    isConnected = false;
    errorMessage: string | null = null;
    isMetaMaskInstalled = false;
    isConnecting = false;

    private readonly _themeService = inject(ThemeService);
    private readonly _web3Service = inject(Web3Service);
    private readonly _destroy$ = new Subject<void>();

    ngOnInit(): void {
        // Subscribe to theme changes
        this._themeService.currentTheme$
            .pipe(takeUntil(this._destroy$))
            .subscribe((theme) => (this.currentTheme = theme));

        // Check if MetaMask is installed
        this.isMetaMaskInstalled = this._web3Service.isMetaMaskInstalled;

        // Subscribe to wallet address changes
        this._web3Service.walletAddress$.pipe(takeUntil(this._destroy$)).subscribe((address) => {
            this.walletAddress = address;
            this.shortenedAddress = address ? shortenAddress(address) : '';
        });

        // Subscribe to network info changes
        this._web3Service.networkInfo$.pipe(takeUntil(this._destroy$)).subscribe((network) => {
            this.networkInfo = network;
        });

        // Subscribe to connection status changes
        this._web3Service.isConnected$.pipe(takeUntil(this._destroy$)).subscribe((connected) => {
            this.isConnected = connected;
        });

        // Subscribe to error messages
        this._web3Service.error$.pipe(takeUntil(this._destroy$)).subscribe((error) => {
            this.errorMessage = error;
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    /**
     * Connect MetaMask wallet
     */
    async onConnectWallet(): Promise<void> {
        this.isConnecting = true;
        this.errorMessage = null;

        try {
            await this._web3Service.connectWallet();
        } catch (error) {
            // Error already handled in service
            console.error('Failed to connect wallet:', error);
        } finally {
            this.isConnecting = false;
        }
    }

    /**
     * Disconnect wallet
     */
    onDisconnectWallet(): void {
        this._web3Service.disconnectWallet();
    }

    /**
     * Handle theme changes
     */
    handleThemeChange(theme: AppTheme): void {
        this._themeService.setTheme(theme);
    }
}
