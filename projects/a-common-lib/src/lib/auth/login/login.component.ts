import { Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { AuthService } from '../service';

/**
 * Reusable login / sign-up card. Needs `provideFirebase(config)` in the app config.
 * Emits `signedIn` after a successful sign-in or sign-up; the app decides where to navigate.
 */
@Component({
  selector: 'lib-login',
  imports: [FormsModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  protected readonly auth = inject(AuthService);
  readonly signedIn = output<void>();

  protected readonly mode = signal<'signin' | 'signup'>('signin');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly info = signal('');
  protected email = '';
  protected password = '';

  protected toggle(e: Event) {
    e.preventDefault();
    this.mode.update((m) => (m === 'signin' ? 'signup' : 'signin'));
    this.error.set('');
    this.info.set('');
  }

  protected submit() {
    return this.run(
      this.mode() === 'signin'
        ? this.auth.signInWithEmail(this.email, this.password)
        : this.auth.signUpWithEmail(this.email, this.password),
    );
  }

  protected async forgot(e: Event) {
    e.preventDefault();
    if (!this.email) return this.error.set('Enter your email first.');
    await this.run(this.auth.resetPassword(this.email), false);
    if (!this.error()) this.info.set('Password reset email sent.');
  }

  protected logout() {
    return this.auth.signOut();
  }

  protected async run(action: Promise<unknown>, emit = true) {
    this.error.set('');
    this.info.set('');
    this.busy.set(true);
    try {
      await action;
      if (emit) this.signedIn.emit();
    } catch (e) {
      this.error.set((e as { code?: string })?.code ?? String(e));
    } finally {
      this.busy.set(false);
    }
  }
}
