import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Vesting Platform Main Component
 * Container for vesting-related pages
 */
@Component({
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
            <router-outlet></router-outlet>
        </div>
    `,
})
export class VestingComponent {}
