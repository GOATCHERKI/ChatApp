import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../Models/api-response';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ MatInputModule, MatIconModule, FormsModule, RouterModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email!: string;
  password!: string;

  private authService = inject(AuthService); 
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  hide = signal(true);

  login() {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.authService.me().subscribe();
        this.snackBar.open('Login successful', 'Close',{
          duration: 3000,
        }) ;
      },
      error: (err: HttpErrorResponse) => {
        let erro = err.error as any;
        let errorMsg = erro.errors || erro.message || erro.error || err.error || 'Login failed';

        // If errorMsg is an object, try to extract the 'error' property or stringify
        if (typeof errorMsg === 'object') {
          errorMsg = errorMsg.error || errorMsg.message || JSON.stringify(errorMsg);
        }

        this.snackBar.open(errorMsg, 'Close', {
          duration: 3000,
        });
      },
      complete: () => {
        this.router.navigate(['/']);
      }
    })
  }

  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation()
  }
}
