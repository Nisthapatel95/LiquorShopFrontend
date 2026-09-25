// Core Angular models matching the backend DTOs

export interface LoginRequest  { email: string; password: string; }
export interface LoginResponse { token: string; fullName: string; role: string; userId: number; }
export interface RegisterRequest { fullName: string; email: string; password: string; roleId: number; }

export interface Product {
  id: number; name: string; sku: string; barcode: string; brand: string;
  unit: string; purchasePrice: number; sellingPrice: number;
  currentStock: number; reorderLevel: number; isActive: boolean;
  categoryName: string; supplierName: string; supplierId?: number;
}

export interface CreateProduct {
  name: string; sku: string; barcode: string; brand: string; unit: string;
  purchasePrice: number; sellingPrice: number; reorderLevel: number;
  categoryId: number; supplierId?: number;
}

export interface Supplier {
  id: number; name: string; contactName: string;
  phone: string; email: string; address: string; isActive: boolean;
}

export interface CreateSupplier {
  name: string; contactName: string; phone: string; email: string; address: string;
}

export interface PurchaseOrderItem {
  productId: number; productName: string;
  quantity: number; unitPrice: number; lineTotal: number;
}

export interface CreatePurchaseOrder {
  supplierId: number; supplierName?: string; invoiceNumber: string; invoiceDate: string;
  ocrScanId?: number; items: PurchaseOrderItem[];
}

export interface PurchaseOrder {
  id: number; invoiceNumber: string; invoiceDate: string;
  totalAmount: number; status: string; supplierName: string;
  createdAt: string; items: PurchaseOrderItem[];
}

export interface CartItem { productId: number; quantity: number; unitPrice: number; }

export interface CreateSalesOrder {
  cashierId: number; cashierName?: string; customerName?: string; customerPhone?: string; discount: number; taxAmount: number;
  paymentMode: string; items: CartItem[];
}

export interface SalesOrderItem {
  productId: number; productName: string;
  quantity: number; unitPrice: number; lineTotal: number;
}

export interface SalesOrder {
  id: number; orderNumber: string; customerName?: string; customerPhone?: string;
  totalAmount: number; discount: number; taxAmount: number; netAmount: number; paymentMode: string;
  cashierName: string; createdAt: string; items: SalesOrderItem[];
}

export interface OcrLineItem { productName: string; quantity: number; unitPrice: number; }

export interface OcrResult {
  scanId: number; supplierName: string; invoiceNumber: string;
  invoiceDate: string; lineItems: OcrLineItem[]; rawText: string;
}

export interface AutoConfirmResult {
  success: boolean; errorMessage: string;
  purchaseOrderId: number; invoiceNumber: string;
  supplierName: string; totalAmount: number;
  itemCount: number; newProductsAdded: string[];
  ocrResult: OcrResult;
}

export interface StockReport {
  productId: number; productName: string; sku: string;
  currentStock: number; reorderLevel: number; totalIn: number; totalOut: number;
}

export interface LowStock {
  productId: number; productName: string; sku: string;
  currentStock: number; reorderLevel: number;
}

export interface SalesSummary {
  date: string; totalOrders: number;
  totalRevenue: number; totalTax: number; netRevenue: number;
}

export interface PurchaseSummary {
  date: string; totalOrders: number; totalPurchased: number;
}
