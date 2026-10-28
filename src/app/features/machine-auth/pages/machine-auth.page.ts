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
  readonly routes = signal<readonly CollectionRoute[]>([]); readonly pending = signal<readonly PendingMachineOtp[]>([]); readonly authorizations = signal<readonly MachineAuthorization[]>([]); readonly error = signal(''); readonly loading = signal(true); readonly acting = signal(''); routeId = ''; otp: Record<string, string> = {}; days: Record<string, number | null> = {}; indefinite: Record<string, boolean> = {};
  constructor() { void this.load(); }
  async load(): Promise<void> { this.loading.set(true); this.error.set(''); try { this.routes.set(await this.routesService.list()); this.pending.set(await this.machine.pending(this.routeId || undefined)); this.authorizations.set(this.routeId ? await this.machine.list(this.routeId) : []); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible cargar autorizaciones.'); } finally { this.loading.set(false); } }
  routeName(id: string): string { return this.routes().find(x => x.id === id)?.name ?? id.slice(0, 8); }
  async approve(item: PendingMachineOtp): Promise<void> { this.acting.set(item.requestId); try { await this.machine.approve(item.requestId, this.otp[item.requestId] ?? '', this.days[item.requestId] ?? null, this.indefinite[item.requestId] ?? false); await this.load(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible autorizar.'); } finally { this.acting.set(''); } }
  async revoke(item: MachineAuthorization): Promise<void> { this.acting.set(item.id); try { await this.machine.revoke(item.id); await this.load(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible revocar.'); } finally { this.acting.set(''); } }
  displayName(userId: string, name?: string): string { return name?.trim() || `Usuario ${userId.slice(0, 8)}`; }
  formatDate(value: string): string { return new Date(value).toLocaleString(); }
}
