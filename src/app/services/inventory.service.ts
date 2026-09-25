import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../environments/environment';
import { StockReport, LowStock, SalesSummary, PurchaseSummary } from '../models/models';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private readonly inv = `${environment.apiUrl}/inventory`;
  constructor(private http: HttpClient) {}

  getCurrentStock():   Observable<StockReport[]>  { return this.http.get<StockReport[]>(`${this.inv}/current-stock`); }
  getStockMovements(): Observable<any[]>           { return this.http.get<any[]>(`${this.inv}/stock-movements`); }
  adjustStock(dto: { productId: number; quantity: number; note: string }): Observable<any> {
    return this.http.post(`${this.inv}/adjust`, dto);
  }
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly rpt = `${environment.apiUrl}/reports`;
  constructor(private http: HttpClient) {}

  getSalesSummary(from: string, to: string):    Observable<SalesSummary[]>    { return this.http.get<SalesSummary[]>(`${this.rpt}/sales-summary?from=${from}&to=${to}`); }
  getPurchaseSummary(from: string, to: string): Observable<PurchaseSummary[]> { return this.http.get<PurchaseSummary[]>(`${this.rpt}/purchase-summary?from=${from}&to=${to}`); }
  getLowStock():                                Observable<LowStock[]>        { return this.http.get<LowStock[]>(`${this.rpt}/low-stock`); }
}
