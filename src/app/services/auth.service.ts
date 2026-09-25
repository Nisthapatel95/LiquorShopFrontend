import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Router }      from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly base = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.loadUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.base}/login`, request).pipe(
      tap(res => {
        localStorage.setItem('auth_user', JSON.stringify(res));
        this.currentUserSubject.next(res);
      })
    );
  }

  register(request: RegisterRequest): Observable<any> {
    return this.http.post(`${this.base}/register`, request);
  }

  logout(): void {
    localStorage.removeItem('auth_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  get currentUser(): LoginResponse | null { return this.currentUserSubject.value; }
  get token(): string | null              { return this.currentUserSubject.value?.token ?? null; }
  get isLoggedIn(): boolean               { return !!this.token; }
  get isAdmin(): boolean                  { return this.currentUserSubject.value?.role === 'Admin'; }

  private loadUser(): LoginResponse | null {
    const stored = localStorage.getItem('auth_user');
    return stored ? JSON.parse(stored) : null;
  }
}
