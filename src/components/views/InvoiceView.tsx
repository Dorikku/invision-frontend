import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Separator } from '../../components/ui/separator';
import { Edit, Download } from 'lucide-react';
import type { Invoice } from '../../types';
import { useState } from 'react';
import RecordPaymentDialog from '../../components/forms/RecordPaymentDialog';
import { Wallet } from 'lucide-react';

interface InvoiceViewProps {
  invoice: Invoice;
  onClose: () => void;
  onEdit: () => void;
}

export default function InvoiceView({ invoice, onClose, onEdit }: InvoiceViewProps) {
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'unpaid': return 'secondary';
      case 'partial': return 'outline';
      case 'paid': return 'success';
      case 'overdue': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Invoice {invoice.invoiceNumber}</h2>
          <p className="text-muted-foreground">
            Created on {new Date(invoice.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(invoice.status)}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Download className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Invoice Number:</span>
              <span className="ml-2">{invoice.invoiceNumber}</span>
            </div>
            <div>
              <span className="font-medium">Invoice Date:</span>
              <span className="ml-2">{new Date(invoice.date).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Due Date:</span>
              <span className="ml-2">{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
            {/* <div>
              <span className="font-medium">Payment Terms:</span>
              <span className="ml-2">{invoice.paymentTerms}</span>
            </div> */}
            <div>
              <span className="font-medium">Status:</span>
              <Badge variant={getStatusBadgeVariant(invoice.status)} className="ml-2">
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span>
              <span className="ml-2">{invoice.customerName}</span>
            </div>
            <div>
              <span className="font-medium">Email:</span>
              <span className="ml-2">{invoice.customerEmail}</span>
            </div>
            <div>
              <span className="font-medium">Address:</span>
              <div className="mt-1 text-sm text-muted-foreground">
                {invoice.customerAddress}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">₱{item.unitPrice}</TableCell>
                  <TableCell className="text-right">{item.taxRate * 100}%</TableCell>
                  <TableCell className="text-right font-medium">₱{item.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₱{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₱{invoice.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₱{invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end space-x-2">
        {['unpaid', 'partial', 'overdue'].includes(invoice.status) && (
          <Button onClick={() => setIsRecordPaymentOpen(true)}>
            <Wallet className="mr-2 h-4 w-4" /> Record Payment
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <RecordPaymentDialog
        open={isRecordPaymentOpen}
        onOpenChange={setIsRecordPaymentOpen}
        invoice={invoice}              // ✅ pass invoice directly
        onPaymentRecorded={() => {
          setIsRecordPaymentOpen(false);
          // optional: trigger parent refresh if you pass it down
        }}
      />
    </div>

    
  );
}