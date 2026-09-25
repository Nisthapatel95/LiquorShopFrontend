import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { ProductService }     from '../../services/product.service';
import { SalesService }       from '../../services/sales.service';
import { AuthService }        from '../../services/auth.service';
import { Product, SalesOrder } from '../../models/models';

interface CartEntry { product: Product; quantity: number; }

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Success Toast Alert -->
    <div class="alert alert-success" *ngIf="successMsg" style="margin-bottom:14px;display:flex;align-items:center;justify-space:between;background:#dcfce7;color:#15803d;padding:12px 16px;border-radius:8px;font-weight:700">
      <span>{{ successMsg }}</span>
      <button style="border:none;background:none;cursor:pointer;color:#15803d;font-weight:bold;margin-left:auto" (click)="successMsg=''">✕</button>
    </div>

    <!-- Receipt Modal -->
    <div class="modal-backdrop" *ngIf="lastOrder" (click)="lastOrder = null">
      <div class="modal receipt-modal" (click)="$event.stopPropagation()">
        <div style="background:#dcfce7;color:#166534;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:700;text-align:center;margin-bottom:12px">
          ✅ Customer Bill Generated & Shop Stock Updated!
        </div>
        <div class="receipt-header">
          <div class="receipt-logo">🍾 LiquorShop</div>
          <div class="receipt-title">SALES RECEIPT</div>
          <div class="receipt-order">{{ lastOrder.orderNumber }}</div>
          <div class="receipt-date">{{ lastOrder.createdAt | date:'medium' }}</div>
        </div>
        <div class="receipt-cashier">👤 Cashier / Admin: <strong>{{ lastOrder.cashierName || auth.currentUser?.fullName || 'Admin' }}</strong></div>
        <div class="receipt-cashier" *ngIf="lastOrder.customerName">👤 Customer: <strong>{{ lastOrder.customerName }}</strong></div>
        <div class="receipt-cashier" *ngIf="lastOrder.customerPhone">📞 Phone: <strong>{{ lastOrder.customerPhone }}</strong></div>
        <div class="receipt-divider">- - - - - - - - - - - - - - - - -</div>
        <div class="receipt-items">
          <div class="receipt-item" *ngFor="let i of lastOrder.items">
            <span class="ri-name">{{ i.productName }}</span>
            <span class="ri-qty">× {{ i.quantity }}</span>
            <span class="ri-price">\${{ i.lineTotal | number:'1.2-2' }}</span>
          </div>
        </div>
        <div class="receipt-divider">- - - - - - - - - - - - - - - - -</div>
        <div class="receipt-totals">
          <div class="rt-row"><span>Subtotal</span><span>\${{ lastOrder.totalAmount | number:'1.2-2' }}</span></div>
          <div class="rt-row" *ngIf="lastOrder.discount"><span>Discount</span><span>- \${{ lastOrder.discount | number:'1.2-2' }}</span></div>
          <div class="rt-row" *ngIf="lastOrder.taxAmount"><span>Tax</span><span>\${{ lastOrder.taxAmount | number:'1.2-2' }}</span></div>
          <div class="rt-row total"><span>NET TOTAL</span><span>\${{ lastOrder.netAmount | number:'1.2-2' }}</span></div>
          <div class="rt-row"><span>Payment</span><span>{{ lastOrder.paymentMode }}</span></div>
        </div>
        <div class="receipt-divider">- - - - - - - - - - - - - - - - -</div>
        <div class="receipt-footer">Thank you for your purchase!</div>
        <div class="modal-footer no-print">
          <button class="btn btn-ghost" (click)="lastOrder = null">Close</button>
          <button class="btn btn-primary" (click)="printReceipt()">🖨 Print</button>
        </div>
      </div>
    </div>

    <!-- Page header -->
    <div class="page-header">
      <div><h2>🧾 Point of Sale</h2><p style="color:var(--muted);font-size:13px;margin-top:2px">Select products and process customer checkout</p></div>
    </div>

    <div class="pos-layout">

      <!-- ── Product Panel ── -->
      <div class="product-panel">
        <div class="panel-toolbar">
          <div class="search-bar" style="flex:1">
            <span class="search-icon">🔍</span>
            <input [(ngModel)]="search" (input)="filterProducts()" placeholder="Search products…" style="width:100%" />
          </div>
        </div>
        <div class="product-grid">
          <div class="product-tile" *ngFor="let p of filtered"
               (click)="addToCart(p)"
               [class.out-of-stock]="p.currentStock === 0">
            <div class="pt-name">{{ p.name }}</div>
            <div class="pt-brand">{{ p.brand }}</div>
            <div class="pt-bottom">
              <span class="pt-price">\${{ p.sellingPrice | number:'1.0-0' }}</span>
              <span class="pt-stock" [class.low]="p.currentStock <= p.reorderLevel">{{ p.currentStock }} left</span>
            </div>
          </div>
          <div *ngIf="filtered.length === 0" class="empty-state" style="grid-column:span 3">
            <div class="empty-icon">🍷</div><p>No products found</p>
          </div>
        </div>
      </div>

      <!-- ── Cart Panel ── -->
      <div class="cart-panel">
        <div class="cart-header">
          <h3>🛒 Cart <span class="cart-count" *ngIf="cart.length">{{ cart.length }}</span></h3>
          <button class="btn btn-ghost btn-sm" (click)="clearCart()" *ngIf="cart.length">Clear</button>
        </div>

        <div class="cart-empty" *ngIf="cart.length === 0">
          <div style="font-size:2.5rem;margin-bottom:8px">🛒</div>
          <p style="color:var(--muted)">Cart is empty — click a product to add</p>
        </div>

        <div class="cart-body" *ngIf="cart.length">
          <div class="cart-items">
            <div class="cart-item" *ngFor="let e of cart; let i = index">
              <div class="ci-info">
                <span class="ci-name">{{ e.product.name }}</span>
                <span class="ci-price">\${{ e.product.sellingPrice | number:'1.2-2' }}</span>
              </div>
              <div class="ci-controls">
                <button class="qty-btn" (click)="decQty(i)">−</button>
                <span class="qty-val">{{ e.quantity }}</span>
                <button class="qty-btn" (click)="incQty(i, e.product.currentStock)">+</button>
                <span class="ci-line">\${{ e.product.sellingPrice * e.quantity | number:'1.2-2' }}</span>
                <button class="rm-btn" (click)="removeFromCart(i)">✕</button>
              </div>
            </div>
          </div>

          <!-- Customer & Admin Details Section -->
          <div style="padding:10px 12px;background:#f8fafc;border-radius:8px;border:1px solid var(--border)">
            <div style="font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;margin-bottom:6px">
              👤 Billing Details
            </div>
            <div style="display:grid;gap:6px">
              <div>
                <label style="font-size:10.5px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px">Admin / Cashier Name</label>
                <input type="text" [(ngModel)]="cashierNameInput" placeholder="Admin / Cashier Name" class="cust-input" />
              </div>
              <div>
                <label style="font-size:10.5px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px">Customer Name</label>
                <input type="text" [(ngModel)]="customerName" placeholder="Customer Name" class="cust-input" />
              </div>
              <div>
                <label style="font-size:10.5px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px">Phone Number</label>
                <input type="tel" [(ngModel)]="customerPhone" placeholder="Phone Number" class="cust-input" />
              </div>
            </div>
          </div>
        </div>

        <div class="cart-totals" *ngIf="cart.length">
          <div class="ct-row"><span>Subtotal</span><span>\${{ subtotal | number:'1.2-2' }}</span></div>
          <div class="ct-row">
            <label>Discount ($)</label>
            <input type="number" [(ngModel)]="discount" (input)="recalc()" class="ct-input" min="0" />
          </div>
          <div class="ct-row">
            <label>Tax (%)</label>
            <input type="number" [(ngModel)]="taxPct" (input)="recalc()" class="ct-input" min="0" />
          </div>
          <div class="ct-row total"><span>Net Total</span><span>\${{ netTotal | number:'1.2-2' }}</span></div>

          <div class="payment-mode">
            <label style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);display:block;margin-bottom:6px">Payment Mode</label>
            <div class="pm-options">
              <button *ngFor="let m of payModes"
                      [class.selected]="paymentMode === m"
                      (click)="paymentMode = m"
                      class="pm-btn">{{ m }}</button>
            </div>
          </div>

          <button class="checkout-btn" (click)="checkout()" [disabled]="processing">
            <span *ngIf="!processing">💳 Checkout — \${{ netTotal | number:'1.0-0' }}</span>
            <span *ngIf="processing" class="spinner-w"></span>
          </button>

          <div class="alert alert-error" *ngIf="checkoutError" style="margin-top:10px">{{ checkoutError }}</div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .pos-layout {
      display: flex; gap: 20px;
      height: calc(100vh - 130px);
    }

    /* Product panel */
    .product-panel {
      flex: 1; display: flex; flex-direction: column; gap: 14px; min-width: 0;
    }
    .panel-toolbar { display: flex; gap: 10px; }
    .product-grid {
      flex: 1; overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px; align-content: start;
    }
    .product-tile {
      background: #fff; border-radius: 10px;
      padding: 14px; cursor: pointer;
      box-shadow: var(--shadow);
      transition: transform .15s, box-shadow .15s;
      display: flex; flex-direction: column; gap: 4px;
    }
    .product-tile:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .product-tile.out-of-stock { opacity: .4; cursor: not-allowed; }
    .pt-name { font-weight: 700; font-size: 13.5px; line-height: 1.3; }
    .pt-brand { font-size: 11.5px; color: var(--muted); }
    .pt-bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 6px; }
    .pt-price { font-weight: 800; color: #d97706; font-size: 14px; }
    .pt-stock { font-size: 11px; color: var(--muted); }
    .pt-stock.low { color: var(--danger); font-weight: 600; }

    /* Cart panel */
    .cart-panel {
      width: 340px; min-width: 300px;
      background: #fff; border-radius: 12px; box-shadow: var(--shadow);
      display: flex; flex-direction: column; overflow: hidden;
    }
    .cart-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 18px; border-bottom: 1px solid var(--border);
    }
    .cart-count {
      background: var(--accent); color: #000;
      font-size: 11px; font-weight: 700;
      border-radius: 10px; padding: 1px 7px; margin-left: 6px;
    }
    .cart-empty {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; color: var(--muted);
    }
    .cart-body { flex: 1; overflow-y: auto; padding: 10px 14px; display: flex; flex-direction: column; gap: 10px; }
    .cart-items { display: flex; flex-direction: column; }
    .cart-item {
      padding: 9px 0; border-bottom: 1px solid var(--border);
      display: flex; flex-direction: column; gap: 6px;
    }
    .cart-item:last-child { border-bottom: none; }
    .ci-info { display: flex; justify-content: space-between; }
    .ci-name { font-weight: 600; font-size: 13px; }
    .ci-price { font-size: 12px; color: var(--muted); }
    .ci-controls { display: flex; align-items: center; gap: 6px; }
    .qty-btn {
      width: 24px; height: 24px; border-radius: 6px;
      border: 1px solid var(--border); background: var(--bg);
      font-size: 14px; cursor: pointer; font-weight: 700; line-height: 1;
    }
    .qty-btn:hover { background: var(--accent); border-color: var(--accent); }
    .qty-val { min-width: 24px; text-align: center; font-weight: 700; font-size: 13px; }
    .ci-line { margin-left: auto; font-weight: 700; font-size: 13px; color: #d97706; }
    .rm-btn {
      background: none; border: none; color: var(--muted);
      cursor: pointer; font-size: 12px; padding: 2px 4px; border-radius: 4px;
    }
    .rm-btn:hover { background: #fee2e2; color: var(--danger); }

    /* Totals */
    .cart-totals { padding: 14px 16px; border-top: 1px solid var(--border); }
    .ct-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 5px 0; font-size: 13.5px;
    }
    .ct-row.total { font-weight: 800; font-size: 16px; padding: 8px 0; border-top: 1px solid var(--border); margin-top: 4px; }
    .ct-input {
      width: 80px; padding: 5px 8px;
      border: 1px solid var(--border); border-radius: 6px; text-align: right; font-size: 13px;
    }
    .payment-mode { margin: 12px 0; }
    .pm-options { display: flex; gap: 8px; }
    .pm-btn {
      flex: 1; padding: 7px; border-radius: 7px;
      border: 1.5px solid var(--border); background: #fff;
      font-size: 12px; font-weight: 600; cursor: pointer; transition: .15s;
    }
    .pm-btn.selected { background: #fef3c7; border-color: var(--accent); color: #92400e; }
    .checkout-btn {
      width: 100%; padding: 13px; background: #22c55e;
      border: none; border-radius: 9px;
      font-size: 14px; font-weight: 700; color: #fff; cursor: pointer;
      transition: background .15s;
      display: flex; align-items: center; justify-content: center; min-height: 46px;
    }
    .checkout-btn:hover:not(:disabled) { background: #16a34a; }
    .checkout-btn:disabled { opacity: .6; cursor: not-allowed; }
    .spinner-w {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin .6s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Receipt modal */
    .receipt-modal { max-width: 360px; font-family: monospace; }
    .receipt-header { text-align: center; margin-bottom: 12px; }
    .receipt-logo { font-size: 1.2rem; font-weight: 800; }
    .receipt-title { font-size: 11px; letter-spacing: .1em; color: var(--muted); margin: 4px 0; }
    .receipt-order { font-weight: 700; }
    .receipt-date { font-size: 11px; color: var(--muted); }
    .receipt-cashier { font-size: 12px; margin-bottom: 8px; }
    .receipt-divider { color: var(--muted); font-size: 12px; margin: 8px 0; }
    .receipt-items { display: flex; flex-direction: column; gap: 6px; }
    .receipt-item { display: flex; gap: 8px; font-size: 13px; }
    .ri-name { flex: 1; }
    .ri-qty { color: var(--muted); }
    .ri-price { font-weight: 700; min-width: 70px; text-align: right; }
    .receipt-totals { display: flex; flex-direction: column; gap: 5px; margin-bottom: 8px; }
    .rt-row { display: flex; justify-content: space-between; font-size: 13px; }
    .rt-row.total { font-weight: 800; font-size: 15px; padding-top: 6px; border-top: 1px solid var(--border); }
    .receipt-footer { text-align: center; font-size: 12px; color: var(--muted); margin-top: 8px; }
    .cust-input { width: 100%; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; box-sizing: border-box; }
  `]
})
export class PosComponent implements OnInit {
  products:     Product[]    = [];
  filtered:     Product[]    = [];
  cart:         CartEntry[]  = [];
  search           = '';
  cashierNameInput = '';
  customerName     = '';
  customerPhone    = '';
  discount         = 0;
  taxPct           = 0;
  subtotal         = 0;
  netTotal         = 0;
  paymentMode      = 'Cash';
  payModes         = ['Cash', 'Card', 'UPI'];
  processing       = false;
  checkoutError    = '';
  successMsg       = '';
  lastOrder:       SalesOrder | null = null;

  constructor(private productSvc: ProductService, private salesSvc: SalesService, public auth: AuthService) {}

  ngOnInit(): void {
    this.cashierNameInput = this.auth.currentUser?.fullName || 'Admin';
    this.productSvc.getAll().subscribe(p => { this.products = p; this.filtered = p; });
  }

  filterProducts(): void {
    const q = this.search.toLowerCase();
    this.filtered = q ? this.products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) : this.products;
  }

  addToCart(p: Product): void {
    if (p.currentStock === 0) return;
    const ex = this.cart.find(e => e.product.id === p.id);
    if (ex) { if (ex.quantity < p.currentStock) ex.quantity++; }
    else      this.cart.push({ product: p, quantity: 1 });
    this.recalc();
  }

  incQty(i: number, max: number): void { if (this.cart[i].quantity < max) { this.cart[i].quantity++; this.recalc(); } }
  decQty(i: number): void { if (this.cart[i].quantity > 1) { this.cart[i].quantity--; this.recalc(); } else this.removeFromCart(i); }
  removeFromCart(i: number): void { this.cart.splice(i, 1); this.recalc(); }
  clearCart(): void { this.cart = []; this.customerName = ''; this.customerPhone = ''; this.recalc(); }

  recalc(): void {
    this.subtotal = this.cart.reduce((s, e) => s + e.product.sellingPrice * e.quantity, 0);
    this.netTotal = this.subtotal - this.discount + (this.subtotal * this.taxPct / 100);
  }

  printReceipt(): void {
    const receipt = document.querySelector('.receipt-modal') as HTMLElement;
    if (!receipt) return;
    const win = window.open('', '_blank', 'width=400,height=600');
    if (!win) return;
    win.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: monospace; font-size: 13px; margin: 20px; }
        .rt-row { display:flex; justify-content:space-between; padding:3px 0; }
        .rt-row.total { font-weight:800; font-size:15px; border-top:1px solid #ccc; margin-top:4px; padding-top:6px; }
        .receipt-item { display:flex; gap:8px; margin:4px 0; }
        .ri-name { flex:1 }
        .ri-price { font-weight:700; min-width:70px; text-align:right; }
        .divider { color:#aaa; margin:8px 0; }
        .header { text-align:center; margin-bottom:10px; }
        .footer { text-align:center; color:#aaa; margin-top:8px; font-size:12px; }
      </style></head><body>
      ${receipt.innerHTML.replace(/<div class="modal-footer no-print"[\s\S]*?<\/div>\s*<\/div>/, '</div>')}
      <script>window.onload=()=>{window.print();window.close();}<\/script>
      </body></html>
    `);
    win.document.close();
  }

  checkout(): void {
    this.processing = true; this.checkoutError = ''; this.successMsg = '';
    const dto = {
      cashierId:     this.auth.currentUser?.userId || 1,
      cashierName:   this.cashierNameInput,
      customerName:  this.customerName,
      customerPhone: this.customerPhone,
      discount:      this.discount,
      taxAmount:     this.subtotal * this.taxPct / 100,
      paymentMode:   this.paymentMode,
      items:         this.cart.map(e => ({ productId: e.product.id, quantity: e.quantity, unitPrice: e.product.sellingPrice }))
    };
    this.salesSvc.checkout(dto).subscribe({
      next: order => {
        this.lastOrder = { ...order, cashierName: this.cashierNameInput || order.cashierName || 'Admin' };
        this.successMsg = `✅ Customer Bill Created & Stock Deducted! (Order #${order.orderNumber})`;
        this.cart = []; this.customerName = ''; this.customerPhone = ''; this.recalc(); this.processing = false;
        // Reload products to update live stock numbers on tiles
        this.productSvc.getAll().subscribe(p => { this.products = p; this.filterProducts(); });
      },
      error: err => { this.checkoutError = err?.error?.message ?? 'Checkout failed.'; this.processing = false; }
    });
  }
}
