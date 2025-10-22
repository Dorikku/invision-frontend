import { useState, useEffect, useRef } from 'react';
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
import PrintableInvoice from '../components/prints/PrintableInvoice'; // Add this import
import { useReactToPrint } from 'react-to-print'; // Install: npm install react-to-print
import { Input } from '@/components/ui/input';
import { useAuth } from "../auth/AuthContext";


const API_URL = import.meta.env.VITE_API_URL;

// Mock API functions
const fetchInvoices = async (): Promise<Invoice[]> => {
  const response = await fetch(`${API_URL}/invoices`);
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  return response.json();
};

const deleteInvoiceAPI = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/invoices/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete invoice');
  }
};

const sendInvoiceAPI = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
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
  const [mode, setMode] = useState<"so" | "standalone" | null>(null);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth(); // 👈 Get logged-in user
  const isSales = user?.role === "Sales"; // 👈 Check if role is "Sales"

  // Company information - you can move this to a config file or fetch from API
  const companyInfo = {
    name: 'PENTAMAX ELECTRICAL SUPPLY',
    address: 'Arty 1 Subd. Brgy. Talipapa Novaliches Quezon City',
    phone: '0916 453 8406',
    email: 'pentamaxelectrical@gmail.com',
    website: 'www.pentamax.com',
    registrationNumber: '314-359-848-00000',
    logo: '3.png' // Add your company logo path
  };

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
    setMode(null);
    setIsFormOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    if (invoice.status === "paid") {
      toast.error("Paid invoices cannot be edited.");
      return;
    }
    setEditingInvoice(invoice);
    setMode(invoice.salesOrderId ? "so" : "standalone");
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
      toast.success(`Invoice ${invoice.invoiceNumber} sent to customer`);
    } catch (error) {
      console.error('Failed to send invoice:', error);
      toast.error('Failed to send invoice');
    }
  };

  const handlePrintInvoice = (invoice: Invoice) => {
    setInvoiceToPrint(invoice);
    setIsPrintDialogOpen(true);
  };

  // Using useReactToPrint hook
  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Invoice-${invoiceToPrint?.invoiceNumber || ''}`,
    onAfterPrint: () => {
      setIsPrintDialogOpen(false);
      toast.success('Invoice printed successfully');
    },
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      unpaid: 'destructive',
      partial: 'secondary',
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
      render: (value: number | null) =>
        value != null ? `₱${value.toLocaleString()}` : "—",
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value: string) => getStatusBadge(value),
    },
  ];

  const getActionItems = (invoice: Invoice) => {
    const handleEditClick = (inv: Invoice) => {
      if (inv.status === "paid" || inv.status == "partial") {
        toast.error("Editing is not available for paid invoices.");
        return;
      }
      handleEditInvoice(inv);
    };

    if (isSales) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex justify-center items-center w-7 h-7 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-200 focus:outline-none"
            >
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
            <DropdownMenuItem onClick={() => handlePrintInvoice(invoice)}>
              <FileText className="mr-2 h-4 w-4" />
              Print
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="inline-flex justify-center items-center w-7 h-7 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-200 focus:outline-none"
          >
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
          <DropdownMenuItem onClick={() => handleEditClick(invoice)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSendInvoice(invoice)}>
            <Mail className="mr-2 h-4 w-4" />
            Send
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePrintInvoice(invoice)}>
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
  };

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
        {!isSales && (
          <Button onClick={handleCreateInvoice}>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        )}
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
            <CardTitle className="text-sm font-medium">Unpaid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {invoices.filter(i => i.status === 'unpaid').length}
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

          <DataTable
            data={invoices}
            columns={columns}
            searchTerm={searchTerm}
            onRowClick={handleViewInvoice}
            actions={getActionItems}
          />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent
          className={`${!mode ? "max-w-md" : "max-w-4xl"} max-h-[90vh] overflow-y-auto`}
        >
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Edit Invoice" : "New Invoice"}
            </DialogTitle>
            <DialogDescription>
              {editingInvoice ? "Update the invoice details." : "Create a new invoice."}
            </DialogDescription>
          </DialogHeader>

          {!mode ? (
            <div className="flex flex-col gap-4 py-4">
              <Button onClick={() => setMode("so")}>From Sales Order</Button>
              <Button onClick={() => setMode("standalone")} variant="outline">
                Standalone
              </Button>
            </div>
          ) : (
            <InvoiceForm
              mode={mode}
              invoice={editingInvoice}
              onInvoiceCreated={() => {
                setIsFormOpen(false);
                loadInvoices();
              }}
              onCancel={() => setIsFormOpen(false)}
            />
          )}
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
                setIsViewOpen(false);
                handleEditInvoice(selectedInvoice);
              }}
              onUpdated={loadInvoices}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Print Invoice</DialogTitle>
            <DialogDescription>
              Preview your invoice before printing
            </DialogDescription>
          </DialogHeader>
          
          {invoiceToPrint && (
            <div>
              <div className="mb-4 flex justify-end space-x-2 no-print">
                <Button onClick={handlePrint}>
                  <FileText className="mr-2 h-4 w-4" />
                  Print Invoice
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsPrintDialogOpen(false)}
                >
                  Cancel
                </Button>
              </div>
              
              {/* Printable Invoice Component */}
              <div className="border rounded-lg">
                <PrintableInvoice
                  ref={printRef}
                  invoice={invoiceToPrint as any}
                  companyInfo={companyInfo}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}