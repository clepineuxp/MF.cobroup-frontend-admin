import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EditorDialogComponent } from './editor-dialog.component';

@Component({ imports: [EditorDialogComponent], template: `<button class="opener" (click)="open.set(true)">Nuevo</button>@if (open()) { <app-editor-dialog title="Nuevo registro" [busy]="busy()" (dismiss)="open.set(false)"><form><input aria-label="Nombre" /></form></app-editor-dialog> }` })
class Host { readonly open = signal(false); readonly busy = signal(false); }

describe('EditorDialogComponent', () => {
  beforeEach(() => {
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function(this: HTMLDialogElement) { this.setAttribute('open', ''); } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function(this: HTMLDialogElement) { this.removeAttribute('open'); } });
    TestBed.configureTestingModule({ imports: [Host] });
  });
  it('blocks Escape and close while saving, then destroys the form and restores focus and scrolling', async () => {
    const fixture = TestBed.createComponent(Host); await fixture.whenStable();
    document.body.appendChild(fixture.nativeElement);
    const root = fixture.nativeElement as HTMLElement;
    const opener = root.querySelector<HTMLButtonElement>('.opener')!;
    const originalOverflow = document.body.style.overflow;
    opener.focus(); opener.click(); await fixture.whenStable();
    const dialog = root.querySelector('dialog')!;
    expect(document.body.style.overflow).toBe('hidden'); expect(dialog.getAttribute('aria-labelledby')).toBe('editor-dialog-title');
    fixture.componentInstance.busy.set(true); await fixture.whenStable();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    expect(fixture.componentInstance.open()).toBe(true);
    expect(root.querySelector<HTMLButtonElement>('.close')!.disabled).toBe(true);
    fixture.componentInstance.busy.set(false); await fixture.whenStable();
    const cancel = new Event('cancel', { cancelable: true }); dialog.dispatchEvent(cancel); await fixture.whenStable();
    expect(cancel.defaultPrevented).toBe(true); expect(root.querySelector('form')).toBeNull();
    expect(document.body.style.overflow).toBe(originalOverflow); expect(document.activeElement).toBe(opener);
    fixture.nativeElement.remove();
  });
});
