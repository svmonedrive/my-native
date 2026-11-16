import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { RevealDirective } from '../reveal.directive';
import { SectionHeadingComponent } from '../section-heading/section-heading.component';

export interface ContactFormValue {
  name: string;
  email: string;
  phone: string;
  message: string;
}

type Field = 'name' | 'email' | 'message';

/**
 * Contact form with validation. It has no backend of its own: it emits `submitted` and the host decides what to
 * do with the message (send to an API, open a mail client, ...). Give the element `id="contact"` to anchor it.
 */
@Component({
  selector: 'lib-contact-form',
  imports: [ReactiveFormsModule, TranslatePipe, SectionHeadingComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  readonly titleKey = input.required<string>();
  readonly subtitleKey = input<string>();
  readonly submitted = output<ContactFormValue>();

  protected readonly sent = signal(false);
  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', Validators.required],
  });

  /** Translation key of the error to show for a field, or null. Only shown after the field was touched. */
  protected error(field: Field): string | null {
    const control = this.form.controls[field];
    if (!control.touched || !control.errors) return null;
    return control.errors['required'] ? 'common.required' : 'common.invalidEmail';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitted.emit(this.form.getRawValue());
    this.sent.set(true);
    this.form.reset();
  }
}
