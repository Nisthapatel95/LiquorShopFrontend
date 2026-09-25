import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { SalesService }       from '../../services/sales.service';
import { SalesOrder }         from '../../models/models';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sales-container">
      <!-- Top Title Header -->
      <div class="page-header-row">
        <div>
          <div class="title-with-badge">
            <h2 class="page-title">Sales History</h2>
            <span class="pulse-chip">{{ filteredOrders.length }} Transactions</span>
          </div>
          <p class="sub-title">Track, inspect, and analyze all register transactions and customer details</p>
        </div>
        <div class="search-filter-box">
          <div class="search-input-wrapper">
            <span class="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search by order #, cashier, or customer..." 
              [(ngModel)]="searchQuery" 
              class="search-input"
            />
          </div>
        </div>
      </div>

      <!-- KPI Summary Cards -->
      <div class="kpi-grid">
        <div class="kpi-card card-purple">
          <div class="kpi-icon-wrap">🛍️</div>
          <div class="kpi-content">
            <span class="kpi-title">TOTAL ORDERS</span>
            <span class="kpi-value">{{ orders.length }}</span>
            <span class="kpi-sub font-green">↑ Live Synced</span>
          </div>
        </div>
        <div class="kpi-card card-emerald">
          <div class="kpi-icon-wrap">💵</div>
          <div class="kpi-content">
            <span class="kpi-title">TOTAL REVENUE</span>
            <span class="kpi-value">\${{ totalNet | number:'1.2-2' }}</span>
            <span class="kpi-sub">Gross Net Sales</span>
          </div>
        </div>
        <div class="kpi-card card-blue">
          <div class="kpi-icon-wrap">📊</div>
          <div class="kpi-content">
            <span class="kpi-title">AVERAGE BASKET</span>
            <span class="kpi-value">\${{ avgOrder | number:'1.2-2' }}</span>
            <span class="kpi-sub">Per transaction</span>
          </div>
        </div>
      </div>

      <!-- Premium Data Table Container -->
      <div class="data-card">
        <div class="table-responsive">
          <table class="pro-table">
            <thead>
              <tr>
                <th>ORDER #</th>
                <th>DATE & TIME</th>
                <th>CASHIER / ADMIN</th>
                <th>CUSTOMER NAME</th>
                <th>PHONE NUMBER</th>
                <th>ITEMS</th>
                <th>SUBTOTAL</th>
                <th>DISCOUNT</th>
                <th>TAX</th>
                <th>NET TOTAL</th>
                <th>PAYMENT</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of filteredOrders" class="pro-row" (click)="openDetail(s)">
                <td>
                  <span class="order-code">{{ s.orderNumber }}</span>
                </td>
                <td class="date-cell">
                  <span class="date-main">{{ s.createdAt | date:'dd MMM yyyy' }}</span>
                  <span class="date-time">{{ s.createdAt | date:'h:mm a' }}</span>
                </td>
                <td>
                  <div class="user-cell">
                    <div class="avatar admin-avatar">👤</div>
                    <span class="user-name">{{ s.cashierName || 'Admin' }}</span>
                  </div>
                </td>
                <td>
                  <div class="user-cell">
                    <div class="avatar cust-avatar" [class.walkin]="!s.customerName">
                      {{ s.customerName ? s.customerName.charAt(0).toUpperCase() : 'W' }}
                    </div>
                    <span class="cust-name" [class.dim]="!s.customerName">
                      {{ s.customerName || 'Walk-in Customer' }}
                    </span>
                  </div>
                </td>
                <td>
                  <span *ngIf="s.customerPhone" class="phone-chip">📱 {{ s.customerPhone }}</span>
                  <span *ngIf="!s.customerPhone" class="dash-text">—</span>
                </td>
                <td>
                  <span class="items-badge">{{ s.items.length }} {{ s.items.length === 1 ? 'item' : 'items' }}</span>
                </td>
                <td class="num-cell">\${{ s.totalAmount | number:'1.2-2' }}</td>
                <td class="num-cell">
                  <span *ngIf="s.discount" class="discount-tag">-\${{ s.discount | number:'1.2-2' }}</span>
                  <span *ngIf="!s.discount" class="dash-text">—</span>
                </td>
                <td class="num-cell muted-cell">
                  {{ s.taxAmount ? '$' + (s.taxAmount | number:'1.2-2') : '—' }}
                </td>
                <td class="num-cell net-cell">
                  \${{ s.netAmount | number:'1.2-2' }}
                </td>
                <td>
                  <span [class]="getPaymentPillClass(s.paymentMode)">
                    <span class="pay-dot"></span>
                    {{ s.paymentMode || 'Cash' }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="filteredOrders.length === 0">
                <td colspan="11">
                  <div class="empty-state-pro">
                    <div class="empty-icon-lg">🔍</div>
                    <h4>No Matching Sales Records</h4>
                    <p>Try adjusting your search criteria</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modern Detail Drawer / Modal -->
      <div class="modal-backdrop-pro" *ngIf="selected" (click)="selected=null">
        <div class="modal-card-pro" (click)="$event.stopPropagation()">
          <div class="modal-header-pro">
            <div>
              <span class="modal-tag">SALES RECEIPT</span>
              <h3>Order # {{ selected.orderNumber }}</h3>
            </div>
            <button class="close-btn" (click)="selected=null">✕</button>
          </div>

          <div class="modal-body-pro">
            <!-- Meta Grid Card -->
            <div class="meta-card-grid">
              <div class="meta-item">
                <span class="meta-lbl">Date & Time</span>
                <span class="meta-val">{{ selected.createdAt | date:'medium' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Admin / Cashier</span>
                <span class="meta-val highlight">{{ selected.cashierName || 'Admin' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Customer</span>
                <span class="meta-val">{{ selected.customerName || 'Walk-in Customer' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Phone</span>
                <span class="meta-val">{{ selected.customerPhone || 'N/A' }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-lbl">Payment Method</span>
                <span class="meta-val"><span [class]="getPaymentPillClass(selected.paymentMode)">{{ selected.paymentMode }}</span></span>
              </div>
            </div>

            <!-- Items Table -->
            <h4 class="section-heading">Purchased Items</h4>
            <div class="detail-table-wrapper">
              <table class="detail-pro-table">
                <thead>
                  <tr>
                    <th>ITEM DESCRIPTION</th>
                    <th style="text-align:center">QTY</th>
                    <th style="text-align:right">PRICE</th>
                    <th style="text-align:right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of selected.items">
                    <td class="font-medium">{{ item.productName }}</td>
                    <td style="text-align:center"><span class="qty-pill">{{ item.quantity }}</span></td>
                    <td style="text-align:right">\${{ item.unitPrice | number:'1.2-2' }}</td>
                    <td style="text-align:right" class="font-bold">\${{ item.lineTotal | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Total Calculation Summary -->
            <div class="totals-breakdown">
              <div class="tot-row">
                <span>Subtotal</span>
                <span>\${{ selected.totalAmount | number:'1.2-2' }}</span>
              </div>
              <div class="tot-row danger" *ngIf="selected.discount">
                <span>Discount Applied</span>
                <span>- \${{ selected.discount | number:'1.2-2' }}</span>
              </div>
              <div class="tot-row muted" *ngIf="selected.taxAmount">
                <span>Tax</span>
                <span>\${{ selected.taxAmount | number:'1.2-2' }}</span>
              </div>
              <div class="tot-row grand-total">
                <span>Grand Total</span>
                <span class="grand-price">\${{ selected.netAmount | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <div class="modal-footer-pro">
            <button class="btn-pro secondary" (click)="selected=null">Close</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sales-container {
      padding: 4px;
      font-family: inherit;
    }

    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    .title-with-badge {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-title {
      font-size: 26px;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0;
    }

    .pulse-chip {
      background: #eff6ff;
      color: #2563eb;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      border: 1px solid #bfdbfe;
    }

    .sub-title {
      color: #64748b;
      font-size: 14px;
      margin: 4px 0 0 0;
    }

    /* Search Input */
    .search-input-wrapper {
      position: relative;
      width: 320px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 14px;
      opacity: 0.6;
    }

    .search-input {
      width: 100%;
      padding: 10px 14px 10px 36px;
      border-radius: 10px;
      border: 1px solid #cbd5e1;
      font-size: 13.5px;
      background: #ffffff;
      transition: all 0.2s ease;
      outline: none;
      box-shadow: 0 1px 2px rgba(0,0,0,0.03);
    }

    .search-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    /* KPI Cards Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 18px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: #ffffff;
      border-radius: 14px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -2px rgba(0, 0, 0, 0.03);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.06);
    }

    .kpi-icon-wrap {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      flex-shrink: 0;
    }

    .card-purple .kpi-icon-wrap { background: #f3e8ff; }
    .card-emerald .kpi-icon-wrap { background: #dcfce7; }
    .card-blue .kpi-icon-wrap { background: #e0f2fe; }

    .kpi-content {
      display: flex;
      flex-direction: column;
    }

    .kpi-title {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #64748b;
    }

    .kpi-value {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.2;
      margin: 2px 0;
    }

    .kpi-sub {
      font-size: 12px;
      color: #94a3b8;
    }

    .font-green { color: #16a34a; font-weight: 600; }

    /* Main Table Styling */
    .data-card {
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
      overflow: hidden;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .pro-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 13.5px;
    }

    .pro-table th {
      background: #f8fafc;
      color: #475569;
      font-weight: 700;
      font-size: 11px;
      letter-spacing: 0.05em;
      padding: 14px 16px;
      border-bottom: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .pro-row {
      border-bottom: 1px solid #f1f5f9;
      transition: background 0.15s ease;
      cursor: pointer;
    }

    .pro-row:hover {
      background: #f8fafc;
    }

    .pro-row td {
      padding: 14px 16px;
      vertical-align: middle;
      color: #334155;
    }

    .order-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      background: #f1f5f9;
      color: #0f172a;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid #e2e8f0;
    }

    .date-cell {
      display: flex;
      flex-direction: column;
    }

    .date-main {
      font-weight: 600;
      color: #1e293b;
    }

    .date-time {
      font-size: 12px;
      color: #94a3b8;
    }

    /* User avatars & cells */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }

    .admin-avatar {
      background: #eff6ff;
      color: #2563eb;
      border: 1px solid #bfdbfe;
    }

    .cust-avatar {
      background: #fdf4ff;
      color: #c026d3;
      border: 1px solid #f5d0fe;
    }

    .cust-avatar.walkin {
      background: #f1f5f9;
      color: #64748b;
      border-color: #cbd5e1;
    }

    .user-name {
      font-weight: 700;
      color: #0f172a;
    }

    .cust-name {
      font-weight: 600;
      color: #1e293b;
    }

    .cust-name.dim {
      color: #94a3b8;
      font-weight: 400;
      font-style: italic;
    }

    .phone-chip {
      background: #f8fafc;
      color: #475569;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 12px;
      border: 1px solid #e2e8f0;
      white-space: nowrap;
    }

    .dash-text {
      color: #cbd5e1;
    }

    .items-badge {
      background: #f1f5f9;
      color: #475569;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .num-cell {
      white-space: nowrap;
    }

    .discount-tag {
      color: #ef4444;
      font-weight: 600;
      background: #fef2f2;
      padding: 2px 6px;
      border-radius: 4px;
    }

    .muted-cell {
      color: #94a3b8;
    }

    .net-cell {
      font-weight: 800;
      color: #0f172a;
      font-size: 14.5px;
    }

    /* Payment Badges */
    .pay-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .pay-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }

    .pay-card { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .pay-card .pay-dot { background: #2563eb; }

    .pay-upi { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
    .pay-upi .pay-dot { background: #16a34a; }

    .pay-cash { background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
    .pay-cash .pay-dot { background: #ea580c; }

    /* Empty state */
    .empty-state-pro {
      text-align: center;
      padding: 48px 20px;
      color: #64748b;
    }

    .empty-icon-lg {
      font-size: 36px;
      margin-bottom: 8px;
    }

    /* Modal / Drawer */
    .modal-backdrop-pro {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.55);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-card-pro {
      background: #ffffff;
      width: 100%;
      max-width: 640px;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      animation: modalSlide 0.2s ease-out;
    }

    @keyframes modalSlide {
      from { transform: translateY(12px) scale(0.98); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }

    .modal-header-pro {
      padding: 20px 24px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-tag {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #3b82f6;
    }

    .modal-header-pro h3 {
      margin: 2px 0 0 0;
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 18px;
      color: #64748b;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 6px;
    }

    .close-btn:hover { background: #e2e8f0; color: #0f172a; }

    .modal-body-pro {
      padding: 24px;
    }

    .meta-card-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      background: #f8fafc;
      padding: 16px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-bottom: 20px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-lbl {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
    }

    .meta-val {
      font-size: 13.5px;
      font-weight: 600;
      color: #0f172a;
      margin-top: 2px;
    }

    .meta-val.highlight {
      color: #2563eb;
    }

    .section-heading {
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #475569;
      margin: 0 0 10px 0;
    }

    .detail-table-wrapper {
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 18px;
    }

    .detail-pro-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .detail-pro-table th {
      background: #f8fafc;
      padding: 10px 12px;
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
    }

    .detail-pro-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #1e293b;
    }

    .qty-pill {
      background: #f1f5f9;
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 12px;
    }

    .font-medium { font-weight: 500; }
    .font-bold { font-weight: 700; }

    .totals-breakdown {
      background: #f8fafc;
      border-radius: 12px;
      padding: 14px 18px;
      border: 1px solid #e2e8f0;
    }

    .tot-row {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      padding: 4px 0;
      color: #475569;
    }

    .tot-row.danger { color: #ef4444; }
    .tot-row.muted { color: #94a3b8; }

    .tot-row.grand-total {
      border-top: 1px dashed #cbd5e1;
      margin-top: 8px;
      padding-top: 10px;
      font-weight: 800;
      font-size: 16px;
      color: #0f172a;
    }

    .grand-price {
      color: #16a34a;
    }

    .modal-footer-pro {
      padding: 16px 24px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;
    }

    .btn-pro {
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s;
    }

    .btn-pro.secondary {
      background: #ffffff;
      border-color: #cbd5e1;
      color: #334155;
    }

    .btn-pro.secondary:hover {
      background: #f1f5f9;
    }
  `]
})
export class SalesComponent implements OnInit {
  orders: SalesOrder[] = [];
  selected: SalesOrder | null = null;
  searchQuery: string = '';

  get filteredOrders(): SalesOrder[] {
    if (!this.searchQuery.trim()) return this.orders;
    const q = this.searchQuery.toLowerCase().trim();
    return this.orders.filter(o => 
      (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
      (o.cashierName && o.cashierName.toLowerCase().includes(q)) ||
      (o.customerName && o.customerName.toLowerCase().includes(q)) ||
      (o.customerPhone && o.customerPhone.includes(q))
    );
  }

  get totalNet(): number { 
    return this.orders.reduce((a, s) => a + s.netAmount, 0); 
  }

  get avgOrder(): number { 
    return this.orders.length ? this.totalNet / this.orders.length : 0; 
  }

  getPaymentPillClass(mode: string): string {
    const m = (mode || '').toLowerCase();
    if (m === 'card') return 'pay-pill pay-card';
    if (m === 'upi') return 'pay-pill pay-upi';
    return 'pay-pill pay-cash';
  }

  openDetail(s: SalesOrder): void { 
    this.selected = s; 
  }

  constructor(private svc: SalesService) {}

  ngOnInit(): void { 
    this.svc.getAll().subscribe(d => this.orders = d); 
  }
}
