import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import type { SalesOrder, Invoice } from '@/types';  // Assume Invoice has id, invoiceNumber, status, total
import { ScrollArea } from '../ui/scroll-area';

interface RecordPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrder: SalesOrder;
  onPaymentRecorded: () => void;
}

export default function RecordPaymentDialog({ open, onOpenChange, salesOrder, onPaymentRecorded }: RecordPaymentDialogProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [remainingBalance, setRemainingBalance] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingInvoices, setFetchingInvoices] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      fetchInvoices();
      setPaymentDate(new Date().toISOString().split('T')[0]);
      resetForm();
    }
  }, [open]);

  const fetchInvoices = async () => {
    setFetchingInvoices(true);
    try {
      const response = await fetch(`${API_URL}/sales-orders/${salesOrder.id}/invoices`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data: Invoice[] = await response.json();
      const openInvoices = data.filter(inv => ['unpaid', 'partial', 'overdue'].includes(inv.status));
      setInvoices(openInvoices);
      if (openInvoices.length > 0) setSelectedInvoiceId(openInvoices[0].id.toString());
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setFetchingInvoices(false);
    }
  };

  useEffect(() => {
    if (selectedInvoiceId) {
      fetchRemainingBalance(selectedInvoiceId);
    }
  }, [selectedInvoiceId]);

  const fetchRemainingBalance = async (invoiceId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/invoices/${invoiceId}/remaining-balance`);
      if (!response.ok) throw new Error('Failed to fetch remaining balance');
      const { remaining_balance } = await response.json();
      setRemainingBalance(remaining_balance);
      setAmount(0);  // Reset amount
    } catch (err) {
      toast.error('Failed to load remaining balance');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {  // 5MB limit
        setError('File size exceeds 5MB limit');
        return;
      }
      setReceipt(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handlePayFull = () => {
    setAmount(remainingBalance);
  };

  const validateForm = () => {
    if (!selectedInvoiceId) return 'Please select an invoice';
    if (amount <= 0 || amount > remainingBalance) return 'Amount must be between 0 and remaining balance';
    if (!method) return 'Please select a payment method';
    return '';
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('invoice_id', selectedInvoiceId!);
      formData.append('payment_date', paymentDate);
      formData.append('amount', amount.toString());
      formData.append('method', method);
      if (reference) formData.append('reference', reference);
      if (notes) formData.append('notes', notes);
      if (receipt) formData.append('receipt', receipt);

      const response = await fetch(`${API_URL}/payments`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to record payment');
      }
      toast.success('Payment recorded successfully');
      onPaymentRecorded();
      onOpenChange(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedInvoiceId(null);
    setRemainingBalance(0);
    setAmount(0);
    setMethod('');
    setReference('');
    setNotes('');
    setReceipt(null);
    setPreviewUrl(null);
    setError('');
  };

  if (fetchingInvoices) {
    return <div>Loading invoices...</div>;
  }

  if (invoices.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>No open invoices for sales order {salesOrder.orderNumber}.</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment for Sales Order {salesOrder.orderNumber}</DialogTitle>
          <DialogDescription>Select an invoice and enter payment details.</DialogDescription>
        </DialogHeader>
        {/* <ScrollArea className="max-h-[60vh] pr-4"> */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="invoice">Invoice</Label>
            <Select value={selectedInvoiceId || ''} onValueChange={setSelectedInvoiceId}>
              <SelectTrigger>
                <SelectValue placeholder="Select invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map(inv => (
                  <SelectItem key={inv.id} value={inv.id.toString()}>{inv.invoiceNumber} ({inv.status})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedInvoiceId && (
            <>
              <div className="text-sm text-muted-foreground">
                Remaining Balance: ₱{remainingBalance.toFixed(2)}
              </div>
              <Separator />
              <div>
                <Label htmlFor="paymentDate">Payment Date</Label>
                <Input id="paymentDate" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} />
              </div>
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" type="number" min="0" max={remainingBalance} value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
                </div>
                <Button variant="outline" onClick={handlePayFull}>Pay Full</Button>
              </div>
              <div>
                <Label htmlFor="method">Payment Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="GCash">GCash</SelectItem>
                    <SelectItem value="Maya">Maya</SelectItem>
                    <SelectItem value="PayPal">PayPal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="reference">Reference</Label>
                <Input id="reference" value={reference} onChange={e => setReference(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="receipt">Receipt (Image)</Label>
                <Input id="receipt" type="file" accept="image/*" onChange={handleFileChange} />
                {previewUrl && <img src={previewUrl} alt="Preview" className="mt-2 max-h-40" />}
              </div>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedInvoiceId}>
            {loading ? 'Submitting...' : 'Record Payment'}
          </Button>
        </DialogFooter>
        {/* </ScrollArea> */}
      </DialogContent>
    </Dialog>
  );
}