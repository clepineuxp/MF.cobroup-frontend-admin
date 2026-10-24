import { EditorDialogComponent } from '../../../shared/ui/editor-dialog/editor-dialog.component';
import { DatePipe, NgClass } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentMethodItem } from '../data/payment-method.models';
import { PaymentMethodsService } from '../data/payment-methods.service';

@Component({
  selector: 'app-payment-methods-page',
  imports: [EditorDialogComponent, ReactiveFormsModule, DatePipe, NgClass],
  templateUrl: './payment-methods.page.html',
  styleUrl: './payment-methods.page.scss',
})
export class PaymentMethodsPage implements OnInit {
  private readonly service = inject(PaymentMethodsService);

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

  async ngOnInit(): Promise<void> {
    await this.loadItems();
  }

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
    const nextOrder = (this.items().length > 0 ? Math.max(...this.items().map((i) => i.displayOrder)) + 1 : 1);
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
      this.items.update((list) =>
        list.map((m) => (m.id === item.id ? updated : m))
      );
      this.success.set(
        `Medio de pago "${item.name}" ${updated.isActive ? 'activado' : 'desactivado'}.`
      );
    } catch (err: unknown) {
      this.error.set(err instanceof Error ? err.message : 'Error al cambiar el estado.');
    } finally { this.submitting.set(false); }
  }
}
