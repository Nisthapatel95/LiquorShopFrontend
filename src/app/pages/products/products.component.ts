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

      <div class="view-toggle">
        <button class="toggle-btn" [class.active]="viewMode === 'table'" (click)="viewMode = 'table'" title="Table View">
          📋 Table
        </button>
        <button class="toggle-btn" [class.active]="viewMode === 'card'" (click)="viewMode = 'card'" title="Card View">
          🎴 Cards
        </button>
      </div>
    </div>

    <!-- Table View -->
    <div class="table-wrap" *ngIf="viewMode === 'table'">
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

    <!-- Card View Grid -->
    <div class="card-grid" *ngIf="viewMode === 'card'">
      <div class="store-card" *ngFor="let p of filtered">
        <div class="store-card-img-wrap">
          <span [class]="p.currentStock <= p.reorderLevel ? 'badge-pill low' : 'badge-pill ok'">
            {{ p.currentStock <= p.reorderLevel ? 'Low Stock' : 'In Stock' }}
          </span>
          <img [src]="getProductImg(p)" [alt]="p.name" class="store-card-img" />
        </div>

        <div class="store-card-content">
          <div class="brand-tag">{{ p.brand || 'Premium Selection' }}</div>
          <h4 class="store-card-title">{{ p.name }}</h4>
          <div class="rating-row">
            <span class="stars">★★★★★</span>
            <span class="sku-code">SKU: {{ p.sku }}</span>
          </div>

          <div class="price-action-row">
            <div class="price-box">
              <span class="price-label">Price</span>
              <span class="price-val">\${{ p.sellingPrice | number:'1.2-2' }}</span>
            </div>
            <div class="card-action-btns">
              <button class="icon-btn edit" (click)="openEdit(p)" title="Edit Product">✏️</button>
              <button class="icon-btn delete" (click)="remove(p.id)" title="Delete Product">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <div class="empty-state-wrap" *ngIf="filtered.length === 0">
        <div class="empty-state"><div class="empty-icon">🍷</div><p>No products found</p></div>
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      display: flex; gap: 12px; align-items: center; margin-bottom: 16px; flex-wrap: wrap;
    }
    code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px; font-family:monospace; color:var(--muted); }
    small { font-size: 12px; }

    .view-toggle {
      display: flex; background: #e2e8f0; border-radius: 8px; padding: 2px; margin-left: auto;
    }
    .toggle-btn {
      border: none; background: transparent; padding: 6px 12px; font-size: 12.5px; font-weight: 600;
      border-radius: 6px; cursor: pointer; color: #64748b; transition: all 0.2s;
    }
    .toggle-btn.active {
      background: #ffffff; color: #0f172a; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    /* E-Commerce Catalog Card Grid */
    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
      gap: 20px;
      margin-top: 14px;
    }
    .store-card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
    }
    .store-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
      border-color: #cbd5e1;
    }
    .store-card-img-wrap {
      position: relative;
      width: 100%;
      height: 200px;
      background: #f8fafc;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
    }
    .store-card-img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 8px 12px rgba(0,0,0,0.15));
      transition: transform 0.3s ease;
    }
    .store-card:hover .store-card-img {
      transform: scale(1.05);
    }
    .badge-pill {
      position: absolute;
      top: 12px;
      left: 12px;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-pill.ok { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-pill.low { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }

    .store-card-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
      justify-content: space-between;
    }
    .brand-tag {
      font-size: 11px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .store-card-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin: 4px 0 8px 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .rating-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .stars { color: #f59e0b; font-size: 12px; letter-spacing: 2px; }
    .sku-code { font-size: 11px; font-family: monospace; color: #64748b; }

    .price-action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 12px;
      border-top: 1px solid #f1f5f9;
    }
    .price-box { display: flex; flex-direction: column; }
    .price-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; }
    .price-val { font-size: 18px; font-weight: 800; color: #059669; }

    .card-action-btns { display: flex; gap: 6px; }
    .icon-btn {
      width: 32px; height: 32px; border-radius: 8px; border: 1px solid #e2e8f0;
      background: #ffffff; cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: all 0.2s; font-size: 13px;
    }
    .icon-btn.edit:hover { background: #eff6ff; border-color: #3b82f6; }
    .icon-btn.delete:hover { background: #fef2f2; border-color: #ef4444; }
    .empty-state-wrap { grid-column: 1 / -1; }
  `]
})
export class ProductsComponent implements OnInit {
  products: Product[]    = [];
  filtered: Product[]    = [];
  viewMode: 'table' | 'card' = 'card';
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

  getProductImg(p: Product): string {
    const name = (p.name || '').toLowerCase();
    const unit = (p.unit || '').toLowerCase();

    if (name.includes('bent water') || name.includes('thunder funk')) {
      return '/assets/bent_water_can.png';
    }
    if (name.includes('bud light')) {
      return '/assets/beer.jpg';
    }
    if (name.includes('budweiser')) {
      return '/assets/budweiser_can.png';
    }
    if (name.includes('cutwater')) {
      return '/assets/beer_can_clean.jpg';
    }
    if (name.includes('beer') || name.includes('can') || unit.includes('can')) {
      return '/assets/beer.jpg';
    }
    if (name.includes('wine') || name.includes('nr') || name.includes('box')) {
      return '/assets/wine.jpg';
    }
    return '/assets/whiskey.jpg';
  }

  remove(id: number): void { if (confirm('Delete this product?')) this.svc.delete(id).subscribe(() => this.load()); }
}
