// Mock data for hardware inventory management dashboard

// Monthly sales data
export const monthlySalesData = [
  { month: 'Jan', sales: 15000, profit: 4500, orders: 120 },
  { month: 'Feb', sales: 18000, profit: 5200, orders: 145 },
  { month: 'Mar', sales: 22000, profit: 6800, orders: 165 },
  { month: 'Apr', sales: 19500, profit: 5800, orders: 152 },
  { month: 'May', sales: 24500, profit: 7200, orders: 178 },
  { month: 'Jun', sales: 28000, profit: 8400, orders: 210 }
];

// Weekly sales data
export const weeklySalesData = [
  { day: 'Monday', sales: 3800, profit: 1150, orders: 32 },
  { day: 'Tuesday', sales: 4200, profit: 1260, orders: 36 },
  { day: 'Wednesday', sales: 5100, profit: 1530, orders: 42 },
  { day: 'Thursday', sales: 4800, profit: 1440, orders: 38 },
  { day: 'Friday', sales: 5500, profit: 1650, orders: 45 },
  { day: 'Saturday', sales: 3900, profit: 1170, orders: 30 },
  { day: 'Sunday', sales: 2800, profit: 840, orders: 22 }
];

// Low stock items data
export const lowStockData = [
  { id: 1, name: 'Phillips Screwdriver Set', category: 'Tools', stock: 5, threshold: 10, status: 'low stock' },
  { id: 2, name: 'Copper Wire 18 AWG', category: 'Electrical', stock: 3, threshold: 15, status: 'low stock' },
  { id: 3, name: 'PVC Pipe 1-inch', category: 'Plumbing', stock: 8, threshold: 20, status: 'low stock' },
  { id: 4, name: 'LED Light Bulbs 10W', category: 'Lighting', stock: 6, threshold: 25, status: 'low stock' },
  { id: 6, name: 'Door Hinges Brass', category: 'Hardware', stock: 0, threshold: 12, status: 'out of stock' }
];

// Payment due alerts data
export const paymentDueData = [
  { id: 1, supplier: 'ToolMaster Inc.', amount: 2850, dueDate: '2025-07-25', invoiceNumber: 'INV-7823' },
  { id: 2, supplier: 'ElectroSupply Co.', amount: 1750, dueDate: '2025-07-26', invoiceNumber: 'INV-5692' },
  { id: 3, supplier: 'PlumbPro Ltd.', amount: 3200, dueDate: '2025-07-28', invoiceNumber: 'INV-4501' },
  { id: 4, supplier: 'LumberYard LLC', amount: 4500, dueDate: '2025-07-30', invoiceNumber: 'INV-3298' },
  { id: 5, supplier: 'FastenRight Co.', amount: 1200, dueDate: '2025-08-02', invoiceNumber: 'INV-6745' }
];

// Recent orders data
export const recentOrdersData = [
  { id: 'ORD-8761', customer: 'Johnson Construction', date: '2025-07-22', amount: 1250.75, status: 'Delivered' },
  { id: 'ORD-8762', customer: 'Smith Home Repairs', date: '2025-07-22', amount: 850.50, status: 'Processing' },
  { id: 'ORD-8763', customer: 'City Maintenance Dept.', date: '2025-07-21', amount: 3200.25, status: 'Shipped' },
  { id: 'ORD-8764', customer: 'Green Landscaping Co.', date: '2025-07-21', amount: 675.00, status: 'Delivered' },
  { id: 'ORD-8765', customer: 'DIY Homestore', date: '2025-07-20', amount: 4850.75, status: 'Delivered' },
  { id: 'ORD-8766', customer: 'Martinez Plumbing', date: '2025-07-20', amount: 1125.30, status: 'Processing' },
  { id: 'ORD-8767', customer: 'Electrical Solutions Inc.', date: '2025-07-19', amount: 2340.80, status: 'Shipped' }
];

// Last purchased date data
export const lastPurchasedData = [
  { id: 1, product: 'Power Drills', category: 'Tools', lastPurchased: 12 },
  { id: 2, product: 'PVC Fittings', category: 'Plumbing', lastPurchased: 5 },
  { id: 3, product: 'Circuit Breakers', category: 'Electrical', lastPurchased: 30 },
  { id: 4, product: 'Hardwood Planks', category: 'Lumber', lastPurchased: 45 },
  { id: 5, product: 'Paint Supplies', category: 'Painting', lastPurchased: 8 },
  { id: 6, product: 'Concrete Mix', category: 'Building Materials', lastPurchased: 22 }
];

// Inventory trend data
export const inventoryTrendData = [
  // Tools category
  { month: 'Jan', category: 'Tools', inStock: 450 },
  { month: 'Feb', category: 'Tools', inStock: 475 },
  { month: 'Mar', category: 'Tools', inStock: 425 },
  { month: 'Apr', category: 'Tools', inStock: 500 },
  { month: 'May', category: 'Tools', inStock: 525 },
  { month: 'Jun', category: 'Tools', inStock: 480 },
  
  // Electrical category
  { month: 'Jan', category: 'Electrical', inStock: 320 },
  { month: 'Feb', category: 'Electrical', inStock: 350 },
  { month: 'Mar', category: 'Electrical', inStock: 380 },
  { month: 'Apr', category: 'Electrical', inStock: 360 },
  { month: 'May', category: 'Electrical', inStock: 400 },
  { month: 'Jun', category: 'Electrical', inStock: 420 },
  
  // Plumbing category
  { month: 'Jan', category: 'Plumbing', inStock: 280 },
  { month: 'Feb', category: 'Plumbing', inStock: 300 },
  { month: 'Mar', category: 'Plumbing', inStock: 290 },
  { month: 'Apr', category: 'Plumbing', inStock: 320 },
  { month: 'May', category: 'Plumbing', inStock: 310 },
  { month: 'Jun', category: 'Plumbing', inStock: 350 },
  
  // Hardware category
  { month: 'Jan', category: 'Hardware', inStock: 600 },
  { month: 'Feb', category: 'Hardware', inStock: 580 },
  { month: 'Mar', category: 'Hardware', inStock: 620 },
  { month: 'Apr', category: 'Hardware', inStock: 650 },
  { month: 'May', category: 'Hardware', inStock: 670 },
  { month: 'Jun', category: 'Hardware', inStock: 700 },
  
  // Lumber category
  { month: 'Jan', category: 'Lumber', inStock: 180 },
  { month: 'Feb', category: 'Lumber', inStock: 200 },
  { month: 'Mar', category: 'Lumber', inStock: 220 },
  { month: 'Apr', category: 'Lumber', inStock: 210 },
  { month: 'May', category: 'Lumber', inStock: 240 },
  { month: 'Jun', category: 'Lumber', inStock: 260 }
];