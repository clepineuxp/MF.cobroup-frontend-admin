import { CurrencyPipe, DatePipe, NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoanExceptionDecision, LoanExceptionItem, LoanExceptionStatus } from '../data/loan-exception.models';
import { LoanExceptionsService } from '../data/loan-exceptions.service';

@Component({
  selector: 'app-loan-exceptions-page',
  imports: [FormsModule, CurrencyPipe, DatePipe, NgClass],
  templateUrl: './loan-exceptions.page.html',
  styleUrl: './loan-exceptions.page.scss',
})
export class LoanExceptionsPage {
  private readonly exceptionsService = inject(LoanExceptionsService);

  readonly items = signal<readonly LoanExceptionItem[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly success = signal('');
  readonly filterStatus = signal<string>('Pending');

  // Decision modal state
  readonly activeDecision = signal<{ item: LoanExceptionItem; decision: LoanExceptionDecision } | null>(null);
  readonly decisionNotes = signal('');
  readonly submittingDecision = signal(false);

  constructor() {
    void this.load();
  }

  async setFilter(status: string): Promise<void> {
    this.filterStatus.set(status);
    await this.load();
  }

  async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try {
      const statusParam = this.filterStatus() === 'All' ? undefined : this.filterStatus();
      const response = await this.exceptionsService.search(statusParam);
      this.items.set(response.items);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error desconocido al cargar solicitudes.');
    } finally {
      this.loading.set(false);
    }
  }

  openDecisionModal(item: LoanExceptionItem, decision: LoanExceptionDecision): void {
    this.activeDecision.set({ item, decision });
    this.decisionNotes.set('');
    this.error.set('');
    this.success.set('');
  }

  closeDecisionModal(): void {
    this.activeDecision.set(null);
    this.decisionNotes.set('');
  }

  async confirmDecision(): Promise<void> {
    const active = this.activeDecision();
    if (!active || this.submittingDecision()) return;

    this.submittingDecision.set(true);
    this.error.set('');
    this.success.set('');

    try {
      await this.exceptionsService.applyDecision(active.item.id, {
        decision: active.decision,
        decisionNotes: this.decisionNotes().trim() || undefined,
      });

      this.success.set(
        active.decision === 'Approved'
          ? `La solicitud para ${active.item.customerName} ha sido aprobada exitosamente.`
          : `La solicitud para ${active.item.customerName} ha sido rechazada.`
      );
      this.closeDecisionModal();
      await this.load();
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al registrar la decisión.');
    } finally {
      this.submittingDecision.set(false);
    }
  }

  getStatusClass(status: LoanExceptionStatus): string {
    switch (status) {
      case 'Approved': return 'status-approved';
      case 'Rejected': return 'status-rejected';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusLabel(status: LoanExceptionStatus): string {
    switch (status) {
      case 'Approved': return 'Aprobada';
      case 'Rejected': return 'Rechazada';
      case 'Cancelled': return 'Cancelada';
      default: return 'Pendiente';
    }
  }
}
