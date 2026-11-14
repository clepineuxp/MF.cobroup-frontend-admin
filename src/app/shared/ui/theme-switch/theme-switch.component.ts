import { Component, inject } from '@angular/core';
import { ThemeService } from '../../../themes/theme.service';

@Component({
  selector: 'app-theme-switch',
  template: `
    <button
      type="button"
      class="btn-theme-toggle"
      (click)="theme.toggleTheme()"
      [attr.aria-pressed]="theme.theme() === 'dark'"
      [title]="theme.theme() === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'"
      aria-label="Cambiar tema visual"
    >
      <span class="theme-icon" aria-hidden="true">{{ theme.theme() === 'light' ? '☀️' : '🌙' }}</span>
      <span class="theme-text">{{ theme.theme() === 'light' ? 'Claro' : 'Oscuro' }}</span>
    </button>
  `,
  styleUrl: './theme-switch.component.scss'
})
export class ThemeSwitchComponent {
  protected readonly theme = inject(ThemeService);
}
