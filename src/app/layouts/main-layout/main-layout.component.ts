import { PwaUpdateService } from '../../core/pwa/pwa-update.service';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ThemeSwitchComponent } from '../../shared/ui/theme-switch/theme-switch.component';
import { OrganizationSwitcherComponent } from '../../features/organization-session/components/organization-switcher.component';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../themes/theme.service';
import { AppIconComponent } from '../../shared/ui/app-icon/app-icon.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ThemeSwitchComponent,
    OrganizationSwitcherComponent,
    AppIconComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  host: {
    '[attr.data-theme]': 'themeService.theme()',
  },
})
export class MainLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router, { optional: true });
  protected readonly themeService = inject(ThemeService);

  readonly pwa = inject(PwaUpdateService);
  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly userContext = this.auth.context;

  readonly sidebarMobileOpen = signal(false);
  readonly mainViewport = viewChild<ElementRef<HTMLElement>>('mainViewport');

  constructor() {
    this.router?.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const el = this.mainViewport()?.nativeElement;
        if (el) {
          el.scrollTop = 0;
        }
      });
  }

  toggleSidebar(): void {
    this.sidebarMobileOpen.update((v) => !v);
  }

  closeSidebar(): void {
    this.sidebarMobileOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeSidebar();
  }

  async logout(): Promise<void> {
    this.closeSidebar();
    await this.auth.logout();
  }
}
