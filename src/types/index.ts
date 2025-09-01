export interface Customer {
  id: string; 
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  customer_since?: string; // Changed to string to match datetime in backend
}

export interface SalesPerson {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
}

export interface Product {
  id: string; // e.g., "prod_001"
  name: string;
  sku: string;
  description?: string;
  category_id?: number;
  quantity: number;
  // tax_rate: number;
  cost_price: number;
  selling_price: number;
  image?: string;
}

export interface LineItem {
  id: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  total: number;
  // taxAmount: number;
  taxRate: number;
  shippedQuantity: number;
}

export interface Quotation extends Record<string, unknown> {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  validUntil: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesOrder extends Record<string, unknown> {
  id: number;
  orderNumber: string;
  quotationId?: string;
  customerId: string;
  customerName: string;
  customerContactPerson: string;
  customerEmail: string;
  customerAddress: string;
  salesPersonId: string;
  salesPersonName: string;
  date: string;
  deliveryDate: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  invoiceStatus: 'not_invoiced' | 'partial' | 'invoiced';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  shipmentStatus: 'not_shipped' | 'partial' | 'shipped';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice extends Record<string, unknown> {
  id: string;
  invoiceNumber: string;
  salesOrderId?: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  paymentTerms: string;
  paidAmount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder extends Record<string, unknown> {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  supplierEmail: string;
  supplierAddress: string;
  date: string;
  deliveryDate: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}