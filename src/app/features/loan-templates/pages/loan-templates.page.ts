import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanTemplate, LoanTemplateClassification, LoanTemplateRequest, LoanTemplateStatus } from '../data/loan-template.models';
import { LoanTemplatesService } from '../data/loan-templates.service';

@Component({
  selector: 'app-loan-templates-page',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './loan-templates.page.html',
  styleUrl: './loan-templates.page.scss',
})
export class LoanTemplatesPage {
  private readonly templatesService = inject(LoanTemplatesService);
  readonly templates = signal<readonly LoanTemplate[]>([]);
  readonly editingId = signal<string | null>(null);
  readonly selected = signal<LoanTemplate | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(120)] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
    classification: new FormControl<LoanTemplateClassification>('Low', { nonNullable: true }),
    status: new FormControl<LoanTemplateStatus>('Draft', { nonNullable: true }),
    maxLoanDays: new FormControl(30, { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(3650)] }),
    maxPrincipalAmount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.0001)] }),
    allowedPercentages: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() { void this.load(); }

  async edit(template: LoanTemplate): Promise<void> {
    this.error.set('');
    try {
      const details = await this.templatesService.get(template.id);
      this.selected.set(details);
      this.editingId.set(details.id);
      this.form.reset({
        name: details.name,
        description: details.description ?? '',
        classification: details.classification,
        status: details.status,
        maxLoanDays: details.maxLoanDays,
        maxPrincipalAmount: details.maxPrincipalAmount,
        allowedPercentages: details.allowedPercentages.join(', '),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      this.error.set(this.message(error));
    }
  }

  cancelEdit(): void { this.reset(); }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    const percentages = this.parsePercentages(this.form.controls.allowedPercentages.value);
    if (!percentages) {
      this.error.set('Ingresa entre 1 y 20 porcentajes positivos separados por coma.');
      return;
    }

    const value = this.form.getRawValue();
    const request: LoanTemplateRequest = {
      name: value.name.trim(),
      description: value.description.trim() || null,
      classification: value.classification,
      status: value.status,
      maxLoanDays: value.maxLoanDays,
      maxPrincipalAmount: value.maxPrincipalAmount!,
      allowedPercentages: percentages,
    };

    this.saving.set(true); this.error.set(''); this.success.set('');
    try {
      const editingId = this.editingId();
      if (editingId) await this.templatesService.update(editingId, request);
      else await this.templatesService.create(request);
      this.success.set(editingId ? 'Plantilla actualizada y nueva versión registrada.' : 'Plantilla creada correctamente.');
      this.reset();
      this.templates.set(await this.templatesService.list());
    } catch (error) {
      this.error.set(this.message(error));
    } finally {
      this.saving.set(false);
    }
  }

  private parsePercentages(raw: string): readonly number[] | null {
    const values = [...new Set(raw.split(',').map((item) => Number(item.trim())))].sort((left, right) => left - right);
    return values.length >= 1 && values.length <= 20 && values.every((value) => Number.isFinite(value) && value > 0 && value < 100000)
      ? values
      : null;
  }

  private reset(): void {
    this.form.reset({ name: '', description: '', classification: 'Low', status: 'Draft', maxLoanDays: 30, maxPrincipalAmount: null, allowedPercentages: '' });
    this.editingId.set(null);
    this.selected.set(null);
  }

  private async load(): Promise<void> {
    this.loading.set(true); this.error.set('');
    try { this.templates.set(await this.templatesService.list()); }
    catch (error) { this.error.set(this.message(error)); }
    finally { this.loading.set(false); }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error al administrar las plantillas.';
  }
}
