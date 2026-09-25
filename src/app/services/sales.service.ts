import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../environments/environment';
import { SalesOrder, CreateSalesOrder } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SalesService {
  private readonly base    = `${environment.apiUrl}/sales`;
  private readonly posBase = `${environment.apiUrl}/pos`;
  constructor(private http: HttpClient) {}

  getAll():                            Observable<SalesOrder[]> { return this.http.get<SalesOrder[]>(this.base); }
  getById(id: number):                 Observable<SalesOrder>   { return this.http.get<SalesOrder>(`${this.base}/${id}`); }
  checkout(dto: CreateSalesOrder):     Observable<SalesOrder>   { return this.http.post<SalesOrder>(`${this.posBase}/checkout`, dto); }
}
