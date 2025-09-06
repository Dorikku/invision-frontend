import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, FileText, Mail, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { DataTable } from '../components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import type { Invoice } from '../types';
import InvoiceForm from '../components/forms/InvoiceForm';
import InvoiceView from '../components/views/InvoiceView';
import { Input } from '@/components/ui/input';


// Mock API functions
const fetchInvoices = async (): Promise<Invoice[]> => {
  // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 500));
  
  const response = await fetch('http://127.0.0.1:8000/api/v1/invoices');
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  return response.json();

  // console.log('Fetched invoices:', dummyInvoices);
  // return dummyInvoices;
};

const deleteInvoiceAPI = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In a real application, this would be:
  // await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
  
  console.log(`Deleted invoice ${id}`);
};

const sendInvoiceAPI = async (id: string): Promise<void> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // In a real application, this would be:
  // await fetch(`/api/invoices/${id}/send`, { method: 'POST' });
  
  console.log(`Sent invoice ${id}`);
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await fetchInvoices();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsFormOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsViewOpen(true);
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await deleteInvoiceAPI(invoice.id);
        // Remove from local state
        setInvoices(prev => prev.filter(i => i.id !== invoice.id));
        toast.success('Invoice deleted successfully');
      } catch (error) {
        console.error('Failed to delete invoice:', error);
        toast.error('Failed to delete invoice');
      }
    }
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    try {
      await sendInvoiceAPI(invoice.id);
      // Update local state to reflect sent status
      setInvoices(prev => prev.map(i => 
        i.id === invoice.id ? { ...i, status: 'sent' } : i
      ));
      toast.success(`Invoice ${invoice.invoiceNumber} sent to customer`);
    } catch (error) {
      console.error('Failed to send invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      unpaid: 'secondary',
      partial: 'default',
      paid: 'success',
      overdue: 'destructive',
      cancelled: 'outline',
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice #',
      sortable: true,
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'date',
      label: 'Issue Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (value: number) => `₱${value.toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
  ];

  const getActionItems = (invoice: Invoice) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="inline-flex justify-center items-center w-7 h-7 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-200 focus:outline-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 12h.01M12 12h.01M19 12h.01" />
          </svg>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleSendInvoice(invoice)}
          disabled={invoice.status === 'sent' || invoice.status === 'paid'}
        >
          <Mail className="mr-2 h-4 w-4" />
          Send
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.print()}>
          <FileText className="mr-2 h-4 w-4" />
          Print
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleDeleteInvoice(invoice)}
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
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading invoices...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground">
            Manage your invoices and billing
          </p>
        </div>
        <Button onClick={handleCreateInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter(i => i.status === 'paid').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {invoices.filter(i => i.status === 'sent').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {invoices.filter(i => i.status === 'overdue').length}
            </div>
          </CardContent>
        </Card>
      </div>


      <Card>
        <CardContent className="pt-5">
          {/* 🔎 Search bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* 📊 DataTable */}
          <DataTable
            data={invoices}
            columns={columns}
            searchTerm={searchTerm} // 👈 pass search term into DataTable
            onRowClick={handleViewInvoice}
            actions={getActionItems}
          />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'New Invoice'}</DialogTitle>
            <DialogDescription>
              {editingInvoice ? 'Update the invoice details.' : 'Create a new invoice.'}
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm
            invoice={editingInvoice}
            onSave={() => {
              setIsFormOpen(false);
              loadInvoices();
              toast.success(`Invoice ${editingInvoice ? 'updated' : 'created'} successfully`);
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <InvoiceView 
              invoice={selectedInvoice} 
              onClose={() => setIsViewOpen(false)}
              onEdit={() => {
                // set(selectedInvoice);
                // setIsFormOpen(true);
                setIsViewOpen(false);
                handleEditInvoice(selectedInvoice);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}