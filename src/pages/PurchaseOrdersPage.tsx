import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Copy, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DataTable } from '../components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getPurchaseOrders, savePurchaseOrders, updateCounter } from '../lib/storage';
import type { PurchaseOrder } from '../types';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingPurchaseOrder, setEditingPurchaseOrder] = useState<PurchaseOrder | null>(null);

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = () => {
    const data = getPurchaseOrders();
    setPurchaseOrders(data);
  };

  const handleCreatePurchaseOrder = () => {
    setEditingPurchaseOrder(null);
    setIsFormOpen(true);
  };

  const handleEditPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setEditingPurchaseOrder(purchaseOrder);
    setIsFormOpen(true);
  };

  const handleViewPurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    setSelectedPurchaseOrder(purchaseOrder);
    setIsViewOpen(true);
  };

  const handleDuplicatePurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    const newPurchaseOrder: PurchaseOrder = {
      ...purchaseOrder,
      id: Date.now().toString(),
      poNumber: updateCounter('purchaseOrder'),
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allPurchaseOrders = getPurchaseOrders();
    const updatedPurchaseOrders = [newPurchaseOrder, ...allPurchaseOrders];
    savePurchaseOrders(updatedPurchaseOrders);
    loadPurchaseOrders();
    toast.success('Purchase order duplicated successfully');
  };

  const handleDeletePurchaseOrder = (purchaseOrder: PurchaseOrder) => {
    if (window.confirm('Are you sure you want to delete this purchase order?')) {
      const allPurchaseOrders = getPurchaseOrders();
      const updatedPurchaseOrders = allPurchaseOrders.filter(po => po.id !== purchaseOrder.id);
      savePurchaseOrders(updatedPurchaseOrders);
      loadPurchaseOrders();
      toast.success('Purchase order deleted successfully');
    }
  };

  const handleStatusChange = (purchaseOrder: PurchaseOrder, newStatus: PurchaseOrder['status']) => {
    const allPurchaseOrders = getPurchaseOrders();
    const updatedPurchaseOrders = allPurchaseOrders.map(po => 
      po.id === purchaseOrder.id 
        ? { ...po, status: newStatus, updatedAt: new Date().toISOString() }
        : po
    );
    savePurchaseOrders(updatedPurchaseOrders);
    loadPurchaseOrders();
    toast.success(`Purchase order status updated to ${newStatus}`);
  };

  const handleSavePurchaseOrder = (purchaseOrderData: Partial<PurchaseOrder>) => {
    const allPurchaseOrders = getPurchaseOrders();
    
    if (editingPurchaseOrder) {
      const updatedPurchaseOrders = allPurchaseOrders.map(po =>
        po.id === editingPurchaseOrder.id
          ? { ...po, ...purchaseOrderData, updatedAt: new Date().toISOString() }
          : po
      );
      savePurchaseOrders(updatedPurchaseOrders);
      toast.success('Purchase order updated successfully');
    } else {
      const newPurchaseOrder: PurchaseOrder = {
        id: Date.now().toString(),
        poNumber: updateCounter('purchaseOrder'),
        ...purchaseOrderData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as PurchaseOrder;
      
      const updatedPurchaseOrders = [newPurchaseOrder, ...allPurchaseOrders];
      savePurchaseOrders(updatedPurchaseOrders);
      toast.success('Purchase order created successfully');
    }
    
    loadPurchaseOrders();
    setIsFormOpen(false);
    setEditingPurchaseOrder(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'outline';
      case 'confirmed': return 'default';
      case 'received': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const columns = [
    {
      key: 'poNumber',
      label: 'PO Number',
      sortable: true,
    },
    {
      key: 'supplierName',
      label: 'Supplier',
      sortable: true,
    },
    {
      key: 'date',
      label: 'Order Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'deliveryDate',
      label: 'Delivery Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => (
        <Badge variant={getStatusBadgeVariant(value)}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Badge>
      ),
    },
  ];

  const getActionItems = (purchaseOrder: PurchaseOrder) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewPurchaseOrder(purchaseOrder)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditPurchaseOrder(purchaseOrder)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicatePurchaseOrder(purchaseOrder)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        {purchaseOrder.status === 'draft' && (
          <DropdownMenuItem onClick={() => handleStatusChange(purchaseOrder, 'sent')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Send to Supplier
          </DropdownMenuItem>
        )}
        {purchaseOrder.status === 'sent' && (
          <DropdownMenuItem onClick={() => handleStatusChange(purchaseOrder, 'confirmed')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Confirmed
          </DropdownMenuItem>
        )}
        {purchaseOrder.status === 'confirmed' && (
          <DropdownMenuItem onClick={() => handleStatusChange(purchaseOrder, 'received')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Received
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          onClick={() => handleDeletePurchaseOrder(purchaseOrder)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage your purchase orders and supplier relationships
          </p>
        </div>
        <Button onClick={handleCreatePurchaseOrder}>
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Purchase Orders</CardTitle>
          <CardDescription>
            A list of all your purchase orders and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={purchaseOrders}
            columns={columns}
            searchPlaceholder="Search purchase orders..."
            onRowClick={handleViewPurchaseOrder}
            actions={getActionItems}
          />
        </CardContent>
      </Card>
    </div>
  );
}