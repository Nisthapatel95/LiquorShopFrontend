import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ReportService }      from '../../services/inventory.service';
import { SalesSummary, PurchaseSummary, LowStock, ProductPurchaseReport } from '../../models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>📈 Reports & Analytics</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">Comprehensive sales, daily product purchase logs, and inventory alerts</p>
      </div>
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

    <!-- Daily Product Purchase Full Report -->
    <div class="card" style="margin-bottom:24px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 style="margin:0; display:flex; align-items:center; gap:8px;">
            🛒 Daily Product Purchases Report
          </h3>
          <p style="margin:4px 0 0 0; color:var(--muted); font-size:12px">
            Detailed record of which products were purchased daily within the selected date range
          </p>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <input 
            type="text" 
            placeholder="Search product, SKU, supplier..." 
            [(ngModel)]="searchQuery" 
            style="padding:6px 12px; font-size:13px; border:1px solid #cbd5e1; border-radius:6px; min-width:220px;"
          />
          <button class="btn btn-secondary" (click)="downloadCSV()" [disabled]="!filteredProductPurchases.length" title="Download CSV Format">
            📥 Export CSV
          </button>
          <button class="btn btn-primary" (click)="printReport()" [disabled]="!filteredProductPurchases.length" title="Print or Save PDF">
            🖨️ Download PDF / Print
          </button>
        </div>
      </div>

      <div *ngIf="!productPurchases.length" class="empty-state" style="padding:28px">
        <div class="empty-icon">🛒</div>
        <p>No product purchase records found for the date range: {{ from }} to {{ to }}</p>
      </div>

      <div *ngIf="productPurchases.length" class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Supplier</th>
              <th style="text-align:right">Total Qty</th>
              <th style="text-align:right">Avg Unit Price</th>
              <th style="text-align:right">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredProductPurchases">
              <td><strong>{{ item.date | date:'dd MMM yyyy' }}</strong></td>
              <td>{{ item.productName }}</td>
              <td><code>{{ item.sku }}</code></td>
              <td><span class="badge badge-neutral">{{ item.categoryName }}</span></td>
              <td>{{ item.supplierName }}</td>
              <td style="text-align:right"><strong>{{ item.totalQuantity }}</strong></td>
              <td style="text-align:right">\${{ item.avgUnitPrice | number:'1.2-2' }}</td>
              <td style="text-align:right; font-weight:700">\${{ item.totalAmount | number:'1.2-2' }}</td>
            </tr>
            <tr style="background:#f8fafc; font-weight:700">
              <td colspan="5">Grand Total ({{ filteredProductPurchases.length }} items)</td>
              <td style="text-align:right">{{ totalPurchasedQty }} units</td>
              <td></td>
              <td style="text-align:right; color:var(--accent-color)">\${{ totalPurchasedAmount | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="report-grid">
      <!-- Sales -->
      <div class="card">
        <h3 style="margin-bottom:14px">📊 Daily Sales Summary</h3>
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

      <!-- Purchases summary -->
      <div class="card">
        <h3 style="margin-bottom:14px">🚚 Daily Purchase Orders Summary</h3>
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
    .table-responsive { overflow-x: auto; }
    code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px; font-family:monospace; color:var(--muted); }
    .badge-neutral { background:#e2e8f0; color:#334155; padding:2px 8px; border-radius:12px; font-size:12px; }
    @media (max-width: 900px) { .report-grid { grid-template-columns: 1fr; } }
  `]
})
export class ReportsComponent implements OnInit {
  from        = this.dateStr(-30);
  to          = this.dateStr(0);
  sales:            SalesSummary[]          = [];
  purchases:        PurchaseSummary[]       = [];
  lowStock:         LowStock[]              = [];
  productPurchases: ProductPurchaseReport[] = [];

  searchQuery = '';

  get totalOrders():    number { return this.sales.reduce((s, r) => s + r.totalOrders, 0); }
  get totalRevBrutto(): number { return this.sales.reduce((s, r) => s + r.totalRevenue, 0); }
  get totalRev():       number { return this.sales.reduce((s, r) => s + r.netRevenue, 0); }
  get totalPurchased(): number { return this.purchases.reduce((s, r) => s + r.totalPurchased, 0); }

  get filteredProductPurchases(): ProductPurchaseReport[] {
    if (!this.searchQuery.trim()) return this.productPurchases;
    const q = this.searchQuery.toLowerCase();
    return this.productPurchases.filter(p =>
      p.productName.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q) ||
      p.supplierName.toLowerCase().includes(q)
    );
  }

  get totalPurchasedQty(): number {
    return this.filteredProductPurchases.reduce((sum, item) => sum + item.totalQuantity, 0);
  }

  get totalPurchasedAmount(): number {
    return this.filteredProductPurchases.reduce((sum, item) => sum + item.totalAmount, 0);
  }

  constructor(private svc: ReportService) {}
  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.getSalesSummary(this.from, this.to).subscribe(d => this.sales = d);
    this.svc.getPurchaseSummary(this.from, this.to).subscribe(d => this.purchases = d);
    this.svc.getLowStock().subscribe(d => this.lowStock = d);
    this.svc.getProductPurchases(this.from, this.to).subscribe(d => this.productPurchases = d);
  }

  downloadCSV(): void {
    if (!this.filteredProductPurchases.length) return;
    const headers = ['Date', 'Product Name', 'SKU', 'Category', 'Supplier', 'Quantity Purchased', 'Avg Unit Price', 'Total Amount'];
    const rows = this.filteredProductPurchases.map(item => [
      `"${new Date(item.date).toLocaleDateString()}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.sku.replace(/"/g, '""')}"`,
      `"${item.categoryName.replace(/"/g, '""')}"`,
      `"${item.supplierName.replace(/"/g, '""')}"`,
      item.totalQuantity,
      item.avgUnitPrice.toFixed(2),
      item.totalAmount.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Product_Purchase_Report_${this.from}_to_${this.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printReport(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = this.filteredProductPurchases.map(item => `
      <tr>
        <td>${new Date(item.date).toLocaleDateString()}</td>
        <td>${item.productName}</td>
        <td>${item.sku}</td>
        <td>${item.categoryName}</td>
        <td>${item.supplierName}</td>
        <td style="text-align:right">${item.totalQuantity}</td>
        <td style="text-align:right">$${item.avgUnitPrice.toFixed(2)}</td>
        <td style="text-align:right">$${item.totalAmount.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Daily Product Purchases Report (${this.from} to ${this.to})</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h2 { margin-bottom: 4px; }
            p { color: #666; font-size: 13px; margin-top: 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; font-size: 13px; text-align: left; }
            th { background-color: #f1f5f9; }
            .total-row { font-weight: bold; background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h2>🛒 Daily Product Purchases Full Report</h2>
          <p>Filter Period: <strong>${this.from}</strong> to <strong>${this.to}</strong></p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Supplier</th>
                <th style="text-align:right">Quantity</th>
                <th style="text-align:right">Avg Price</th>
                <th style="text-align:right">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="5">Grand Total (${this.filteredProductPurchases.length} items)</td>
                <td style="text-align:right">${this.totalPurchasedQty} units</td>
                <td></td>
                <td style="text-align:right">$${this.totalPurchasedAmount.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  private dateStr(offset: number): string {
    const d = new Date(); d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0];
  }
}
