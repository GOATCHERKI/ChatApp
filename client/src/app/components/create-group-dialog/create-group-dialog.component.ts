import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { User } from '../../Models/User';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-create-group-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatButtonModule,
    FormsModule,
    NgForOf
  ],
  templateUrl: './create-group-dialog.component.html',
  styleUrl: './create-group-dialog.component.css'
})
export class CreateGroupDialogComponent {
  groupName = '';
  selectedUsers: string[] = [];
  groupType = 'private';
  users: User[] = [];

  constructor(
    public dialogRef: MatDialogRef<CreateGroupDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { users: User[] }
  ) {
    this.users = data.users;
  }

  onCancel() {
    this.dialogRef.close();
  }

  onCreate() {
    this.dialogRef.close({
      name: this.groupName,
      memberIds: this.selectedUsers,
      type: this.groupType
    });
  }
}
