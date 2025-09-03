import React, { useState, useEffect } from 'react';

// Mock supplier data
const suppliers = [
  {
    id: 1,
    name: 'DeWalt Philippines',
    email: 'orders@dewalt.ph',
    phone: '+632-8234-5678',
    joinDate: '2022-03-15',
    status: 'Preferred',
    avatar: 'https://ui-avatars.com/api/?name=DeWalt+Philippines&background=fbbf24&color=000',
    address: '1234 Industrial Avenue, Pasig City, Metro Manila',
    company: 'DeWalt Industrial Tools Inc.',
    contactPerson: 'Roberto Santos',
    totalPurchases: 45,
    totalSpent: 2850000,
    averagePurchaseValue: 63333,
    hasOutstandingPayables: false,
    paymentTerms: 'Net 30',
    category: 'Power Tools'
  },
  {
    id: 2,
    name: 'Makita Supply Corp',
    email: 'supply@makita.com.ph',
    phone: '+632-8567-8901',
    joinDate: '2022-01-20',
    status: 'Preferred',
    avatar: 'https://ui-avatars.com/api/?name=Makita+Supply&background=06b6d4&color=fff',
    address: '567 Commerce Street, Quezon City, Metro Manila',
    company: 'Makita Supply Corporation',
    contactPerson: 'Jennifer Cruz',
    totalPurchases: 38,
    totalSpent: 1950000,
    averagePurchaseValue: 51316,
    hasOutstandingPayables: true,
    paymentTerms: 'Net 45',
    category: 'Power Tools'
  },
  {
    id: 3,
    name: 'Stanley Tools Distributor',
    email: 'info@stanleytools.ph',
    phone: '+632-8789-0123',
    joinDate: '2022-05-10',
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Stanley+Tools&background=dc2626&color=fff',
    address: '890 Hardware Boulevard, Mandaluyong City',
    company: 'Stanley Tools Distribution Inc.',
    contactPerson: 'Michael Torres',
    totalPurchases: 28,
    totalSpent: 1250000,
    averagePurchaseValue: 44643,
    hasOutstandingPayables: false,
    paymentTerms: 'Net 30',
    category: 'Hand Tools'
  },
  {
    id: 4,
    name: 'Bosch Equipment Supply',
    email: 'orders@boschequip.ph',
    phone: '+632-8345-6789',
    joinDate: '2022-07-22',
    status: 'Active',
    avatar: 'https://ui-avatars.com/api/?name=Bosch+Equipment&background=059669&color=fff',
    address: '345 Technology Park, BGC, Taguig City',
    company: 'Bosch Equipment Supply Philippines',
    contactPerson: 'Lisa Gonzales',
    totalPurchases: 22,
    totalSpent: 1680000,
    averagePurchaseValue: 76364,
    hasOutstandingPayables: true,
    paymentTerms: 'Net 60',
    category: 'Power Tools'
  },
  {
    id: 5,
    name: 'Safety First Corp',
    email: 'sales@safetyfirst.ph',
    phone: '+632-8456-7890',
    joinDate: '2022-09-05',
    status: 'New Supplier',
    avatar: 'https://ui-avatars.com/api/?name=Safety+First&background=f59e0b&color=fff',
    address: '678 Safety Street, Muntinlupa City',
    company: 'Safety First Corporation',
    contactPerson: 'David Reyes',
    totalPurchases: 8,
    totalSpent: 320000,
    averagePurchaseValue: 40000,
    hasOutstandingPayables: false,
    paymentTerms: 'Net 15',
    category: 'Safety Equipment'
  },
  {
    id: 6,
    name: 'Milwaukee Tools PH',
    email: 'wholesale@milwaukee.ph',
    phone: '+632-8901-2345',
    joinDate: '2022-11-12',
    status: 'Preferred',
    avatar: 'https://ui-avatars.com/api/?name=Milwaukee+Tools&background=b91c1c&color=fff',
    address: '912 Industrial Complex, Caloocan City',
    company: 'Milwaukee Tools Philippines Inc.',
    contactPerson: 'Sarah Martinez',
    totalPurchases: 35,
    totalSpent: 2100000,
    averagePurchaseValue: 60000,
    hasOutstandingPayables: false,
    paymentTerms: 'Net 30',
    category: 'Power Tools'
  }
];

// Mock active purchase orders data
const activePurchaseOrders = [
  {
    id: 'PO-2024-001',
    supplierId: 1,
    poNumber: 'PO-DEW-001',
    date: '2024-08-05',
    status: 'Pending',
    expectedDelivery: '2024-08-15',
    total: 125000.00
  },
  {
    id: 'PO-2024-002',
    supplierId: 1,
    poNumber: 'PO-DEW-002',
    date: '2024-08-07',
    status: 'Shipped',
    expectedDelivery: '2024-08-12',
    total: 85000.00
  },
  {
    id: 'PO-2024-003',
    supplierId: 2,
    poNumber: 'PO-MAK-001',
    date: '2024-08-03',
    status: 'Received',
    expectedDelivery: '2024-08-10',
    total: 95000.00
  },
  {
    id: 'PO-2024-004',
    supplierId: 3,
    poNumber: 'PO-STA-001',
    date: '2024-08-01',
    status: 'Pending',
    expectedDelivery: '2024-08-18',
    total: 45000.00
  },
  {
    id: 'PO-2024-005',
    supplierId: 4,
    poNumber: 'PO-BOS-001',
    date: '2024-08-06',
    status: 'Confirmed',
    expectedDelivery: '2024-08-20',
    total: 180000.00
  }
];

// Mock purchase history data
const purchaseHistory = [
  {
    id: 'PO-2024-001',
    supplierId: 1,
    date: '2024-07-25',
    items: [
      { name: 'DeWalt Power Drill DCD771', quantity: 50, unitCost: 6500.00, subtotal: 325000.00 },
      { name: 'DeWalt Impact Driver DCF885', quantity: 30, unitCost: 7200.00, subtotal: 216000.00 }
    ],
    total: 541000.00,
    status: 'Completed'
  },
  {
    id: 'PO-2024-002',
    supplierId: 1,
    date: '2024-07-15',
    items: [
      { name: 'DeWalt Circular Saw DCS570', quantity: 25, unitCost: 8500.00, subtotal: 212500.00 },
      { name: 'DeWalt Angle Grinder DCG405', quantity: 40, unitCost: 5800.00, subtotal: 232000.00 }
    ],
    total: 444500.00,
    status: 'Completed'
  },
  {
    id: 'PO-2024-003',
    supplierId: 2,
    date: '2024-07-20',
    items: [
      { name: 'Makita Hammer Drill HP2050', quantity: 35, unitCost: 7800.00, subtotal: 273000.00 },
      { name: 'Makita Jigsaw 4329', quantity: 20, unitCost: 6200.00, subtotal: 124000.00 }
    ],
    total: 397000.00,
    status: 'Completed'
  }
];

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'received':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getSupplierStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'preferred':
      return 'bg-emerald-100 text-emerald-800';
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'new supplier':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const SuppliersPage = () => {
  const [selectedSupplier, setSelectedSupplier] = useState(suppliers[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get active purchase orders for selected supplier
  const supplierActivePOs = activePurchaseOrders.filter(po => po.supplierId === selectedSupplier?.id);

  // Get purchase history for selected supplier
  const supplierPurchaseHistory = purchaseHistory.filter(purchase => purchase.supplierId === selectedSupplier?.id);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Panel - Supplier List */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col ">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">All suppliers</h1>
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search suppliers"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Filter Legend */}
          <div className="flex flex-wrap items-center mt-3 text-sm gap-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
              <span className="text-gray-600">Preferred</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
              <span className="text-gray-600">Active</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
              <span className="text-gray-600">New</span>
            </div>
          </div>
        </div>

        {/* Supplier List */}
        <div className="flex-1 overflow-y-auto">
          {filteredSuppliers.map((supplier) => (
            <div
              key={supplier.id}
              onClick={() => setSelectedSupplier(supplier)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedSupplier?.id === supplier.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-center">
                <img
                  src={supplier.avatar}
                  alt={supplier.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                    <span className="text-sm text-gray-500">{supplier.joinDate}</span>
                  </div>
                  <p className="text-sm text-gray-600">{supplier.email}</p>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        supplier.status === 'Preferred' ? 'bg-emerald-400' :
                        supplier.status === 'Active' ? 'bg-blue-400' : 'bg-amber-400'
                      }`}></div>
                      <span className="text-xs text-gray-500">{supplier.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Supplier Details */}
      <div className="flex-1 overflow-y-auto">
        {selectedSupplier ? (
          <div className="p-6">
            {/* Supplier Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <img
                    src={selectedSupplier.avatar}
                    alt={selectedSupplier.name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div>
                    <h1 className="text-2xl font-semibold text-gray-900">{selectedSupplier.name}</h1>
                    <p className="text-gray-600">{selectedSupplier.email}</p>
                    <p className="text-gray-600">{selectedSupplier.phone}</p>
                    <p className="text-sm text-gray-500 mt-1">Contact: {selectedSupplier.contactPerson}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSupplierStatusColor(selectedSupplier.status)}`}>
                    {selectedSupplier.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">Terms: {selectedSupplier.paymentTerms}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Total Purchase Orders</p>
                  <p className="text-xl font-semibold text-gray-900">{selectedSupplier.totalPurchases}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Purchases</p>
                  <p className="text-xl font-semibold text-gray-900">₱{selectedSupplier.totalSpent.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average PO Value</p>
                  <p className="text-xl font-semibold text-gray-900">₱{selectedSupplier.averagePurchaseValue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Supplier Since</p>
                  <p className="text-xl font-semibold text-gray-900">{selectedSupplier.joinDate}</p>
                </div>
              </div>

              {/* Address and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="text-sm text-gray-900">{selectedSupplier.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="text-sm text-gray-900">{selectedSupplier.category}</p>
                </div>
              </div>
            </div>

            {/* Notification for outstanding payables */}
            {selectedSupplier.hasOutstandingPayables && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="font-medium text-red-800">This supplier has outstanding payables that require attention.</p>
                </div>
              </div>
            )}

            {/* Active Purchase Orders Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Active Purchase Orders</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO#</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected Delivery</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {supplierActivePOs.map((po) => (
                      <tr key={po.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{po.poNumber}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{po.date}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{po.expectedDelivery}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₱{po.total.toLocaleString()}</td>
                      </tr>
                    ))}
                    {supplierActivePOs.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          No active purchase orders with this supplier
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Purchase History Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Purchase History</h2>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Product</th>
                      <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                      <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Unit Cost</th>
                      <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Total Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierPurchaseHistory.map((purchase) => (
                      <React.Fragment key={purchase.id}>
                        <tr className="bg-gray-50">
                          <td colSpan="4" className="px-2 py-2 text-sm font-medium text-gray-700">
                            PO {purchase.id} - {purchase.date} - Total: ₱{purchase.total.toLocaleString()}
                          </td>
                        </tr>
                        {purchase.items.map((item, index) => (
                          <tr key={`${purchase.id}-${index}`} className="border-b border-gray-100">
                            <td className="px-2 py-2 text-sm text-gray-900">{item.name}</td>
                            <td className="px-2 py-2 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-2 py-2 text-sm text-gray-900">₱{item.unitCost.toLocaleString()}</td>
                            <td className="px-2 py-2 text-sm text-gray-900">₱{item.subtotal.toLocaleString()}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    {supplierPurchaseHistory.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-2 py-8 text-center text-gray-500">
                          No purchase history with this supplier
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a supplier to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuppliersPage;