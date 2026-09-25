import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../environments/environment';
import { PurchaseOrder, CreatePurchaseOrder } from '../models/models';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private readonly base = `${environment.apiUrl}/purchaseorders`;
  constructor(private http: HttpClient) {}

  getAll():                                  Observable<PurchaseOrder[]> { return this.http.get<PurchaseOrder[]>(this.base); }
  getById(id: number):                       Observable<PurchaseOrder>   { return this.http.get<PurchaseOrder>(`${this.base}/${id}`); }
  confirm(dto: CreatePurchaseOrder):         Observable<any>             { return this.http.post(`${this.base}/confirm`, dto); }
}
