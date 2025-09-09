import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Copy, Trash2, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { DataTable } from '../components/ui/data-table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { getQuotations, saveQuotations, updateCounter } from '../lib/storage';
import type { Quotation } from '../types';
import QuotationForm from '../components/forms/QuotationForm';
import QuotationView from '../components/views/QuotationView';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = () => {
    const data = getQuotations();
    setQuotations(data);
  };

  const handleCreateQuotation = () => {
    setEditingQuotation(null);
    setIsFormOpen(true);
  };

  const handleEditQuotation = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setIsFormOpen(true);
  };

  const handleViewQuotation = (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setIsViewOpen(true);
  };

  const handleDuplicateQuotation = (quotation: Quotation) => {
    const newQuotation: Quotation = {
      ...quotation,
      id: Date.now().toString(),
      quotationNumber: updateCounter('quotation'),
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allQuotations = getQuotations();
    const updatedQuotations = [newQuotation, ...allQuotations];
    saveQuotations(updatedQuotations);
    loadQuotations();
    toast.success('Quotation duplicated successfully');
  };

  const handleDeleteQuotation = (quotation: Quotation) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      const allQuotations = getQuotations();
      const updatedQuotations = allQuotations.filter(q => q.id !== quotation.id);
      saveQuotations(updatedQuotations);
      loadQuotations();
      toast.success('Quotation deleted successfully');
    }
  };

  const handleStatusChange = (quotation: Quotation, newStatus: Quotation['status']) => {
    const allQuotations = getQuotations();
    const updatedQuotations = allQuotations.map(q => 
      q.id === quotation.id 
        ? { ...q, status: newStatus, updatedAt: new Date().toISOString() }
        : q
    );
    saveQuotations(updatedQuotations);
    loadQuotations();
    toast.success(`Quotation status updated to ${newStatus}`);
  };

  const handleSaveQuotation = (quotationData: Partial<Quotation>) => {
    const allQuotations = getQuotations();
    
    if (editingQuotation) {
      const updatedQuotations = allQuotations.map(q =>
        q.id === editingQuotation.id
          ? { ...q, ...quotationData, updatedAt: new Date().toISOString() }
          : q
      );
      saveQuotations(updatedQuotations);
      toast.success('Quotation updated successfully');
    } else {
      const newQuotation: Quotation = {
        id: Date.now().toString(),
        quotationNumber: updateCounter('quotation'),
        ...quotationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Quotation;
      
      const updatedQuotations = [newQuotation, ...allQuotations];
      saveQuotations(updatedQuotations);
      toast.success('Quotation created successfully');
    }
    
    loadQuotations();
    setIsFormOpen(false);
    setEditingQuotation(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'outline';
      case 'accepted': return 'default';
      case 'rejected': return 'destructive';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  const columns = [
    {
      key: 'quotationNumber',
      label: 'Quote #',
      sortable: true,
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'validUntil',
      label: 'Valid Until',
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

  const getActionItems = (quotation: Quotation) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleViewQuotation(quotation)}>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleEditQuotation(quotation)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDuplicateQuotation(quotation)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        {quotation.status === 'draft' && (
          <DropdownMenuItem onClick={() => handleStatusChange(quotation, 'sent')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Send to Customer
          </DropdownMenuItem>
        )}
        {quotation.status === 'sent' && (
          <>
            <DropdownMenuItem onClick={() => handleStatusChange(quotation, 'accepted')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Accepted
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(quotation, 'rejected')}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Rejected
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem 
          onClick={() => handleDeleteQuotation(quotation)}
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
          <h1 className="text-3xl font-bold tracking-tight">Quotations</h1>
          <p className="text-muted-foreground">
            Create and manage your quotations and proposals
          </p>
        </div>
        <Button onClick={handleCreateQuotation}>
          <Plus className="mr-2 h-4 w-4" />
          New Quotation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Quotations</CardTitle>
          <CardDescription>
            A list of all your quotations and their current status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={quotations}
            columns={columns}
            searchPlaceholder="Search quotations..."
            onRowClick={handleViewQuotation}
            actions={getActionItems}
          />
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuotation ? 'Edit Quotation' : 'Create New Quotation'}
            </DialogTitle>
            <DialogDescription>
              {editingQuotation 
                ? 'Update the quotation details below.'
                : 'Fill in the details to create a new quotation.'
              }
            </DialogDescription>
          </DialogHeader>
          <QuotationForm
            quotation={editingQuotation}
            onSave={handleSaveQuotation}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <QuotationView
            quotation={selectedQuotation}
            onEdit={() => {
              setIsViewOpen(false);
              if (selectedQuotation) {
                handleEditQuotation(selectedQuotation);
              }
            }}
            onClose={() => setIsViewOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}