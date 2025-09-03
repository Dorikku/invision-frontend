import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Search, Filter, AlertTriangle } from 'lucide-react';
// import { ScrollArea } from '@radix-ui/react-scroll-area';
import { ScrollArea } from '@/components/ui/scroll-area';

// Mock customer data
const customers = [
  {
    id: 1,
    name: 'Juan Dela Cruz',
    email: 'juan@gmail.com',
    phone: '+639176789012',
    joinDate: '2023-01-15',
    status: 'Regular',
    avatar: 'https://ui-avatars.com/api/?name=Juan+Dela+Cruz&background=3b82f6&color=fff',
    address: '123 Rizal Street, Manila, Philippines',
    company: 'Individual',
    totalOrders: 12,
    totalSpent: 185000,
    averageOrderValue: 15417,
    hasUnpaidInvoices: false
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '+639189876543',
    joinDate: '2023-02-20',
    status: 'Regular',
    avatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=10b981&color=fff',
    address: '456 Bonifacio Avenue, Quezon City, Philippines',
    company: 'Individual',
    totalOrders: 8,
    totalSpent: 125000,
    averageOrderValue: 15625,
    hasUnpaidInvoices: true
  },
  {
    id: 3,
    name: 'BuildRight Construction',
    email: 'contact@buildright.com',
    phone: '+639198765432',
    joinDate: '2023-03-10',
    status: 'Premium',
    avatar: 'https://ui-avatars.com/api/?name=BuildRight+Construction&background=f59e0b&color=fff',
    address: '789 Construction Ave, Makati City, Philippines',
    company: 'BuildRight Construction Corp.',
    totalOrders: 25,
    totalSpent: 850000,
    averageOrderValue: 34000,
    hasUnpaidInvoices: false
  },
  {
    id: 4,
    name: 'Harmony Homes Realty',
    email: 'info@harmonyhomes.com',
    phone: '+639187654321',
    joinDate: '2023-04-05',
    status: 'Premium',
    avatar: 'https://ui-avatars.com/api/?name=Harmony+Homes&background=8b5cf6&color=fff',
    address: '321 Real Estate Blvd, BGC, Taguig, Philippines',
    company: 'Harmony Homes Realty Inc.',
    totalOrders: 18,
    totalSpent: 645000,
    averageOrderValue: 35833,
    hasUnpaidInvoices: true
  },
  {
    id: 5,
    name: 'Anna Rodriguez',
    email: 'anna@gmail.com',
    phone: '+639176543210',
    joinDate: '2023-05-12',
    status: 'New Customer',
    avatar: 'https://ui-avatars.com/api/?name=Anna+Rodriguez&background=ef4444&color=fff',
    address: '654 Luna Street, Pasig City, Philippines',
    company: 'Individual',
    totalOrders: 3,
    totalSpent: 45000,
    averageOrderValue: 15000,
    hasUnpaidInvoices: false
  },
  {
    id: 6,
    name: 'Modern Builders Inc.',
    email: 'orders@modernbuilders.com',
    phone: '+639165432109',
    joinDate: '2023-06-18',
    status: 'Premium',
    avatar: 'https://ui-avatars.com/api/?name=Modern+Builders&background=06b6d4&color=fff',
    address: '987 Industrial Road, Caloocan City, Philippines',
    company: 'Modern Builders Inc.',
    totalOrders: 30,
    totalSpent: 1250000,
    averageOrderValue: 41667,
    hasUnpaidInvoices: false
  },
  {
    id: 7,
    name: 'Green Thumb Landscaping',
    email: 'info@greenthumb.com',
    phone: '+639123456789',
    joinDate: '2023-07-22',
    status: 'Regular',
    avatar: 'https://ui-avatars.com/api/?name=Green+Thumb&background=3b82f6&color=fff',
    address: '456 Garden Lane, Quezon City, Philippines',
    company: 'Green Thumb Landscaping Services',
    totalOrders: 10,
    totalSpent: 300000,
    averageOrderValue: 30000,
    hasUnpaidInvoices: false
  },
  {
    id: 8,
    name: 'Blue Sky Aviation',
    email: 'info@blueskyaviation.com',
    phone: '+639876543210',
    joinDate: '2023-08-15',
    status: 'Regular',
    avatar: 'https://ui-avatars.com/api/?name=Blue+Sky+Aviation&background=3b82f6&color=fff',
    address: '123 Airport Road, Pasay City, Philippines',
    company: 'Blue Sky Aviation Services',
    totalOrders: 5,
    totalSpent: 150000,
    averageOrderValue: 30000,
    hasUnpaidInvoices: false
  },
  {
    id: 9,
    name: 'Skyline Tech Solutions',
    email: 'info@skylinetech.com',
    phone: '+639876543210',
    joinDate: '2023-08-15',
    status: 'Regular',
    avatar: 'https://ui-avatars.com/api/?name=Skyline+Tech&background=3b82f6&color=fff',
    address: '123 Tech Park, Pasay City, Philippines',
    company: 'Skyline Tech Solutions Inc.',
    totalOrders: 5,
    totalSpent: 150000,
    averageOrderValue: 30000,
    hasUnpaidInvoices: false
  }
];

// Mock active orders data
const activeOrders = [
  {
    id: 'SO-2024-001',
    customerId: 1,
    poNumber: 'PO-2024-001',
    date: '2024-08-05',
    status: 'Invoiced',
    total: 15500.00
  },
  {
    id: 'SO-2024-002',
    customerId: 1,
    poNumber: 'PO-2024-002',
    date: '2024-08-07',
    status: 'Packed',
    total: 8750.00
  },
  {
    id: 'SO-2024-003',
    customerId: 2,
    poNumber: 'PO-2024-003',
    date: '2024-08-03',
    status: 'Invoiced',
    total: 12300.00
  },
  {
    id: 'SO-2024-004',
    customerId: 3,
    poNumber: 'PO-2024-004',
    date: '2024-08-01',
    status: 'Shipped',
    total: 65000.00
  },
  {
    id: 'SO-2024-005',
    customerId: 4,
    poNumber: 'PO-2024-005',
    date: '2024-08-06',
    status: 'Invoiced',
    total: 42000.00
  }
];

// Mock order history data
const orderHistory = [
  {
    id: 'SO-2024-001',
    customerId: 1,
    date: '2024-08-05',
    items: [
      { name: 'DeWalt Power Drill', quantity: 2, price: 6500.00, subtotal: 13000.00 },
      { name: 'Stanley Hammer', quantity: 5, price: 850.00, subtotal: 4250.00 }
    ],
    total: 17250.00,
    status: 'Completed'
  },
  {
    id: 'SO-2024-002',
    customerId: 1,
    date: '2024-07-28',
    items: [
      { name: 'Makita Circular Saw', quantity: 1, price: 8500.00, subtotal: 8500.00 },
      { name: 'Safety Gear Set', quantity: 3, price: 1700.00, subtotal: 5100.00 }
    ],
    total: 13600.00,
    status: 'Completed'
  },
  {
    id: 'SO-2024-003',
    customerId: 2,
    date: '2024-08-03',
    items: [
      { name: 'Milwaukee Angle Grinder', quantity: 1, price: 9500.00, subtotal: 9500.00 },
      { name: 'Paint Sprayer', quantity: 1, price: 12500.00, subtotal: 12500.00 }
    ],
    total: 22000.00,
    status: 'Completed'
  }
];

// Helper function to get status variant for badges
const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'invoiced':
      return 'default';
    case 'paid':
      return 'default';
    case 'packed':
      return 'secondary';
    case 'shipped':
      return 'outline';
    case 'completed':
      return 'default';
    default:
      return 'secondary';
  }
};

const getCustomerStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'premium':
      return 'default';
    case 'regular':
      return 'primary';
    case 'new customer':
      return 'success';
    default:
      return 'secondary';
  }
};

const CustomersPage = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [customerList] = useState(customers); // Ready for API integration

  // Filter customers based on search query - easy to replace with API call
  const filteredCustomers = customerList.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get active orders for selected customer - ready for API integration
  const customerActiveOrders = activeOrders.filter(order => order.customerId === selectedCustomer?.id);

  // Get order history for selected customer - ready for API integration
  const customerOrderHistory = orderHistory.filter(order => order.customerId === selectedCustomer?.id);

  return (
    <ScrollArea>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your customer database
          </p>
        </div>
        <Button >
          <Plus className="mr-2 h-4 w-4" />
          New Customer
        </Button>
      </div>

      <div className="flex h-screen ">
        
        {/* Left Panel - Customer List */}
        <ScrollArea className="w-1/3 bg-white border-r border-gray-200 flex flex-col rounded-lg mt-5">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            {/* <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-gray-800">All customers</h1>
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Add Customer
                </Button>
                <Button variant="ghost" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div> */}
            
            {/* Search */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers"
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="sm" className="ml-2">
                <Filter className="h-4 w-4" />
              </Button>
            </div>


            {/* Filter Legend */}
            <div className="flex items-center mt-3 text-sm">
              <div className="flex items-center mr-4">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-gray-600">New Customer</span>
              </div>
              <div className="flex items-center mr-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                <span className="text-gray-600">Regular</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                <span className="text-gray-600">Premium</span>
              </div>
            </div>
          </div>

          {/* Customer List */}
          <div className="flex-1 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedCustomer?.id === customer.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-center">
                  <img
                    src={customer.avatar}
                    alt={customer.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{customer.name}</h3>
                      <span className="text-sm text-gray-500">{customer.joinDate}</span>
                    </div>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <div className="flex items-center mt-1">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        customer.status === 'New Customer' ? 'bg-green-400' :
                        customer.status === 'Regular' ? 'bg-blue-400' : 'bg-purple-400'
                      }`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        

        {/* Right Panel - Customer Details */}
        <ScrollArea className="flex-1 overflow-y-auto">
          {selectedCustomer ? (
            <div className="p-6">
              {/* Customer Header */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <img
                        src={selectedCustomer.avatar}
                        alt={selectedCustomer.name}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{selectedCustomer.name}</h1>
                        <p className="text-gray-600">{selectedCustomer.email}</p>
                        <p className="text-gray-600">{selectedCustomer.phone}</p>
                      </div>
                    </div>
                    <Badge variant={getCustomerStatusVariant(selectedCustomer.status)} >
                      {selectedCustomer.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-xl font-semibold text-gray-900">{selectedCustomer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Spent</p>
                      <p className="text-xl font-semibold text-gray-900">₱{selectedCustomer.totalSpent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Order Value</p>
                      <p className="text-xl font-semibold text-gray-900">₱{selectedCustomer.averageOrderValue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Customer Since</p>
                      <p className="text-xl font-semibold text-gray-900">{selectedCustomer.joinDate}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification for unpaid invoices */}
              {selectedCustomer.hasUnpaidInvoices && (
                <Alert className="mb-6" variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className='font-medium'>
                    This customer has unpaid invoices.
                  </AlertDescription>
                </Alert>
              )}

              {/* Active Orders Section */}
              <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-semibold">Active Orders</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO#</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {customerActiveOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <Badge variant={getStatusVariant(order.status)}>
                                {order.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{order.poNumber}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{order.date}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">₱{order.total.toLocaleString()}</td>
                          </tr>
                        ))}
                        {customerActiveOrders.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              No active orders for this customer
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Order History Section */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-lg font-semibold">Order History</CardTitle>
                  <Button variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Unit Price</th>
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Total Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerOrderHistory.map((order) => (
                          <React.Fragment key={order.id}>
                            <tr className="bg-gray-50">
                              <td colSpan={4} className="px-2 py-2 text-sm font-medium text-gray-700">
                                Order {order.id} - {order.date}
                              </td>
                            </tr>
                            {order.items.map((item, index) => (
                              <tr key={`${order.id}-${index}`} className="border-b border-gray-100">
                                <td className="px-2 py-2 text-sm text-gray-900">{item.name}</td>
                                <td className="px-2 py-2 text-sm text-gray-900">{item.quantity}</td>
                                <td className="px-2 py-2 text-sm text-gray-900">₱{item.price.toLocaleString()}</td>
                                <td className="px-2 py-2 text-sm text-gray-900">₱{item.subtotal.toLocaleString()}</td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                        {customerOrderHistory.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-2 py-8 text-center text-gray-500">
                              No order history for this customer
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Select a customer to view details</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </ScrollArea>
  );
};

export default CustomersPage;