import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RouteSelectorComponent, RouteSelectorOption } from './route-selector.component';

describe('RouteSelectorComponent', () => {
  const sampleRoutes: RouteSelectorOption[] = Array.from({ length: 200 }, (_, i) => ({
    id: `route-${i + 1}`,
    name: `Ruta ${i + 1} - Sector ${i % 2 === 0 ? 'Norte' : 'Sur'}`,
    supervisor: { displayName: `Supervisor ${i + 1}` },
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteSelectorComponent],
    }).compileComponents();
  });

  it('renders Todas las rutas by default and opens searchable dropdown for 200 routes', async () => {
    const fixture = TestBed.createComponent(RouteSelectorComponent);
    const component = fixture.componentInstance;
    component.routes = sampleRoutes;
    fixture.detectChanges();

    expect(component.displayLabel()).toBe('Todas las rutas');
    expect(fixture.nativeElement.textContent).toContain('200');

    const trigger = fixture.nativeElement.querySelector('.route-selector-trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);
    expect(component.filteredRoutes().length).toBe(200);
  });

  it('filters routes by name or supervisor when typing in the search input', async () => {
    const fixture = TestBed.createComponent(RouteSelectorComponent);
    const component = fixture.componentInstance;
    component.routes = sampleRoutes;
    component.toggleDropdown();
    fixture.detectChanges();

    const searchInput = fixture.nativeElement.querySelector('.route-search-input') as HTMLInputElement;
    searchInput.value = 'Ruta 199';
    searchInput.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.filteredRoutes().length).toBe(1);
    expect(component.filteredRoutes()[0].id).toBe('route-199');
  });

  it('emits valueChange and closes dropdown when selecting a route or Todas las rutas', async () => {
    const fixture = TestBed.createComponent(RouteSelectorComponent);
    const component = fixture.componentInstance;
    component.routes = sampleRoutes;
    const spy = vi.fn();
    component.valueChange.subscribe(spy);

    component.toggleDropdown();
    fixture.detectChanges();

    component.selectOption('route-50');
    fixture.detectChanges();

    expect(component.value).toBe('route-50');
    expect(component.displayLabel()).toContain('Ruta 50');
    expect(component.isOpen()).toBe(false);
    expect(spy).toHaveBeenCalledWith('route-50');

    component.selectOption('');
    fixture.detectChanges();
    expect(component.isAllSelected()).toBe(true);
    expect(spy).toHaveBeenCalledWith('');
  });
});
