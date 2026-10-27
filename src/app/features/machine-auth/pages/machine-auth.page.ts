import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutesService } from '../../routes/data/routes.service';
import { CollectionRoute } from '../../routes/data/route.models';
import { MachineAuthService, PendingMachineOtp, MachineAuthorization } from '../data/machine-auth.service';

@Component({ selector: 'app-machine-auth-page', standalone: true, imports: [FormsModule], template: `
<section><h2>Autorización de dispositivos</h2><p>Gestiona los celulares y computadores autorizados por ruta.</p>
<label>Ruta <select [(ngModel)]="routeId" (ngModelChange)="load()"><option value="">Todas</option>@for (route of routes(); track route.id) { <option [value]="route.id">{{ route.name }}</option> }</select></label>
@if (error()) { <p role="alert">{{ error() }}</p> } @if (pending().length) { <h3>Solicitudes pendientes</h3><ul>@for (item of pending(); track item.requestId) { <li><span>Ruta {{ routeName(item.routeId) }} · usuario {{ item.userId }} · máquina {{ item.machineId.slice(0, 12) }}</span><input [(ngModel)]="otp[item.requestId]" placeholder="OTP" inputmode="numeric" maxlength="6"/><input [(ngModel)]="days[item.requestId]" type="number" min="1" placeholder="Días"/><label><input type="checkbox" [(ngModel)]="indefinite[item.requestId]"/> Indefinido</label><button (click)="approve(item)">Autorizar</button></li> }</ul> } @if (authorizations().length) { <h3>Dispositivos autorizados</h3><ul>@for (item of authorizations(); track item.id) { <li>{{ routeName(item.routeId) }} · {{ item.userId }} · {{ item.machineId.slice(0, 12) }} · {{ item.indefinite ? 'Indefinido' : item.authorizedUntilUtc }} <button (click)="revoke(item)">Revocar</button></li> }</ul> }</section>` })
export class MachineAuthPage {
  private readonly routesService = inject(RoutesService); private readonly machine = inject(MachineAuthService);
  readonly routes = signal<readonly CollectionRoute[]>([]); readonly pending = signal<readonly PendingMachineOtp[]>([]); readonly authorizations = signal<readonly MachineAuthorization[]>([]); readonly error = signal(''); routeId = ''; otp: Record<string, string> = {}; days: Record<string, number | null> = {}; indefinite: Record<string, boolean> = {};
  constructor() { void this.load(); }
  async load(): Promise<void> { try { this.routes.set(await this.routesService.list()); this.pending.set(await this.machine.pending(this.routeId || undefined)); this.authorizations.set(this.routeId ? await this.machine.list(this.routeId) : []); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible cargar autorizaciones.'); } }
  routeName(id: string): string { return this.routes().find(x => x.id === id)?.name ?? id.slice(0, 8); }
  async approve(item: PendingMachineOtp): Promise<void> { try { await this.machine.approve(item.requestId, this.otp[item.requestId] ?? '', this.days[item.requestId] ?? null, this.indefinite[item.requestId] ?? false); await this.load(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible autorizar.'); } }
  async revoke(item: MachineAuthorization): Promise<void> { try { await this.machine.revoke(item.id); await this.load(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'No fue posible revocar.'); } }
}
