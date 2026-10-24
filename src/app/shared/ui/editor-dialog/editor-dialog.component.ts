import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, inject, input, output, viewChild } from '@angular/core';

@Component({
  selector: 'app-editor-dialog',
  template: `
    <dialog #dialog aria-labelledby="editor-dialog-title" [attr.aria-busy]="busy()" (cancel)="cancel($event)" (click)="backdrop($event)">
      <header><div><p>COBRO UP · ADMINISTRACIÓN</p><h3 id="editor-dialog-title">{{ title() }}</h3></div>
        <button type="button" class="close" aria-label="Cerrar formulario" [disabled]="busy()" (click)="dismiss.emit()">✕</button>
      </header>
      @if (error()) { <p class="editor-error" role="alert">{{ error() }}</p> }
      <fieldset [disabled]="busy()"><ng-content /></fieldset>
      <footer><button type="button" [disabled]="busy()" (click)="dismiss.emit()">Cancelar</button></footer>
    </dialog>`,
  styleUrl: './editor-dialog.component.scss'
})
export class EditorDialogComponent implements AfterViewInit, OnDestroy {
  readonly title = input.required<string>();
  readonly busy = input(false);
  readonly error = input('');
  readonly dismiss = output<void>();
  private readonly document = inject(DOCUMENT);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly opener = this.document.activeElement as HTMLElement | null;
  private readonly overflow = this.document.body.style.overflow;
  ngAfterViewInit(): void {
    this.dialog().nativeElement.showModal();
    this.document.body.style.overflow = 'hidden';
  }
  ngOnDestroy(): void {
    this.dialog().nativeElement.close();
    this.document.body.style.overflow = this.overflow;
    if (this.opener?.isConnected) this.opener.focus();
  }
  cancel(event: Event): void { event.preventDefault(); if (!this.busy()) this.dismiss.emit(); }
  backdrop(event: MouseEvent): void {
    if (event.target !== this.dialog().nativeElement || this.busy()) return;
    const rect = this.dialog().nativeElement.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) this.dismiss.emit();
  }
}
