import type { Route } from '@angular/router';

/**
 * Vesting Platform routes
 */
export default [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },
    {
        path: 'dashboard',
        loadComponent: (): Promise<typeof import('./dashboard/dashboard.component').DashboardComponent> =>
            import('./dashboard/dashboard.component').then((m) => m.DashboardComponent),
        title: 'Vesting Dashboard',
    },
    {
        path: 'schedules',
        loadComponent: (): Promise<typeof import('./schedules/schedules.component').SchedulesComponent> =>
            import('./schedules/schedules.component').then((m) => m.SchedulesComponent),
        title: 'Vesting Schedules',
    },
] satisfies Route[];
