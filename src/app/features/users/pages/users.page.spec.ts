import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthContext } from '../../../core/auth/auth-context.model';
import { AuthService } from '../../../core/auth/auth.service';
import { OrganizationUser } from '../data/users.models';
import { UsersService } from '../data/users.service';
import { UsersPage } from './users.page';

describe('UsersPage', () => {
  const context = signal<AuthContext | null>(null);
  const service = { list: vi.fn(), create: vi.fn() };
  const user: OrganizationUser = { id: 'user-1', username: 'ana', displayName: 'Ana', role: 'Supervisor',
    phoneNumber: '+573001234567', isActive: true, isOwner: false, joinedAtUtc: '2026-10-23T12:00:00Z' };
  const admin: AuthContext = { userId: 'admin', organizationId: 'org-1', organizationCode: 'NORTE', username: 'admin', displayName: 'Admin', role: 'Admin' };

  beforeEach(async () => {
    vi.resetAllMocks();
    context.set(admin);
    service.list.mockResolvedValue([user]);
    service.create.mockResolvedValue(user);
    await TestBed.configureTestingModule({ imports: [UsersPage], providers: [
      { provide: UsersService, useValue: service }, { provide: AuthService, useValue: { context } },
    ] }).compileComponents();
  });

  it('renders the team and does not offer creation of administrators', async () => {
    const fixture = TestBed.createComponent(UsersPage);
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ana');
    const options = [...fixture.nativeElement.querySelectorAll('option')].map((option: HTMLOptionElement) => option.value);
    expect(options).toEqual(['Collector', 'Supervisor']);
  });

  it('creates an operational user and clears the password', async () => {
    const fixture = TestBed.createComponent(UsersPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    page.form.setValue({ username: ' ana ', displayName: ' Ana ', phoneNumber: '+573001234567', password: '1', role: 'Supervisor' });
    await page.submit();
    expect(service.create).toHaveBeenCalledWith({ username: 'ana', displayName: 'Ana', phoneNumber: '+573001234567', password: '1', role: 'Supervisor' });
    expect(page.form.controls.password.value).toBe('');
    expect(page.success()).toContain('ana');
  });

  it('rejects incomplete input and presents duplicate errors without retaining the password', async () => {
    const fixture = TestBed.createComponent(UsersPage);
    await fixture.whenStable();
    const page = fixture.componentInstance;
    await page.submit();
    expect(service.create).not.toHaveBeenCalled();
    page.form.setValue({ username: 'ana', displayName: 'Ana', phoneNumber: '+573001234567', password: 'private-password-test', role: 'Collector' });
    service.create.mockRejectedValueOnce(new Error('El nombre de usuario no está disponible.'));
    await page.submit();
    expect(page.error()).toContain('no está disponible');
    expect(page.form.controls.password.value).toBe('');
    expect(page.form.controls.username.value).toBe('ana');
  });

  it('does not fetch or create for a supervisor', async () => {
    context.set({ ...admin, role: 'Supervisor' });
    const fixture = TestBed.createComponent(UsersPage);
    await fixture.whenStable();
    expect(service.list).not.toHaveBeenCalled();
    await fixture.componentInstance.submit();
    expect(service.create).not.toHaveBeenCalled();
  });

  it('clears previous tenant data and ignores a late response after changing organization', async () => {
    let resolveOld!: (users: readonly OrganizationUser[]) => void;
    service.list.mockReturnValueOnce(new Promise<readonly OrganizationUser[]>((resolve) => { resolveOld = resolve; }));
    const fixture = TestBed.createComponent(UsersPage);
    fixture.detectChanges();
    context.set({ ...admin, organizationId: 'org-2', organizationCode: 'SUR' });
    service.list.mockResolvedValueOnce([]);
    fixture.detectChanges();
    resolveOld([user]);
    await fixture.whenStable();
    expect(fixture.componentInstance.users()).toEqual([]);
    expect(fixture.componentInstance.success()).toBe('');
  });
});
