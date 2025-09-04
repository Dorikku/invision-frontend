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
import type { SalesOrder, LineItem } from '../../types';

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
  invoicedQuantity: number;
  remainingQuantity: number;
}

export default function CreateInvoiceDialog({ open, onOpenChange, salesOrder, onInvoiceCreated }: CreateInvoiceDialogProps) {
  const [mode, setMode] = useState<Mode>('choice');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>(salesOrder.notes || '');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const fetchInvoicedQuantities = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/v1/sales-orders/${salesOrder.id}/invoiced-quantities`);
          if (!response.ok) {
            throw new Error('Failed to fetch invoiced quantities');
          }
          const invoicedQuantities = await response.json();
          
          const newSelectedItems = salesOrder.items.map(item => {
            const invoicedQty = invoicedQuantities.find((iq: { soItemId: string; quantity: number }) => Number(iq.soItemId) === Number(item.id))?.quantity || 0;
            return {
              original: item,
              selected: false,
              quantity: 0,
              invoicedQuantity: invoicedQty,
              remainingQuantity: item.quantity - invoicedQty,
            };
          });
          
          setSelectedItems(newSelectedItems);
          setMode('choice');
          setInvoiceDate(new Date().toISOString().split('T')[0]);
          setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
          setNotes(salesOrder.notes || '');
          setSubtotal(0);
          setTax(0);
          setTotal(0);
        } catch (error) {
          console.error('Error fetching invoiced quantities:', error);
          toast.error('Failed to load invoiced quantities');
        } finally {
          setLoading(false);
        }
      };
      
      fetchInvoicedQuantities();
    }
  }, [open, salesOrder]);

  const calculateTotals = (items: SelectedItem[]) => {
    const newSubtotal = items.reduce((sum, si) => {
      return sum + (si.selected ? si.quantity * si.original.unitPrice : 0);
    }, 0);
    const newTax = items.reduce((sum, si) => {
      return sum + (si.selected ? (si.quantity * si.original.unitPrice) * (si.original.taxRate) : 0);
    }, 0);
    const newTotal = newSubtotal + newTax;
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  };

  const handleItemSelect = (index: number, selected: boolean) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems[index].selected = selected;
    newSelectedItems[index].quantity = selected ? newSelectedItems[index].remainingQuantity : 0;
    setSelectedItems(newSelectedItems);
    calculateTotals(newSelectedItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newSelectedItems = [...selectedItems];
    const maxQty = newSelectedItems[index].remainingQuantity;
    newSelectedItems[index].quantity = Math.max(0, Math.min(qty, maxQty));
    if (newSelectedItems[index].quantity > 0) {
      newSelectedItems[index].selected = true;
    } else {
      newSelectedItems[index].selected = false;
    }
    setSelectedItems(newSelectedItems);
    calculateTotals(newSelectedItems);
  };

  const createInvoice = async (itemsToInvoice: { soItemId: number; quantity: number }[]) => {
    try {
      const payload = {
        salesOrderId: salesOrder.id,
        date: invoiceDate,
        dueDate: dueDate,
        notes: notes,
        items: itemsToInvoice,
      };

      const response = await fetch('http://127.0.0.1:8000/api/v1/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create invoice');
      }

      toast.success('Invoice created successfully');
      onInvoiceCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    }
  };

  const handleInvoiceAll = () => {
    const itemsToInvoice = salesOrder.items.map(item => ({
      soItemId: parseInt(item.id),
      quantity: item.quantity - (selectedItems.find(si => si.original.id === item.id)?.invoicedQuantity || 0),
    })).filter(item => item.quantity > 0);
    createInvoice(itemsToInvoice);
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
        soItemId: parseInt(si.original.id),
        quantity: si.quantity,
      }));

    createInvoice(itemsToInvoice);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
            <DialogDescription>Loading invoiced quantities...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

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
              Invoice All Remaining Line-Items
            </Button>
            <Button onClick={() => setMode('partial')} variant="outline">
              Pick and Choose Line-Items and Quantities
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
          <div className="grid gap-4 md:grid-cols-2">
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
          </div>

          <div>
            <Label>Items to Invoice</Label>
            <div className="mt-2 border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                <div className="col-span-1"></div>
                <div className="col-span-3">Product</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Quantity (Remaining)</div>
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
                      disabled={si.remainingQuantity === 0}
                    />
                  </div>
                  <div className="col-span-3 font-medium">{si.original.productName}</div>
                  <div className="col-span-3 text-muted-foreground">{si.original.description || '-'}</div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      max={si.remainingQuantity}
                      value={si.quantity}
                      onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                      disabled={!si.selected || si.remainingQuantity === 0}
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground ml-2">
                      (remaining {si.remainingQuantity}, invoiced {si.invoicedQuantity})
                    </span>
                  </div>
                  <div className="col-span-1">₱{si.original.unitPrice.toFixed(2)}</div>
                  <div className="col-span-2 text-right">₱{(si.quantity * si.original.unitPrice).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₱{tax.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span>₱{total.toFixed(2)}</span>
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
