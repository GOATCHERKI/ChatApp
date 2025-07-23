import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ApiResponse } from '../Models/api-response';
import { User } from '../Models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseUrl = "http://localhost:5000/api/account";
  private token ='token';

  constructor(private httpClient: HttpClient) {}

  register(data:FormData): Observable<ApiResponse<string>>
  {
    return this.httpClient.post<ApiResponse<string>>(`${this.baseUrl}/register`, data).pipe(tap(res=> 
    {
      localStorage.setItem(this.token, res.data);
    }
    ));
  }

  login(email: string, password: string): Observable<ApiResponse<string>> {
    return this.httpClient.post<ApiResponse<string>>(`${this.baseUrl}/login`, { email, password }).pipe(tap(res => {
      if(res.isSuccess) {
        localStorage.setItem(this.token, res.data);
      }
      return res;
    }));
  }
 
  me(): Observable<ApiResponse<User>> {

    return this.httpClient.get<ApiResponse<User>>(`${this.baseUrl}/me`,
      {headers:{
      "Authorization": `Bearer ${this.getAccessToken}`
    }
  }).pipe(tap(res => {
      if (res.isSuccess) {
        localStorage.setItem("user", JSON.stringify(res.data));
      }
      return res;
    }));
  }

  get getAccessToken(): string | null {
    return localStorage.getItem(this.token) || '';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.token);
  }

    logout() {
    localStorage.removeItem(this.token);
    localStorage.removeItem('user');
  }

  get currentLoggedInUser(): User | null
  {
    const user:User = JSON.parse(localStorage.getItem('user') || '{}');
    return user;
  }
}
