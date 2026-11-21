import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'a-common-lib';
import { MARITAL_STATUS_OPTIONS, ProfileDoc } from '../../models/profile';
import { ProfilesService } from '../../services/profiles';

type ProfileCard = ProfileDoc & { id: string };

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly profiles = inject(ProfilesService);
  private readonly router = inject(Router);

  protected readonly list = signal<ProfileCard[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  async ngOnInit() {
    const uid = this.auth.auth.currentUser?.uid ?? '';
    try {
      this.list.set(await this.profiles.listVisible(uid));
    } catch (e) {
      this.error.set((e as { code?: string })?.code ?? String(e));
    } finally {
      this.loading.set(false);
    }
  }

  protected initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');
  }

  protected marital(value: ProfileDoc['maritalStatus']): string {
    return MARITAL_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
  }

  protected async logout() {
    await this.auth.signOut();
    this.router.navigate(['/login-page']);
  }
}
