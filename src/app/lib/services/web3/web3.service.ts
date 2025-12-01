import { Injectable, NgZone, OnDestroy } from '@angular/core';
import { getNetworkName, isNetworkSupported } from '@lib/constants/networks.constant';
import type { EthereumProvider, NetworkInfo, WalletState } from '@lib/interfaces/web3.interface';
import { BrowserProvider } from 'ethers';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

/**
 * Web3 Service
 * Handles MetaMask wallet connection, account management, and network detection
 */
@Injectable({
    providedIn: 'root',
})
export class Web3Service implements OnDestroy {
    // State management
    private readonly _walletAddress$ = new BehaviorSubject<string | null>(null);
    private readonly _networkInfo$ = new BehaviorSubject<NetworkInfo | null>(null);
    private readonly _isConnected$ = new BehaviorSubject<boolean>(false);
    private readonly _error$ = new BehaviorSubject<string | null>(null);
    private readonly _destroy$ = new Subject<void>();

    // Public observables
    public readonly walletAddress$: Observable<string | null> = this._walletAddress$.asObservable();
    public readonly networkInfo$: Observable<NetworkInfo | null> = this._networkInfo$.asObservable();
    public readonly isConnected$: Observable<boolean> = this._isConnected$.asObservable();
    public readonly error$: Observable<string | null> = this._error$.asObservable();

    // Ethereum provider
    private _ethereum: EthereumProvider | undefined;

    // Save listener references for proper removal
    private _accountsChangedHandler?: (accounts: unknown) => void;
    private _chainChangedHandler?: (chainId: unknown) => void;

    constructor(private readonly _ngZone: NgZone) {
        this._ethereum = window.ethereum;
        this._initializeListeners();
        // Try to restore connection state from localStorage
        this._restoreConnection();
    }

    ngOnDestroy(): void {
        this._removeListeners();
        this._destroy$.next();
        this._destroy$.complete();
    }

    /**
     * Check if MetaMask is installed
     */
    public get isMetaMaskInstalled(): boolean {
        return typeof this._ethereum !== 'undefined' && !!this._ethereum.isMetaMask;
    }

    /**
     * Get current wallet state
     */
    public get walletState(): WalletState {
        return {
            address: this._walletAddress$.value,
            isConnected: this._isConnected$.value,
            network: this._networkInfo$.value,
        };
    }

    /**
     * Connect MetaMask wallet
     */
    public async connectWallet(): Promise<void> {
        try {
            // Clear previous errors
            this._error$.next(null);

            // Check if MetaMask is installed
            if (!this.isMetaMaskInstalled) {
                throw new Error('MetaMask is not installed. Please install MetaMask extension.');
            }

            // Request account access
            const accounts = (await this._ethereum?.request({
                method: 'eth_requestAccounts',
            })) as string[] | undefined;

            if (!accounts || accounts.length === 0) {
                throw new Error('No accounts returned from MetaMask.');
            }

            // Set wallet address
            this._walletAddress$.next(accounts[0]);
            this._isConnected$.next(true);

            // Save connection state to localStorage
            localStorage.setItem('web3_connected', 'true');
            localStorage.setItem('web3_last_address', accounts[0]);

            // Get network information
            await this._updateNetworkInfo();

            console.log('✅ Wallet connected:', accounts[0]);
        } catch (error: unknown) {
            this._handleError(error);
            throw error;
        }
    }

    /**
     * Disconnect wallet (clears app state only)
     * Note: This does not revoke MetaMask authorization, user must manually revoke in MetaMask
     */
    public disconnectWallet(): void {
        this._walletAddress$.next(null);
        this._networkInfo$.next(null);
        this._isConnected$.next(false);
        this._error$.next(null);

        // Clear connection state from localStorage
        localStorage.removeItem('web3_connected');
        localStorage.removeItem('web3_last_address');

        console.log('🔌 Wallet disconnected (app state only)');
    }

    /**
     * Restore connection state from localStorage
     */
    private async _restoreConnection(): Promise<void> {
        // Check if there's a saved connection state
        const hasSavedConnection = localStorage.getItem('web3_connected') === 'true';

        if (!hasSavedConnection || !this.isMetaMaskInstalled) {
            return;
        }

        try {
            // Silent account request (won't show MetaMask popup)
            const accounts = (await this._ethereum?.request({
                method: 'eth_accounts', // Use eth_accounts instead of eth_requestAccounts
            })) as string[] | undefined;

            if (accounts && accounts.length > 0) {
                // Update state within Angular zone
                this._ngZone.run(() => {
                    this._walletAddress$.next(accounts[0]);
                    this._isConnected$.next(true);
                    console.log('🔄 Connection restored:', accounts[0]);
                });

                // Update network info (this method already uses NgZone internally)
                await this._updateNetworkInfo();
            } else {
                // If no accounts, clear saved state
                localStorage.removeItem('web3_connected');
                localStorage.removeItem('web3_last_address');
            }
        } catch (error) {
            console.warn('⚠️ Failed to restore connection:', error);
            localStorage.removeItem('web3_connected');
            localStorage.removeItem('web3_last_address');
        }
    }

    /**
     * Initialize event listeners
     */
    private _initializeListeners(): void {
        if (!this._ethereum) {
            return;
        }

        // Create listener function references
        this._accountsChangedHandler = (accounts: unknown): void => {
            this._handleAccountsChanged(accounts as string[]);
        };

        this._chainChangedHandler = (chainId: unknown): void => {
            this._handleChainChanged(chainId as string);
        };

        // Listen for account changes
        this._ethereum.on('accountsChanged', this._accountsChangedHandler);

        // Listen for network changes
        this._ethereum.on('chainChanged', this._chainChangedHandler);
    }

    /**
     * Remove event listeners
     */
    private _removeListeners(): void {
        if (!this._ethereum) {
            return;
        }

        // Remove listeners
        if (this._accountsChangedHandler) {
            this._ethereum.removeListener('accountsChanged', this._accountsChangedHandler);
        }
        if (this._chainChangedHandler) {
            this._ethereum.removeListener('chainChanged', this._chainChangedHandler);
        }
    }

    /**
     * Handle account changes
     */
    private _handleAccountsChanged(accounts: string[]): void {
        console.log('👤 Accounts changed:', accounts);

        // Execute state updates within Angular zone to ensure change detection
        this._ngZone.run(() => {
            if (accounts.length === 0) {
                // User disconnected all accounts
                console.log('🔌 User disconnected all accounts');
                this.disconnectWallet();
            } else {
                // User switched accounts
                const oldAddress = this._walletAddress$.value;
                const newAddress = accounts[0];
                console.log('✅ Account switched:', { from: oldAddress, to: newAddress });
                this._walletAddress$.next(newAddress);
            }
        });
    }

    /**
     * Handle network changes
     */
    private _handleChainChanged(chainId: string): void {
        console.log('🌐 Chain changed:', chainId);

        // Save connection state to localStorage (if connected)
        if (this._isConnected$.value) {
            localStorage.setItem('web3_connected', 'true');
            localStorage.setItem('web3_last_address', this._walletAddress$.value || '');
        }

        // MetaMask recommends reloading the page on network changes
        window.location.reload();
    }

    /**
     * Update network information
     */
    private async _updateNetworkInfo(): Promise<void> {
        if (!this._ethereum) {
            return;
        }

        try {
            const provider = new BrowserProvider(this._ethereum);
            const network = await provider.getNetwork();

            // Convert chainId to hexadecimal string
            const chainId = `0x${network.chainId.toString(16)}`;
            const chainName = getNetworkName(chainId);
            const isSupported = isNetworkSupported(chainId);

            const networkInfo: NetworkInfo = {
                chainId,
                chainName,
                isSupported,
            };

            // Update state within Angular zone
            this._ngZone.run(() => {
                this._networkInfo$.next(networkInfo);
                console.log('🌐 Network info updated:', networkInfo);

                // If network is not supported, show warning
                if (!isSupported) {
                    this._error$.next(`Unsupported network: ${chainName}. Please switch to a supported network.`);
                } else {
                    // Clear previous error messages (if network is supported)
                    this._error$.next(null);
                }
            });
        } catch (error) {
            console.error('❌ Error updating network info:', error);
            this._error$.next('Failed to retrieve network information.');
        }
    }

    /**
     * Error handling
     */
    private _handleError(error: unknown): void {
        let errorMessage = 'An unknown error occurred.';

        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
            const err = error as { message?: string; code?: number };
            if (err.code === 4001) {
                errorMessage = 'Connection request rejected by user.';
            } else if (err.code === -32002) {
                errorMessage = 'Request already pending. Please check MetaMask.';
            } else if (err.message) {
                errorMessage = err.message;
            }
        }

        this._error$.next(errorMessage);
        console.error('❌ Web3 Error:', errorMessage);
    }
}
