import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { AuthService, OrganizationOption } from '../../../core/auth/auth.service';
import { AuthContext } from '../../../core/auth/auth-context.model';
import { OrganizationSwitcherComponent } from './organization-switcher.component';

describe('OrganizationSwitcherComponent', () => {
  const contextSignal = signal<AuthContext | null>({
    userId: 'user-1',
    username: 'jhonny',
    displayName: 'Jhonny',
    role: 'Admin',
    organizationId: 'org-1',
    organizationCode: 'NORTE',
  });

  const authMock = {
    context: contextSignal,
    listOrganizations: vi.fn(),
    selectOrganization: vi.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [OrganizationSwitcherComponent],
      providers: [
        { provide: AuthService, useValue: authMock },
      ],
    }).compileComponents();
  });

  it('does NOT render the switcher when user has only 1 organization', async () => {
    const singleOrg: OrganizationOption[] = [
      {
        organizationId: 'org-1',
        organizationCode: 'NORTE',
        organizationName: 'Organización Norte',
        role: 'Admin',
        lastAccessedAtUtc: null,
      },
    ];
    authMock.listOrganizations.mockResolvedValue(singleOrg);

    const fixture = TestBed.createComponent(OrganizationSwitcherComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.organization-switcher')).toBeNull();
    expect(root.querySelector('select')).toBeNull();
  });

  it('renders the switcher and options when user has more than 1 organization', async () => {
    const multipleOrgs: OrganizationOption[] = [
      {
        organizationId: 'org-1',
        organizationCode: 'NORTE',
        organizationName: 'Organización Norte',
        role: 'Admin',
        lastAccessedAtUtc: null,
      },
      {
        organizationId: 'org-2',
        organizationCode: 'SUR',
        organizationName: 'Organización Sur',
        role: 'Supervisor',
        lastAccessedAtUtc: null,
      },
    ];
    authMock.listOrganizations.mockResolvedValue(multipleOrgs);

    const fixture = TestBed.createComponent(OrganizationSwitcherComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.organization-switcher')).toBeTruthy();
    const select = root.querySelector('select');
    expect(select).toBeTruthy();
    expect(select?.options.length).toBe(2);
  });

  it('calls auth.selectOrganization when a new organization is selected', async () => {
    const multipleOrgs: OrganizationOption[] = [
      {
        organizationId: 'org-1',
        organizationCode: 'NORTE',
        organizationName: 'Organización Norte',
        role: 'Admin',
        lastAccessedAtUtc: null,
      },
      {
        organizationId: 'org-2',
        organizationCode: 'SUR',
        organizationName: 'Organización Sur',
        role: 'Supervisor',
        lastAccessedAtUtc: null,
      },
    ];
    authMock.listOrganizations.mockResolvedValue(multipleOrgs);

    const fixture = TestBed.createComponent(OrganizationSwitcherComponent);
    await fixture.whenStable();
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'org-2';
    select.dispatchEvent(new Event('change'));

    expect(authMock.selectOrganization).toHaveBeenCalledWith('org-2');
  });
});
