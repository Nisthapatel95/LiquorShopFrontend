import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { HttpClient }         from '@angular/common/http';
import { environment }        from '../../../environments/environment';

interface CategoryDto {
  id: number; name: string; description: string; productCount: number;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>🏷️ Categories</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">Manage product categories</p>
      </div>
      <button class="btn btn-primary" (click)="openCreate()">+ Add Category</button>
    </div>

    <div class="stat-grid" style="margin-bottom:20px">
      <div class="stat-card blue">
        <span class="stat-label">Total Categories</span>
        <span class="stat-value">{{ cats.length }}</span>
      </div>
      <div class="stat-card green">
        <span class="stat-label">Total Products</span>
        <span class="stat-value">{{ totalProducts }}</span>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>#</th><th>Category Name</th><th>Description</th><th>Products</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of cats; let i = index">
            <td style="color:var(--muted)">{{ i + 1 }}</td>
            <td><strong>{{ c.name }}</strong></td>
            <td style="color:var(--muted)">{{ c.description || '—' }}</td>
            <td>
              <span class="badge badge-info">{{ c.productCount }} products</span>
            </td>
            <td>
              <button class="btn-sm" (click)="openEdit(c)">✏️ Edit</button>
              <button class="btn-sm btn-sm-danger" (click)="delete(c)" style="margin-left:6px"
                      [disabled]="c.productCount > 0" [title]="c.productCount > 0 ? 'Has products' : 'Delete'">
                🗑️ Delete
              </button>
            </td>
          </tr>
          <tr *ngIf="cats.length === 0">
            <td colspan="5"><div class="empty-state"><div class="empty-icon">🏷️</div><p>No categories yet</p></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create / Edit Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="showModal=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editId ? '✏️ Edit Category' : '+ New Category' }}</h3>
          <button class="modal-close" (click)="showModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group"><label>Category Name *</label><input [(ngModel)]="form.name" placeholder="e.g. Whiskey, Vodka, Beer" /></div>
          <div class="form-group"><label>Description</label><input [(ngModel)]="form.description" placeholder="Optional description" /></div>
          <div class="alert alert-error" *ngIf="formError">{{ formError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" (click)="showModal=false">Cancel</button>
          <button class="btn btn-primary" (click)="save()" [disabled]="saving">
            {{ saving ? 'Saving…' : (editId ? '✅ Update' : '✅ Create') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-sm { padding:4px 10px; border-radius:5px; border:1px solid var(--border); background:#fff; font-size:12px; cursor:pointer; }
    .btn-sm:hover { background:var(--bg); }
    .btn-sm-danger { color:var(--danger); border-color:var(--danger); }
    .btn-sm-danger:hover:not(:disabled) { background:#fee2e2; }
    .btn-sm:disabled { opacity:.4; cursor:not-allowed; }
  `]
})
export class CategoriesComponent implements OnInit {
  cats:      CategoryDto[] = [];
  showModal  = false;
  saving     = false;
  formError  = '';
  editId     = 0;
  form = { name: '', description: '' };

  get totalProducts(): number { return this.cats.reduce((a, c) => a + c.productCount, 0); }
  private get api() { return `${environment.apiUrl}/categories`; }

  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.load(); }
  load(): void { this.http.get<CategoryDto[]>(this.api).subscribe(d => this.cats = d); }

  openCreate(): void {
    this.editId = 0; this.form = { name: '', description: '' };
    this.formError = ''; this.showModal = true;
  }
  openEdit(c: CategoryDto): void {
    this.editId = c.id; this.form = { name: c.name, description: c.description };
    this.formError = ''; this.showModal = true;
  }

  save(): void {
    if (!this.form.name.trim()) { this.formError = 'Category name is required.'; return; }
    this.saving = true; this.formError = '';
    const req = this.editId
      ? this.http.put(`${this.api}/${this.editId}`, this.form)
      : this.http.post(this.api, this.form);
    req.subscribe({
      next: () => { this.saving = false; this.showModal = false; this.load(); },
      error: err => { this.formError = err?.error?.message ?? 'Save failed.'; this.saving = false; }
    });
  }

  delete(c: CategoryDto): void {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    this.http.delete(`${this.api}/${c.id}`).subscribe({
      next: () => this.load(),
      error: err => alert(err?.error?.message ?? 'Delete failed.')
    });
  }
}
