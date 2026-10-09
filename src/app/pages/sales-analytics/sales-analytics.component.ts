import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ReportService }      from '../../services/inventory.service';
import { DailyProductSales, BestSellingProduct } from '../../models/models';

@Component({
  selector: 'app-sales-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>📈 Sales Analytics</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">Daily product sales breakdown and best selling products analysis</p>
      </div>
      <div class="filter-row">
        <input type="date" [(ngModel)]="from" />
        <span style="color:var(--muted)">to</span>
        <input type="date" [(ngModel)]="to" />
        <button class="btn btn-primary" (click)="load()">Generate</button>
      </div>
    </div>

    <!-- Tabs header -->
    <div class="tabs-header" style="margin-bottom:20px; display:flex; gap:10px; border-bottom:2px solid #e2e8f0; padding-bottom:10px;">
      <button 
        class="tab-btn" 
        [class.active]="activeTab === 'daily'" 
        (click)="activeTab = 'daily'">
        📅 Daily Sales by Product
      </button>
      <button 
        class="tab-btn" 
        [class.active]="activeTab === 'bestsellers'" 
        (click)="activeTab = 'bestsellers'">
        🏆 Best Selling Products
      </button>
    </div>

    <!-- Tab 1: Daily Product Sales -->
    <div *ngIf="activeTab === 'daily'" class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 style="margin:0">📅 Daily Product Sales Log</h3>
          <p style="margin:4px 0 0 0; color:var(--muted); font-size:12px">Detailed record of products sold per day</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <input 
            type="text" 
            placeholder="Search product, SKU, category..." 
            [(ngModel)]="dailySearch" 
            style="padding:6px 12px; font-size:13px; border:1px solid #cbd5e1; border-radius:6px; min-width:220px;"
          />
          <button class="btn btn-secondary" (click)="downloadDailyCSV()" [disabled]="!filteredDailySales.length">
            📥 Export CSV
          </button>
          <button class="btn btn-primary" (click)="printDailyReport()" [disabled]="!filteredDailySales.length">
            🖨️ Download PDF / Print
          </button>
        </div>
      </div>

      <div *ngIf="!dailySales.length" class="empty-state" style="padding:28px">
        <div class="empty-icon">📅</div>
        <p>No product sales recorded for the period: {{ from }} to {{ to }}</p>
      </div>

      <div *ngIf="dailySales.length" class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th style="text-align:right">Quantity Sold</th>
              <th style="text-align:right">Avg Selling Price</th>
              <th style="text-align:right">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of filteredDailySales">
              <td><strong>{{ s.date | date:'dd MMM yyyy' }}</strong></td>
              <td>{{ s.productName }}</td>
              <td><code>{{ s.sku }}</code></td>
              <td><span class="badge badge-neutral">{{ s.categoryName }}</span></td>
              <td style="text-align:right"><strong>{{ s.totalQuantity }}</strong></td>
              <td style="text-align:right">\${{ s.avgSellingPrice | number:'1.2-2' }}</td>
              <td style="text-align:right; font-weight:700; color:var(--success)">\${{ s.totalRevenue | number:'1.2-2' }}</td>
            </tr>
            <tr style="background:#f8fafc; font-weight:700">
              <td colspan="4">Grand Total ({{ filteredDailySales.length }} items)</td>
              <td style="text-align:right">{{ totalDailyQty }} units</td>
              <td></td>
              <td style="text-align:right; color:var(--success)">\${{ totalDailyRevenue | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tab 2: Best Selling Products -->
    <div *ngIf="activeTab === 'bestsellers'" class="card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
        <div>
          <h3 style="margin:0">🏆 Top Best Selling Products</h3>
          <p style="margin:4px 0 0 0; color:var(--muted); font-size:12px">Highest performing items ranked by total units sold</p>
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <input 
            type="text" 
            placeholder="Search product..." 
            [(ngModel)]="bestSearch" 
            style="padding:6px 12px; font-size:13px; border:1px solid #cbd5e1; border-radius:6px; min-width:200px;"
          />
          <button class="btn btn-secondary" (click)="downloadBestCSV()" [disabled]="!filteredBestSellers.length">
            📥 Export CSV
          </button>
          <button class="btn btn-primary" (click)="printBestReport()" [disabled]="!filteredBestSellers.length">
            🖨️ Download PDF / Print
          </button>
        </div>
      </div>

      <div *ngIf="!bestSellers.length" class="empty-state" style="padding:28px">
        <div class="empty-icon">🏆</div>
        <p>No sales data available to rank best sellers for period: {{ from }} to {{ to }}</p>
      </div>

      <div *ngIf="bestSellers.length" class="table-responsive">
        <table>
          <thead>
            <tr>
              <th style="width:60px">Rank</th>
              <th>Product Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th style="text-align:right">Total Units Sold</th>
              <th style="text-align:right">Total Orders</th>
              <th style="text-align:right">Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let b of filteredBestSellers; let i = index">
              <td>
                <span class="rank-badge" [class.rank-top]="i < 3">#{{ i + 1 }}</span>
              </td>
              <td><strong>{{ b.productName }}</strong></td>
              <td><code>{{ b.sku }}</code></td>
              <td><span class="badge badge-neutral">{{ b.categoryName }}</span></td>
              <td style="text-align:right"><strong style="font-size:14px">{{ b.totalQuantitySold }}</strong></td>
              <td style="text-align:right">{{ b.totalOrders }}</td>
              <td style="text-align:right; font-weight:700; color:var(--success)">\${{ b.totalRevenue | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .filter-row { display: flex; align-items: center; gap: 10px; }
    .table-responsive { overflow-x: auto; }
    .tab-btn { background: none; border: none; padding: 8px 16px; font-size: 14px; font-weight: 600; color: #64748b; cursor: pointer; border-radius: 6px; }
    .tab-btn:hover { background: #e2e8f0; color: #0f172a; }
    .tab-btn.active { background: #0f172a; color: #f59e0b; }
    code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px; font-family:monospace; color:var(--muted); }
    .badge-neutral { background:#e2e8f0; color:#334155; padding:2px 8px; border-radius:12px; font-size:12px; }
    .rank-badge { display:inline-block; width:28px; height:28px; line-height:28px; text-align:center; background:#cbd5e1; color:#0f172a; font-weight:700; border-radius:50%; font-size:12px; }
    .rank-top { background:#f59e0b; color:#000; }
  `]
})
export class SalesAnalyticsComponent implements OnInit {
  from = this.dateStr(-30);
  to = this.dateStr(0);

  activeTab: 'daily' | 'bestsellers' = 'daily';

  dailySales: DailyProductSales[] = [];
  bestSellers: BestSellingProduct[] = [];

  dailySearch = '';
  bestSearch = '';

  get filteredDailySales(): DailyProductSales[] {
    if (!this.dailySearch.trim()) return this.dailySales;
    const q = this.dailySearch.toLowerCase();
    return this.dailySales.filter(s =>
      s.productName.toLowerCase().includes(q) ||
      s.sku.toLowerCase().includes(q) ||
      s.categoryName.toLowerCase().includes(q)
    );
  }

  get totalDailyQty(): number {
    return this.filteredDailySales.reduce((sum, item) => sum + item.totalQuantity, 0);
  }

  get totalDailyRevenue(): number {
    return this.filteredDailySales.reduce((sum, item) => sum + item.totalRevenue, 0);
  }

  get filteredBestSellers(): BestSellingProduct[] {
    if (!this.bestSearch.trim()) return this.bestSellers;
    const q = this.bestSearch.toLowerCase();
    return this.bestSellers.filter(b =>
      b.productName.toLowerCase().includes(q) ||
      b.sku.toLowerCase().includes(q) ||
      b.categoryName.toLowerCase().includes(q)
    );
  }

  constructor(private svc: ReportService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.svc.getDailyProductSales(this.from, this.to).subscribe(d => this.dailySales = d);
    this.svc.getBestSellingProducts(this.from, this.to).subscribe(d => this.bestSellers = d);
  }

  downloadDailyCSV(): void {
    if (!this.filteredDailySales.length) return;
    const headers = ['Date', 'Product Name', 'SKU', 'Category', 'Quantity Sold', 'Avg Selling Price', 'Total Revenue'];
    const rows = this.filteredDailySales.map(item => [
      `"${new Date(item.date).toLocaleDateString()}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.sku.replace(/"/g, '""')}"`,
      `"${item.categoryName.replace(/"/g, '""')}"`,
      item.totalQuantity,
      item.avgSellingPrice.toFixed(2),
      item.totalRevenue.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Daily_Product_Sales_${this.from}_to_${this.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printDailyReport(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = this.filteredDailySales.map(item => `
      <tr>
        <td>${new Date(item.date).toLocaleDateString()}</td>
        <td>${item.productName}</td>
        <td>${item.sku}</td>
        <td>${item.categoryName}</td>
        <td style="text-align:right">${item.totalQuantity}</td>
        <td style="text-align:right">$${item.avgSellingPrice.toFixed(2)}</td>
        <td style="text-align:right">$${item.totalRevenue.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Daily Product Sales Report (${this.from} to ${this.to})</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; font-size: 13px; text-align: left; }
            th { background-color: #f1f5f9; }
            .total-row { font-weight: bold; background-color: #f8fafc; }
          </style>
        </head>
        <body>
          <h2>📅 Daily Product Sales Full Report</h2>
          <p>Period: <strong>${this.from}</strong> to <strong>${this.to}</strong></p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th style="text-align:right">Quantity Sold</th>
                <th style="text-align:right">Avg Price</th>
                <th style="text-align:right">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              <tr class="total-row">
                <td colspan="4">Grand Total (${this.filteredDailySales.length} items)</td>
                <td style="text-align:right">${this.totalDailyQty} units</td>
                <td></td>
                <td style="text-align:right">$${this.totalDailyRevenue.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  downloadBestCSV(): void {
    if (!this.filteredBestSellers.length) return;
    const headers = ['Rank', 'Product Name', 'SKU', 'Category', 'Total Units Sold', 'Total Orders', 'Total Revenue'];
    const rows = this.filteredBestSellers.map((item, idx) => [
      idx + 1,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.sku.replace(/"/g, '""')}"`,
      `"${item.categoryName.replace(/"/g, '""')}"`,
      item.totalQuantitySold,
      item.totalOrders,
      item.totalRevenue.toFixed(2)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Best_Selling_Products_${this.from}_to_${this.to}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  printBestReport(): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rowsHtml = this.filteredBestSellers.map((item, idx) => `
      <tr>
        <td>#${idx + 1}</td>
        <td>${item.productName}</td>
        <td>${item.sku}</td>
        <td>${item.categoryName}</td>
        <td style="text-align:right">${item.totalQuantitySold}</td>
        <td style="text-align:right">${item.totalOrders}</td>
        <td style="text-align:right">$${item.totalRevenue.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Best Selling Products Report (${this.from} to ${this.to})</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px 12px; font-size: 13px; text-align: left; }
            th { background-color: #f1f5f9; }
          </style>
        </head>
        <body>
          <h2>🏆 Top Best Selling Products</h2>
          <p>Period: <strong>${this.from}</strong> to <strong>${this.to}</strong></p>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th style="text-align:right">Units Sold</th>
                <th style="text-align:right">Total Orders</th>
                <th style="text-align:right">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); window.close(); }</script>
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
