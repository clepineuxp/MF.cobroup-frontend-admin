import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { RouteSelectionService } from './route-selection.service';

describe('RouteSelectionService', () => {
  let service: RouteSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RouteSelectionService);
  });

  it('starts with empty string representing Todas las rutas', () => {
    expect(service.selectedRouteId()).toBe('');
  });

  it('stores and normalizes selected route IDs', () => {
    service.setSelectedRoute('route-10');
    expect(service.selectedRouteId()).toBe('route-10');

    service.setSelectedRoute('all');
    expect(service.selectedRouteId()).toBe('');

    service.setSelectedRoute('route-20');
    service.clear();
    expect(service.selectedRouteId()).toBe('');
  });

  it('validates selected route against loaded routes and resets if absent', () => {
    service.setSelectedRoute('route-99');
    const valid = service.ensureValidRoute([{ id: 'route-1' }, { id: 'route-2' }]);
    expect(valid).toBe('');
    expect(service.selectedRouteId()).toBe('');

    service.setSelectedRoute('route-2');
    expect(service.ensureValidRoute([{ id: 'route-1' }, { id: 'route-2' }])).toBe('route-2');
  });
});
