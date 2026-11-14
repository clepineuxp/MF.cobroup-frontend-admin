import { EditorDialogComponent } from '../../../shared/ui/editor-dialog/editor-dialog.component';
import { AppIconComponent } from '../../../shared/ui/app-icon/app-icon.component';
import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  NonPaymentReasonItem,
  ParameterConfigTabId,
  ParameterConfigTabMeta,
  PaymentMethodItem,
} from '../data/payment-method.models';
import { PaymentMethodsService } from '../data/payment-methods.service';

@Component({
  selector: 'app-payment-methods-page',
  imports: [EditorDialogComponent, AppIconComponent, ReactiveFormsModule, DatePipe, NgClass],
  templateUrl: './payment-methods.page.html',
  styleUrl: './payment-methods.page.scss',
})
export class PaymentMethodsPage implements OnInit {
  private readonly service = inject(PaymentMethodsService);

  readonly tabs: readonly ParameterConfigTabMeta[] = [
    {
      id: 'payment-methods',
      label: 'Medios de pago',
      description: 'Canales de recaudo autorizados para cobradores en ruta.',
      icon: 'payment',
    },
    {
      id: 'non-payment-reasons',
      label: 'Motivos de no pago',
      description: 'Causales estandarizadas para reportar visitas sin abono.',
      icon: 'clipboard',
    },
  ];

  readonly activeTab = signal<ParameterConfigTabId>('payment-methods');
  readonly activeTabMeta = computed(
    () => this.tabs.find((t) => t.id === this.activeTab()) ?? this.tabs[0]
  );

  // 1. Payment Methods State
  readonly items = signal<readonly PaymentMethodItem[]>([]);
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly success = signal('');

  readonly showModal = signal(false);
  readonly editingItem = signal<PaymentMethodItem | null>(null);

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),
    displayOrder: new FormControl<number>(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(999)],
    }),
  });

  // 2. Non-Payment Reasons State
  readonly reasons = signal<readonly NonPaymentReasonItem[]>([]);
  readonly loadingReasons = signal(false);
  readonly showReasonModal = signal(false);
  readonly editingReason = signal<NonPaymentReasonItem | null>(null);

  readonly reasonForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(200)],
    }),
    displayOrder: new FormControl<number>(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(999)],
    }),
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([this.loadItems(), this.loadReasons()]);
  }

  selectTab(tab: ParameterConfigTabId): void {
    if (this.activeTab() === tab) return;
    this.activeTab.set(tab);
    this.error.set('');
    this.success.set('');
  }

  // =========================================================================
  // 1. PAYMENT METHODS MINI-CRUD
  // =========================================================================

  async loadItems(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set('');
      const data = await this.service.list();
      this.items.set(data);
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al cargar los medios de pago.');
    } finally {
      this.loading.set(false);
    }
  }

  openCreate(): void {
    if (this.submitting()) return;
    this.editingItem.set(null);
    const nextOrder =
      this.items().length > 0 ? Math.max(...this.items().map((i) => i.displayOrder)) + 1 : 1;
    this.form.reset({
      name: '',
      displayOrder: nextOrder,
    });
    this.error.set('');
    this.success.set('');
    this.showModal.set(true);
  }

  openEdit(item: PaymentMethodItem): void {
    if (this.submitting()) return;
    this.editingItem.set(item);
    this.form.reset({
      name: item.name,
      displayOrder: item.displayOrder,
    });
    this.error.set('');
    this.success.set('');
    this.showModal.set(true);
  }

  closeModal(): void {
    if (this.submitting()) return;
    this.resetEditor();
    this.error.set('');
  }

  private resetEditor(): void {
    this.form.reset({ name: '', displayOrder: 1 });
    this.showModal.set(false);
    this.editingItem.set(null);
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const editing = this.editingItem();
    this.submitting.set(true);
    this.error.set('');
    this.success.set('');

    try {
      if (editing) {
        await this.service.update(editing.id, {
          name: raw.name.trim(),
          displayOrder: raw.displayOrder,
          isActive: editing.isActive,
        });
        this.success.set(`Medio de pago "${raw.name}" actualizado.`);
      } else {
        await this.service.create({
          name: raw.name.trim(),
          displayOrder: raw.displayOrder,
        });
        this.success.set(`Medio de pago "${raw.name}" creado con éxito.`);
      }

      this.resetEditor();
      await this.loadItems();
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al guardar el medio de pago.');
    } finally {
      this.submitting.set(false);
    }
  }

  async toggleStatus(item: PaymentMethodItem): Promise<void> {
    if (this.submitting()) return;
    this.submitting.set(true);
    try {
      this.error.set('');
      const updated = await this.service.toggleStatus(item.id, !item.isActive);
      this.items.update((list) => list.map((m) => (m.id === item.id ? updated : m)));
      this.success.set(
        `Medio de pago "${item.name}" ${updated.isActive ? 'activado' : 'desactivado'}.`
      );
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al cambiar el estado.');
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteItem(item: PaymentMethodItem): Promise<void> {
    if (this.submitting() || !this.service.delete) return;
    this.submitting.set(true);
    try {
      this.error.set('');
      await this.service.delete(item.id);
      this.items.update((list) => list.filter((m) => m.id !== item.id));
      this.success.set(`Medio de pago "${item.name}" eliminado.`);
      if (this.editingItem()?.id === item.id) {
        this.resetEditor();
      }
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al eliminar el medio de pago.');
    } finally {
      this.submitting.set(false);
    }
  }

  // =========================================================================
  // 2. NON-PAYMENT REASONS MINI-CRUD
  // =========================================================================

  async loadReasons(): Promise<void> {
    if (!this.service.listReasons) return;
    try {
      this.loadingReasons.set(true);
      const data = await this.service.listReasons(true);
      this.reasons.set(data);
    } catch (err: unknown) {
      if (this.activeTab() === 'non-payment-reasons') {
        this.error.set(
          err instanceof Error ? err.message : 'Error al cargar los motivos de no pago.'
        );
      }
    } finally {
      this.loadingReasons.set(false);
    }
  }

  openCreateReason(): void {
    if (this.submitting()) return;
    this.editingReason.set(null);
    const nextOrder =
      this.reasons().length > 0
        ? Math.max(...this.reasons().map((r) => r.displayOrder)) + 1
        : 1;
    this.reasonForm.reset({
      name: '',
      description: '',
      displayOrder: nextOrder,
    });
    this.error.set('');
    this.success.set('');
    this.showReasonModal.set(true);
  }

  openEditReason(reason: NonPaymentReasonItem): void {
    if (this.submitting()) return;
    this.editingReason.set(reason);
    this.reasonForm.reset({
      name: reason.name,
      description: reason.description ?? '',
      displayOrder: reason.displayOrder,
    });
    this.error.set('');
    this.success.set('');
    this.showReasonModal.set(true);
  }

  closeReasonModal(): void {
    if (this.submitting()) return;
    this.resetReasonEditor();
    this.error.set('');
  }

  private resetReasonEditor(): void {
    this.reasonForm.reset({ name: '', description: '', displayOrder: 1 });
    this.showReasonModal.set(false);
    this.editingReason.set(null);
  }

  async saveReason(): Promise<void> {
    if (this.reasonForm.invalid || this.submitting()) {
      this.reasonForm.markAllAsTouched();
      return;
    }

    const raw = this.reasonForm.getRawValue();
    const editing = this.editingReason();
    this.submitting.set(true);
    this.error.set('');
    this.success.set('');

    try {
      const description = raw.description.trim() || null;
      if (editing) {
        await this.service.updateReason(editing.id, {
          name: raw.name.trim(),
          description,
          displayOrder: raw.displayOrder,
          isActive: editing.isActive,
        });
        this.success.set(`Motivo de no pago "${raw.name}" actualizado.`);
      } else {
        await this.service.createReason({
          name: raw.name.trim(),
          description,
          displayOrder: raw.displayOrder,
        });
        this.success.set(`Motivo de no pago "${raw.name}" creado con éxito.`);
      }

      this.resetReasonEditor();
      await this.loadReasons();
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al guardar el motivo de no pago.');
    } finally {
      this.submitting.set(false);
    }
  }

  async toggleReasonStatus(reason: NonPaymentReasonItem): Promise<void> {
    if (this.submitting()) return;
    this.submitting.set(true);
    try {
      this.error.set('');
      const updated = await this.service.toggleReasonStatus(reason.id, !reason.isActive);
      this.reasons.update((list) => list.map((r) => (r.id === reason.id ? updated : r)));
      this.success.set(
        `Motivo "${reason.name}" ${updated.isActive ? 'activado' : 'desactivado'}.`
      );
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al cambiar el estado del motivo.');
    } finally {
      this.submitting.set(false);
    }
  }

  async deleteReason(reason: NonPaymentReasonItem): Promise<void> {
    if (this.submitting() || !this.service.deleteReason) return;
    this.submitting.set(true);
    try {
      this.error.set('');
      await this.service.deleteReason(reason.id);
      this.reasons.update((list) => list.filter((r) => r.id !== reason.id));
      this.success.set(`Motivo "${reason.name}" eliminado.`);
      if (this.editingReason()?.id === reason.id) {
        this.resetReasonEditor();
      }
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al eliminar el motivo de no pago.');
    } finally {
      this.submitting.set(false);
    }
  }
}
