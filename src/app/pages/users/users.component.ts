import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { HttpClient }         from '@angular/common/http';
import { environment }        from '../../../environments/environment';

interface UserDto {
  id: number; fullName: string; email: string;
  role: string; roleId: number; isActive: boolean; createdAt: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>👥 User Management</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">Manage cashiers and admin accounts</p>
      </div>
      <button class="btn btn-primary" (click)="openCreate()">+ Add User</button>
    </div>

    <div class="stat-grid" style="margin-bottom:20px">
      <div class="stat-card blue">
        <span class="stat-label">Total Users</span>
        <span class="stat-value">{{ users.length }}</span>
      </div>
      <div class="stat-card green">
        <span class="stat-label">Active</span>
        <span class="stat-value">{{ activeCount }}</span>
      </div>
      <div class="stat-card accent">
        <span class="stat-label">Cashiers</span>
        <span class="stat-value">{{ cashierCount }}</span>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Full Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of users; let i = index">
            <td style="color:var(--muted)">{{ i + 1 }}</td>
            <td><strong>{{ u.fullName }}</strong></td>
            <td style="color:var(--muted)">{{ u.email }}</td>
            <td>
              <span [class]="u.role === 'Admin' ? 'badge badge-info' : 'badge badge-muted'">{{ u.role }}</span>
            </td>
            <td>
              <span [class]="u.isActive ? 'badge badge-success' : 'badge badge-danger'">
                {{ u.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td style="color:var(--muted)">{{ u.createdAt | date:'dd MMM yyyy' }}</td>
            <td>
              <button class="btn-sm" (click)="toggleUser(u)">{{ u.isActive ? 'Deactivate' : 'Activate' }}</button>
              <button class="btn-sm btn-sm-warn" (click)="openReset(u)" style="margin-left:6px">Reset Pwd</button>
            </td>
          </tr>
          <tr *ngIf="users.length === 0">
            <td colspan="7"><div class="empty-state"><div class="empty-icon">👥</div><p>No users found</p></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create User Modal -->
    <div class="modal-backdrop" *ngIf="showCreate" (click)="showCreate=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>+ Add New User</h3>
          <button class="modal-close" (click)="showCreate=false">✕</button>
        </div>
        <div class="modal-body">
          <div class="grid-2">
            <div class="form-group"><label>Full Name *</label><input [(ngModel)]="form.fullName" placeholder="John Doe" /></div>
            <div class="form-group"><label>Email *</label><input type="email" [(ngModel)]="form.email" placeholder="john@shop.com" /></div>
            <div class="form-group"><label>Password *</label><input type="password" [(ngModel)]="form.password" placeholder="Min 6 chars" /></div>
            <div class="form-group">
              <label>Role *</label>
              <select [(ngModel)]="form.roleId">
                <option [value]="1">Admin</option>
                <option [value]="2">Cashier</option>
              </select>
            </div>
          </div>
          <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>
          <div class="alert alert-success" *ngIf="formSuccess">{{ formSuccess }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" (click)="showCreate=false">Cancel</button>
          <button class="btn btn-primary" (click)="createUser()" [disabled]="saving">
            {{ saving ? 'Creating…' : '✅ Create User' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Reset Password Modal -->
    <div class="modal-backdrop" *ngIf="showReset" (click)="showReset=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>🔑 Reset Password — {{ resetTarget?.fullName }}</h3>
          <button class="modal-close" (click)="showReset=false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group"><label>New Password *</label><input type="password" [(ngModel)]="newPassword" placeholder="Min 6 characters" /></div>
          <div class="alert alert-error" *ngIf="resetError">{{ resetError }}</div>
          <div class="alert alert-success" *ngIf="resetSuccess">{{ resetSuccess }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" (click)="showReset=false">Cancel</button>
          <button class="btn btn-primary" (click)="resetPassword()" [disabled]="saving">
            {{ saving ? 'Saving…' : '🔑 Reset Password' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-sm { padding:4px 10px; border-radius:5px; border:1px solid var(--border); background:#fff; font-size:12px; cursor:pointer; }
    .btn-sm:hover { background:var(--bg); }
    .btn-sm-warn { color:var(--danger); border-color:var(--danger); }
    .btn-sm-warn:hover { background:#fee2e2; }
  `]
})
export class UsersComponent implements OnInit {
  users:       UserDto[] = [];
  showCreate   = false;
  showReset    = false;
  saving       = false;
  formError    = '';
  formSuccess  = '';
  resetError   = '';
  resetSuccess = '';
  resetTarget: UserDto | null = null;
  newPassword  = '';
  form = { fullName: '', email: '', password: '', roleId: 2 };

  get activeCount():  number { return this.users.filter(u => u.isActive).length; }
  get cashierCount(): number { return this.users.filter(u => u.role === 'Cashier').length; }

  private get api() { return `${environment.apiUrl}/users`; }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.load(); }
  load(): void { this.http.get<UserDto[]>(this.api).subscribe(d => this.users = d); }

  openCreate(): void {
    this.form = { fullName: '', email: '', password: '', roleId: 2 };
    this.formError = ''; this.formSuccess = '';
    this.showCreate = true;
  }

  createUser(): void {
    if (!this.form.fullName || !this.form.email || !this.form.password) {
      this.formError = 'All fields are required.'; return;
    }
    this.saving = true; this.formError = '';
    this.http.post(this.api, this.form).subscribe({
      next: () => { this.formSuccess = 'User created!'; this.saving = false; this.load(); setTimeout(() => this.showCreate = false, 1000); },
      error: err => { this.formError = err?.error?.message ?? 'Failed to create user.'; this.saving = false; }
    });
  }

  toggleUser(u: UserDto): void {
    this.http.put(`${this.api}/${u.id}/toggle`, {}).subscribe(() => this.load());
  }

  openReset(u: UserDto): void {
    this.resetTarget = u; this.newPassword = '';
    this.resetError = ''; this.resetSuccess = '';
    this.showReset = true;
  }

  resetPassword(): void {
    if (!this.newPassword || this.newPassword.length < 6) {
      this.resetError = 'Password must be at least 6 characters.'; return;
    }
    this.saving = true;
    this.http.put(`${this.api}/${this.resetTarget!.id}/reset-password`, { newPassword: this.newPassword }).subscribe({
      next: () => { this.resetSuccess = 'Password reset!'; this.saving = false; setTimeout(() => this.showReset = false, 1000); },
      error: () => { this.resetError = 'Reset failed.'; this.saving = false; }
    });
  }
}
