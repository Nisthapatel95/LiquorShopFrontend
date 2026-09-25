import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { HttpClient }         from '@angular/common/http';
import { environment }        from '../../../environments/environment';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2>🔍 Audit Logs</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">{{ logs.length }} events recorded</p>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Record ID</th><th>Changes</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let log of logs">
            <td style="color:var(--muted);white-space:nowrap">{{ log.createdAt | date:'dd MMM, h:mm a' }}</td>
            <td><strong>{{ log.userName }}</strong></td>
            <td>
              <span [class]="actionBadge(log.action)">{{ log.action }}</span>
            </td>
            <td><code>{{ log.entity }}</code></td>
            <td style="color:var(--muted)">#{{ log.entityId }}</td>
            <td>
              <span *ngIf="log.newValues" class="change-pill" [title]="log.newValues">View →</span>
            </td>
          </tr>
          <tr *ngIf="logs.length === 0">
            <td colspan="6">
              <div class="empty-state"><div class="empty-icon">🔍</div><p>No audit events recorded yet</p></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px; font-family:monospace; color:var(--muted); }
    .change-pill {
      cursor: pointer; font-size: 11px; color: var(--primary);
      background: #dbeafe; padding: 2px 8px; border-radius: 10px;
    }
  `]
})
export class AuditLogsComponent implements OnInit {
  logs: any[] = [];

  actionBadge(action: string): string {
    const a = action?.toLowerCase();
    return a === 'create' ? 'badge badge-success' : a === 'update' ? 'badge badge-info' : a === 'delete' ? 'badge badge-danger' : 'badge badge-muted';
  }

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.http.get<any[]>(`${environment.apiUrl}/auditlogs`).subscribe(d => this.logs = d);
  }
}
