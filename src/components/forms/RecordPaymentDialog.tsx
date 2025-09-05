import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Card, CardContent } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { getInvoices, saveInvoices, getSalesOrders, saveSalesOrders } from '../../lib/storage';
import type { SalesOrder, Invoice } from '../../types';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrder: SalesOrder;
  onPaymentRecorded: () => void;
}

type Mode = 'choice' | 'partial';

interface PaymentItem {
  invoice: Invoice;
  selected: boolean;
  paymentAmount: number;
}

export default function RecordPaymentDialog({ open, onOpenChange, salesOrder, onPaymentRecorded }: RecordPaymentDialogProps) {
  const [mode, setMode] = useState<Mode>('choice');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [totalPayment, setTotalPayment] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setMode('choice');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('credit_card');
      setPaymentReference('');
      setNotes('');
      const invoices = getInvoices().filter(
        (inv) => inv.salesOrderId === salesOrder.id && inv.status !== 'paid' && inv.status !== 'cancelled'
      );
      setPaymentItems(
        invoices.map((inv) => ({
          invoice: inv,
          selected: false,
          paymentAmount: 0,
        }))
      );
      setTotalPayment(0);
    }
  }, [open, salesOrder]);

  const calculateOutstandingBalance = (invoice: Invoice) => {
    return invoice.total - (invoice.paidAmount || 0);
  };

  const calculateTotalPayment = (items: PaymentItem[]) => {
    const total = items.reduce((sum, item) => (item.selected ? item.paymentAmount : 0), 0);
    setTotalPayment(total);
  };

  const handleItemSelect = (index: number, selected: boolean) => {
    const newPaymentItems = [...paymentItems];
    newPaymentItems[index].selected = selected;
    newPaymentItems[index].paymentAmount = selected ? calculateOutstandingBalance(newPaymentItems[index].invoice) : 0;
    setPaymentItems(newPaymentItems);
    calculateTotalPayment(newPaymentItems);
  };

  const handlePaymentAmountChange = (index: number, amount: number) => {
    const newPaymentItems = [...paymentItems];
    const maxAmount = calculateOutstandingBalance(newPaymentItems[index].invoice);
    newPaymentItems[index].paymentAmount = Math.max(0, Math.min(amount, maxAmount));
    newPaymentItems[index].selected = newPaymentItems[index].paymentAmount > 0;
    setPaymentItems(newPaymentItems);
    calculateTotalPayment(newPaymentItems);
  };

  const handleRecordFullPayment = () => {
    const invoices = getInvoices().filter(
      (inv) => inv.salesOrderId === salesOrder.id && inv.status !== 'paid' && inv.status !== 'cancelled'
    );
    const updatedInvoices: Invoice[] = invoices.map((inv) => ({
      ...inv,
      paidAmount: (inv.paidAmount || 0) + calculateOutstandingBalance(inv),
      status: 'paid' as const, // Explicitly cast to literal type
      updatedAt: new Date().toISOString(),
    }));
    saveInvoices([...getInvoices().filter((inv) => inv.salesOrderId !== salesOrder.id), ...updatedInvoices]);

    const allSalesOrders = getSalesOrders();
    const updatedSalesOrders: SalesOrder[] = allSalesOrders.map((so) =>
      so.id === salesOrder.id
        ? {
            ...so,
            paymentStatus: 'paid' as const, // Explicitly cast to literal type
            updatedAt: new Date().toISOString(),
          }
        : so
    );
    saveSalesOrders(updatedSalesOrders);

    toast.success('Full payment recorded successfully');
    onPaymentRecorded();
    onOpenChange(false);
  };

  const handleRecordPartialPayment = () => {
    const selectedItems = paymentItems.filter((item) => item.selected && item.paymentAmount > 0);
    if (selectedItems.length === 0) {
      toast.error('Please select at least one invoice and enter a valid payment amount.');
      return;
    }

    const invoices = getInvoices();
    const updatedInvoices: Invoice[] = invoices.map((inv) => {
      const paymentItem = selectedItems.find((item) => item.invoice.id === inv.id);
      if (paymentItem) {
        const newPaidAmount = (inv.paidAmount || 0) + paymentItem.paymentAmount;
        const outstanding = inv.total - newPaidAmount;
        const newStatus: Invoice['status'] =
          outstanding <= 0 ? 'paid' : inv.status === 'draft' ? 'draft' : 'sent'; // Maintain 'draft' if not sent, else 'sent'
        return { ...inv, paidAmount: newPaidAmount, status: newStatus, updatedAt: new Date().toISOString() };
      }
      return inv;
    });
    saveInvoices(updatedInvoices);

    const allSalesOrders = getSalesOrders();
    const allInvoices = updatedInvoices.filter((inv) => inv.salesOrderId === salesOrder.id);
    const allInvoicesPaid = allInvoices.every((inv) => inv.status === 'paid' || inv.status === 'cancelled');
    const updatedSalesOrders: SalesOrder[] = allSalesOrders.map((so) =>
      so.id === salesOrder.id
        ? {
            ...so,
            paymentStatus: allInvoicesPaid ? 'paid' : 'partial' as const, // Explicitly cast to literal type
            updatedAt: new Date().toISOString(),
          }
        : so
    );
    saveSalesOrders(updatedSalesOrders);

    toast.success('Partial payment recorded successfully');
    onPaymentRecorded();
    onOpenChange(false);
  };

  if (mode === 'choice') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Choose how to record payment for sales order {salesOrder.orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={handleRecordFullPayment}>Record Full Payment</Button>
            <Button onClick={() => setMode('partial')} variant="outline">
              Record Partial Payment
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
          <DialogTitle>Record Partial Payment</DialogTitle>
          <DialogDescription>
            Allocate payment amounts to invoices for sales order {salesOrder.orderNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Payment Details */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="paymentDate">Payment Date</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger id="paymentMethod">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="paymentReference">Payment Reference</Label>
              <Input
                id="paymentReference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
              />
            </div>
          </div>

          {/* Invoice Selection */}
          <div>
            <Label>Invoices to Pay</Label>
            <div className="mt-2 border rounded-md overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                <div className="col-span-1"></div>
                <div className="col-span-2">Invoice #</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-2">Outstanding</div>
                <div className="col-span-3">Payment Amount</div>
              </div>
              <Separator />
              {paymentItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      checked={item.selected}
                      onCheckedChange={(checked) => handleItemSelect(index, checked as boolean)}
                    />
                  </div>
                  <div className="col-span-2">{item.invoice.invoiceNumber}</div>
                  <div className="col-span-2">{new Date(item.invoice.date).toLocaleDateString()}</div>
                  <div className="col-span-2">${item.invoice.total.toFixed(2)}</div>
                  <div className="col-span-2">${calculateOutstandingBalance(item.invoice).toFixed(2)}</div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min={0}
                      max={calculateOutstandingBalance(item.invoice)}
                      value={item.paymentAmount}
                      onChange={(e) => handlePaymentAmountChange(index, parseFloat(e.target.value) || 0)}
                      disabled={!item.selected}
                      className="w-full"
                    />
                  </div>
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
              <div className="flex justify-between font-bold">
                <span>Total Payment:</span>
                <span>${totalPayment.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setMode('choice')}>Back to Choice</Button>
          <Button onClick={handleRecordPartialPayment}>Record Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}