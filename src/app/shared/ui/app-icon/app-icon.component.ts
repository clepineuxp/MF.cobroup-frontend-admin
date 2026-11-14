import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon', standalone: true, changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    @switch (name) {
      @case ('diamond') { <path d="m12 2 10 10-10 10L2 12 12 2Z"/><path d="m12 7 5 5-5 5-5-5 5-5Z"/> }
      @case ('route') { <circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/> }
      @case ('users') { <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/> }
      @case ('money') { <circle cx="12" cy="12" r="9"/><path d="M16 8.5c-.8-.8-2-1.25-3.5-1.25-2 0-3.5.9-3.5 2.25 0 3.5 7 1.5 7 5 0 1.35-1.5 2.25-3.5 2.25-1.5 0-2.8-.45-3.7-1.35M12 5v14"/> }
      @case ('clipboard') { <rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5V3h6v1.5M8 9h8M8 13h8M8 17h5"/> }
      @case ('bolt') { <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/> }
      @case ('customer') { <circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4.4 3.5-6.5 8-6.5s7.2 2.1 8 6.5"/> }
      @case ('payment') { <path d="M4 8h16M4 16h16M7 5 4 8l3 3M17 13l3 3-3 3"/> }
      @case ('map') { <path d="m3 6 5-2 8 2 5-2v14l-5 2-8-2-5 2V6Z"/><path d="M8 4v14M16 6v14"/> }
      @case ('analytics') { <path d="M4 19V9M10 19V5M16 19v-7M22 19V2"/> }
      @case ('settings') { <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M2 12h3M19 12h3M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12"/> }
      @case ('lock') { <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/> }
      @case ('menu') { <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/> }
      @case ('refresh') { <path d="M21 2v6h-6"/><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M3 22v-6h6"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/> }
      @case ('logout') { <path d="M10 17l5-5-5-5M15 12H3M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"/> }
      @case ('search') { <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/> }
      @case ('plus') { <path d="M12 5v14M5 12h14"/> }
      @case ('calendar') { <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/> }
      @case ('filter') { <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/> }
      @case ('check') { <polyline points="20 6 9 17 4 12"/> }
      @case ('clock') { <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/> }
      @case ('globe') { <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/> }
      @case ('info') { <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/> }
      @default { <circle cx="12" cy="12" r="9"/> }
    }
  </svg>`,
  styles: [':host{display:inline-grid;width:1.25rem;height:1.25rem;place-items:center;color:inherit}:host svg{display:block;width:100%;height:100%}'],
})
export class AppIconComponent { @Input() name = 'diamond'; }
