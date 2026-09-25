import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

interface NavItem {
  path: string; label: string; icon: string; adminOnly?: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <ng-container *ngIf="auth.isLoggedIn; else loginView">
      <div class="shell" [class.mobile-nav-open]="isMobileNavOpen">

        <!-- ── Mobile Top Header ── -->
        <header class="mobile-header">
          <button class="menu-toggle" (click)="toggleMobileNav()">
            {{ isMobileNavOpen ? '✕' : '☰' }}
          </button>
          <div class="mobile-logo">
            <span>🍾</span> <strong>LiquorShop</strong>
          </div>
          <button class="logout-btn" (click)="auth.logout()" title="Logout">⏻</button>
        </header>

        <!-- ── Backdrop for Mobile ── -->
        <div class="sidebar-backdrop" (click)="closeMobileNav()"></div>

        <!-- ── Sidebar ── -->
        <aside class="sidebar">
          <div class="sidebar-logo">
            <span class="logo-icon">🍾</span>
            <span class="logo-text">LiquorShop</span>
          </div>

          <div class="sidebar-section-label">Main</div>
          <nav class="sidebar-nav">
            <ng-container *ngFor="let item of mainNav">
              <a *ngIf="!item.adminOnly || auth.isAdmin"
                 [routerLink]="item.path"
                 routerLinkActive="active"
                 (click)="closeMobileNav()"
                 class="nav-item">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            </ng-container>
          </nav>

          <div class="sidebar-section-label" *ngIf="auth.isAdmin">Admin</div>
          <nav class="sidebar-nav" *ngIf="auth.isAdmin">
            <ng-container *ngFor="let item of adminNav">
              <a [routerLink]="item.path" routerLinkActive="active" (click)="closeMobileNav()" class="nav-item">
                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>
              </a>
            </ng-container>
          </nav>

          <div class="sidebar-bottom">
            <div class="user-chip">
              <div class="user-avatar">{{ initial }}</div>
              <div class="user-info">
                <span class="user-name">{{ auth.currentUser?.fullName }}</span>
                <span class="user-role">{{ auth.currentUser?.role }}</span>
              </div>
            </div>
            <button class="logout-btn" (click)="auth.logout()" title="Logout">⏻</button>
          </div>
        </aside>

        <!-- ── Main content ── -->
        <main class="main-content">
          <router-outlet />
        </main>

      </div>
    </ng-container>
    <ng-template #loginView><router-outlet /></ng-template>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      position: relative;
    }

    .mobile-header {
      display: none;
    }

    .sidebar-backdrop {
      display: none;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 220px;
      min-width: 220px;
      background: #0f172a;
      display: flex;
      flex-direction: column;
      padding: 0;
      overflow-y: auto;
      overflow-x: hidden;
      z-index: 100;
      transition: transform .25s ease;
    }

    .sidebar-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 20px 18px 16px;
      border-bottom: 1px solid rgba(255,255,255,.07);
    }
    .logo-icon { font-size: 1.5rem; }
    .logo-text {
      font-size: 1.1rem; font-weight: 700;
      color: #f59e0b; letter-spacing: .02em;
    }

    .sidebar-section-label {
      padding: 18px 18px 6px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: .08em;
      color: #475569;
    }

    .sidebar-nav { display: flex; flex-direction: column; gap: 2px; padding: 0 10px; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 12px;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 13.5px;
      font-weight: 500;
      transition: background .15s, color .15s;
      cursor: pointer;
    }
    .nav-item:hover { background: rgba(255,255,255,.06); color: #e2e8f0; }
    .nav-item.active { background: rgba(245,158,11,.15); color: #f59e0b; font-weight: 600; }
    .nav-icon { font-size: 15px; width: 18px; text-align: center; }

    .sidebar-bottom {
      margin-top: auto;
      padding: 14px 14px;
      border-top: 1px solid rgba(255,255,255,.07);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .user-chip {
      display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0;
    }
    .user-avatar {
      width: 32px; height: 32px;
      background: #f59e0b;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; color: #000; font-size: 13px;
      flex-shrink: 0;
    }
    .user-info { display: flex; flex-direction: column; min-width: 0; }
    .user-name {
      font-size: 12.5px; font-weight: 600; color: #e2e8f0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .user-role { font-size: 11px; color: #64748b; }

    .logout-btn {
      background: none; border: none;
      color: #475569; font-size: 16px;
      cursor: pointer; padding: 6px;
      border-radius: 6px; transition: .15s;
      flex-shrink: 0;
    }
    .logout-btn:hover { background: rgba(239,68,68,.15); color: #ef4444; }

    /* ── Main content ── */
    .main-content {
      flex: 1;
      overflow-y: auto;
      padding: 28px 32px;
      background: #f1f5f9;
    }

    /* ── Mobile responsiveness (Phone View) ── */
    @media (max-width: 768px) {
      .shell {
        flex-direction: column;
        height: 100vh;
      }
      .mobile-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #0f172a;
        color: #fff;
        padding: 10px 16px;
        z-index: 110;
        height: 54px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
      }
      .menu-toggle {
        background: none;
        border: none;
        color: #f59e0b;
        font-size: 22px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 6px;
      }
      .mobile-logo {
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .sidebar {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 250px;
        transform: translateX(-100%);
        box-shadow: 4px 0 20px rgba(0,0,0,0.3);
      }
      .mobile-nav-open .sidebar {
        transform: translateX(0);
      }
      .mobile-nav-open .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 95;
      }
      .main-content {
        padding: 16px 12px;
        height: calc(100vh - 54px);
      }
    }
  `]
})
export class AppComponent {
  isMobileNavOpen = false;

  mainNav: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard',  icon: '📊' },
    { path: '/pos',       label: 'POS / Billing', icon: '🧾' },
    { path: '/products',  label: 'Products',   icon: '🍷' },
    { path: '/inventory', label: 'Inventory',  icon: '📦' },
    { path: '/sales',     label: 'Sales',      icon: '💰' },
  ];
  adminNav: NavItem[] = [
    { path: '/purchases',  label: 'Purchases',  icon: '🚚' },
    { path: '/ocr-scan',   label: 'OCR Scan',   icon: '📷' },
    { path: '/suppliers',  label: 'Suppliers',  icon: '🏭' },
    { path: '/categories', label: 'Categories', icon: '🏷️' },
    { path: '/reports',    label: 'Reports',    icon: '📈' },
    { path: '/users',      label: 'Users',      icon: '👥' },
    { path: '/audit-logs', label: 'Audit Logs', icon: '🔍' },
  ];

  get initial(): string {
    return (this.auth.currentUser?.fullName?.[0] ?? 'U').toUpperCase();
  }

  constructor(public auth: AuthService) {}

  toggleMobileNav(): void {
    this.isMobileNavOpen = !this.isMobileNavOpen;
  }

  closeMobileNav(): void {
    this.isMobileNavOpen = false;
  }
}
