import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { getInvoices, saveInvoices, updateCounter, getSalesOrders, saveSalesOrders } from '../../lib/storage';
import type { SalesOrder, Invoice, LineItem } from '../../types';

interface CreateInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrder: SalesOrder;
  onInvoiceCreated: () => void;
}

type Mode = 'choice' | 'partial';

interface SelectedItem {
  original: LineItem;
  selected: boolean;
  quantity: number;
}

export default function CreateInvoiceDialog({ open, onOpenChange, salesOrder, onInvoiceCreated }: CreateInvoiceDialogProps) {
  const [mode, setMode] = useState<Mode>('choice');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30');
  const [notes, setNotes] = useState<string>(salesOrder.notes || '');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setMode('choice');
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setPaymentTerms('Net 30');
      setNotes(salesOrder.notes || '');
      setSelectedItems(salesOrder.items.map(item => ({
        original: item,
        selected: false,
        quantity: 0,
      })));
      setSubtotal(0);
      setTax(0);
      setTotal(0);
    }
  }, [open, salesOrder]);

  const calculateTotals = (items: SelectedItem[]) => {
    const newSubtotal = items.reduce((sum, si) => si.selected ? si.quantity * si.original.unitPrice : 0, 0);
    const newTax = newSubtotal * salesOrder.taxRate / 100;
    const newTotal = newSubtotal + newTax;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  };

  const handleItemSelect = (index: number, selected: boolean) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems[index].selected = selected;
    newSelectedItems[index].quantity = selected ? newSelectedItems[index].original.quantity : 0;
    setSelectedItems(newSelectedItems);
    calculateTotals(newSelectedItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newSelectedItems = [...selectedItems];
    const maxQty = newSelectedItems[index].original.quantity;
    newSelectedItems[index].quantity = Math.max(0, Math.min(qty, maxQty));
    if (newSelectedItems[index].quantity > 0) {
      newSelectedItems[index].selected = true;
    } else {
      newSelectedItems[index].selected = false;
    }
    setSelectedItems(newSelectedItems);
    calculateTotals(newSelectedItems);
  };

    const createInvoice = (isFull: boolean, itemsToInvoice: LineItem[]) => {
        const now = new Date().toISOString();
        const newInvoice: Invoice = {
            id: Date.now().toString(),
            invoiceNumber: updateCounter('invoice'),
            salesOrderId: salesOrder.id,
            customerId: salesOrder.customerId,
            customerName: salesOrder.customerName,
            customerEmail: salesOrder.customerEmail,
            customerAddress: salesOrder.customerAddress,
            date: invoiceDate,
            dueDate: dueDate,
            items: itemsToInvoice.map((item) => ({ ...item, shippedQuantity: 0 })),
            subtotal: isFull ? salesOrder.subtotal : subtotal,
            tax: isFull ? salesOrder.tax : tax,
            taxRate: salesOrder.taxRate,
            total: isFull ? salesOrder.total : total,
            status: 'draft' as const,
            paidAmount: 0,
            paymentTerms: paymentTerms,
            notes: notes,
            createdAt: now,
            updatedAt: now,
        };

    const allInvoices = getInvoices();
    saveInvoices([newInvoice, ...allInvoices]);

    const allSalesOrders = getSalesOrders();
    const updatedSalesOrders: SalesOrder[] = allSalesOrders.map((so) => {
        if (so.id === salesOrder.id) {
        let newInvoiceStatus: SalesOrder['invoiceStatus'];
        if (isFull) {
            newInvoiceStatus = 'invoiced';
        } else {
            const isFullyInvoiced = selectedItems.every((si) => si.quantity === si.original.quantity);
            newInvoiceStatus = isFullyInvoiced ? 'invoiced' : 'partially_invoiced';
        }
        return { ...so, invoiceStatus: newInvoiceStatus, updatedAt: now };
        }
        return so;
    });
    saveSalesOrders(updatedSalesOrders);

    toast.success('Invoice created successfully');
    onInvoiceCreated();
    onOpenChange(false);
    };

  const handleInvoiceAll = () => {
    const itemsToInvoice = salesOrder.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice,
      taxAmount: (item.quantity * item.unitPrice) * (salesOrder.taxRate / 100),
    }));
    createInvoice(true, itemsToInvoice);
  };

  const handlePartialSubmit = () => {
    const selectedCount = selectedItems.filter(si => si.selected && si.quantity > 0).length;
    if (selectedCount === 0) {
      toast.error('Please select at least one item to invoice.');
      return;
    }

    const itemsToInvoice = selectedItems
      .filter(si => si.selected && si.quantity > 0)
      .map(si => ({
        id: Date.now().toString() + Math.random().toString(),
        productId: si.original.productId,
        productName: si.original.productName,
        description: si.original.description,
        quantity: si.quantity,
        unitPrice: si.original.unitPrice,
        total: si.quantity * si.original.unitPrice,
        taxAmount: (si.quantity * si.original.unitPrice) * (salesOrder.taxRate / 100),
        shippedQuantity: 0,
      }));

    createInvoice(false, itemsToInvoice);
  };

  if (mode === 'choice') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>
              Choose how you want to create the invoice for sales order {salesOrder.orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={handleInvoiceAll}>
              Invoice All Line-Items
            </Button>
            <Button onClick={() => setMode('partial')} variant="outline">
              Pick and Choose Line-Items and Quantities
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Partial mode form
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Partial Invoice</DialogTitle>
          <DialogDescription>
            Select items and adjust quantities to invoice from sales order {salesOrder.orderNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Invoice Details */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input
                id="invoiceDate"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Input
                id="paymentTerms"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
              />
            </div>
          </div>

          {/* Items Selection */}
          <div>
            <Label>Items to Invoice</Label>
            <div className="mt-2 border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                <div className="col-span-1"></div>
                <div className="col-span-3">Product</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Quantity (Max)</div>
                <div className="col-span-1">Unit Price</div>
                <div className="col-span-2 text-right">Line Total</div>
              </div>
              <Separator />
              {selectedItems.map((si, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      checked={si.selected}
                      onCheckedChange={(checked) => handleItemSelect(index, checked as boolean)}
                    />
                  </div>
                  <div className="col-span-3 font-medium">{si.original.productName}</div>
                  <div className="col-span-3 text-muted-foreground">{si.original.description || '-'}</div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      max={si.original.quantity}
                      value={si.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                      disabled={!si.selected}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground ml-2">(max {si.original.quantity})</span>
                  </div>
                  <div className="col-span-1">${si.original.unitPrice.toFixed(2)}</div>
                  <div className="col-span-2 text-right">${(si.quantity * si.original.unitPrice).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({salesOrder.taxRate}%):</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setMode('choice')}>Back to Choice</Button>
          <Button onClick={handlePartialSubmit}>Create Invoice</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}