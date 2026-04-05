import { Component, signal, inject } from '@angular/core';
import { LucideAngularModule, Mail, EyeOff, Eye, Loader2 } from 'lucide-angular';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BCheckboxComponent } from '@shared/components/b-checkbox/b-checkbox.component';
import { CommonModule } from '@angular/common';
import { BInputComponent } from '@shared/components/b-input/b-input.component';
import { LoginService } from '../services/login.service';
import { ILoginData } from '../interfaces/auth';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-login-page',
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule,
    BInputComponent,
    BCheckboxComponent,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(LoginService);
  private readonly _Router = inject(Router);
  readonly MailIcon = Mail;
  readonly EyeOffIcon = EyeOff;
  readonly EyeIcon = Eye;
  error = signal<string | null>(null);
  isLoading = signal(false);
  loginForm: FormGroup = this.fb.group({
    identity: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    remember_me: [false],
  });
  readonly LoaderIcon = Loader2;

  onSubmit() {
    if (this.loginForm.valid) {
      this.error.set('');
      this.isLoading.set(true);
      this.authService
        .login(this.loginForm.value as ILoginData)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: (response) => {
            this._Router.navigate(['/']);
          },
          error: (error) => {
            console.error(error);
            this.error.set(error.error.message);
          },
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  getErrorMessage(controlName: string): string | null {
    const control = this.loginForm.get(controlName);
    if (!control || !control.touched || !control.errors) return null;
    if (control.errors['required']) return 'This field is required';
    if (control.errors['identity']) return 'Invalid email format';
    if (control.errors['minlength'])
      return `Minimum length is ${control.errors['minlength'].requiredLength}`;

    return 'Invalid input';
  }

  isInvalid(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.touched && control.invalid);
  }
}
