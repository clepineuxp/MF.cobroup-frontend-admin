import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  computed,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AppIconComponent } from '../app-icon/app-icon.component';

export interface RouteSelectorOption {
  readonly id: string;
  readonly name: string;
  readonly description?: string | null;
  readonly status?: string;
  readonly supervisor?: {
    readonly id?: string;
    readonly username?: string;
    readonly displayName?: string;
  } | null;
}

@Component({
  selector: 'app-route-selector',
  standalone: true,
  imports: [FormsModule, AppIconComponent],
  templateUrl: './route-selector.component.html',
  styleUrl: './route-selector.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RouteSelectorComponent),
      multi: true,
    },
  ],
})
export class RouteSelectorComponent implements ControlValueAccessor {
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  private readonly routesSignal = signal<readonly RouteSelectorOption[]>([]);
  private readonly selectedValueSignal = signal<string>('');
  private readonly disabledSignal = signal<boolean>(false);

  @Input()
  set routes(value: readonly RouteSelectorOption[] | null | undefined) {
    this.routesSignal.set(value ?? []);
  }
  get routes(): readonly RouteSelectorOption[] {
    return this.routesSignal();
  }

  @Input()
  set value(val: string | null | undefined) {
    this.selectedValueSignal.set(val ?? this.allValue);
  }
  get value(): string {
    return this.selectedValueSignal();
  }

  @Input()
  set disabled(val: boolean) {
    this.disabledSignal.set(Boolean(val));
    if (val) {
      this.isOpen.set(false);
    }
  }
  get disabled(): boolean {
    return this.disabledSignal();
  }

  @Input() includeAllOption = true;
  @Input() allLabel = 'Todas las rutas';
  @Input() allValue = '';
  @Input() placeholder = 'Selecciona una ruta';
  @Input() searchPlaceholder = 'Buscar ruta por nombre o supervisor…';
  @Input() showSupervisor = false;
  @Input() ariaLabel = 'Seleccionar ruta';
  @Input() selectId = '';

  @Output() readonly valueChange = new EventEmitter<string>();

  readonly isOpen = signal(false);
  readonly searchQuery = signal('');

  private onChangeCallback: (value: string) => void = () => {};
  private onTouchedCallback: () => void = () => {};

  readonly selectedRoute = computed<RouteSelectorOption | null>(() => {
    const current = this.selectedValueSignal();
    if (!current || (this.includeAllOption && current === this.allValue)) {
      return null;
    }
    return this.routesSignal().find((r) => r.id === current) ?? null;
  });

  readonly displayLabel = computed<string>(() => {
    const route = this.selectedRoute();
    if (route) {
      const sup = this.showSupervisor ? route.supervisor?.displayName : null;
      return sup ? `${route.name} (${sup})` : route.name;
    }
    if (this.includeAllOption) {
      return this.allLabel;
    }
    return this.placeholder;
  });

  readonly isAllSelected = computed<boolean>(() => {
    const current = this.selectedValueSignal();
    return this.includeAllOption && (current === this.allValue || current === '');
  });

  readonly filteredRoutes = computed<readonly RouteSelectorOption[]>(() => {
    const list = this.routesSignal();
    const rawTerm = this.searchQuery().trim();
    if (!rawTerm) {
      return list;
    }
    const normalizedTerm = this.normalizeText(rawTerm);
    return list.filter((route) => {
      const nameMatch = this.normalizeText(route.name).includes(normalizedTerm);
      const descMatch = this.normalizeText(route.description ?? '').includes(normalizedTerm);
      const supMatch = this.normalizeText(route.supervisor?.displayName ?? '').includes(normalizedTerm);
      return nameMatch || descMatch || supMatch;
    });
  });

  writeValue(val: string | null | undefined): void {
    this.selectedValueSignal.set(val ?? (this.includeAllOption ? this.allValue : ''));
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedCallback = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDropdown(): void {
    if (this.disabledSignal()) return;
    const next = !this.isOpen();
    this.isOpen.set(next);
    if (next) {
      this.searchQuery.set('');
      setTimeout(() => {
        this.searchInputRef?.nativeElement?.focus();
      }, 10);
    } else {
      this.onTouchedCallback();
    }
  }

  closeDropdown(): void {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.searchQuery.set('');
      this.onTouchedCallback();
    }
  }

  selectOption(newValue: string): void {
    if (this.disabledSignal()) return;
    this.selectedValueSignal.set(newValue);
    this.onChangeCallback(newValue);
    this.valueChange.emit(newValue);
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.onTouchedCallback();
  }

  onSearchInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  clearSearch(event: Event): void {
    event.stopPropagation();
    this.searchQuery.set('');
    this.searchInputRef?.nativeElement?.focus();
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closeDropdown();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      const matches = this.filteredRoutes();
      if (matches.length > 0) {
        this.selectOption(matches[0].id);
      } else if (this.includeAllOption && !this.searchQuery().trim()) {
        this.selectOption(this.allValue);
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const target = event.target as Node | null;
    if (target && !this.hostRef.nativeElement.contains(target)) {
      this.closeDropdown();
    }
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
