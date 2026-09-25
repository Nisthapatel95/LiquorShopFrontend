import { Injectable } from '@angular/core';
import { HttpClient }  from '@angular/common/http';
import { Observable }  from 'rxjs';
import { environment } from '../../environments/environment';
import { Supplier, CreateSupplier } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly base = `${environment.apiUrl}/suppliers`;
  constructor(private http: HttpClient) {}

  getAll():                               Observable<Supplier[]> { return this.http.get<Supplier[]>(this.base); }
  getById(id: number):                    Observable<Supplier>   { return this.http.get<Supplier>(`${this.base}/${id}`); }
  create(dto: CreateSupplier):            Observable<Supplier>   { return this.http.post<Supplier>(this.base, dto); }
  update(id: number, dto: CreateSupplier): Observable<void>      { return this.http.put<void>(`${this.base}/${id}`, dto); }
  delete(id: number):                     Observable<void>       { return this.http.delete<void>(`${this.base}/${id}`); }
}
