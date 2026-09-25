import { Component }         from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterLink }        from '@angular/router';
import { OcrService }        from '../../services/ocr.service';
import { AutoConfirmResult } from '../../models/models';

type State = 'idle' | 'processing' | 'done' | 'error';

@Component({
  selector: 'app-ocr-scan',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-header">
      <div>
        <h2>📷 Auto Invoice Import</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">
          Upload a supplier bill — everything is extracted and added automatically
        </p>
      </div>
    </div>

    <!-- ── IDLE: Options ── -->
    <div class="card" *ngIf="state === 'idle'">
      <div class="how-it-works">
        <div class="step"><span class="step-num">1</span><span>Choose or scan bill</span></div>
        <div class="step-arrow">→</div>
        <div class="step"><span class="step-num">2</span><span>OCR reads details</span></div>
        <div class="step-arrow">→</div>
        <div class="step"><span class="step-num">3</span><span>Products auto-created</span></div>
        <div class="step-arrow">→</div>
        <div class="step"><span class="step-num">4</span><span>Stock updated ✅</span></div>
      </div>

      <!-- Option Action Buttons -->
      <div class="upload-options">
        <!-- Option 1: File Browser / Gallery -->
        <label class="opt-card">
          <input type="file" accept="image/*,.pdf" (change)="onFile($event)" #galleryInput />
          <div class="opt-icon">🖼️</div>
          <div class="opt-title">Choose Image / File</div>
          <div class="opt-desc">Select from gallery, photo library or documents</div>
        </label>

        <!-- Option 2: Live Camera Scan -->
        <label class="opt-card camera-opt">
          <input type="file" accept="image/*" capture="environment" (change)="onFile($event)" #cameraInput />
          <div class="opt-icon">📸</div>
          <div class="opt-title">Scan Bill with Camera</div>
          <div class="opt-desc">Open live camera & capture instant bill photo</div>
        </label>
      </div>

      <!-- Selected File Preview Bar -->
      <div *ngIf="selectedFile" class="selected-file-preview">
        <span class="preview-icon">📄</span>
        <div class="preview-info">
          <div class="preview-name">{{ selectedFile.name }}</div>
          <div class="preview-size">{{ (selectedFile.size / 1024 / 1024) | number:'1.1-1' }} MB · File ready</div>
        </div>
        <button class="remove-file-btn" (click)="selectedFile = null">✕</button>
      </div>

      <div style="margin-top:22px;text-align:center">
        <button class="btn-auto" (click)="process()" [disabled]="!selectedFile">
          🚀 Auto-Import Invoice
        </button>
        <p style="margin-top:10px;font-size:12px;color:var(--muted)">
          No typing needed — select image or camera photo and import
        </p>
      </div>
    </div>

    <!-- ── PROCESSING ── -->
    <div class="card processing-card" *ngIf="state === 'processing'">
      <div class="proc-icon">⚙️</div>
      <h3>Processing Invoice…</h3>
      <div class="progress-steps">
        <div class="prog-step" [class.active]="procStep >= 1" [class.done]="procStep > 1">
          <span class="pstep-icon">{{ procStep > 1 ? '✅' : procStep === 1 ? '🔄' : '⬜' }}</span>
          <span>Reading image with OCR</span>
        </div>
        <div class="prog-step" [class.active]="procStep >= 2" [class.done]="procStep > 2">
          <span class="pstep-icon">{{ procStep > 2 ? '✅' : procStep === 2 ? '🔄' : '⬜' }}</span>
          <span>Extracting products, dates & totals</span>
        </div>
        <div class="prog-step" [class.active]="procStep >= 3" [class.done]="procStep > 3">
          <span class="pstep-icon">{{ procStep > 3 ? '✅' : procStep === 3 ? '🔄' : '⬜' }}</span>
          <span>Creating products & updating stock</span>
        </div>
      </div>
      <div class="proc-spinner"></div>
    </div>

    <!-- ── DONE ── -->
    <div class="card result-card" *ngIf="state === 'done' && result">
      <div class="result-header">
        <div class="result-check">✅</div>
        <div>
          <h2 style="margin:0">Import Complete!</h2>
          <p style="color:var(--muted);margin:4px 0 0">Everything has been added to your inventory automatically</p>
        </div>
      </div>

      <div class="result-stats">
        <div class="rs-card blue">
          <div class="rs-val">{{ result.itemCount }}</div>
          <div class="rs-lbl">Products Imported</div>
        </div>
        <div class="rs-card green">
          <div class="rs-val">{{ result.newProductsAdded.length }}</div>
          <div class="rs-lbl">New Products Created</div>
        </div>
        <div class="rs-card accent">
          <div class="rs-val">\${{ result.totalAmount | number:'1.2-2' }}</div>
          <div class="rs-lbl">Invoice Total</div>
        </div>
      </div>

      <div class="result-details">
        <div class="rd-row"><span class="rd-label">📋 Invoice #</span><span class="rd-val">{{ result.invoiceNumber }}</span></div>
        <div class="rd-row"><span class="rd-label">🏭 Supplier</span><span class="rd-val">{{ result.supplierName }}</span></div>
        <div class="rd-row"><span class="rd-label">📦 Purchase Order</span><span class="rd-val">#{{ result.purchaseOrderId }}</span></div>
      </div>

      <!-- New products created -->
      <div *ngIf="result.newProductsAdded.length > 0" class="new-products">
        <div class="np-label">🆕 New Products Created ({{ result.newProductsAdded.length }})</div>
        <div class="np-chips">
          <span class="np-chip" *ngFor="let p of result.newProductsAdded">{{ p }}</span>
        </div>
        <p style="font-size:12px;color:var(--muted);margin:8px 0 0">
          These products were added with a default 30% selling margin. Edit prices in the <strong>Products</strong> page.
        </p>
      </div>

      <!-- Line items extracted -->
      <div *ngIf="result.ocrResult?.lineItems?.length" class="items-section">
        <div class="items-title">📦 Items Added to Stock</div>
        <div class="items-list">
          <div class="item-row" *ngFor="let item of result.ocrResult.lineItems">
            <span class="item-name">{{ item.productName }}</span>
            <span class="item-meta">Qty: <strong>{{ item.quantity }}</strong></span>
            <span class="item-meta">\${{ item.unitPrice | number:'1.2-2' }}/unit</span>
          </div>
        </div>
      </div>

      <div style="margin-top:20px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-primary" (click)="reset()">📷 Import Another Bill</button>
        <a class="btn" routerLink="/purchases" style="text-decoration:none">🚚 Add Manual Bill</a>
        <a class="btn" routerLink="/inventory" style="text-decoration:none">📦 View Inventory</a>
        <a class="btn" routerLink="/products" style="text-decoration:none">🍷 View Products</a>
      </div>
    </div>

    <!-- ── ERROR ── -->
    <div class="card error-card" *ngIf="state === 'error'">
      <div class="err-icon">⚠️</div>
      <h3>Processing Failed</h3>
      <p class="err-msg">{{ errorMessage }}</p>
      <div class="err-tips">
        <div class="tip">💡 <strong>Tips for better results:</strong></div>
        <ul>
          <li>Make sure the bill is flat and fully visible</li>
          <li>Take the photo in good lighting (no shadows)</li>
          <li>Hold the camera directly above the bill</li>
          <li>Ensure text is sharp and not blurry</li>
        </ul>
      </div>
      <div style="margin-top:16px;display:flex;gap:10px;justify-content:center">
        <button class="btn btn-primary" (click)="reset()">🔄 Try Again</button>
        <a class="btn" routerLink="/purchases" style="text-decoration:none">➕ Add Manual Bill</a>
      </div>
    </div>
  `,
  styles: [`
    /* How it works bar */
    .how-it-works {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      background: #f0f4ff; border-radius: 10px; padding: 14px 18px;
      margin-bottom: 22px; font-size: 13px;
    }
    .step { display: flex; align-items: center; gap: 6px; }
    .step-num {
      background: var(--primary); color: #fff;
      font-size: 11px; font-weight: 800;
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
    }
    .step-arrow { color: var(--muted); font-size: 16px; }

    /* Upload options (Choose Image vs Scan Camera) */
    .upload-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 20px;
    }
    @media (max-width: 600px) {
      .upload-options { grid-template-columns: 1fr; }
    }
    .opt-card {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border: 2px dashed var(--border); border-radius: 12px;
      padding: 28px 18px; cursor: pointer; text-align: center;
      background: #fafafa; transition: all .15s ease; position: relative;
    }
    .opt-card:hover { border-color: var(--primary); background: #f0f4ff; transform: translateY(-2px); }
    .opt-card.camera-opt:hover { border-color: #f59e0b; background: #fffbeb; }
    .opt-card input { display: none; }
    .opt-icon { font-size: 2.4rem; margin-bottom: 8px; }
    .opt-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .opt-desc { font-size: 12px; color: var(--muted); }

    /* Selected file preview */
    .selected-file-preview {
      display: flex; align-items: center; gap: 12px;
      background: #f0fdf4; border: 1px solid #86efac; border-radius: 10px;
      padding: 12px 16px; margin-bottom: 12px;
    }
    .preview-icon { font-size: 1.8rem; }
    .preview-info { flex: 1; min-width: 0; }
    .preview-name { font-weight: 700; font-size: 13.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .preview-size { font-size: 11px; color: #166534; }
    .remove-file-btn {
      background: none; border: none; color: #ef4444; font-size: 16px;
      cursor: pointer; padding: 4px 8px; border-radius: 4px; font-weight: 700;
    }
    .remove-file-btn:hover { background: #fee2e2; }

    /* Big action button */
    .btn-auto {
      padding: 14px 36px; background: #22c55e; color: #fff;
      border: none; border-radius: 10px; font-size: 16px; font-weight: 800;
      cursor: pointer; transition: background .15s;
    }
    .btn-auto:hover:not(:disabled) { background: #16a34a; }
    .btn-auto:disabled { opacity: .5; cursor: not-allowed; }

    /* Processing */
    .processing-card { text-align: center; padding: 48px 24px; }
    .proc-icon { font-size: 3rem; margin-bottom: 12px; }
    .proc-spinner {
      width: 40px; height: 40px; border: 4px solid #e5e7eb;
      border-top-color: var(--primary); border-radius: 50%;
      animation: spin .8s linear infinite; margin: 24px auto 0;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .progress-steps { margin: 20px auto; max-width: 380px; text-align: left; display: flex; flex-direction: column; gap: 10px; }
    .prog-step { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--muted); }
    .prog-step.active { color: var(--text); font-weight: 600; }
    .prog-step.done { color: #16a34a; }
    .pstep-icon { font-size: 16px; width: 20px; text-align: center; }

    /* Done result */
    .result-card { padding: 28px; }
    .result-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .result-check { font-size: 3rem; }
    .result-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 20px; }
    .rs-card { padding: 16px; border-radius: 10px; text-align: center; }
    .rs-card.blue  { background: #eff6ff; }
    .rs-card.green { background: #f0fdf4; }
    .rs-card.accent{ background: #fffbeb; }
    .rs-val { font-size: 26px; font-weight: 800; }
    .rs-lbl { font-size: 12px; color: var(--muted); margin-top: 2px; }
    .result-details { background: #f8fafc; border-radius: 8px; padding: 14px 16px; margin-bottom: 18px; display: flex; flex-direction: column; gap: 8px; }
    .rd-row { display: flex; justify-content: space-between; font-size: 13px; }
    .rd-label { color: var(--muted); }
    .rd-val { font-weight: 600; }
    .new-products { border: 1px solid #d1fae5; background: #f0fdf4; border-radius: 8px; padding: 14px; margin-bottom: 18px; }
    .np-label { font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 8px; }
    .np-chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .np-chip { background: #dcfce7; color: #166534; padding: 3px 10px; border-radius: 12px; font-size: 12px; }
    .items-section { border-top: 1px solid var(--border); padding-top: 16px; }
    .items-title { font-size: 13px; font-weight: 700; margin-bottom: 10px; }
    .items-list { display: flex; flex-direction: column; gap: 6px; max-height: 240px; overflow-y: auto; }
    .item-row { display: flex; align-items: center; gap: 12px; padding: 6px 10px; background: #f8fafc; border-radius: 6px; font-size: 13px; }
    .item-name { flex: 1; font-weight: 600; }
    .item-meta { color: var(--muted); white-space: nowrap; }

    /* Error */
    .error-card { text-align: center; padding: 40px 24px; }
    .err-icon { font-size: 3rem; margin-bottom: 12px; }
    .err-msg { color: var(--danger); font-size: 14px; margin-bottom: 16px; }
    .err-tips { background: #fffbeb; border-radius: 8px; padding: 14px 18px; text-align: left; font-size: 13px; }
    .err-tips ul { margin: 8px 0 0 16px; padding: 0; display: flex; flex-direction: column; gap: 4px; color: var(--muted); }
    .tip { font-weight: 600; color: #78350f; }
  `]
})
export class OcrScanComponent {
  state:        State = 'idle';
  selectedFile: File | null = null;
  result:       AutoConfirmResult | null = null;
  errorMessage  = '';
  procStep      = 0;
  private stepTimer: any;

  constructor(private ocr: OcrService) {}

  onFile(event: Event): void {
    this.selectedFile = (event.target as HTMLInputElement).files?.[0] ?? null;
  }

  process(): void {
    if (!this.selectedFile) return;
    this.state = 'processing';
    this.procStep = 1;

    // Animate progress steps
    this.stepTimer = setInterval(() => {
      if (this.procStep < 3) this.procStep++;
    }, 1800);

    this.ocr.scanAndConfirm(this.selectedFile).subscribe({
      next: res => {
        clearInterval(this.stepTimer);
        this.procStep = 4;
        if (res.success) {
          this.result = res;
          this.state  = 'done';
        } else {
          this.errorMessage = res.errorMessage || 'No items could be extracted. Please try a clearer photo.';
          this.state = 'error';
        }
      },
      error: err => {
        clearInterval(this.stepTimer);
        this.errorMessage = err?.error?.message
          ?? 'Server error. Please restart the backend and try again.';
        this.state = 'error';
      }
    });
  }

  reset(): void {
    this.state = 'idle';
    this.selectedFile = null;
    this.result = null;
    this.errorMessage = '';
    this.procStep = 0;
  }
}
