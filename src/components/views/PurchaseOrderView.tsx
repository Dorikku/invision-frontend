import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Edit, Printer, Mail, Package, CircleX } from 'lucide-react';
import type { PurchaseOrder } from '../../types';

interface PurchaseOrderViewProps {
  purchaseOrder: PurchaseOrder;
  onClose: () => void;
  onEdit: () => void;
  onReceive: () => void;
}

export default function PurchaseOrderView({
  purchaseOrder,
  onClose,
  onEdit,
  onReceive,
}: PurchaseOrderViewProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'primary';
      case 'partially_received':
        return 'secondary';
      case 'fully_received':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatStatusText = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    alert('Email functionality would be implemented here');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{purchaseOrder.poNumber}</h2>
          <p className="text-muted-foreground">
            Created on {new Date(purchaseOrder.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusBadgeVariant(purchaseOrder.status)}>
            {formatStatusText(purchaseOrder.status)}
          </Badge>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleSendEmail}>
            <Mail className="mr-2 h-4 w-4" /> Email
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
          
        </div>
      </div>

      {/* Order + Supplier Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">PO Number:</span> {purchaseOrder.poNumber}
            </div>
            <div>
              <span className="font-medium">Date:</span>{' '}
              {new Date(purchaseOrder.date).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Status:</span>{' '}
              <Badge variant={getStatusBadgeVariant(purchaseOrder.status)}>
                {formatStatusText(purchaseOrder.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="font-medium">Name:</span> {purchaseOrder.supplierName}
            </div>
            {purchaseOrder.supplierContactPerson && (
              <div>
                <span className="font-medium">Contact Person:</span>{' '}
                {purchaseOrder.supplierContactPerson}
              </div>
            )}
            {purchaseOrder.supplierEmail && (
              <div>
                <span className="font-medium">Email:</span> {purchaseOrder.supplierEmail}
              </div>
            )}
            {purchaseOrder.supplierAddress && (
              <div>
                <span className="font-medium">Address:</span>
                <div className="mt-1 text-sm text-muted-foreground whitespace-pre-line">
                  {purchaseOrder.supplierAddress}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
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
              {purchaseOrder.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{item.quantityOrdered}</TableCell>
                  <TableCell className="text-right">₱ {item.unitPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{(item.taxRate * 100).toFixed(0)}%</TableCell>
                  <TableCell className="text-right font-medium">₱ {item.lineTotal}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          {/* Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₱ {purchaseOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₱ {purchaseOrder.tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>₱ {purchaseOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {purchaseOrder.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {purchaseOrder.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Close Button */}
      <div className="flex justify-end gap-2">
        <Button onClick={onReceive}>
            <Package className="mr-2 h-4 w-4" /> Receive Items
        </Button>
        <Button variant="outline" onClick={onClose}>
          <CircleX className="mr-2 h-4 w-4" />
          Close
        </Button>
      </div>
    </div>
  );
}
