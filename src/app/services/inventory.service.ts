import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../environments/environment';
import { StockReport, LowStock, SalesSummary, PurchaseSummary, ProductPurchaseReport, DailyProductSales, BestSellingProduct } from '../models/models';

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

  getSalesSummary(from: string, to: string):        Observable<SalesSummary[]>          { return this.http.get<SalesSummary[]>(`${this.rpt}/sales-summary?from=${from}&to=${to}`); }
  getPurchaseSummary(from: string, to: string):     Observable<PurchaseSummary[]>       { return this.http.get<PurchaseSummary[]>(`${this.rpt}/purchase-summary?from=${from}&to=${to}`); }
  getLowStock():                                    Observable<LowStock[]>              { return this.http.get<LowStock[]>(`${this.rpt}/low-stock`); }
  getProductPurchases(from: string, to: string):    Observable<ProductPurchaseReport[]> { return this.http.get<ProductPurchaseReport[]>(`${this.rpt}/product-purchases?from=${from}&to=${to}`); }
  getDailyProductSales(from: string, to: string):   Observable<DailyProductSales[]>     { return this.http.get<DailyProductSales[]>(`${this.rpt}/daily-product-sales?from=${from}&to=${to}`); }
  getBestSellingProducts(from: string, to: string, top = 20): Observable<BestSellingProduct[]> {
    return this.http.get<BestSellingProduct[]>(`${this.rpt}/best-selling?from=${from}&to=${to}&top=${top}`);
  }
}
