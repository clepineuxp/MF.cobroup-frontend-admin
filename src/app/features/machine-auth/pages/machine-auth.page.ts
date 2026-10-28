import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutesService } from '../../routes/data/routes.service';
import { CollectionRoute } from '../../routes/data/route.models';
import { MachineAuthService, PendingMachineOtp, MachineAuthorization } from '../data/machine-auth.service';

@Component({
  selector: 'app-machine-auth-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './machine-auth.page.html',
  styleUrl: './machine-auth.page.scss',
})
export class MachineAuthPage {
  private readonly routesService = inject(RoutesService); private readonly machine = inject(MachineAuthService);
  readonly routes = signal<readonly CollectionRoute[]>([]); readonly pending = signal<readonly PendingMachineOtp[]>([]); readonly authorizations = signal<readonly MachineAuthorization[]>([]); readonly authorizationTotal = signal(0); readonly error = signal(''); readonly loading = signal(true); readonly acting = signal(''); routeId = ''; roleFilter: 'all' | 'Supervisor' | 'Collector' = 'all'; userId = ''; page = 1; pageSize = 20; otp: Record<string, string> = {}; days: Record<string, number | null> = {}; indefinite: Record<string, boolean> = {};
  constructor() { void this.load(); }
  async load(): Promise<void> { this.loading.set(true); this.error.set(''); try { this.routes.set(await this.routesService.list()); this.pending.set(await this.machine.pending(this.routeId || undefined)); await this.loadAuthorizations(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible cargar autorizaciones.'); } finally { this.loading.set(false); } }
  async loadAuthorizations(): Promise<void> { const result = await this.machine.list({ routeId: this.routeId || undefined, role: this.roleFilter === 'all' ? undefined : this.roleFilter, userId: this.userId || undefined, page: this.page, pageSize: this.pageSize }); this.authorizations.set(result.items); this.authorizationTotal.set(result.total); }
  onRouteChange(): void { this.userId = ''; this.page = 1; void this.load(); }
  onAuthorizationFilterChange(): void { this.page = 1; void this.loadAuthorizations().catch((e) => this.error.set(e instanceof Error ? e.message : 'No fue posible filtrar dispositivos.')); }
  availableUsers(): readonly { id: string; displayName: string; role: 'Supervisor' | 'Collector' }[] { const source = this.routeId ? this.routes().filter(route => route.id === this.routeId) : this.routes(); const users = new Map<string, { id: string; displayName: string; role: 'Supervisor' | 'Collector' }>(); source.forEach(route => { users.set(route.supervisor.id, { ...route.supervisor, role: 'Supervisor' }); route.collectors.forEach(user => users.set(user.id, { ...user, role: 'Collector' })); }); return [...users.values()].filter(user => this.roleFilter === 'all' || user.role === this.roleFilter).sort((a, b) => a.displayName.localeCompare(b.displayName)); }
  totalPages(): number { return Math.max(1, Math.ceil(this.authorizationTotal() / this.pageSize)); }
  previousPage(): void { if (this.page > 1) { this.page -= 1; void this.loadAuthorizations(); } }
  nextPage(): void { if (this.page < this.totalPages()) { this.page += 1; void this.loadAuthorizations(); } }
  routeName(id: string): string { return this.routes().find(x => x.id === id)?.name ?? id.slice(0, 8); }
  async approve(item: PendingMachineOtp): Promise<void> { this.acting.set(item.requestId); try { await this.machine.approve(item.requestId, this.otp[item.requestId] ?? '', this.days[item.requestId] ?? null, this.indefinite[item.requestId] ?? false); await this.load(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible autorizar.'); } finally { this.acting.set(''); } }
  async cancel(item: PendingMachineOtp): Promise<void> { this.acting.set(item.requestId); try { await this.machine.cancel(item.requestId); await this.load(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible cancelar el OTP.'); } finally { this.acting.set(''); } }
  async revoke(item: MachineAuthorization): Promise<void> { this.acting.set(item.id); try { await this.machine.revoke(item.id); await this.load(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible revocar.'); } finally { this.acting.set(''); } }
  displayName(userId: string, name?: string): string { return name?.trim() || `Usuario ${userId.slice(0, 8)}`; }
  formatDate(value: string): string { return new Date(value).toLocaleString(); }
}
