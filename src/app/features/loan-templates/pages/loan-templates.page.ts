import { EditorDialogComponent } from '../../../shared/ui/editor-dialog/editor-dialog.component';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoanTemplate, LoanTemplateClassification, LoanTemplateRequest, LoanTemplateStatus } from '../data/loan-template.models';
import { RoutesService } from '../../routes/data/routes.service';
import { CollectionRoute } from '../../routes/data/route.models';
import { LoanTemplatesService } from '../data/loan-templates.service';

@Component({
  selector: 'app-loan-templates-page',
  imports: [EditorDialogComponent, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './loan-templates.page.html',
  styleUrl: './loan-templates.page.scss',
})
export class LoanTemplatesPage {
  readonly editorOpen = signal(false);
  readonly editorLoading = signal(false);
  readonly editorLoadFailed = signal(false);
  private editVersion = 0;
  private readonly destroyRef = inject(DestroyRef);
  openCreate(): void {
    if (this.saving()) return;
    this.reset(); this.error.set(''); this.success.set(''); this.editorOpen.set(true);
  }
  closeEditor(): void {
    if (this.saving()) return;
    this.reset(); this.error.set('');
  }
  private readonly templatesService = inject(LoanTemplatesService);
  private readonly routesService = inject(RoutesService);
  readonly routes = signal<readonly CollectionRoute[]>([]);
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
    minPrincipalAmount: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.0001)] }),
    minPercentage: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.0001), Validators.max(99999.9999)] }),
    maxPercentage: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.0001), Validators.max(99999.9999)] }),
    routeIds: new FormControl<string[]>([], { nonNullable: true }),
  });

  constructor() { void this.load(); }

  async edit(template: LoanTemplate): Promise<void> {
    if (this.saving()) return;
    this.reset();
    const version = ++this.editVersion;
    this.editingId.set(template.id);
    this.editorOpen.set(true); this.editorLoading.set(true);
    this.success.set('');
    this.error.set('');
    try {
      const details = await this.templatesService.get(template.id);
      if (version !== this.editVersion || this.destroyRef.destroyed) return;
      this.selected.set(details);
      this.editingId.set(details.id);
      this.form.reset({
        name: details.name,
        description: details.description ?? '',
        classification: details.classification,
        status: details.status,
        maxLoanDays: details.maxLoanDays,
        maxPrincipalAmount: details.maxPrincipalAmount,
        minPrincipalAmount: details.minPrincipalAmount,
        minPercentage: details.minPercentage,
        maxPercentage: details.maxPercentage,
        routeIds: [...details.routeIds],
      });

    } catch (error) {
      if (version === this.editVersion && !this.destroyRef.destroyed) { this.error.set(this.message(error)); this.editorLoadFailed.set(true); }
    } finally { if (version === this.editVersion) this.editorLoading.set(false); }
  }

  cancelEdit(): void { this.reset(); }

  async submit(): Promise<void> {
    if (this.form.invalid || this.saving() || this.editorLoading() || this.editorLoadFailed()) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.minPrincipalAmount! > value.maxPrincipalAmount! || value.minPercentage! > value.maxPercentage!) {
      this.error.set('Los valores mínimos no pueden superar los máximos.');
      return;
    }
    const request: LoanTemplateRequest = {
      name: value.name.trim(),
      description: value.description.trim() || null,
      classification: value.classification,
      status: value.status,
      maxLoanDays: value.maxLoanDays,
      maxPrincipalAmount: value.maxPrincipalAmount!,
      minPrincipalAmount: value.minPrincipalAmount!,
      minPercentage: value.minPercentage!,
      maxPercentage: value.maxPercentage!,
      routeIds: value.routeIds,
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

  private reset(): void {
    this.editVersion++; this.editorLoading.set(false); this.editorLoadFailed.set(false);
    this.editorOpen.set(false);
    this.form.reset({ name: '', description: '', classification: 'Low', status: 'Draft', maxLoanDays: 30, maxPrincipalAmount: null, minPrincipalAmount: null, minPercentage: null, maxPercentage: null, routeIds: [] });
    this.editingId.set(null);
    this.selected.set(null);
  }

  private async load(): Promise<void> {
    this.loading.set(true); this.error.set('');
    try {
      const [templates, routes] = await Promise.all([this.templatesService.list(), this.routesService.list()]);
      this.templates.set(templates);
      this.routes.set(routes.filter(route => route.status === 'Active'));
    }
    catch (error) { this.error.set(this.message(error)); }
    finally { this.loading.set(false); }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Ocurrió un error al administrar las plantillas.';
  }
}
