import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiResponse } from '../Models/api-response';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-register',
  imports: [MatFormFieldModule, FormsModule, MatInputModule, MatIconModule , RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  email!: string;
  password!: string;
  fullName!: string;
  userName!: string;
  profilePicture: string='https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png';
  profilePictureFile: File | null= null;

  authService = inject(AuthService);
  snackBar = inject(MatSnackBar);
  router = inject(Router);

  hide = signal(true);

  togglePassword(event: MouseEvent) {
    this.hide.set(!this.hide());
  }

  register() {
    let formData = new FormData();
    formData.append('email', this.email);
    formData.append('fullName', this.fullName);
    formData.append('userName', this.userName);
    formData.append('password', this.password);
    formData.append('profilePic', this.profilePictureFile!);

    this.authService.register(formData).subscribe({
      next: () => {
        this.snackBar.open('Registration successful!', 'Close');
      
      },
      error:(error:HttpErrorResponse) => {
        let err = error.error as any;
        let errorMsg = err.errors || err.message || err.error || error.error || 'Registration failed';
        if (typeof errorMsg === 'object') {
          errorMsg = errorMsg.error || errorMsg.message || JSON.stringify(errorMsg);
        }
        this.snackBar.open(errorMsg, 'Close');
      },
      complete: () => {
        this.router.navigate(['/']);
      }
    });
  }

  onFileSelected(event: any) {
    const file:File = event.target.files[0];
    if (file){
    this.profilePictureFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.profilePicture = e.target?.result as string;
      console.log(e.target?.result);
    };
    reader.readAsDataURL(file);
    console.log(this.profilePicture);
  }
  }
}
