import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { FormsModule }        from '@angular/forms';
import { SupplierService }    from '../../services/supplier.service';
import { Supplier, CreateSupplier } from '../../models/models';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal -->
    <div class="modal-backdrop" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ editing ? '✏️ Edit Supplier' : '➕ New Supplier' }}</h3>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>
        <div class="grid-2">
          <div class="form-group"><label>Company Name *</label><input [(ngModel)]="form.name" placeholder="Supplier company" /></div>
          <div class="form-group"><label>Contact Person</label><input [(ngModel)]="form.contactName" placeholder="Contact name" /></div>
          <div class="form-group"><label>Phone</label><input [(ngModel)]="form.phone" placeholder="+91 99999 00000" /></div>
          <div class="form-group"><label>Email</label><input type="email" [(ngModel)]="form.email" placeholder="email@supplier.com" /></div>
          <div class="form-group col-span-2"><label>Address</label><input [(ngModel)]="form.address" placeholder="Full address" /></div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" (click)="closeModal()">Cancel</button>
          <button class="btn btn-primary" (click)="save()">{{ editing ? 'Update' : 'Create' }} Supplier</button>
        </div>
      </div>
    </div>

    <div class="page-header">
      <div>
        <h2>🏭 Suppliers</h2>
        <p style="color:var(--muted);font-size:13px;margin-top:2px">{{ suppliers.length }} suppliers registered</p>
      </div>
      <button class="btn btn-primary" (click)="openCreate()">➕ Add Supplier</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead><tr><th>#</th><th>Company</th><th>Contact</th><th>Phone</th><th>Email</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          <tr *ngFor="let s of suppliers; let i = index">
            <td style="color:var(--muted)">{{ i + 1 }}</td>
            <td><strong>{{ s.name }}</strong></td>
            <td>{{ s.contactName }}</td>
            <td>{{ s.phone }}</td>
            <td style="color:var(--primary)">{{ s.email }}</td>
            <td><span [class]="s.isActive ? 'badge badge-success' : 'badge badge-danger'">{{ s.isActive ? 'Active' : 'Inactive' }}</span></td>
            <td>
              <button class="btn btn-blue btn-sm" (click)="openEdit(s)">Edit</button>
              <button class="btn btn-danger btn-sm" style="margin-left:6px" (click)="remove(s.id)">Delete</button>
            </td>
          </tr>
          <tr *ngIf="suppliers.length === 0">
            <td colspan="7"><div class="empty-state"><div class="empty-icon">🏭</div><p>No suppliers yet</p></div></td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`/* uses global styles */`]
})
export class SuppliersComponent implements OnInit {
  suppliers: Supplier[]  = [];
  showModal              = false;
  editing: number | null = null;
  form: CreateSupplier   = this.blank();

  constructor(private svc: SupplierService) {}
  ngOnInit(): void { this.load(); }
  load():  void { this.svc.getAll().subscribe(d => this.suppliers = d); }
  blank(): CreateSupplier { return { name:'', contactName:'', phone:'', email:'', address:'' }; }

  openCreate(): void { this.form = this.blank(); this.editing = null; this.showModal = true; }
  openEdit(s: Supplier): void {
    this.editing = s.id; this.showModal = true;
    this.form = { name:s.name, contactName:s.contactName, phone:s.phone, email:s.email, address:s.address };
  }
  closeModal(): void { this.showModal = false; this.editing = null; }

  save(): void {
    const obs = this.editing ? this.svc.update(this.editing, this.form) : this.svc.create(this.form) as any;
    obs.subscribe(() => { this.load(); this.closeModal(); });
  }
  remove(id: number): void { if (confirm('Delete supplier?')) this.svc.delete(id).subscribe(() => this.load()); }
}
