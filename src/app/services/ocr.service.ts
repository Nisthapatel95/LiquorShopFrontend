import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../environments/environment';
import { OcrResult, AutoConfirmResult } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OcrService {
  private readonly base = `${environment.apiUrl}/ocr`;
  constructor(private http: HttpClient) {}

  scanInvoice(file: File): Observable<OcrResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<OcrResult>(`${this.base}/scan`, formData);
  }

  /** Fully automatic: scan + parse + create products + add stock in one shot. */
  scanAndConfirm(file: File): Observable<AutoConfirmResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AutoConfirmResult>(`${this.base}/scan-and-confirm`, formData);
  }
}
