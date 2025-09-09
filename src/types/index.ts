// export interface Customer {
//   id: string; 
//   name: string;
//   contact_person?: string;
//   email?: string;
//   phone?: string;
//   address?: string;
//   customer_since?: string; // Changed to string to match datetime in backend
// }

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

export interface Category{
  id: number;
  name: string;
  description?: string;
}

export interface Product extends Record<string, unknown>{
  id: string;
  name: string;
  sku: string;
  description?: string;
  category_id?: number;
  category_name: string;
  quantity: number;
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
  taxRate: number;
}

export interface Quotation extends Record<string, unknown> {
  id: number;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerContactPerson: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  salesPersonId: string | null;
  salesPersonName: string | null;
  date: Date; 
  validUntil: Date | null; 
  status: "open" | "accepted" | "rejected" | "expired";
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  items: LineItem[];
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
  salesOrderId?: number;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'unpaid' | 'partial' | 'paid'  | 'overdue' | 'cancelled';
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

export interface Payment {
  id: string;
  invoiceId: string;
  paymentDate: string;  // ISO date
  amount: number;
  method: string;
  reference?: string;
  notes?: string;
  document?: string;  // URL or path to receipt
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contact_person: string | null;
  status: string;
  customer_since: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  has_unpaid_invoices: boolean;
  avatar: string;
}

export interface ActiveOrder {
  id: string;
  order_number: string;
  po_number: string;
  date: string;
  invoice_status: string;
  payment_status: string;
  shipment_status: string;
  total: number;
}

export interface OrderHistoryItem {
  id: string;
  order_number: string;
  date: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    description?: string | null;
    quantity: number;
    unitCost: number;
    unitPrice: number;
    total: number;
    taxRate: number;
    shippedQuantity: number;
  }[];
  total: number;
}