import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule }   from '@angular/common';
import { FormsModule }    from '@angular/forms';
import { Router }         from '@angular/router';
import { AuthService }    from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="luxury-lounge-container" (mousemove)="onMouseMove($event)" (mouseleave)="onMouseLeave()">
    <!-- High-End Dark Executive Lounge Background Image -->
    <div class="lounge-hero-bg" [style.transform]="bgTransform"></div>
    <div class="lounge-dark-overlay"></div>
    <div class="grid-lines-overlay"></div>

    <!-- Gold Dust Particle Canvas Animation -->
    <canvas #particleCanvas class="gold-particle-canvas"></canvas>

    <!-- Shimmering Radial Ambient Spotlights -->
    <div class="gold-spotlight top-spotlight" [style.transform]="spotlightTransform"></div>
    <div class="gold-spotlight bottom-spotlight"></div>

    <!-- Centered Pure Glassmorphic Obsidian Login Card -->
    <main class="obsidian-card-container">
      <div class="obsidian-glass-card" [style.transform]="cardTiltTransform">
        <!-- Golden Shield Crest Vector Emblem -->
        <div class="brand-crest-wrapper">
          <div class="crest-emblem">
            <svg viewBox="0 0 100 100" fill="none" class="gold-crest-svg">
              <path d="M 50,10 L 80,25 V 55 C 80,75 50,90 50,90 C 50,90 20,75 20,55 V 25 Z" stroke="url(#goldGradient)" stroke-width="2" fill="rgba(20,15,10,0.7)"/>
              <path d="M 50,16 L 73,28 V 53 C 73,69 50,82 50,82 C 50,82 27,69 27,53 V 28 Z" stroke="url(#goldGradient)" stroke-width="1" opacity="0.6"/>
              <text x="50" y="56" font-family="'Cinzel', serif" font-size="26" font-weight="bold" fill="url(#goldGradient)" text-anchor="middle">V</text>
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fef08a"/>
                  <stop offset="50%" stop-color="#f59e0b"/>
                  <stop offset="100%" stop-color="#b45309"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="est-tag">— EST. 1892 —</span>
          <h1 class="brand-title">VELVET OAK</h1>
          <p class="brand-subtitle">EXECUTIVE CELLAR PORTAL</p>
        </div>

        <div class="card-headline">
          <h2>MEMBER LOGIN</h2>
          <p>Access your private collection & executive portal</p>
        </div>

        <!-- Error Notification -->
        <div class="alert-error" *ngIf="error">
          <span>⚠️ {{ error }}</span>
        </div>

        <!-- Form Section -->
        <form (keydown.enter)="login()" (submit)="$event.preventDefault()" class="obsidian-form">
          <!-- Email Input -->
          <div class="input-group" [class.focused]="emailFocus">
            <label class="input-label">EMAIL ADDRESS</label>
            <div class="input-box">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input type="email" [(ngModel)]="email" name="email" placeholder="alexander.vance@executive.com"
                     (focus)="emailFocus=true" (blur)="emailFocus=false" autocomplete="email" />
            </div>
          </div>

          <!-- Password Input -->
          <div class="input-group" [class.focused]="passFocus">
            <div class="label-row">
              <label class="input-label">PASSWORD</label>
              <a href="javascript:void(0)" (click)="forgotPassword()" class="forgot-link">Forgot Password?</a>
            </div>
            <div class="input-box">
              <svg class="field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input [type]="showPass ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="••••••••••••"
                     (focus)="passFocus=true" (blur)="passFocus=false" autocomplete="current-password" />
              <button type="button" class="eye-toggle" (click)="showPass = !showPass" aria-label="Toggle password">
                {{ showPass ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>

          <!-- Primary Gold Action Button -->
          <button type="button" class="gold-action-btn" (click)="login()" [disabled]="loading">
            <div *ngIf="!loading" class="btn-text">
              <span class="btn-main">SIGN IN</span>
              <span class="btn-sub">ACCESS THE CELLAR</span>
            </div>
            <span *ngIf="loading" class="btn-spinner"></span>
          </button>
        </form>

        <!-- Card Footer Links -->
        <div class="card-bottom-row">
          <span>Don't have executive access? </span>
          <a href="javascript:void(0)" (click)="createAccount()" class="request-link">Request Access</a>
        </div>
      </div>
    </main>

    <!-- Bottom Footer Navigation -->
    <footer class="modern-footer">
      <div class="footer-links">
        <a href="javascript:void(0)">CONTACT</a>
        <span class="dot">•</span>
        <a href="javascript:void(0)">PRIVACY POLICY</a>
        <span class="dot">•</span>
        <a href="javascript:void(0)">TERMS OF SERVICE</a>
      </div>
      <div class="copyright-tag">&copy; 2026 VELVET OAK DISTILLERS. ALL RIGHTS RESERVED.</div>
    </footer>
  </div>
  `,
  styles: [`
  :host {
    display: block;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .luxury-lounge-container {
    position: relative;
    width: 100%;
    height: 100%;
    background-color: #07090e;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    font-family: 'Cinzel', 'Trajan Pro', 'Georgia', serif;
    color: #f3f4f6;
    padding: 24px 16px;
    box-sizing: border-box;
    overflow: hidden;
    perspective: 1000px;
  }

  /* Fullscreen High-End Dark Lounge Background Image */
  .lounge-hero-bg {
    position: absolute;
    inset: -30px;
    background: url('/assets/liquor_store_hero.jpg') center/cover no-repeat;
    filter: brightness(0.48) contrast(1.18) blur(2px);
    transition: transform 0.2s cubic-bezier(0.1, 0.9, 0.2, 1);
    animation: kenburnsLounge 30s ease-in-out infinite alternate;
  }

  @keyframes kenburnsLounge {
    0% { transform: scale(1.05); }
    100% { transform: scale(1.15); }
  }

  /* Deep Radial Gradient Background Overlay */
  .lounge-dark-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 50% 45%, rgba(255, 255, 255, 0.08) 0%, rgba(10, 12, 18, 0.88) 85%);
    pointer-events: none;
    z-index: 1;
  }

  /* Fine Geometric Grid Lines */
  .grid-lines-overlay {
    position: absolute;
    inset: 0;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
    background-size: 70px 70px;
    pointer-events: none;
    z-index: 1;
  }

  /* Gold & White Particle Canvas Overlay */
  .gold-particle-canvas {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 2;
  }

  /* Floating 3D Transparent Product Render Scene (Behind Card) */
  .floating-3d-scene {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    overflow: hidden;
  }

  .product-cutout-3d {
    position: absolute;
    transition: transform 0.25s cubic-bezier(0.1, 0.8, 0.2, 1);
  }

  .product-cutout-3d img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.95)) drop-shadow(0 0 20px rgba(245, 158, 11, 0.3));
  }

  .left-product {
    width: 160px;
    height: 250px;
    left: 4%;
    top: 50%;
    transform: translateY(-50%);
  }

  .right-product {
    width: 140px;
    height: 240px;
    right: 4%;
    top: 50%;
    transform: translateY(-50%);
  }

  /* Centered Obsidian Glass Card */
  .obsidian-card-container {
    position: relative;
    z-index: 100;
    margin: auto;
    width: 100%;
    max-width: 440px;
    pointer-events: auto;
  }

  .obsidian-glass-card {
    width: 100%;
    background: rgba(16, 18, 24, 0.7);
    backdrop-filter: blur(35px);
    -webkit-backdrop-filter: blur(35px);
    border-radius: 28px;
    border: 1.5px solid rgba(255, 255, 255, 0.45);
    box-shadow: 
      0 0 50px rgba(255, 255, 255, 0.15),
      0 35px 75px rgba(0, 0, 0, 0.9),
      inset 0 1px 3px rgba(255, 255, 255, 0.5);
    padding: 38px 34px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    pointer-events: auto;
  }

  /* Brand Crest Header */
  .brand-crest-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 22px;
  }

  .crest-emblem {
    width: 72px;
    height: 72px;
    margin-bottom: 6px;
    animation: crestGlow 4s ease-in-out infinite alternate;
  }

  @keyframes crestGlow {
    0% { filter: drop-shadow(0 2px 8px rgba(245, 158, 11, 0.3)); }
    100% { filter: drop-shadow(0 6px 18px rgba(245, 158, 11, 0.7)); }
  }

  .gold-crest-svg {
    width: 100%;
    height: 100%;
  }

  .est-tag {
    font-size: 10px;
    letter-spacing: 3px;
    color: #f59e0b;
    margin-bottom: 4px;
    font-family: system-ui, sans-serif;
  }

  .brand-title {
    font-size: 25px;
    font-weight: 700;
    letter-spacing: 4px;
    margin: 0 0 4px 0;
    background: linear-gradient(180deg, #ffffff 0%, #fef08a 50%, #f59e0b 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .brand-subtitle {
    font-size: 10px;
    letter-spacing: 2.5px;
    color: #9ca3af;
    margin: 0;
    font-family: system-ui, sans-serif;
  }

  /* Headline */
  .card-headline {
    margin-bottom: 24px;
  }

  .card-headline h2 {
    font-size: 17px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #ffffff;
    margin: 0 0 4px 0;
  }

  .card-headline p {
    font-size: 12px;
    color: #9ca3af;
    margin: 0;
    font-family: system-ui, sans-serif;
  }

  .alert-error {
    width: 100%;
    background: rgba(220, 38, 38, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.4);
    color: #fca5a5;
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 12px;
    font-family: system-ui, sans-serif;
    margin-bottom: 20px;
    box-sizing: border-box;
  }

  /* Form Section */
  .obsidian-form {
    position: relative;
    z-index: 25;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 18px;
    margin-bottom: 24px;
    pointer-events: auto;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    width: 100%;
    position: relative;
    z-index: 25;
  }

  .label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .input-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 1.5px;
    color: #d1d5db;
    font-family: system-ui, sans-serif;
  }

  .forgot-link {
    font-size: 11px;
    color: #f59e0b;
    text-decoration: none;
    font-family: system-ui, sans-serif;
    transition: color 0.2s;
    cursor: pointer;
    pointer-events: auto;
    position: relative;
    z-index: 30;
  }

  .forgot-link:hover {
    color: #fef08a;
    text-decoration: underline;
  }

  .input-box {
    position: relative;
    z-index: 25;
    width: 100%;
    height: 48px;
    background: rgba(30, 22, 16, 0.75);
    border: 1.2px solid rgba(245, 158, 11, 0.4);
    border-radius: 12px;
    display: flex;
    align-items: center;
    padding: 0 14px;
    box-sizing: border-box;
    transition: all 0.3s ease;
    pointer-events: auto;
  }

  .input-group.focused .input-box {
    border-color: #f59e0b;
    background: rgba(45, 30, 20, 0.95);
    box-shadow: 0 0 18px rgba(245, 158, 11, 0.4);
  }

  .field-icon {
    width: 16px;
    height: 16px;
    color: #9ca3af;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .input-box input {
    position: relative;
    z-index: 30;
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #ffffff;
    font-size: 14px;
    font-family: system-ui, sans-serif;
    cursor: text;
    pointer-events: auto;
  }

  .input-box input::placeholder {
    color: #6b7280;
  }

  .eye-toggle {
    position: relative;
    z-index: 30;
    background: none;
    border: none;
    color: #9ca3af;
    cursor: pointer;
    font-size: 14px;
    padding: 0;
    margin-left: 6px;
    pointer-events: auto;
  }

  /* Gold Shimmer Action Button */
  .gold-action-btn {
    position: relative;
    width: 100%;
    height: 52px;
    border-radius: 12px;
    border: 1px solid rgba(254, 240, 138, 0.6);
    background: linear-gradient(135deg, #b45309 0%, #f59e0b 50%, #d97706 100%);
    color: #0f0a04;
    cursor: pointer;
    box-shadow: 0 4px 22px rgba(217, 119, 6, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.4);
    transition: all 0.25s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 6px;
    overflow: hidden;
  }

  .gold-action-btn::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 60%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmerPass 3.5s infinite;
  }

  @keyframes shimmerPass {
    0% { left: -100%; }
    30% { left: 150%; }
    100% { left: 150%; }
  }

  .gold-action-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    background: linear-gradient(135deg, #d97706 0%, #fbbf24 50%, #f59e0b 100%);
    box-shadow: 0 8px 30px rgba(245, 158, 11, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  }

  .btn-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1;
    gap: 2px;
  }

  .btn-main {
    font-weight: 800;
    font-size: 15px;
    letter-spacing: 2px;
    color: #110c05;
    line-height: 1;
  }

  .btn-sub {
    font-size: 9px;
    letter-spacing: 1.5px;
    font-weight: 700;
    color: #261706;
    opacity: 0.85;
    line-height: 1;
  }

  .btn-spinner {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(15, 10, 4, 0.3);
    border-top-color: #0f0a04;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Card Bottom Row */
  .card-bottom-row {
    font-size: 12px;
    font-family: system-ui, sans-serif;
    color: #9ca3af;
  }

  .request-link {
    color: #ffffff;
    font-weight: 700;
    text-decoration: none;
    margin-left: 4px;
    transition: color 0.2s;
  }

  .request-link:hover {
    color: #fef08a;
    text-decoration: underline;
  }

  /* Modern Footer */
  .modern-footer {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    font-family: system-ui, sans-serif;
  }

  .footer-links {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 11px;
    letter-spacing: 1.5px;
  }

  .footer-links a {
    color: #d1d5db;
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-links a:hover {
    color: #f59e0b;
  }

  .footer-links .dot {
    color: #f59e0b;
    opacity: 0.6;
  }

  .copyright-tag {
    font-size: 10px;
    color: #6b7280;
    letter-spacing: 1px;
  }

  /* Mobile responsiveness */
  @media (max-width: 640px) {
    .obsidian-glass-card {
      padding: 28px 20px;
    }
  }
  `]
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('particleCanvas') particleCanvas!: ElementRef<HTMLCanvasElement>;

  email = '';
  password = '';
  showPass = false;
  emailFocus = false;
  passFocus = false;
  loading = false;
  error = '';

  bgTransform = '';
  spotlightTransform = 'translateX(-50%)';
  cardTiltTransform = '';
  leftProductTransform = '';
  rightProductTransform = '';

  private animationFrameId: any;
  private particles: Array<{ x: number; y: number; size: number; speedY: number; opacity: number }> = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {}

  ngAfterViewInit() {
    this.initGoldParticles();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /* Mouse Interaction: Background Parallax & 3D Tilt */
  onMouseMove(e: MouseEvent) {
    const { innerWidth, innerHeight } = window;
    const mouseX = (e.clientX / innerWidth) - 0.5;
    const mouseY = (e.clientY / innerHeight) - 0.5;

    this.bgTransform = `translate3d(${mouseX * -25}px, ${mouseY * -25}px, 0)`;
    this.spotlightTransform = `translate3d(calc(-50% + ${mouseX * 40}px), ${mouseY * 40}px, 0)`;
    this.leftProductTransform = `translate3d(${mouseX * -35}px, ${mouseY * -35}px, 0) rotate(${mouseX * -4}deg)`;
    this.rightProductTransform = `translate3d(${mouseX * 35}px, ${mouseY * -25}px, 0) rotate(${mouseX * 4}deg)`;
    
    /* Subtle 3D Card Tilt */
    const tiltX = mouseY * -10;
    const tiltY = mouseX * 10;
    this.cardTiltTransform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  }

  onMouseLeave() {
    this.bgTransform = 'translate3d(0, 0, 0)';
    this.spotlightTransform = 'translateX(-50%)';
    this.cardTiltTransform = 'rotateX(0deg) rotateY(0deg)';
    this.leftProductTransform = 'translate3d(0, 0, 0)';
    this.rightProductTransform = 'translate3d(0, 0, 0)';
  }

  /* Gold Floating Dust Particles */
  private initGoldParticles() {
    if (!this.particleCanvas) return;
    const canvas = this.particleCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    this.particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedY: Math.random() * 0.4 + 0.1,
      opacity: Math.random() * 0.6 + 0.2
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.particles.forEach(p => {
        p.y -= p.speedY;
        if (p.y < 0) p.y = canvas.height;

        ctx.fillStyle = `rgba(245, 158, 11, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please enter your corporate email and password';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err?.error?.message || 'Invalid credentials. Please verify your details.';
      }
    });
  }

  forgotPassword() {
    alert('Password recovery link dispatched to your registered email address.');
  }

  createAccount() {
    alert('Please contact executive support to request a new cellar account.');
  }
}
