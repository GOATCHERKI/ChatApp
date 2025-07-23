// cloudinary.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { envirenmont } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  constructor(private http: HttpClient) {}

// cloudinary.service.ts
uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', envirenmont.cloudinary.uploadPreset);
    formData.append('cloud_name', envirenmont.cloudinary.cloudName);
  
    return this.http.post<any>(
      `https://api.cloudinary.com/v1_1/${envirenmont.cloudinary.cloudName}/upload`,
      formData
    );
  }
}