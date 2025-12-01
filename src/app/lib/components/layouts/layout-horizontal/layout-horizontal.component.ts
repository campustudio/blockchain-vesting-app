import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'app-layout-horizontal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './layout-horizontal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutHorizontalComponent {}
