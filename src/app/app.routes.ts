import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: async () => (await import('@pages/home')).routes,
    },
    {
        path: 'vesting',
        loadChildren: async () => await import('@pages/vesting'),
    },
    {
        path: '**',
        loadComponent: async () => (await import('@pages/screens/not-found/not-found.component')).NotFoundComponent,
    },
];
