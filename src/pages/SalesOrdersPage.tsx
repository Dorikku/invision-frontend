import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Copy, Trash2, Package, Truck, Receipt, Wallet } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DataTable } from '../components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { SalesOrder, Quotation } from '../types';
import SalesOrderForm from '../components/forms/SalesOrderForm';
import SalesOrderView from '../components/views/SalesOrderView';
import CreateInvoiceDialog from '../components/forms/CreateInvoiceDialog'; 
import RecordPaymentDialog from '../components/forms/RecordPaymentDialog';
import CreateShipmentDialog from '../components/forms/CreateShipmentDialog';

// API functions
const fetchSalesOrders = async (): Promise<SalesOrder[]> => {
  const response = await fetch('http://127.0.0.1:8000/api/v1/sales-orders');
  if (!response.ok) {
    throw new Error('Failed to fetch sales orders');
  }
  return response.json();
};

const deleteSalesOrder = async (id: number): Promise<void> => {
  const response = await fetch(`http://127.0.0.1:8000/api/v1/sales-orders/${id}`, { 
    method: 'DELETE' 
  });
  if (!response.ok) {
    throw new Error('Failed to delete sales order');
  }
};

export default function SalesOrdersPage() {
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [selectedSalesOrder, setSelectedSalesOrder] = useState<SalesOrder | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingSalesOrder, setEditingSalesOrder] = useState<SalesOrder | null>(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [invoiceSalesOrder, setInvoiceSalesOrder] = useState<SalesOrder | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentSalesOrder, setPaymentSalesOrder] = useState<SalesOrder | null>(null);
  const [isCreateShipmentOpen, setIsCreateShipmentOpen] = useState(false);
  const [shipmentSalesOrder, setShipmentSalesOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSalesOrders();
  }, []);

  const loadSalesOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchSalesOrders();
      setSalesOrders(data);
    } catch (error) {
      console.error('Error loading sales orders:', error);
      toast.error('Failed to load sales orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSalesOrder = () => {
    setEditingSalesOrder(null);
    setIsFormOpen(true);
  };

  const handleEditSalesOrder = (salesOrder: SalesOrder) => {
    setEditingSalesOrder(salesOrder);
    setIsFormOpen(true);
  };

  const handleViewSalesOrder = (salesOrder: SalesOrder) => {
    setSelectedSalesOrder(salesOrder);
    setIsViewOpen(true);
  };

  const handleDuplicateSalesOrder = async (salesOrder: SalesOrder) => {
    try {
      // Create a copy of the sales order without the ID and with new dates
      const duplicateData = {
        customerId: salesOrder.customerId,
        quotationId: salesOrder.quotationId,
        date: new Date().toISOString().split('T')[0],
        deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        items: salesOrder.items.map(item => ({
          id: item.id,
          productName: item.productName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          taxRate: item.taxRate,
          shippedQuantity: 0 // Reset shipped quantity for duplicate
        })),
        subtotal: salesOrder.subtotal,
        tax: salesOrder.tax,
        taxRate: salesOrder.taxRate,
        total: salesOrder.total,
        invoiceStatus: 'not_invoiced' as const,
        paymentStatus: 'unpaid' as const,
        shipmentStatus: 'not_shipped' as const,
        notes: salesOrder.notes,
      };

      const response = await fetch('http://127.0.0.1:8000/api/v1/sales-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to duplicate sales order');
      }

      await loadSalesOrders();
      toast.success('Sales order duplicated successfully');
    } catch (error) {
      console.error('Error duplicating sales order:', error);
      toast.error('Failed to duplicate sales order');
    }
  };

  const handleDeleteSalesOrder = async (salesOrder: SalesOrder) => {
    if (window.confirm('Are you sure you want to delete this sales order?')) {
      try {
        await deleteSalesOrder(salesOrder.id);
        await loadSalesOrders();
        toast.success('Sales order deleted successfully');
      } catch (error) {
        console.error('Error deleting sales order:', error);
        toast.error('Failed to delete sales order');
      }
    }
  };

  const handleInvoiceStatusChange = (salesOrder: SalesOrder, newStatus: SalesOrder['invoiceStatus']) => {
    setInvoiceSalesOrder(salesOrder);
    setIsCreateInvoiceOpen(true);
  };

  const handlePaymentStatusChange = (salesOrder: SalesOrder, newStatus: SalesOrder['paymentStatus']) => {
    setPaymentSalesOrder(salesOrder);
    setIsRecordPaymentOpen(true);
  };

  const handleShipmentStatusChange = (salesOrder: SalesOrder, newStatus: SalesOrder['shipmentStatus']) => {
    setShipmentSalesOrder(salesOrder);
    setIsCreateShipmentOpen(true);
  };

  const handleSaveSalesOrder = async (salesOrderData: Partial<SalesOrder>) => {
    try {
      // The API call is now handled inside the SalesOrderForm component
      // This callback is called after successful save
      await loadSalesOrders();
      setIsFormOpen(false);
      setEditingSalesOrder(null);
      toast.success(editingSalesOrder ? 'Sales order updated successfully' : 'Sales order created successfully');
    } catch (error) {
      console.error('Error in handleSaveSalesOrder:', error);
      toast.error('Failed to save sales order');
    }
  };

  const handleCreateFromQuotation = async (quotationId: string) => {
    try {
      // You might want to implement this endpoint on your backend
      // For now, this will use your existing quotation data
      const quotationsResponse = await fetch('http://127.0.0.1:8000/api/v1/quotations');
      if (!quotationsResponse.ok) {
        throw new Error('Failed to fetch quotations');
      }
      const quotations = await quotationsResponse.json();
      const quotation = quotations.find((q: Quotation) => q.id === quotationId);

      if (quotation) {
        const salesOrderData = {
          customerId: quotation.customerId,
          quotationId: quotation.id,
          date: new Date().toISOString().split('T')[0],
          deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          items: quotation.items,
          subtotal: quotation.subtotal,
          tax: quotation.tax,
          taxRate: quotation.taxRate,
          total: quotation.total,
          invoiceStatus: 'not_invoiced' as const,
          paymentStatus: 'unpaid' as const,
          shipmentStatus: 'not_shipped' as const,
          notes: quotation.notes,
        };

        const response = await fetch('http://127.0.0.1:8000/api/v1/sales-orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(salesOrderData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to create sales order from quotation');
        }

        await loadSalesOrders();
        toast.success('Sales order created from quotation successfully');
      }
    } catch (error) {
      console.error('Error creating sales order from quotation:', error);
      toast.error('Failed to create sales order from quotation');
    }
  };

  const getInvoiceStatusBadgeVariant = (invoiceStatus: string) => {
    switch (invoiceStatus) {
      case 'not_invoiced': return 'destructive';
      case 'partial': return 'secondary';
      case 'invoiced': return 'success';
      default: return 'secondary';
    }
  };

  const getPaymentStatusBadgeVariant = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'unpaid': return 'destructive';
      case 'partial': return 'secondary';
      case 'paid': return 'success';
      default: return 'secondary';
    }
  };

  const getShipmentStatusBadgeVariant = (shipmentStatus: string) => {
    switch (shipmentStatus) {
      case 'not_shipped': return 'destructive';
      case 'partial': return 'secondary';
      case 'shipped': return 'success';
      default: return 'secondary';
    }
  };

  const formatStatusLabel = (status?: string) => {
    if (!status) return "";
    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      sortable: true,
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'date',
      label: 'Order Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value: number) => `₱ ${value.toFixed(2)}`,
    },
    {
      key: 'invoiceStatus',
      label: 'Invoice',
      sortable: true,
      render: (value: string) => (
        <Badge variant={getInvoiceStatusBadgeVariant(value)}>
          {formatStatusLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      sortable: true,
      render: (value: string) => (
        <Badge variant={getPaymentStatusBadgeVariant(value)}>
          {formatStatusLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'shipmentStatus',
      label: 'Shipment',
      sortable: true,
      render: (value: string) => (
        <Badge variant={getShipmentStatusBadgeVariant(value)}>
          {formatStatusLabel(value)}
        </Badge>
      ),
    },
  ];

  const getActionItems = (salesOrder: SalesOrder) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="inline-flex justify-center items-center w-7 h-7 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-200 focus:outline-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 12h.01M12 12h.01M19 12h.01" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewSalesOrder(salesOrder)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditSalesOrder(salesOrder)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicateSalesOrder(salesOrder)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        {["not_invoiced", "partial"].includes(salesOrder.invoiceStatus) && (
          <DropdownMenuItem onClick={() => handleInvoiceStatusChange(salesOrder, 'invoiced')}>
            <Receipt className="mr-2 h-4 w-4" />
            Create Invoice
          </DropdownMenuItem>
        )}
        {["invoiced", "partial"].includes(salesOrder.invoiceStatus) &&
          salesOrder.paymentStatus !== "paid" && (
          <DropdownMenuItem onClick={() => handlePaymentStatusChange(salesOrder, 'paid')}>
            <Wallet className="mr-2 h-4 w-4" />
            Record Payment
          </DropdownMenuItem>
        )}
        {salesOrder.shipmentStatus !== "shipped" && (
          <DropdownMenuItem onClick={() => handleShipmentStatusChange(salesOrder, 'shipped')}>
            <Truck className="mr-2 h-4 w-4" />
            Ship Items
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => handleDeleteSalesOrder(salesOrder)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
            <p className="text-muted-foreground">
              Manage your sales orders and track fulfillment
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div>Loading sales orders...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Orders</h1>
          <p className="text-muted-foreground">
            Manage your sales orders and track fulfillment
          </p>
        </div>
        <Button onClick={handleCreateSalesOrder}>
          <Plus className="mr-2 h-4 w-4" />
          New Sales Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales Orders</CardTitle>
          <CardDescription>
            A list of all your sales orders and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={salesOrders}
            columns={columns}
            searchPlaceholder="Search sales orders..."
            onRowClick={handleViewSalesOrder}
            actions={getActionItems}
          />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSalesOrder ? 'Edit Sales Order' : 'Create New Sales Order'}
            </DialogTitle>
            <DialogDescription>
              {editingSalesOrder 
                ? 'Update the sales order details below.'
                : 'Fill in the details to create a new sales order.'
              }
            </DialogDescription>
          </DialogHeader>
          <SalesOrderForm
            salesOrder={editingSalesOrder}
            onSave={handleSaveSalesOrder}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sales Order Details</DialogTitle>
          </DialogHeader>
          {selectedSalesOrder && (
            <SalesOrderView
              salesOrder={selectedSalesOrder}
              onClose={() => setIsViewOpen(false)}
              onEdit={() => {
                setIsViewOpen(false);
                handleEditSalesOrder(selectedSalesOrder);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {invoiceSalesOrder && (
        <CreateInvoiceDialog
          open={isCreateInvoiceOpen}
          onOpenChange={setIsCreateInvoiceOpen}
          salesOrder={invoiceSalesOrder}
          onInvoiceCreated={() => {
            loadSalesOrders();
            setIsCreateInvoiceOpen(false);
            setInvoiceSalesOrder(null);
          }}
        />
      )}

      {paymentSalesOrder && (
        <RecordPaymentDialog
          open={isRecordPaymentOpen}
          onOpenChange={setIsRecordPaymentOpen}
          salesOrder={paymentSalesOrder}
          onPaymentRecorded={() => {
            loadSalesOrders();
            setIsRecordPaymentOpen(false);
            setPaymentSalesOrder(null);
          }}
        />
      )}

      {shipmentSalesOrder && (
        <CreateShipmentDialog
          open={isCreateShipmentOpen}
          onOpenChange={setIsCreateShipmentOpen}
          salesOrder={shipmentSalesOrder}
          onShipmentCreated={() => {
            loadSalesOrders();
            setIsCreateShipmentOpen(false);
            setShipmentSalesOrder(null);
          }}
        />
      )}
    </div>
  );
}