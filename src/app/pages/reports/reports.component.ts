import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ReportService }      from '../../services/inventory.service';
import { SalesSummary, PurchaseSummary, LowStock } from '../../models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div><h2>📈 Reports</h2><p style="color:var(--muted);font-size:13px;margin-top:2px">Sales, purchases and stock analysis</p></div>
      <div class="filter-row">
        <input type="date" [(ngModel)]="from" />
        <span style="color:var(--muted)">to</span>
        <input type="date" [(ngModel)]="to" />
        <button class="btn btn-primary" (click)="load()">Generate</button>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="stat-grid" style="margin-bottom:24px">
      <div class="stat-card green">
        <span class="stat-label">Total Revenue</span>
        <span class="stat-value">\${{ totalRev | number:'1.0-0' }}</span>
        <span class="stat-sub">Net sales in period</span>
      </div>
      <div class="stat-card blue">
        <span class="stat-label">Total Orders</span>
        <span class="stat-value">{{ totalOrders }}</span>
      </div>
      <div class="stat-card accent">
        <span class="stat-label">Total Purchased</span>
        <span class="stat-value">\${{ totalPurchased | number:'1.0-0' }}</span>
      </div>
      <div class="stat-card red">
        <span class="stat-label">Low Stock Items</span>
        <span class="stat-value">{{ lowStock.length }}</span>
      </div>
    </div>

    <div class="report-grid">
      <!-- Sales -->
      <div class="card">
        <h3 style="margin-bottom:14px">📊 Daily Sales</h3>
        <div *ngIf="!sales.length" class="empty-state" style="padding:28px">
          <div class="empty-icon">📊</div><p>No sales in selected period</p>
        </div>
        <table *ngIf="sales.length">
          <thead><tr><th>Date</th><th>Orders</th><th>Revenue</th><th>Tax</th><th>Net</th></tr></thead>
          <tbody>
            <tr *ngFor="let s of sales">
              <td>{{ s.date | date:'dd MMM' }}</td>
              <td>{{ s.totalOrders }}</td>
              <td>\${{ s.totalRevenue | number:'1.0-0' }}</td>
              <td style="color:var(--muted)">\${{ s.totalTax | number:'1.0-0' }}</td>
              <td><strong>\${{ s.netRevenue | number:'1.0-0' }}</strong></td>
            </tr>
            <tr style="background:#f8fafc;font-weight:700">
              <td>Total</td><td>{{ totalOrders }}</td><td>\${{ totalRevBrutto | number:'1.0-0' }}</td><td></td><td>\${{ totalRev | number:'1.0-0' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Purchases -->
      <div class="card">
        <h3 style="margin-bottom:14px">🚚 Daily Purchases</h3>
        <div *ngIf="!purchases.length" class="empty-state" style="padding:28px">
          <div class="empty-icon">🚚</div><p>No purchases in selected period</p>
        </div>
        <table *ngIf="purchases.length">
          <thead><tr><th>Date</th><th>Orders</th><th>Total Purchased</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of purchases">
              <td>{{ p.date | date:'dd MMM' }}</td>
              <td>{{ p.totalOrders }}</td>
              <td><strong>\${{ p.totalPurchased | number:'1.0-0' }}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Low stock -->
    <div class="card" style="margin-top:20px" *ngIf="lowStock.length">
      <h3 style="margin-bottom:14px">⚠️ Low Stock — Action Required</h3>
      <table>
        <thead><tr><th>Product</th><th>SKU</th><th>Current Stock</th><th>Reorder Level</th><th>Shortfall</th></tr></thead>
        <tbody>
          <tr *ngFor="let l of lowStock">
            <td><strong>{{ l.productName }}</strong></td>
            <td><code>{{ l.sku }}</code></td>
            <td><span class="badge badge-danger">{{ l.currentStock }}</span></td>
            <td>{{ l.reorderLevel }}</td>
            <td style="color:var(--danger);font-weight:700">{{ l.reorderLevel - l.currentStock }} units</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .filter-row { display: flex; align-items: center; gap: 10px; }
    .report-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px; font-family:monospace; color:var(--muted); }
    @media (max-width: 900px) { .report-grid { grid-template-columns: 1fr; } }
  `]
})
export class ReportsComponent implements OnInit {
  from        = this.dateStr(-30);
  to          = this.dateStr(0);
  sales:      SalesSummary[]    = [];
  purchases:  PurchaseSummary[] = [];
  lowStock:   LowStock[]        = [];

  get totalOrders():    number { return this.sales.reduce((s, r) => s + r.totalOrders, 0); }
  get totalRevBrutto(): number { return this.sales.reduce((s, r) => s + r.totalRevenue, 0); }
  get totalRev():       number { return this.sales.reduce((s, r) => s + r.netRevenue, 0); }
  get totalPurchased(): number { return this.purchases.reduce((s, r) => s + r.totalPurchased, 0); }

  constructor(private svc: ReportService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.getSalesSummary(this.from, this.to).subscribe(d => this.sales = d);
    this.svc.getPurchaseSummary(this.from, this.to).subscribe(d => this.purchases = d);
    this.svc.getLowStock().subscribe(d => this.lowStock = d);
  }

  private dateStr(offset: number): string {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  }
}
