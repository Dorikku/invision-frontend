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
import { getInvoices, getSalesOrders, saveSalesOrders } from '../../lib/storage';
import type { SalesOrder, Invoice, LineItem } from '../../types';

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrder: SalesOrder;
  onShipmentCreated: () => void;
}

type Mode = 'choice' | 'partial';

interface ShipmentItem {
  lineItem: LineItem;
  selected: boolean;
  quantityToShip: number;
}

export default function CreateShipmentDialog({ open, onOpenChange, salesOrder, onShipmentCreated }: CreateShipmentDialogProps) {
  const [mode, setMode] = useState<Mode>('choice');
  const [shipmentDate, setShipmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [carrier, setCarrier] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [shipmentItems, setShipmentItems] = useState<ShipmentItem[]>([]);
  const [totalShipped, setTotalShipped] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setMode('choice');
      setShipmentDate(new Date().toISOString().split('T')[0]);
      setCarrier('');
      setTrackingNumber('');
      setNotes('');
      setSelectedInvoiceId('');
      setShipmentItems([]);
      setTotalShipped(0);
    }
  }, [open]);

  const invoices = getInvoices().filter(
    (inv) => inv.salesOrderId === salesOrder.id && inv.status !== 'cancelled'
  );

  const handleInvoiceSelect = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    const selectedInvoice = invoices.find((inv) => inv.id === invoiceId);
    if (selectedInvoice) {
      setShipmentItems(
        selectedInvoice.items.map((item) => ({
          lineItem: item,
          selected: false,
          quantityToShip: 0,
        }))
      );
      setTotalShipped(0);
    }
  };

  const calculateRemainingQuantity = (item: LineItem) => {
    return item.quantity - (item.shippedQuantity || 0);
  };

  const calculateTotalShipped = (items: ShipmentItem[]) => {
    const total = items.reduce((sum, item) => (item.selected ? item.quantityToShip : 0), 0);
    setTotalShipped(total);
  };

  const handleItemSelect = (index: number, selected: boolean) => {
    const newShipmentItems = [...shipmentItems];
    newShipmentItems[index].selected = selected;
    newShipmentItems[index].quantityToShip = selected ? calculateRemainingQuantity(newShipmentItems[index].lineItem) : 0;
    setShipmentItems(newShipmentItems);
    calculateTotalShipped(newShipmentItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newShipmentItems = [...shipmentItems];
    const maxQty = calculateRemainingQuantity(newShipmentItems[index].lineItem);
    newShipmentItems[index].quantityToShip = Math.max(0, Math.min(qty, maxQty));
    newShipmentItems[index].selected = newShipmentItems[index].quantityToShip > 0;
    setShipmentItems(newShipmentItems);
    calculateTotalShipped(newShipmentItems);
  };

  const handleFullShipment = () => {
    const allSalesOrders = getSalesOrders();
    const updatedSalesOrders: SalesOrder[] = allSalesOrders.map((so) => {
      if (so.id === salesOrder.id) {
        const updatedItems = so.items.map((item) => ({
          ...item,
          shippedQuantity: item.quantity,
        }));
        return {
          ...so,
          items: updatedItems,
          shipmentStatus: 'shipped' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return so;
    });
    saveSalesOrders(updatedSalesOrders);

    toast.success('All items marked as shipped');
    onShipmentCreated();
    onOpenChange(false);
  };

  const handlePartialShipment = () => {
    const selectedItems = shipmentItems.filter((item) => item.selected && item.quantityToShip > 0);
    if (!selectedInvoiceId || selectedItems.length === 0) {
      toast.error('Please select an invoice and at least one item with a valid quantity to ship.');
      return;
    }

    const allSalesOrders = getSalesOrders();
    const updatedSalesOrders: SalesOrder[] = allSalesOrders.map((so) => {
      if (so.id === salesOrder.id) {
        const updatedItems = so.items.map((soItem) => {
          const shipmentItem = shipmentItems.find(
            (si) => si.lineItem.id === soItem.id && si.selected && si.quantityToShip > 0
          );
          if (shipmentItem) {
            return {
              ...soItem,
              shippedQuantity: (soItem.shippedQuantity || 0) + shipmentItem.quantityToShip,
            };
          }
          return soItem;
        });

        const allItemsShipped = updatedItems.every((item) => (item.shippedQuantity || 0) >= item.quantity);
        const newShipmentStatus: SalesOrder['shipmentStatus'] = allItemsShipped ? 'shipped' : 'partially_shipped';

        return {
          ...so,
          items: updatedItems,
          shipmentStatus: newShipmentStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return so;
    });
    saveSalesOrders(updatedSalesOrders);

    toast.success('Partial shipment recorded successfully');
    onShipmentCreated();
    onOpenChange(false);
  };

  if (mode === 'choice') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Shipment</DialogTitle>
            <DialogDescription>
              Choose how to create a shipment for sales order {salesOrder.orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={handleFullShipment}>Fully Ship All Items</Button>
            <Button onClick={() => setMode('partial')} variant="outline">
              Enter Quantities
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
          <DialogTitle>Create Partial Shipment</DialogTitle>
          <DialogDescription>
            Select an invoice and specify quantities to ship for sales order {salesOrder.orderNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Shipment Details */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="shipmentDate">Shipment Date</Label>
              <Input
                id="shipmentDate"
                type="date"
                value={shipmentDate}
                onChange={(e) => setShipmentDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="carrier">Carrier</Label>
              <Input
                id="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g., UPS, FedEx"
              />
            </div>
            <div>
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Invoice Selection */}
          <div>
            <Label htmlFor="invoiceSelect">Select Invoice</Label>
            <Select value={selectedInvoiceId} onValueChange={handleInvoiceSelect}>
              <SelectTrigger id="invoiceSelect">
                <SelectValue placeholder="Select an invoice" />
              </SelectTrigger>
              <SelectContent>
                {invoices.map((invoice) => (
                  <SelectItem key={invoice.id} value={invoice.id}>
                    {invoice.invoiceNumber} ({new Date(invoice.date).toLocaleDateString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Item Selection */}
          {selectedInvoiceId && (
            <div>
              <Label>Items to Ship</Label>
              <div className="mt-2 border rounded-md overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                  <div className="col-span-1"></div>
                  <div className="col-span-3">Product</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Remaining Quantity</div>
                  <div className="col-span-3">Quantity to Ship</div>
                </div>
                <Separator />
                {shipmentItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                    <div className="col-span-1 flex items-center">
                      <Checkbox
                        checked={item.selected}
                        onCheckedChange={(checked) => handleItemSelect(index, checked as boolean)}
                      />
                    </div>
                    <div className="col-span-3 font-medium">{item.lineItem.productName}</div>
                    <div className="col-span-3 text-muted-foreground">{item.lineItem.description || '-'}</div>
                    <div className="col-span-2">{calculateRemainingQuantity(item.lineItem)}</div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        min={0}
                        max={calculateRemainingQuantity(item.lineItem)}
                        value={item.quantityToShip}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                        disabled={!item.selected}
                        className="w-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <span>Total Items to Ship:</span>
                <span>{totalShipped}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setMode('choice')}>Back to Choice</Button>
          <Button onClick={handlePartialShipment} disabled={!selectedInvoiceId}>
            Create Shipment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}