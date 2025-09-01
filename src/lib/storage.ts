import type { Customer, Supplier, Product, Quotation, SalesOrder, Invoice, PurchaseOrder } from '../types';

// Storage keys
const STORAGE_KEYS = {
  CUSTOMERS: 'bms_customers',
  SUPPLIERS: 'bms_suppliers',
  PRODUCTS: 'bms_products',
  QUOTATIONS: 'bms_quotations',
  SALES_ORDERS: 'bms_sales_orders',
  INVOICES: 'bms_invoices',
  PURCHASE_ORDERS: 'bms_purchase_orders',
  COUNTERS: 'bms_counters',
};

// Generic storage functions
export const getFromStorage = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting ${key} from storage:`, error);
    return [];
  }
};

export const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Counter management for document numbers
interface Counters {
  quotation: number;
  salesOrder: number;
  invoice: number;
  purchaseOrder: number;
}

export const getCounters = (): Counters => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.COUNTERS);
    return data ? JSON.parse(data) : {
      quotation: 1000,
      salesOrder: 2000,
      invoice: 3000,
      purchaseOrder: 4000,
    };
  } catch (error) {
    return {
      quotation: 1000,
      salesOrder: 2000,
      invoice: 3000,
      purchaseOrder: 4000,
    };
  }
};

export const updateCounter = (type: keyof Counters): string => {
  const counters = getCounters();
  const currentNumber = counters[type];
  counters[type] = currentNumber + 1;
  
  try {
    localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify(counters));
  } catch (error) {
    console.error('Error updating counters:', error);
  }
  
  const prefixes = {
    quotation: 'QUO',
    salesOrder: 'SO',
    invoice: 'INV',
    purchaseOrder: 'PO',
  };
  
  return `${prefixes[type]}-${currentNumber.toString().padStart(4, '0')}`;
};

// Specific storage functions
export const getCustomers = (): Customer[] => getFromStorage(STORAGE_KEYS.CUSTOMERS);
export const saveCustomers = (customers: Customer[]): void => saveToStorage(STORAGE_KEYS.CUSTOMERS, customers);

export const getSuppliers = (): Supplier[] => getFromStorage(STORAGE_KEYS.SUPPLIERS);
export const saveSuppliers = (suppliers: Supplier[]): void => saveToStorage(STORAGE_KEYS.SUPPLIERS, suppliers);

export const getProducts = (): Product[] => getFromStorage(STORAGE_KEYS.PRODUCTS);
export const saveProducts = (products: Product[]): void => saveToStorage(STORAGE_KEYS.PRODUCTS, products);

export const getQuotations = (): Quotation[] => getFromStorage(STORAGE_KEYS.QUOTATIONS);
export const saveQuotations = (quotations: Quotation[]): void => saveToStorage(STORAGE_KEYS.QUOTATIONS, quotations);

export const getSalesOrders = (): SalesOrder[] => getFromStorage(STORAGE_KEYS.SALES_ORDERS);
export const saveSalesOrders = (salesOrders: SalesOrder[]): void => saveToStorage(STORAGE_KEYS.SALES_ORDERS, salesOrders);

export const getInvoices = (): Invoice[] => getFromStorage(STORAGE_KEYS.INVOICES);
export const saveInvoices = (invoices: Invoice[]): void => saveToStorage(STORAGE_KEYS.INVOICES, invoices);

export const getPurchaseOrders = (): PurchaseOrder[] => getFromStorage(STORAGE_KEYS.PURCHASE_ORDERS);
export const savePurchaseOrders = (purchaseOrders: PurchaseOrder[]): void => saveToStorage(STORAGE_KEYS.PURCHASE_ORDERS, purchaseOrders);

// Initialize sample data if none exists
export const initializeSampleData = (): void => {
  // Sample customers
  if (getCustomers().length === 0) {
    const sampleCustomers: Customer[] = [
      {
        id: '1',
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1 (555) 123-4567',
        address: '123 Main St, New York, NY 10001',
        // company: 'Acme Corporation',
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techsolutions.com',
        phone: '+1 (555) 987-6543',
        address: '456 Oak Ave, San Francisco, CA 94102',
        // company: 'Tech Solutions Inc',
      },
    ];
    saveCustomers(sampleCustomers);
  }

  // Sample suppliers
  if (getSuppliers().length === 0) {
    const sampleSuppliers: Supplier[] = [
      {
        id: '1',
        name: 'Global Supplies Ltd',
        email: 'orders@globalsupplies.com',
        phone: '+1 (555) 111-2222',
        address: '789 Industrial Blvd, Chicago, IL 60601',
        company: 'Global Supplies Ltd',
      },
      {
        id: '2',
        name: 'Premium Materials Co',
        email: 'sales@premiummaterials.com',
        phone: '+1 (555) 333-4444',
        address: '321 Business Park, Dallas, TX 75201',
        company: 'Premium Materials Co',
      },
    ];
    saveSuppliers(sampleSuppliers);
  }

  // Sample products
  if (getProducts().length === 0) {
    const sampleProducts: Product[] = [
      {
        id: '1',
        name: 'Office Chair Pro',
        description: 'Ergonomic office chair with lumbar support',
        selling_price: 299.99,
        // unit: 'each',
        category_id: 1,
        sku: '',
        quantity: 0,

        cost_price: 0
      },
      {
        id: '2',
        name: 'Standing Desk',
        description: 'Height-adjustable standing desk',
        selling_price: 599.99,
        // unit: 'each',
        category_id: 1,
        sku: 'OFF-CHAIR-PRO',
        quantity: 0,
        cost_price: 0
      },
      {
        id: '3',
        name: 'Laptop Computer',
        description: 'High-performance business laptop',
        selling_price: 1299.99,
        category_id: 1,
        sku: '',
        quantity: 0,
        cost_price: 0
      },
      {
        id: '4',
        name: 'Office Paper A4',
        description: 'Premium white office paper, 500 sheets',
        selling_price: 8.99,
        category_id: 1,
        sku: '',
        quantity: 0,
        cost_price: 0
      },
    ];
    saveProducts(sampleProducts);
  }
};