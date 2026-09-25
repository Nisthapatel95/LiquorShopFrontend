import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { InventoryService, ReportService } from '../../services/inventory.service';
import { StockReport, LowStock, SalesSummary } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `

    <!-- ══════════════════════════════════════════
         HERO BANNER
    ══════════════════════════════════════════ -->
    <div class="hero">

      <!-- left text -->
      <div class="hero-text">
        <div class="hero-pill">🏪 Store Dashboard</div>
        <h1 class="hero-h1">Good {{ greeting }}, <span class="hero-gold">LiquorShop</span></h1>
        <p class="hero-sub">{{ today | date:'EEEE, MMMM d, y' }} — here's your live store overview.</p>
        <div class="hero-btns">
          <a routerLink="/pos"      class="hbtn hbtn-primary">🧾 Open POS</a>
          <a routerLink="/ocr-scan" class="hbtn hbtn-ghost">📷 Scan Invoice</a>
          <a routerLink="/reports"  class="hbtn hbtn-ghost">📈 Reports</a>
        </div>
      </div>

      <!-- right: SVG store illustration -->
      <div class="hero-art">
        <svg viewBox="0 0 380 200" class="art-svg">
          <!-- night sky bg -->
          <rect width="380" height="200" fill="#060d1a" rx="16"/>

          <!-- aurora/glow -->
          <ellipse cx="190" cy="60" rx="180" ry="60" fill="url(#aurora)" opacity=".3"/>
          <defs>
            <radialGradient id="aurora" cx="50%" cy="50%">
              <stop offset="0%"   stop-color="#3b82f6"/>
              <stop offset="100%" stop-color="transparent"/>
            </radialGradient>
          </defs>

          <!-- moon -->
          <circle cx="330" cy="32" r="22" fill="#fef3c7" opacity=".95"/>
          <circle cx="340" cy="24" r="17" fill="#060d1a"/>

          <!-- stars -->
          <circle cx="28"  cy="18" r="1.5" fill="#fff" opacity=".9"/>
          <circle cx="70"  cy="10" r="1"   fill="#fff" opacity=".7"/>
          <circle cx="130" cy="22" r="1.5" fill="#fff" opacity=".6"/>
          <circle cx="185" cy="8"  r="1"   fill="#fff" opacity=".8"/>
          <circle cx="240" cy="18" r="1.5" fill="#fff" opacity=".5"/>
          <circle cx="55"  cy="40" r="1"   fill="#fff" opacity=".6"/>
          <circle cx="150" cy="35" r="1"   fill="#fff" opacity=".7"/>

          <!-- building shadow -->
          <rect x="45" y="68" width="290" height="132" rx="2" fill="#0a1628"/>
          <!-- building front -->
          <rect x="48" y="65" width="284" height="135" rx="4" fill="#1e293b"/>
          <!-- facade texture lines -->
          <line x1="48" y1="105" x2="332" y2="105" stroke="rgba(255,255,255,.04)" stroke-width="1"/>
          <line x1="48" y1="140" x2="332" y2="140" stroke="rgba(255,255,255,.04)" stroke-width="1"/>

          <!-- shop sign board -->
          <rect x="78" y="54" width="224" height="34" rx="7" fill="url(#signGrad)"/>
          <defs>
            <linearGradient id="signGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%"   stop-color="#d97706"/>
              <stop offset="100%" stop-color="#f59e0b"/>
            </linearGradient>
          </defs>
          <text x="190" y="76" text-anchor="middle" font-size="14" font-weight="800"
                fill="#000" font-family="Segoe UI,sans-serif">🍾 LiquorShop</text>
          <!-- sign neon glow -->
          <rect x="78" y="54" width="224" height="34" rx="7" fill="none"
                stroke="#f59e0b" stroke-width="1.5" class="sign-glow"/>

          <!-- left window -->
          <rect x="66"  y="88" width="72" height="46" rx="5" fill="url(#winGrad)"/>
          <!-- right window -->
          <rect x="242" y="88" width="72" height="46" rx="5" fill="url(#winGrad)"/>
          <defs>
            <linearGradient id="winGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stop-color="#1d4ed8" stop-opacity=".9"/>
              <stop offset="100%" stop-color="#1e3a8a" stop-opacity=".7"/>
            </linearGradient>
          </defs>
          <!-- window reflections -->
          <line x1="102" y1="88" x2="102" y2="134" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>
          <line x1="66"  y1="111" x2="138" y2="111" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>
          <line x1="278" y1="88" x2="278" y2="134" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>
          <line x1="242" y1="111" x2="314" y2="111" stroke="rgba(255,255,255,.2)" stroke-width="1.5"/>
          <!-- window light glow -->
          <rect x="66"  y="88" width="72" height="46" rx="5" fill="#60a5fa" opacity=".06" class="win-pulse"/>
          <rect x="242" y="88" width="72" height="46" rx="5" fill="#60a5fa" opacity=".06" class="win-pulse"/>

          <!-- door -->
          <rect x="155" y="110" width="70" height="90" rx="5" fill="#0f2a4a"/>
          <rect x="159" y="114" width="28" height="50" rx="3" fill="#1e3a5f"/>
          <rect x="193" y="114" width="28" height="50" rx="3" fill="#1e3a5f"/>
          <!-- door handle -->
          <circle cx="189" cy="142" r="3.5" fill="#f59e0b"/>
          <circle cx="191" cy="142" r="3.5" fill="#d97706"/>

          <!-- road -->
          <rect x="0" y="186" width="380" height="14" fill="#1e293b"/>
          <line x1="0" y1="193" x2="380" y2="193" stroke="#f59e0b" stroke-width="2"
                stroke-dasharray="28 16" class="road-dash"/>

          <!-- street light left -->
          <rect x="20" y="82" width="4" height="104" fill="#334155"/>
          <rect x="10" y="78" width="24" height="7" rx="3" fill="#475569"/>
          <ellipse cx="22" cy="79" rx="9" ry="7" fill="#fef08a" opacity=".85" class="lamp-glow"/>

          <!-- street light right -->
          <rect x="356" y="82" width="4" height="104" fill="#334155"/>
          <rect x="346" y="78" width="24" height="7" rx="3" fill="#475569"/>
          <ellipse cx="358" cy="79" rx="9" ry="7" fill="#fef08a" opacity=".85" class="lamp-glow"/>

          <!-- animated car -->
          <rect x="-60" y="175" width="55" height="16" rx="5" fill="#dc2626" class="car"/>
          <circle cx="-48" cy="191" r="5" fill="#1e293b" class="car"/>
          <circle cx="-20" cy="191" r="5" fill="#1e293b" class="car"/>
          <rect x="-54" y="170" width="36" height="12" rx="3" fill="#ef4444" class="car"/>
          <rect x="-30" y="172" width="16" height="8"  rx="2" fill="#bfdbfe" opacity=".7" class="car"/>
        </svg>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         STAT CARDS
    ══════════════════════════════════════════ -->
    <div class="stat-row">
      <div class="scard sc-amber" (click)="goTo('/products')">
        <div class="sc-left">
          <div class="sc-val">{{ totalProducts }}</div>
          <div class="sc-lbl">Total Products</div>
          <div class="sc-sub">Active SKUs in stock</div>
        </div>
        <div class="sc-icon">🍷</div>
        <div class="sc-spark">
          <svg viewBox="0 0 60 24">
            <polyline points="0,20 10,15 20,18 30,10 40,12 50,6 60,8"
              fill="none" stroke="rgba(245,158,11,.6)" stroke-width="2"/>
          </svg>
        </div>
      </div>
      <div class="scard sc-red" (click)="goTo('/inventory')">
        <div class="sc-left">
          <div class="sc-val">{{ lowStockCount }}</div>
          <div class="sc-lbl">Low Stock</div>
          <div class="sc-sub">Items need reordering</div>
        </div>
        <div class="sc-icon">⚠️</div>
      </div>
      <div class="scard sc-green" (click)="goTo('/sales')">
        <div class="sc-left">
          <div class="sc-val">\${{ todayRevenue | number:'1.0-0' }}</div>
          <div class="sc-lbl">Today's Revenue</div>
          <div class="sc-sub">Net sales today</div>
        </div>
        <div class="sc-icon">💰</div>
        <div class="sc-spark">
          <svg viewBox="0 0 60 24">
            <polyline points="0,22 10,18 20,14 30,16 40,8 50,4 60,6"
              fill="none" stroke="rgba(34,197,94,.6)" stroke-width="2"/>
          </svg>
        </div>
      </div>
      <div class="scard sc-blue" (click)="goTo('/sales')">
        <div class="sc-left">
          <div class="sc-val">{{ todayOrders }}</div>
          <div class="sc-lbl">Today's Orders</div>
          <div class="sc-sub">Completed checkouts</div>
        </div>
        <div class="sc-icon">📋</div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         QUICK ACTIONS
    ══════════════════════════════════════════ -->
    <div class="section-head"><span class="sh-dot"></span>Quick Actions</div>
    <div class="qa-grid">
      <a routerLink="/pos"       class="qa qa-green">
        <div class="qa-bg-icon">🧾</div>
        <div class="qa-emoji">🧾</div>
        <div class="qa-lbl">New Sale</div>
        <div class="qa-sub">Open POS</div>
      </a>
      <a routerLink="/ocr-scan"  class="qa qa-blue">
        <div class="qa-bg-icon">📷</div>
        <div class="qa-emoji">📷</div>
        <div class="qa-lbl">Scan Invoice</div>
        <div class="qa-sub">OCR + Stock In</div>
      </a>
      <a routerLink="/products"  class="qa qa-amber">
        <div class="qa-bg-icon">🍷</div>
        <div class="qa-emoji">🍷</div>
        <div class="qa-lbl">Add Product</div>
        <div class="qa-sub">New SKU</div>
      </a>
      <a routerLink="/suppliers" class="qa qa-purple">
        <div class="qa-bg-icon">🏭</div>
        <div class="qa-emoji">🏭</div>
        <div class="qa-lbl">Suppliers</div>
        <div class="qa-sub">Manage</div>
      </a>
      <a routerLink="/reports"   class="qa qa-rose">
        <div class="qa-bg-icon">📈</div>
        <div class="qa-emoji">📈</div>
        <div class="qa-lbl">Reports</div>
        <div class="qa-sub">Analytics</div>
      </a>
      <a routerLink="/inventory" class="qa qa-teal">
        <div class="qa-bg-icon">📦</div>
        <div class="qa-emoji">📦</div>
        <div class="qa-lbl">Inventory</div>
        <div class="qa-sub">Stock View</div>
      </a>
    </div>

    <!-- ══════════════════════════════════════════
         BOTTOM ROW: bar chart + low stock table
    ══════════════════════════════════════════ -->
    <div class="btm-row">

      <!-- inline SVG bar chart -->
      <div class="chart-card">
        <div class="cc-head">
          <div>
            <div class="cc-title">📊 Sales — Last 7 Days</div>
            <div class="cc-sub">Revenue trend</div>
          </div>
          <a routerLink="/reports" class="cc-link">View report →</a>
        </div>

        <div *ngIf="salesSummary.length === 0" class="es">
          <div class="es-icon">📊</div><p>No sales data yet</p>
        </div>

        <ng-container *ngIf="salesSummary.length">
          <!-- SVG chart -->
          <svg class="chart-svg" [attr.viewBox]="'0 0 ' + chartW + ' ' + chartH" preserveAspectRatio="none">
            <!-- grid -->
            <line *ngFor="let g of gridLines" [attr.x1]="0" [attr.y1]="g" [attr.x2]="chartW" [attr.y2]="g"
                  stroke="rgba(0,0,0,.06)" stroke-width="1"/>
            <!-- bars -->
            <ng-container *ngFor="let s of last7; let i = index">
              <rect
                [attr.x]="barX(i)"
                [attr.y]="barY(s.netRevenue)"
                [attr.width]="barW"
                [attr.height]="barH(s.netRevenue)"
                rx="4"
                [attr.fill]="i === maxIdx ? 'url(#barHi)' : 'url(#barNorm)'"
                class="anim-bar" [style.animation-delay]="i * 80 + 'ms'"/>
              <text [attr.x]="barX(i) + barW/2" [attr.y]="chartH - 2"
                    text-anchor="middle" class="bar-date">{{ s.date | date:'d' }}</text>
            </ng-container>
            <!-- trend line -->
            <polyline [attr.points]="trendPoints" fill="none"
                      stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                      class="trend"/>
            <!-- dots on trend -->
            <circle *ngFor="let s of last7; let i = index"
                    [attr.cx]="barX(i) + barW/2"
                    [attr.cy]="barY(s.netRevenue)"
                    r="3.5" fill="#f59e0b" stroke="#fff" stroke-width="1.5"
                    class="trend-dot" [style.animation-delay]="i * 80 + 'ms'"/>
            <defs>
              <linearGradient id="barNorm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#3b82f6" stop-opacity=".85"/>
                <stop offset="100%" stop-color="#1e40af" stop-opacity=".4"/>
              </linearGradient>
              <linearGradient id="barHi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#f59e0b" stop-opacity=".95"/>
                <stop offset="100%" stop-color="#d97706" stop-opacity=".5"/>
              </linearGradient>
            </defs>
          </svg>

          <!-- legend row -->
          <div class="chart-legend">
            <div *ngFor="let s of last7" class="cl-item">
              <span class="cl-date">{{ s.date | date:'MMM d' }}</span>
              <span class="cl-rev">\${{ s.netRevenue | number:'1.0-0' }}</span>
            </div>
          </div>
        </ng-container>
      </div>

      <!-- low stock panel -->
      <div class="low-stock-card">
        <div class="cc-head">
          <div>
            <div class="cc-title">⚠️ Low Stock Alerts</div>
            <div class="cc-sub">{{ lowStockItems.length }} items need attention</div>
          </div>
          <a routerLink="/inventory" class="cc-link">View all →</a>
        </div>

        <div *ngIf="lowStockItems.length === 0" class="es">
          <svg viewBox="0 0 80 80" class="es-svg">
            <circle cx="40" cy="40" r="36" fill="#dcfce7"/>
            <text x="40" y="52" text-anchor="middle" font-size="28">✅</text>
          </svg>
          <p>All products well stocked!</p>
        </div>

        <div class="ls-list" *ngIf="lowStockItems.length">
          <div class="ls-item" *ngFor="let item of lowStockItems.slice(0,7)">
            <div class="ls-left">
              <div class="ls-dot">🍷</div>
              <div>
                <div class="ls-name">{{ item.productName }}</div>
                <div class="ls-sku">{{ item.sku }}</div>
              </div>
            </div>
            <div class="ls-right">
              <span class="ls-badge">{{ item.currentStock }} left</span>
              <div class="ls-bar-wrap">
                <div class="ls-bar" [style.width.%]="stockPct(item)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
  /* ══ Hero ══ */
  .hero {
    background: linear-gradient(135deg, #060d1a 0%, #0f2a4a 55%, #0a1628 100%);
    border-radius: 18px; padding: 28px 32px;
    display: flex; justify-content: space-between; align-items: center;
    margin-bottom: 24px; overflow: hidden; gap: 24px;
  }
  .hero-text { flex: 1; min-width: 0; }
  .hero-pill {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(245,158,11,.15); border: 1px solid rgba(245,158,11,.3);
    color: #fcd34d; font-size: 11.5px; font-weight: 700; letter-spacing: .04em;
    padding: 4px 12px; border-radius: 20px; margin-bottom: 12px;
  }
  .hero-h1 {
    font-size: 1.85rem; font-weight: 800; color: #f1f5f9;
    line-height: 1.2; margin-bottom: 8px;
  }
  .hero-gold { color: #f59e0b; }
  .hero-sub  { font-size: 13px; color: #94a3b8; margin-bottom: 20px; }
  .hero-btns { display: flex; gap: 10px; flex-wrap: wrap; }
  .hbtn {
    padding: 9px 18px; border-radius: 8px;
    font-size: 13px; font-weight: 700; cursor: pointer;
    text-decoration: none; transition: all .15s;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .hbtn-primary {
    background: #f59e0b; color: #000;
    box-shadow: 0 3px 12px rgba(245,158,11,.4);
  }
  .hbtn-primary:hover { background: #d97706; transform: translateY(-1px); box-shadow: 0 6px 18px rgba(245,158,11,.45); }
  .hbtn-ghost {
    background: rgba(255,255,255,.07); color: #e2e8f0;
    border: 1px solid rgba(255,255,255,.15);
  }
  .hbtn-ghost:hover { background: rgba(255,255,255,.12); }

  .hero-art { flex-shrink: 0; }
  .art-svg { width: 320px; max-width: 45%; border-radius: 14px; display: block; }
  .sign-glow { animation: signPulse 2.5s ease-in-out infinite; }
  @keyframes signPulse {
    0%,100% { opacity:1; filter:drop-shadow(0 0 5px #f59e0b); }
    50%     { opacity:.4; filter:drop-shadow(0 0 1px #f59e0b); }
  }
  .win-pulse { animation: winFlicker 4s ease-in-out infinite; }
  @keyframes winFlicker {
    0%,100% { opacity:.06; }  40% { opacity:.14; }  42% { opacity:.04; }  44% { opacity:.14; }
  }
  .lamp-glow { animation: lampPulse 3s ease-in-out infinite; }
  @keyframes lampPulse { 0%,100% { opacity:.85; } 50% { opacity:.5; } }
  .road-dash { animation: roadMove 2s linear infinite; }
  @keyframes roadMove { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -88; } }
  .car { animation: carDrive 5s linear infinite; }
  @keyframes carDrive { from { transform: translateX(0); } to { transform: translateX(500px); } }

  /* ══ Stat row ══ */
  .stat-row {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 16px; margin-bottom: 24px;
  }
  .scard {
    border-radius: 14px; padding: 18px 20px;
    position: relative; overflow: hidden;
    cursor: pointer; transition: transform .15s, box-shadow .15s;
    display: flex; flex-direction: column; justify-content: space-between;
    min-height: 110px;
  }
  .scard:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,.14); }
  .sc-amber { background: linear-gradient(135deg,#fffbeb,#fef3c7); border: 1px solid #fde68a; }
  .sc-red   { background: linear-gradient(135deg,#fff5f5,#fee2e2); border: 1px solid #fca5a5; }
  .sc-green { background: linear-gradient(135deg,#f0fdf4,#dcfce7); border: 1px solid #86efac; }
  .sc-blue  { background: linear-gradient(135deg,#eff6ff,#dbeafe); border: 1px solid #93c5fd; }
  .sc-left  { z-index: 1; }
  .sc-val   { font-size: 1.9rem; font-weight: 800; line-height: 1; color: #0f172a; }
  .sc-lbl   { font-size: 12.5px; font-weight: 700; color: #374151; margin-top: 5px; }
  .sc-sub   { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .sc-icon  {
    position: absolute; right: 14px; top: 14px;
    font-size: 2.2rem; opacity: .25; z-index: 0;
    transition: opacity .15s;
  }
  .scard:hover .sc-icon { opacity: .45; }
  .sc-spark {
    position: absolute; bottom: 6px; right: 6px;
    width: 60px; height: 24px; opacity: .6;
  }

  /* ══ Quick actions ══ */
  .section-head {
    display: flex; align-items: center; gap: 8px;
    font-size: 11.5px; font-weight: 700; color: #64748b;
    text-transform: uppercase; letter-spacing: .07em;
    margin-bottom: 12px;
  }
  .sh-dot {
    width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;
    animation: dotPulse 2s ease-in-out infinite;
  }
  @keyframes dotPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.4); opacity: .7; } }

  .qa-grid {
    display: grid; grid-template-columns: repeat(6, 1fr);
    gap: 12px; margin-bottom: 24px;
  }
  .qa {
    border-radius: 14px; padding: 18px 12px;
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    text-decoration: none; cursor: pointer; position: relative; overflow: hidden;
    transition: transform .15s, box-shadow .15s;
    text-align: center;
  }
  .qa:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.14); }
  .qa:hover .qa-bg-icon { opacity: .2; transform: scale(1.2) rotate(-5deg); }
  .qa-bg-icon {
    position: absolute; font-size: 3.5rem; opacity: .08;
    bottom: -8px; right: -4px; pointer-events: none;
    transition: opacity .2s, transform .2s;
  }
  .qa-emoji  { font-size: 1.9rem; z-index: 1; }
  .qa-lbl    { font-size: 13px; font-weight: 700; z-index: 1; }
  .qa-sub    { font-size: 10.5px; opacity: .7; z-index: 1; }
  .qa-green  { background: #dcfce7; color: #15803d; }
  .qa-blue   { background: #dbeafe; color: #1d4ed8; }
  .qa-amber  { background: #fef9c3; color: #92400e; }
  .qa-purple { background: #ede9fe; color: #6d28d9; }
  .qa-rose   { background: #ffe4e6; color: #be123c; }
  .qa-teal   { background: #ccfbf1; color: #0f766e; }

  /* ══ Bottom row ══ */
  .btm-row {
    display: grid; grid-template-columns: 1.4fr 1fr;
    gap: 20px;
  }

  /* chart card */
  .chart-card, .low-stock-card {
    background: #fff; border-radius: 14px;
    box-shadow: 0 1px 4px rgba(0,0,0,.08);
    padding: 20px 22px;
  }
  .cc-head {
    display: flex; justify-content: space-between; align-items: flex-start;
    margin-bottom: 16px;
  }
  .cc-title { font-size: 14px; font-weight: 700; color: #0f172a; }
  .cc-sub   { font-size: 11px; color: #64748b; margin-top: 2px; }
  .cc-link  { font-size: 12px; font-weight: 600; color: #3b82f6; text-decoration: none; white-space: nowrap; }
  .cc-link:hover { text-decoration: underline; }

  /* SVG chart */
  .chart-svg { width: 100%; height: 130px; overflow: visible; }
  .anim-bar  { animation: growUp .5s ease forwards; transform-origin: bottom; opacity: 0; }
  @keyframes growUp { from { transform: scaleY(0); opacity: 0; } to { transform: scaleY(1); opacity: 1; } }
  .bar-date  { font-size: 9px; fill: #94a3b8; }
  .trend     { stroke-dasharray: 600; stroke-dashoffset: 600; animation: drawTrend .8s ease forwards .6s; }
  @keyframes drawTrend { to { stroke-dashoffset: 0; } }
  .trend-dot { opacity: 0; animation: popIn .3s ease forwards; }
  @keyframes popIn { to { opacity: 1; } }

  .chart-legend {
    display: flex; justify-content: space-around;
    padding-top: 8px; border-top: 1px solid #f1f5f9;
    margin-top: 6px;
  }
  .cl-item  { display: flex; flex-direction: column; align-items: center; gap: 2px; }
  .cl-date  { font-size: 10px; color: #94a3b8; }
  .cl-rev   { font-size: 11px; font-weight: 700; color: #0f172a; }

  /* empty state */
  .es { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px 0; gap: 8px; color: #94a3b8; }
  .es-svg { width: 64px; height: 64px; }
  .es p { font-size: 13px; }

  /* low stock list */
  .ls-list { display: flex; flex-direction: column; gap: 10px; }
  .ls-item {
    display: flex; justify-content: space-between; align-items: center;
    padding: 8px 10px; border-radius: 9px; background: #fafafa;
    transition: background .15s;
  }
  .ls-item:hover { background: #fff7ed; }
  .ls-left { display: flex; align-items: center; gap: 10px; }
  .ls-dot  { font-size: 1.3rem; }
  .ls-name { font-size: 13px; font-weight: 600; color: #0f172a; }
  .ls-sku  { font-size: 11px; color: #94a3b8; font-family: monospace; }
  .ls-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; min-width: 80px; }
  .ls-badge {
    background: #fee2e2; color: #991b1b;
    font-size: 11px; font-weight: 700;
    padding: 2px 8px; border-radius: 10px;
  }
  .ls-bar-wrap {
    width: 72px; height: 4px; background: #f1f5f9; border-radius: 2px; overflow: hidden;
  }
  .ls-bar {
    height: 100%; background: #ef4444; border-radius: 2px;
    transition: width .4s ease;
  }

  @media (max-width: 1100px) {
    .qa-grid { grid-template-columns: repeat(3, 1fr); }
    .stat-row { grid-template-columns: repeat(2, 1fr); }
    .art-svg  { width: 240px; }
  }
  @media (max-width: 900px) {
    .btm-row { grid-template-columns: 1fr; }
    .hero-art { display: none; }
  }
  `]
})
export class DashboardComponent implements OnInit {
  stockReport:   StockReport[]  = [];
  lowStockItems: LowStock[]     = [];
  salesSummary:  SalesSummary[] = [];
  today = new Date();

  // chart config
  readonly chartW = 340;
  readonly chartH = 120;
  readonly barW   = 30;
  readonly gutter = 8;
  readonly gridLines = [20, 50, 80];

  get greeting()      { const h = new Date().getHours(); return h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'; }
  get totalProducts() { return this.stockReport.length; }
  get lowStockCount() { return this.lowStockItems.length; }
  get last7()         { return this.salesSummary.slice(-7); }

  get todayRevenue() {
    const t = new Date().toISOString().split('T')[0];
    return this.salesSummary.filter(s => s.date?.startsWith(t)).reduce((a, b) => a + b.netRevenue, 0);
  }
  get todayOrders() {
    const t = new Date().toISOString().split('T')[0];
    return this.salesSummary.filter(s => s.date?.startsWith(t)).reduce((a, b) => a + b.totalOrders, 0);
  }

  get maxIdx() {
    let max = 0, idx = 0;
    this.last7.forEach((s, i) => { if (s.netRevenue > max) { max = s.netRevenue; idx = i; } });
    return idx;
  }

  barX(i: number): number { return i * (this.barW + this.gutter) + 4; }
  barH(rev: number): number {
    const max = Math.max(...this.last7.map(s => s.netRevenue), 1);
    return Math.max(6, ((rev / max) * (this.chartH - 22)));
  }
  barY(rev: number): number { return this.chartH - 14 - this.barH(rev); }

  get trendPoints(): string {
    return this.last7.map((s, i) => `${this.barX(i) + this.barW / 2},${this.barY(s.netRevenue)}`).join(' ');
  }

  stockPct(item: LowStock): number {
    return Math.max(5, Math.round((item.currentStock / Math.max(item.reorderLevel, 1)) * 100));
  }

  goTo(path: string) {
    this.router.navigateByUrl(path);
  }

  constructor(
    private inv: InventoryService,
    private rpt: ReportService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inv.getCurrentStock().subscribe(d => this.stockReport = d);
    this.rpt.getLowStock().subscribe(d => this.lowStockItems = d);
    const from = new Date(); from.setDate(from.getDate() - 30);
    this.rpt.getSalesSummary(from.toISOString(), new Date().toISOString()).subscribe(d => this.salesSummary = d);
  }
}
