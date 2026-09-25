import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { Router }         from '@angular/router';
import { AuthService }    from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="lp">

    <!-- ════════════════ LEFT PANEL ════════════════ -->
    <div class="lp-left">

      <!-- animated gradient orbs -->
      <div class="orb orb1"></div>
      <div class="orb orb2"></div>
      <div class="orb orb3"></div>

      <!-- rising bottles -->
      <div class="bottle b1">🍾</div><div class="bottle b2">🥃</div>
      <div class="bottle b3">🍷</div><div class="bottle b4">🍸</div>
      <div class="bottle b5">🥂</div><div class="bottle b6">🍾</div>
      <div class="bottle b7">🥃</div><div class="bottle b8">🍷</div>
      <div class="bottle b9">🥂</div><div class="bottle b10">🍸</div>

      <div class="lp-left-body">

        <!-- brand -->
        <div class="brand">
          <div class="brand-box">🍾</div>
          <span class="brand-name">LiquorShop</span>
        </div>

        <!-- headline -->
        <h1 class="headline">Complete Inventory<br>&amp; <span class="hl-gold">Billing System</span></h1>
        <p class="sub">From OCR invoice scanning to live POS checkout — manage your entire liquor shop in one modern platform.</p>

        <!-- ── SVG bar-chart illustration ── -->
        <div class="chart-card">
          <div class="chart-label">📊 Monthly Sales Overview</div>
          <svg class="bar-svg" viewBox="0 0 280 90" preserveAspectRatio="none">
            <!-- grid lines -->
            <line x1="0" y1="0"  x2="280" y2="0"  stroke="rgba(255,255,255,.06)" stroke-width="1"/>
            <line x1="0" y1="30" x2="280" y2="30" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
            <line x1="0" y1="60" x2="280" y2="60" stroke="rgba(255,255,255,.06)" stroke-width="1"/>
            <!-- bars -->
            <rect x="6"   y="50" width="20" height="40" rx="4" fill="url(#bg1)" class="bar" style="animation-delay:.0s"/>
            <rect x="36"  y="30" width="20" height="60" rx="4" fill="url(#bg1)" class="bar" style="animation-delay:.1s"/>
            <rect x="66"  y="20" width="20" height="70" rx="4" fill="url(#bg1)" class="bar" style="animation-delay:.2s"/>
            <rect x="96"  y="40" width="20" height="50" rx="4" fill="url(#bg1)" class="bar" style="animation-delay:.3s"/>
            <rect x="126" y="10" width="20" height="80" rx="4" fill="url(#bg2)" class="bar bar-hi" style="animation-delay:.4s"/>
            <rect x="156" y="25" width="20" height="65" rx="4" fill="url(#bg1)" class="bar" style="animation-delay:.5s"/>
            <rect x="186" y="35" width="20" height="55" rx="4" fill="url(#bg1)" class="bar" style="animation-delay:.6s"/>
            <rect x="216" y="15" width="20" height="75" rx="4" fill="url(#bg2)" class="bar bar-hi" style="animation-delay:.7s"/>
            <rect x="246" y="45" width="20" height="45" rx="4" fill="url(#bg1)" class="bar" style="animation-delay:.8s"/>
            <!-- trend line -->
            <polyline points="16,50 46,30 76,20 106,40 136,10 166,25 196,35 226,15 256,45"
              fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"
              stroke-dasharray="400" stroke-dashoffset="400" class="trend-line"/>
            <!-- month labels -->
            <text x="16"  y="88" class="bar-lbl">Apr</text>
            <text x="46"  y="88" class="bar-lbl">May</text>
            <text x="76"  y="88" class="bar-lbl">Jun</text>
            <text x="106" y="88" class="bar-lbl">Jul</text>
            <text x="136" y="88" class="bar-lbl">Aug</text>
            <text x="166" y="88" class="bar-lbl">Sep</text>
            <text x="196" y="88" class="bar-lbl">Oct</text>
            <text x="226" y="88" class="bar-lbl">Nov</text>
            <text x="256" y="88" class="bar-lbl">Dec</text>
            <defs>
              <linearGradient id="bg1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#3b82f6" stop-opacity=".9"/>
                <stop offset="100%" stop-color="#1e40af" stop-opacity=".5"/>
              </linearGradient>
              <linearGradient id="bg2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#f59e0b" stop-opacity=".95"/>
                <stop offset="100%" stop-color="#d97706" stop-opacity=".6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <!-- feature chips -->
        <div class="chips">
          <span class="chip" *ngFor="let f of features">{{ f }}</span>
        </div>

        <!-- live counter strip -->
        <div class="counter-strip">
          <div class="ctr" *ngFor="let c of counters">
            <span class="ctr-val">{{ c.val }}</span>
            <span class="ctr-lbl">{{ c.lbl }}</span>
          </div>
        </div>

      </div>
    </div>

    <!-- ════════════════ RIGHT PANEL ════════════════ -->
    <div class="lp-right">

      <!-- top window bar -->
      <div class="win-bar">
        <span class="wd red"></span>
        <span class="wd yellow"></span>
        <span class="wd green"></span>
        <span class="win-title">LiquorShop — Admin Console</span>
      </div>

      <!-- scrollable form area -->
      <div class="form-scroll">

        <!-- store SVG illustration -->
        <div class="store-svg-wrap">
          <svg viewBox="0 0 320 140" class="store-svg">
            <!-- background sky -->
            <rect width="320" height="140" fill="#0f172a" rx="12"/>
            <!-- moon -->
            <circle cx="270" cy="28" r="18" fill="#fef3c7" opacity=".9"/>
            <circle cx="278" cy="22" r="14" fill="#0f172a"/>
            <!-- stars -->
            <circle cx="30"  cy="20" r="1.5" fill="white" opacity=".8"/>
            <circle cx="80"  cy="12" r="1"   fill="white" opacity=".7"/>
            <circle cx="140" cy="25" r="1.5" fill="white" opacity=".6"/>
            <circle cx="200" cy="10" r="1"   fill="white" opacity=".8"/>
            <circle cx="50"  cy="35" r="1"   fill="white" opacity=".5"/>
            <!-- building -->
            <rect x="40" y="50" width="240" height="90" rx="4" fill="#1e293b"/>
            <!-- shop sign -->
            <rect x="70" y="42" width="180" height="28" rx="6" fill="#f59e0b"/>
            <text x="160" y="61" text-anchor="middle" font-size="13" font-weight="800" fill="#000" font-family="Segoe UI,sans-serif">🍾 LiquorShop</text>
            <!-- door -->
            <rect x="138" y="90" width="44" height="50" rx="4" fill="#334155"/>
            <circle cx="175" cy="117" r="3" fill="#f59e0b"/>
            <!-- windows -->
            <rect x="58"  y="76" width="50" height="36" rx="4" fill="#1d4ed8" opacity=".8"/>
            <rect x="212" y="76" width="50" height="36" rx="4" fill="#1d4ed8" opacity=".8"/>
            <!-- window cross -->
            <line x1="83"  y1="76" x2="83"  y2="112" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
            <line x1="58"  y1="94" x2="108" y2="94"  stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
            <line x1="237" y1="76" x2="237" y2="112" stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
            <line x1="212" y1="94" x2="262" y2="94"  stroke="rgba(255,255,255,.3)" stroke-width="1.5"/>
            <!-- road -->
            <rect x="0" y="130" width="320" height="10" fill="#334155"/>
            <line x1="0" y1="135" x2="320" y2="135" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="20 12"/>
            <!-- street light -->
            <rect x="18" y="68" width="3" height="62" fill="#475569"/>
            <rect x="10" y="66" width="19" height="5" rx="2" fill="#64748b"/>
            <circle cx="19" cy="66" r="6" fill="#fef08a" opacity=".9"/>
            <!-- animated neon sign glow -->
            <rect x="70" y="42" width="180" height="28" rx="6" fill="none" stroke="#f59e0b" stroke-width="2" class="neon-pulse"/>
          </svg>
        </div>

        <!-- form card -->
        <div class="fc">
          <div class="fc-head">
            <h2>Welcome back 👋</h2>
            <p>Sign in to your admin account</p>
          </div>

          <div class="alert-err" *ngIf="error">⚠ {{ error }}</div>

          <!-- email -->
          <div class="fg">
            <label>Email Address</label>
            <div class="iw" [class.focused]="emailFocus">
              <svg class="ii" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/></svg>
              <input type="email" [(ngModel)]="email" placeholder="admin@shop.com"
                     (focus)="emailFocus=true" (blur)="emailFocus=false"
                     (keyup.enter)="login()" />
            </div>
          </div>

          <!-- password -->
          <div class="fg" style="margin-top:14px">
            <label>Password</label>
            <div class="iw" [class.focused]="passFocus">
              <svg class="ii" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"/></svg>
              <input [type]="showPass?'text':'password'" [(ngModel)]="password" placeholder="••••••••"
                     (focus)="passFocus=true" (blur)="passFocus=false"
                     (keyup.enter)="login()" />
              <button class="eye-btn" (click)="showPass=!showPass" type="button">
                <svg *ngIf="!showPass" viewBox="0 0 20 20" fill="currentColor" width="16"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/></svg>
                <svg *ngIf="showPass"  viewBox="0 0 20 20" fill="currentColor" width="16"><path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd"/><path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.064 7 9.542 7 .847 0 1.669-.105 2.454-.303z"/></svg>
              </button>
            </div>
          </div>

          <!-- progress bar shown while loading -->
          <div class="progress-bar" *ngIf="loading">
            <div class="progress-fill"></div>
          </div>

          <button class="sign-btn" (click)="login()" [disabled]="loading" [class.loading]="loading">
            <span *ngIf="!loading" class="btn-content">
              <svg viewBox="0 0 20 20" fill="currentColor" width="17"><path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              Sign In to Dashboard
            </span>
            <span *ngIf="loading" class="btn-spinner"></span>
          </button>

          <div class="cred-box">
            <div class="cred-row"><span class="cred-k">✉ Email</span><span class="cred-v">admin&#64;shop.com</span></div>
            <div class="cred-row"><span class="cred-k">🔑 Password</span><span class="cred-v">Admin&#64;123</span></div>
          </div>
        </div>

        <!-- animated shelf at bottom -->
        <div class="btm-shelf">
          <div class="bsh-inner">
            <span class="bsh-bottle" style="--d:0s">🍾</span>
            <span class="bsh-bottle" style="--d:.2s">🥃</span>
            <span class="bsh-bottle" style="--d:.4s">🍷</span>
            <span class="bsh-bottle" style="--d:.6s">🍸</span>
            <span class="bsh-bottle" style="--d:.8s">🥂</span>
            <span class="bsh-bottle" style="--d:1s">🍾</span>
            <span class="bsh-bottle" style="--d:1.2s">🥃</span>
            <span class="bsh-bottle" style="--d:1.4s">🍷</span>
          </div>
          <div class="shelf-wood"></div>
        </div>

      </div><!-- /form-scroll -->
    </div><!-- /lp-right -->

  </div>
  `,
  styles: [`
  * { box-sizing: border-box; margin: 0; padding: 0; }

  .lp {
    display: flex; height: 100vh; overflow: hidden;
    font-family: 'Segoe UI', system-ui, sans-serif;
  }

  /* ══════════ LEFT ══════════ */
  .lp-left {
    flex: 1; position: relative; overflow: hidden;
    background: #060d1a;
    display: flex; align-items: center; justify-content: center;
  }

  /* gradient orbs */
  .orb {
    position: absolute; border-radius: 50%;
    filter: blur(80px); pointer-events: none;
  }
  .orb1 { width: 400px; height: 400px; background: #1e3a5f; top: -100px; left: -80px; animation: drift 12s ease-in-out infinite; }
  .orb2 { width: 300px; height: 300px; background: #7c2d12; bottom: -60px; right: 40px; animation: drift 16s ease-in-out infinite reverse; }
  .orb3 { width: 250px; height: 250px; background: #1e1b4b; top: 40%; left: 50%; animation: drift 10s ease-in-out infinite 3s; }
  @keyframes drift {
    0%,100% { transform: translate(0,0) scale(1); }
    50%      { transform: translate(30px,-40px) scale(1.08); }
  }

  /* rising bottles */
  .bottle {
    position: absolute; bottom: -70px; opacity: 0;
    user-select: none; pointer-events: none;
    animation: riseUp linear infinite;
  }
  .b1  { left:  4%; font-size:2.6rem; animation-duration:7s;   animation-delay:0s;   }
  .b2  { left: 13%; font-size:2rem;   animation-duration:9.5s; animation-delay:1.3s; }
  .b3  { left: 23%; font-size:2.9rem; animation-duration:8s;   animation-delay:2.6s; }
  .b4  { left: 35%; font-size:1.8rem; animation-duration:6.5s; animation-delay:0.8s; }
  .b5  { left: 47%; font-size:2.5rem; animation-duration:10s;  animation-delay:3.9s; }
  .b6  { left: 58%; font-size:2rem;   animation-duration:7.5s; animation-delay:1.8s; }
  .b7  { left: 68%; font-size:2.7rem; animation-duration:8.5s; animation-delay:4.6s; }
  .b8  { left: 78%; font-size:1.9rem; animation-duration:6.8s; animation-delay:2.2s; }
  .b9  { left: 88%; font-size:2.4rem; animation-duration:9s;   animation-delay:0.5s; }
  .b10 { left: 42%; font-size:2.1rem; animation-duration:11s;  animation-delay:5.5s; }
  @keyframes riseUp {
    0%   { transform:translateY(0)      rotate(0deg);   opacity:0;    }
    7%   { opacity:.6; }
    50%  { transform:translateY(-50vh)  rotate(14deg);  opacity:.35;  }
    93%  { opacity:.1; }
    100% { transform:translateY(-108vh) rotate(-10deg); opacity:0;    }
  }

  .lp-left-body {
    position: relative; z-index: 2;
    padding: 44px 52px; max-width: 560px; width: 100%;
  }

  .brand { display:flex; align-items:center; gap:14px; margin-bottom:30px; }
  .brand-box {
    width:50px; height:50px; background:linear-gradient(135deg,#f59e0b,#d97706);
    border-radius:14px; display:flex; align-items:center; justify-content:center;
    font-size:1.7rem; box-shadow:0 4px 18px rgba(245,158,11,.45);
    animation: pulse-brand 3s ease-in-out infinite;
  }
  @keyframes pulse-brand {
    0%,100% { box-shadow: 0 4px 18px rgba(245,158,11,.45); }
    50%     { box-shadow: 0 6px 28px rgba(245,158,11,.7); }
  }
  .brand-name { font-size:1.75rem; font-weight:800; color:#f59e0b; letter-spacing:.02em; }

  .headline { font-size:2.1rem; font-weight:800; line-height:1.2; color:#f1f5f9; margin-bottom:12px; }
  .hl-gold  { color:#f59e0b; }
  .sub { font-size:13.5px; color:#94a3b8; line-height:1.7; margin-bottom:26px; max-width:420px; }

  /* bar chart card */
  .chart-card {
    background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08);
    border-radius:12px; padding:16px 18px; margin-bottom:22px;
  }
  .chart-label { font-size:12px; font-weight:700; color:#94a3b8; margin-bottom:10px; letter-spacing:.04em; }
  .bar-svg { width:100%; height:90px; }
  .bar { transform-origin: bottom; animation: growBar .8s ease forwards; opacity:0; }
  @keyframes growBar {
    from { transform: scaleY(0); opacity:0; }
    to   { transform: scaleY(1); opacity:1; }
  }
  .bar-lbl { font-size:7px; fill:rgba(255,255,255,.35); text-anchor:middle; }
  .trend-line { animation: drawLine 1.5s ease forwards .8s; }
  @keyframes drawLine { to { stroke-dashoffset: 0; } }

  /* feature chips */
  .chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
  .chip {
    background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
    color:#cbd5e1; font-size:12px; font-weight:600; padding:5px 12px; border-radius:20px;
    transition:.2s;
  }
  .chip:hover { background:rgba(245,158,11,.15); border-color:rgba(245,158,11,.3); color:#fcd34d; }

  /* counter strip */
  .counter-strip {
    display:flex; gap:0;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    border-radius:10px; overflow:hidden;
  }
  .ctr {
    flex:1; display:flex; flex-direction:column; align-items:center; padding:12px 8px;
    border-right:1px solid rgba(255,255,255,.07);
  }
  .ctr:last-child { border-right:none; }
  .ctr-val { font-size:1.3rem; font-weight:800; color:#f59e0b; }
  .ctr-lbl { font-size:10px; color:#64748b; font-weight:600; margin-top:2px; text-align:center; }

  /* ══════════ RIGHT ══════════ */
  .lp-right {
    width:480px; min-width:440px; background:#f1f5f9;
    display:flex; flex-direction:column; overflow:hidden;
  }

  .win-bar {
    background:#e2e8f0; padding:10px 16px;
    display:flex; align-items:center; gap:7px;
    border-bottom:1px solid #cbd5e1; flex-shrink:0;
  }
  .wd { width:12px; height:12px; border-radius:50%; display:inline-block; }
  .wd.red    { background:#ef4444; }
  .wd.yellow { background:#f59e0b; }
  .wd.green  { background:#22c55e; }
  .win-title { margin-left:8px; font-size:12px; color:#64748b; font-weight:600; }

  .form-scroll {
    flex:1; overflow-y:auto; padding:20px 32px 28px;
    display:flex; flex-direction:column; gap:16px;
  }

  /* store SVG illustration */
  .store-svg-wrap { border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,.15); }
  .store-svg { width:100%; display:block; }
  .neon-pulse { animation: neon 2s ease-in-out infinite; }
  @keyframes neon {
    0%,100% { opacity:1; filter:drop-shadow(0 0 4px #f59e0b); }
    50%     { opacity:.4; filter:drop-shadow(0 0 1px #f59e0b); }
  }

  /* form card */
  .fc { background:#fff; border-radius:14px; padding:26px 28px; box-shadow:0 2px 12px rgba(0,0,0,.07); }
  .fc-head { margin-bottom:22px; }
  .fc-head h2 { font-size:1.45rem; font-weight:800; color:#0f172a; margin-bottom:4px; }
  .fc-head p  { font-size:13px; color:#64748b; }

  .alert-err {
    background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;
    border-radius:8px; padding:10px 14px; font-size:13px; margin-bottom:14px;
  }

  .fg label {
    display:block; font-size:11px; font-weight:700;
    text-transform:uppercase; letter-spacing:.06em; color:#475569; margin-bottom:6px;
  }
  .iw {
    display:flex; align-items:center; position:relative;
    border:1.5px solid #e2e8f0; border-radius:9px; background:#fff;
    transition:border-color .15s, box-shadow .15s;
  }
  .iw.focused { border-color:#3b82f6; box-shadow:0 0 0 3px rgba(59,130,246,.12); }
  .ii { width:16px; height:16px; color:#94a3b8; margin:0 10px; flex-shrink:0; }
  .iw input {
    flex:1; padding:11px 8px; border:none; outline:none;
    font-size:14px; background:transparent; color:#0f172a;
  }
  .eye-btn {
    background:none; border:none; cursor:pointer; padding:8px 10px;
    color:#94a3b8; display:flex; align-items:center;
  }
  .eye-btn:hover { color:#3b82f6; }

  .progress-bar {
    height:3px; background:#e2e8f0; border-radius:2px; margin-top:14px; overflow:hidden;
  }
  .progress-fill {
    height:100%; background:linear-gradient(90deg,#3b82f6,#f59e0b);
    border-radius:2px; animation: progress 1.2s ease-in-out infinite;
  }
  @keyframes progress {
    0%   { width:0%;   margin-left:0%; }
    50%  { width:70%;  margin-left:15%; }
    100% { width:0%;   margin-left:100%; }
  }

  .sign-btn {
    width:100%; margin-top:18px; padding:13px;
    background:linear-gradient(135deg,#f59e0b,#d97706);
    border:none; border-radius:9px; font-size:14px; font-weight:700;
    cursor:pointer; color:#000;
    transition:transform .15s, box-shadow .15s, filter .15s;
    display:flex; align-items:center; justify-content:center; min-height:46px;
    box-shadow:0 4px 16px rgba(245,158,11,.4);
  }
  .sign-btn:hover:not(:disabled) {
    transform:translateY(-2px); box-shadow:0 8px 24px rgba(245,158,11,.5);
    filter:brightness(1.05);
  }
  .sign-btn:active:not(:disabled) { transform:translateY(0); }
  .sign-btn:disabled { opacity:.6; cursor:not-allowed; }
  .btn-content { display:flex; align-items:center; gap:8px; }
  .btn-spinner {
    width:18px; height:18px;
    border:2.5px solid rgba(0,0,0,.2); border-top-color:#000;
    border-radius:50%; animation:spin .6s linear infinite;
  }
  @keyframes spin { to { transform:rotate(360deg); } }

  .cred-box {
    margin-top:16px; background:#f8fafc; border:1px solid #e2e8f0;
    border-radius:9px; overflow:hidden;
  }
  .cred-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:9px 14px; border-bottom:1px solid #e2e8f0; font-size:12.5px;
  }
  .cred-row:last-child { border-bottom:none; }
  .cred-k { color:#64748b; font-weight:600; }
  .cred-v { font-family:monospace; font-size:12px; color:#0f172a; background:#e2e8f0; padding:2px 8px; border-radius:5px; }

  /* bottom shelf */
  .btm-shelf { flex-shrink:0; }
  .bsh-inner {
    display:flex; justify-content:space-around;
    padding:4px 16px 0;
  }
  .bsh-bottle {
    font-size:1.9rem; display:inline-block;
    animation: wobble 3s ease-in-out infinite;
    animation-delay: var(--d);
  }
  @keyframes wobble {
    0%,100% { transform:rotate(0deg) translateY(0); }
    25%     { transform:rotate(-5deg) translateY(-3px); }
    75%     { transform:rotate(5deg)  translateY(-1px); }
  }
  .shelf-wood {
    height:8px;
    background:linear-gradient(90deg,#92400e,#b45309,#78350f);
    box-shadow:0 3px 8px rgba(0,0,0,.3);
  }

  @media (max-width:820px) {
    .lp-left { display:none; }
    .lp-right { width:100%; min-width:unset; }
  }
  `]
})
export class LoginComponent implements OnInit, OnDestroy {
  email    = '';
  password = '';
  loading  = false;
  error    = '';
  showPass = false;
  emailFocus = false;
  passFocus  = false;

  features = ['📷 OCR Scan','🧾 POS Billing','📦 Live Inventory','📈 Reports','🔒 Role Auth','🖨 Print Bills'];
  counters  = [
    { val: '500+', lbl: 'Products' },
    { val: '24/7', lbl: 'Live Stock' },
    { val: '100%', lbl: 'Accurate' },
    { val: '∞',    lbl: 'Transactions' },
  ];

  private ticker: any;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    // animate counter values
    const targets = [523, null, 100, null];
    const vals    = [0, null, 0, null];
    this.ticker = setInterval(() => {
      if (vals[0] !== null && vals[0]! < targets[0]!) {
        vals[0] = Math.min(vals[0]! + 7, targets[0]!);
        this.counters[0].val = vals[0] + '+';
      }
    }, 20);
  }

  ngOnDestroy(): void { clearInterval(this.ticker); }

  login(): void {
    if (!this.email || !this.password) { this.error = 'Please enter your email and password.'; return; }
    this.loading = true; this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => { this.error = 'Invalid email or password. Please try again.'; this.loading = false; }
    });
  }
}
