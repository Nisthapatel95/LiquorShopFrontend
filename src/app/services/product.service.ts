import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, CreateProduct } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly base = `${environment.apiUrl}/products`;
  constructor(private http: HttpClient) {}

  getAll():                          Observable<Product[]>   { return this.http.get<Product[]>(this.base); }
  getById(id: number):               Observable<Product>     { return this.http.get<Product>(`${this.base}/${id}`); }
  getLowStock():                     Observable<Product[]>   { return this.http.get<Product[]>(`${this.base}/low-stock`); }
  create(dto: CreateProduct):        Observable<Product>     { return this.http.post<Product>(this.base, dto); }
  update(id: number, dto: CreateProduct): Observable<void>   { return this.http.put<void>(`${this.base}/${id}`, dto); }
  delete(id: number):                Observable<void>        { return this.http.delete<void>(`${this.base}/${id}`); }
}
