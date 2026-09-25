import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ProductService }     from '../../services/product.service';
import { Product, CreateProduct } from '../../models/models';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? '✏️ Edit Product' : '➕ New Product' }}</h3>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>
        <div class="grid-2">
          <div class="form-group"><label>Name *</label><input [(ngModel)]="form.name" placeholder="Product name" /></div>
          <div class="form-group"><label>SKU</label><input [(ngModel)]="form.sku" placeholder="SKU-001" /></div>
          <div class="form-group"><label>Brand</label><input [(ngModel)]="form.brand" placeholder="Brand name" /></div>
          <div class="form-group"><label>Barcode</label><input [(ngModel)]="form.barcode" placeholder="Barcode" /></div>
          <div class="form-group">
            <label>Unit</label>
            <select [(ngModel)]="form.unit">
              <option>Bottle</option><option>Case</option><option>Can</option><option>Litre</option><option>Pack</option>
            </select>
          </div>
          <div class="form-group"><label>Category ID *</label><input type="number" [(ngModel)]="form.categoryId" /></div>
          <div class="form-group"><label>Purchase Price ($)</label><input type="number" [(ngModel)]="form.purchasePrice" placeholder="0.00" /></div>
          <div class="form-group"><label>Selling Price ($)</label><input type="number" [(ngModel)]="form.sellingPrice" placeholder="0.00" /></div>
          <div class="form-group"><label>Reorder Level</label><input type="number" [(ngModel)]="form.reorderLevel" /></div>
          <div class="form-group"><label>Supplier ID</label><input type="number" [(ngModel)]="form.supplierId" placeholder="Optional" /></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="save()">{{ editing ? 'Update' : 'Create' }} Product</button>
        </div>
      </div>
    </div>

    <!-- Page -->
    <div class="page-header">
      <div>
        <h2>🍷 Products</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">{{ filtered.length }} products found</p>
      </div>
      <button class="btn btn-primary" (click)="openCreate()">➕ Add Product</button>
    </div>

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input [(ngModel)]="search" (input)="filter()" placeholder="Search by name, SKU or brand…" />
      </div>
      <select [(ngModel)]="stockFilter" (change)="filter()" style="padding:8px 12px;border:1px solid var(--border);border-radius:7px">
        <option value="">All Stock</option>
        <option value="low">Low Stock Only</option>
        <option value="ok">In Stock</option>
      </select>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th><th>SKU</th><th>Brand</th><th>Unit</th>
            <th>Purchase $</th><th>Selling $</th><th>Stock</th><th>Status</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filtered">
            <td><strong>{{ p.name }}</strong><br><small style="color:var(--muted)">{{ p.categoryName }}</small></td>
            <td><code>{{ p.sku }}</code></td>
            <td>{{ p.brand }}</td>
            <td>{{ p.unit }}</td>
            <td>\${{ p.purchasePrice | number:'1.2-2' }}</td>
            <td>\${{ p.sellingPrice | number:'1.2-2' }}</td>
            <td>
              <span [class]="p.currentStock <= p.reorderLevel ? 'badge badge-danger' : 'badge badge-success'">
                {{ p.currentStock }}
              </span>
            </td>
            <td>
              <span *ngIf="p.currentStock <= p.reorderLevel" class="badge badge-warning">Low</span>
              <span *ngIf="p.currentStock > p.reorderLevel"  class="badge badge-success">OK</span>
            </td>
            <td>
              <button class="btn btn-blue btn-sm" (click)="openEdit(p)">Edit</button>
              <button class="btn btn-danger btn-sm" style="margin-left:6px" (click)="remove(p.id)">Delete</button>
            </td>
          </tr>
          <tr *ngIf="filtered.length === 0">
            <td colspan="9">
              <div class="empty-state"><div class="empty-icon">🍷</div><p>No products found</p></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;
    }
    code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px; font-family:monospace; color:var(--muted); }
    small { font-size: 12px; }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[]    = [];
  filtered: Product[]    = [];
  showModal              = false;
  editing: number | null = null;
  search                 = '';
  stockFilter            = '';
  form: CreateProduct    = this.blank();

  constructor(private svc: ProductService) {}
  ngOnInit(): void { this.load(); }

  load(): void { this.svc.getAll().subscribe(d => { this.products = d; this.filter(); }); }
  blank(): CreateProduct { return { name:'', sku:'', barcode:'', brand:'', unit:'Bottle', purchasePrice:0, sellingPrice:0, reorderLevel:10, categoryId:1 }; }

  filter(): void {
    let list = this.products;
    if (this.search) {
      const q = this.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }
    if (this.stockFilter === 'low') list = list.filter(p => p.currentStock <= p.reorderLevel);
    if (this.stockFilter === 'ok')  list = list.filter(p => p.currentStock > p.reorderLevel);
    this.filtered = list;
  }

  openCreate(): void { this.form = this.blank(); this.editing = null; this.showModal = true; }
  openEdit(p: Product): void {
    this.editing = p.id; this.showModal = true;
    this.form = { name:p.name, sku:p.sku, barcode:p.barcode, brand:p.brand, unit:p.unit, purchasePrice:p.purchasePrice, sellingPrice:p.sellingPrice, reorderLevel:p.reorderLevel, categoryId:1, supplierId:p.supplierId ?? undefined };
  }
  closeModal(): void { this.showModal = false; this.editing = null; }

  save(): void {
    const obs = this.editing ? this.svc.update(this.editing, this.form) : this.svc.create(this.form) as any;
    obs.subscribe(() => { this.load(); this.closeModal(); });
  }

  remove(id: number): void { if (confirm('Delete this product?')) this.svc.delete(id).subscribe(() => this.load()); }
}
