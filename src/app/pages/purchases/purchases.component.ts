import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { PurchaseService }    from '../../services/purchase.service';
import { ProductService }     from '../../services/product.service';
import { SupplierService }    from '../../services/supplier.service';
import { PurchaseOrder, Product, Supplier } from '../../models/models';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <h2>🚚 Purchase Orders</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">All supplier invoices and stock-in records — click a row to see items</p>
      </div>
      <button class="btn btn-primary" (click)="openCreateModal()">➕ Add New Supplier Bill</button>
    </div>

    <!-- Success Toast Alert -->
    <div class="alert alert-success" *ngIf="successMessage" style="margin-bottom:14px;display:flex;align-items:center;background:#dcfce7;color:#15803d;padding:12px 16px;border-radius:8px;font-weight:700">
      <span>{{ successMessage }}</span>
      <button style="border:none;background:none;cursor:pointer;color:#15803d;font-weight:bold;margin-left:auto" (click)="successMessage=''">✕</button>
    </div>

    <div class="stat-grid" style="margin-bottom:20px">
      <div class="stat-card blue">
        <span class="stat-label">Total Orders</span>
        <span class="stat-value">{{ orders.length }}</span>
      </div>
      <div class="stat-card green">
        <span class="stat-label">Confirmed</span>
        <span class="stat-value">{{ confirmedCount }}</span>
      </div>
      <div class="stat-card accent">
        <span class="stat-label">Total Purchased</span>
        <span class="stat-value">\${{ totalPurchased | number:'1.0-0' }}</span>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr><th>Invoice #</th><th>Date</th><th>Supplier</th><th>Items</th><th>Total Amount</th><th>Status</th><th>Created</th></tr>
        </thead>
        <tbody>
          <tr *ngFor="let po of orders" class="clickable-row" (click)="openDetail(po)">
            <td><code>{{ po.invoiceNumber }}</code></td>
            <td>{{ po.invoiceDate | date:'dd MMM yyyy' }}</td>
            <td><strong>{{ po.supplierName }}</strong></td>
            <td style="color:var(--muted)">{{ po.items ? po.items.length : 0 }} items</td>
            <td><strong>\${{ po.totalAmount | number:'1.2-2' }}</strong></td>
            <td>
              <span [class]="statusBadge(po.status)">{{ po.status }}</span>
            </td>
            <td style="color:var(--muted)">{{ po.createdAt | date:'dd MMM, h:mm a' }}</td>
          </tr>
          <tr *ngIf="orders.length === 0">
            <td colspan="7"><div class="empty-state"><div class="empty-icon">🚚</div><p>No purchase orders yet — scan an invoice or click Add New Supplier Bill</p></div></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Purchase Order Detail Modal -->
    <div class="modal-backdrop" *ngIf="selected" (click)="selected=null">
      <div class="modal" style="max-width:580px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>🚚 Purchase Order — <code>{{ selected.invoiceNumber }}</code></h3>
          <button class="modal-close" (click)="selected=null">✕</button>
        </div>
        <div class="modal-body">
          <div class="detail-meta">
            <span><strong>Supplier:</strong> {{ selected.supplierName }}</span>
            <span><strong>Invoice Date:</strong> {{ selected.invoiceDate | date:'dd MMM yyyy' }}</span>
            <span><strong>Status:</strong>
              <span [class]="statusBadge(selected.status)">{{ selected.status }}</span>
            </span>
            <span><strong>Created:</strong> {{ selected.createdAt | date:'dd MMM yyyy, h:mm a' }}</span>
          </div>
          <table class="detail-table">
            <thead><tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Line Total</th></tr></thead>
            <tbody>
              <tr *ngFor="let item of selected.items">
                <td>{{ item.productName }}</td>
                <td style="text-align:center">{{ item.quantity }}</td>
                <td>\${{ item.unitPrice | number:'1.2-2' }}</td>
                <td><strong>\${{ item.lineTotal | number:'1.2-2' }}</strong></td>
              </tr>
              <tr *ngIf="!selected.items || selected.items.length === 0">
                <td colspan="4" style="text-align:center;color:var(--muted);padding:16px">No items</td>
              </tr>
            </tbody>
          </table>
          <div class="detail-totals">
            <div class="dt-row total"><span>Grand Total</span><span>\${{ selected.totalAmount | number:'1.2-2' }}</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn" (click)="selected=null">Close</button>
        </div>
      </div>
    </div>

    <!-- CREATE MANUAL BILL MODAL -->
    <div class="modal-backdrop" *ngIf="showCreateModal" (click)="showCreateModal=false">
      <div class="modal" style="max-width:680px" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>➕ Add New Supplier Bill (Stock-In)</h3>
          <button class="modal-close" (click)="showCreateModal=false">✕</button>
        </div>
        <div class="modal-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
            <div>
              <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Supplier Name</label>
              <input type="text" class="form-control" [(ngModel)]="newBill.supplierName" placeholder="e.g. National Beverages" />
            </div>
            <div>
              <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Invoice Number</label>
              <input type="text" class="form-control" [(ngModel)]="newBill.invoiceNumber" placeholder="e.g. INV-9021" />
            </div>
          </div>

          <div style="margin-bottom:14px">
            <label style="font-size:12px;font-weight:700;display:block;margin-bottom:4px">Invoice Date</label>
            <input type="date" class="form-control" [(ngModel)]="newBillDateStr" (change)="onDateChange()" />
          </div>

          <div style="border-top:1px solid var(--border);padding-top:12px;margin-top:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
              <strong style="font-size:14px">📦 Bill Line Items (Added to Stock)</strong>
              <button class="btn btn-sm btn-secondary" (click)="addItemRow()">+ Add Product Item</button>
            </div>

            <table class="detail-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th style="width:90px">Qty</th>
                  <th style="width:110px">Cost / Unit (\$)</th>
                  <th style="width:100px">Line Total</th>
                  <th style="width:40px"></th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of newBill.items; let i = index">
                  <td>
                    <input type="text" class="form-control" [(ngModel)]="item.productName" placeholder="Product name" list="products-list" />
                  </td>
                  <td>
                    <input type="number" class="form-control" [(ngModel)]="item.quantity" min="1" style="text-align:center" />
                  </td>
                  <td>
                    <input type="number" class="form-control" [(ngModel)]="item.unitPrice" step="0.01" min="0" />
                  </td>
                  <td>
                    <strong>\${{ (item.quantity * item.unitPrice) | number:'1.2-2' }}</strong>
                  </td>
                  <td style="text-align:center">
                    <button style="border:none;background:none;cursor:pointer;color:#ef4444;font-weight:bold" (click)="removeItemRow(i)">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <datalist id="products-list">
              <option *ngFor="let p of availableProducts" [value]="p.name"></option>
            </datalist>

            <div class="detail-totals" style="margin-top:10px">
              <div class="dt-row total">
                <span>Total Bill Amount</span>
                <span>\${{ calculateBillTotal() | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" style="display:flex;justify-content:space-between">
          <button class="btn" (click)="showCreateModal=false">Cancel</button>
          <button class="btn btn-primary" (click)="saveBill()" [disabled]="isSaving || !newBill.items.length">
            {{ isSaving ? 'Saving…' : '✅ Save Bill & Add Stock' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    code { background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:12px; font-family:monospace; color:var(--muted); }
    .clickable-row { cursor: pointer; }
    .clickable-row:hover td { background: #f8fafc; }
    .detail-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; margin-bottom: 14px; color: var(--muted); }
    .detail-meta strong { color: var(--text); }
    .detail-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 14px; }
    .detail-table th, .detail-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); text-align: left; }
    .detail-table th { background: #f8fafc; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); }
    .detail-totals { background: #f8fafc; border-radius: 8px; padding: 10px 14px; }
    .dt-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
    .dt-row.total { font-weight: 800; font-size: 15px; }
    .form-control { width: 100%; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; box-sizing: border-box; }
  `]
})
export class PurchasesComponent implements OnInit {
  orders:            PurchaseOrder[] = [];
  selected:          PurchaseOrder | null = null;
  availableProducts: Product[] = [];
  showCreateModal                  = false;
  isSaving                         = false;
  successMessage                   = '';
  newBillDateStr                   = new Date().toISOString().substring(0, 10);

  newBill = {
    supplierId: 0,
    supplierName: 'National Beverage Distributors',
    invoiceNumber: 'INV-' + Math.floor(100000 + Math.random() * 900000),
    invoiceDate: new Date(),
    items: [
      { productId: 0, productName: 'Royal Challenge Whiskey 750ml', quantity: 12, unitPrice: 18.50 },
      { productId: 0, productName: 'Kingfisher Premium Beer 650ml', quantity: 24, unitPrice: 3.20 },
      { productId: 0, productName: 'McDowell\'s No.1 Rum 750ml', quantity: 10, unitPrice: 15.00 }
    ]
  };

  get confirmedCount(): number { return this.orders.filter(o => o.status === 'Confirmed').length; }
  get totalPurchased(): number { return this.orders.filter(o => o.status === 'Confirmed').reduce((a, o) => a + o.totalAmount, 0); }

  statusBadge(s: string): string {
    return s === 'Confirmed' ? 'badge badge-success' : s === 'Cancelled' ? 'badge badge-danger' : 'badge badge-warning';
  }

  openDetail(po: PurchaseOrder): void { this.selected = po; }

  openCreateModal(): void {
    this.newBill.invoiceNumber = 'INV-' + Math.floor(100000 + Math.random() * 900000);
    this.showCreateModal = true;
  }

  onDateChange(): void {
    if (this.newBillDateStr) {
      this.newBill.invoiceDate = new Date(this.newBillDateStr);
    }
  }

  addItemRow(): void {
    this.newBill.items.push({ productId: 0, productName: '', quantity: 1, unitPrice: 10.00 });
  }

  removeItemRow(idx: number): void {
    this.newBill.items.splice(idx, 1);
  }

  calculateBillTotal(): number {
    return this.newBill.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  }

  saveBill(): void {
    if (!this.newBill.items.length) return;
    this.isSaving = true;
    this.svc.confirm(this.newBill as any).subscribe({
      next: () => {
        this.isSaving = false;
        this.showCreateModal = false;
        this.successMessage = '✅ Supplier Bill Saved & Shop Stock Added Successfully!';
        this.loadOrders();
        setTimeout(() => this.successMessage = '', 6000);
      },
      error: (err) => {
        this.isSaving = false;
        alert('Failed to save bill: ' + (err.error?.message || err.message));
      }
    });
  }

  constructor(
    private svc: PurchaseService,
    private prodSvc: ProductService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
    this.prodSvc.getAll().subscribe(p => this.availableProducts = p);
  }

  private loadOrders(): void {
    this.svc.getAll().subscribe(d => this.orders = d);
  }
}
