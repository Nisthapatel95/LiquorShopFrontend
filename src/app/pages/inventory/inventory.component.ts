import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { InventoryService }   from '../../services/inventory.service';
import { ProductService }     from '../../services/product.service';
import { AuthService }        from '../../services/auth.service';
import { StockReport, Product } from '../../models/models';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>📦 Inventory</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">Stock levels, movements and adjustments</p>
      </div>
    </div>

    <div class="stat-grid" style="margin-bottom:20px">
      <div class="stat-card green">
        <span class="stat-label">Total SKUs</span>
        <span class="stat-value">{{ stock.length }}</span>
      </div>
      <div class="stat-card red">
        <span class="stat-label">Low Stock</span>
        <span class="stat-value">{{ lowCount }}</span>
      </div>
      <div class="stat-card blue">
        <span class="stat-label">Total Units In Stock</span>
        <span class="stat-value">{{ totalUnits }}</span>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-bar">
      <button [class.active]="tab==='stock'" (click)="tab='stock'">📊 Current Stock</button>
      <button [class.active]="tab==='movements'" (click)="loadMovements(); tab='movements'">🔄 Stock Movements</button>
    </div>

    <!-- Current Stock Tab -->
    <div class="table-wrap" *ngIf="tab==='stock'">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border)">
        <input class="search-box" placeholder="🔍 Search product…" [(ngModel)]="searchStock" />
        <button *ngIf="auth.isAdmin" class="btn btn-primary" style="font-size:13px" (click)="openAdjust()">⚙️ Adjust Stock</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Product</th><th>SKU</th><th>Current Stock</th>
            <th>Reorder Level</th><th>Total In</th><th>Total Out</th><th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let s of filteredStock" [style.background]="s.currentStock <= s.reorderLevel ? '#fff8f0' : ''">
            <td><strong>{{ s.productName }}</strong></td>
            <td><code>{{ s.sku }}</code></td>
            <td>
              <span [class]="s.currentStock <= s.reorderLevel ? 'badge badge-danger' : 'badge badge-success'">
                {{ s.currentStock }}
              </span>
            </td>
            <td style="color:var(--muted)">{{ s.reorderLevel }}</td>
            <td class="in">+{{ s.totalIn }}</td>
            <td class="out">-{{ s.totalOut }}</td>
            <td>
              <span *ngIf="s.currentStock <= s.reorderLevel" class="badge badge-warning">⚠ Low Stock</span>
              <span *ngIf="s.currentStock > s.reorderLevel"  class="badge badge-success">✓ OK</span>
            </td>
          </tr>
          <tr *ngIf="filteredStock.length === 0">
            <td colspan="7"><div class="empty-state"><div class="empty-icon">📦</div><p>No inventory data</p></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Stock Movements Tab -->
    <div class="table-wrap" *ngIf="tab==='movements'">
      <div style="padding:12px 16px;border-bottom:1px solid var(--border)">
        <input class="search-box" placeholder="🔍 Search product or note…" [(ngModel)]="searchMove" />
      </div>
      <table>
        <thead>
          <tr><th>Date/Time</th><th>Product</th><th>SKU</th><th>Type</th><th>Quantity</th><th>Reference</th><th>Note</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let m of filteredMovements">
            <td style="color:var(--muted);white-space:nowrap">{{ m.createdAt | date:'dd MMM yy, h:mm a' }}</td>
            <td><strong>{{ m.productName }}</strong></td>
            <td><code>{{ m.productSKU }}</code></td>
            <td>
              <span [class]="typeBadge(m.transactionType)">{{ m.transactionType }}</span>
            </td>
            <td [class]="m.quantity > 0 ? 'in' : 'out'">{{ m.quantity > 0 ? '+' : '' }}{{ m.quantity }}</td>
            <td style="color:var(--muted)">{{ m.referenceType }} #{{ m.referenceId || '—' }}</td>
            <td style="color:var(--muted);font-size:12px">{{ m.note }}</td>
          </tr>
          <tr *ngIf="filteredMovements.length === 0">
            <td colspan="7"><div class="empty-state"><div class="empty-icon">🔄</div><p>No stock movements yet</p></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Adjust Stock Modal -->
    <div class="modal-backdrop" *ngIf="showAdjust" (click)="showAdjust=false">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>⚙️ Manual Stock Adjustment</h3>
          <button class="modal-close" (click)="showAdjust=false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Product *</label>
            <select [(ngModel)]="adj.productId">
              <option value="0" disabled>— Select product —</option>
              <option *ngFor="let p of products" [value]="p.id">{{ p.name }} (Stock: {{ p.currentStock }})</option>
            </select>
          </div>
          <div class="form-group">
            <label>Adjustment Quantity *</label>
            <input type="number" [(ngModel)]="adj.quantity" placeholder="Use negative to remove stock, e.g. -5" />
            <small style="color:var(--muted);font-size:11px">Positive = add stock, Negative = remove stock</small>
          </div>
          <div class="form-group">
            <label>Reason / Note *</label>
            <input [(ngModel)]="adj.note" placeholder="e.g. Breakage, Damage, Manual correction" />
          </div>
          <div class="alert alert-error" *ngIf="adjError">{{ adjError }}</div>
          <div class="alert alert-success" *ngIf="adjSuccess">{{ adjSuccess }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn" (click)="showAdjust=false">Cancel</button>
          <button class="btn btn-primary" (click)="submitAdjust()" [disabled]="adjSaving">
            {{ adjSaving ? 'Saving…' : '✅ Apply Adjustment' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px; font-family:monospace; color:var(--muted); }
    .in  { color: #16a34a; font-weight: 600; }
    .out { color: #dc2626; font-weight: 600; }
    .tab-bar {
      display: flex; gap: 4px; margin-bottom: 16px;
      border-bottom: 2px solid var(--border); padding-bottom: 0;
    }
    .tab-bar button {
      padding: 9px 18px; border: none; background: none;
      font-size: 13px; font-weight: 600; cursor: pointer;
      color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -2px;
      border-radius: 6px 6px 0 0; transition: .15s;
    }
    .tab-bar button.active { color: var(--primary); border-bottom-color: var(--primary); background: #f0f4ff; }
    .search-box {
      padding: 7px 12px; border: 1px solid var(--border); border-radius: 7px;
      font-size: 13px; width: 260px;
    }
  `]
})
export class InventoryComponent implements OnInit {
  stock:     StockReport[] = [];
  movements: any[]         = [];
  products:  Product[]     = [];
  tab        = 'stock';
  searchStock = '';
  searchMove  = '';
  showAdjust  = false;
  adjSaving   = false;
  adjError    = '';
  adjSuccess  = '';
  adj = { productId: 0, quantity: 0, note: '' };

  get lowCount():    number { return this.stock.filter(s => s.currentStock <= s.reorderLevel).length; }
  get totalUnits():  number { return this.stock.reduce((a, s) => a + s.currentStock, 0); }
  get filteredStock(): StockReport[] {
    const q = this.searchStock.toLowerCase();
    return q ? this.stock.filter(s => s.productName.toLowerCase().includes(q) || s.sku.toLowerCase().includes(q)) : this.stock;
  }
  get filteredMovements(): any[] {
    const q = this.searchMove.toLowerCase();
    return q ? this.movements.filter(m => m.productName.toLowerCase().includes(q) || m.note.toLowerCase().includes(q)) : this.movements;
  }

  constructor(
    private svc: InventoryService,
    private productSvc: ProductService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.svc.getCurrentStock().subscribe(d => this.stock = d);
    this.productSvc.getAll().subscribe(p => this.products = p);
  }

  loadMovements(): void {
    if (this.movements.length === 0)
      this.svc.getStockMovements().subscribe(d => this.movements = d);
  }

  typeBadge(type: string): string {
    const t = type?.toLowerCase();
    return t === 'purchase' ? 'badge badge-success' : t === 'sale' ? 'badge badge-danger' : 'badge badge-info';
  }

  openAdjust(): void {
    this.adj = { productId: 0, quantity: 0, note: '' };
    this.adjError = ''; this.adjSuccess = '';
    this.showAdjust = true;
  }

  submitAdjust(): void {
    if (!this.adj.productId || this.adj.quantity === 0 || !this.adj.note.trim()) {
      this.adjError = 'Please fill all fields. Quantity cannot be 0.'; return;
    }
    this.adjSaving = true; this.adjError = ''; this.adjSuccess = '';
    this.svc.adjustStock(this.adj).subscribe({
      next: () => {
        this.adjSuccess = 'Stock adjusted successfully!';
        this.adjSaving = false;
        this.svc.getCurrentStock().subscribe(d => this.stock = d);
        this.movements = [];
        setTimeout(() => { this.showAdjust = false; }, 1200);
      },
      error: err => { this.adjError = err?.error?.message ?? 'Adjustment failed.'; this.adjSaving = false; }
    });
  }
}
