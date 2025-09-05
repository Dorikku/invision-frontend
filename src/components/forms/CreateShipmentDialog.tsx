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

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesOrder: SalesOrder;
  onShipmentCreated: () => void;
}

type Mode = 'choice' | 'partial';

interface SelectedItem {
  original: LineItem;
  selected: boolean;
  quantity: number;
  shippedQuantity: number;
  remainingQuantity: number;
}

interface ShippedQuantityResponse {
  soItemId: string;
  quantity: number;
}

export default function CreateShipmentDialog({ open, onOpenChange, salesOrder, onShipmentCreated }: CreateShipmentDialogProps) {
  const [mode, setMode] = useState<Mode>('choice');
  const [shipmentDate, setShipmentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [carrier, setCarrier] = useState<string>('');
  const [tracker, setTracker] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      const fetchShippedQuantities = async () => {
        try {
          const response = await fetch(`http://127.0.0.1:8000/api/v1/sales-orders/${salesOrder.id}/shipped-quantities`);
          if (!response.ok) {
            throw new Error('Failed to fetch shipped quantities');
          }
          const shippedQuantities: ShippedQuantityResponse[] = await response.json();
          
          const newSelectedItems = salesOrder.items.map(item => {
            const shippedQty = shippedQuantities.find(iq => Number(iq.soItemId) === Number(item.id))?.quantity || 0;
            return {
              original: item,
              selected: false,
              quantity: 0,
              shippedQuantity: shippedQty,
              remainingQuantity: item.quantity - shippedQty,
            };
          });
          
          setSelectedItems(newSelectedItems);
          setMode('choice');
          setShipmentDate(new Date().toISOString().split('T')[0]);
          setCarrier('');
          setTracker('');
        } catch (error) {
          console.error('Error fetching shipped quantities:', error);
          toast.error('Failed to load shipped quantities');
        } finally {
          setLoading(false);
        }
      };
      
      fetchShippedQuantities();
    }
  }, [open, salesOrder]);

  const handleItemSelect = (index: number, selected: boolean) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems[index].selected = selected;
    newSelectedItems[index].quantity = selected ? newSelectedItems[index].remainingQuantity : 0;
    setSelectedItems(newSelectedItems);
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
  };

  const createShipment = async (itemsToShip: { soItemId: number; quantity: number }[]) => {
    if (!carrier.trim()) {
      toast.error('Carrier is required');
      return;
    }

    try {
      const payload = {
        salesOrderId: salesOrder.id,
        date: shipmentDate,
        carrier,
        tracker: tracker || null,
        items: itemsToShip,
      };

      const response = await fetch('http://127.0.0.1:8000/api/v1/shipments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create shipment');
      }

      toast.success('Shipment created successfully');
      onShipmentCreated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast.error((error as Error).message || 'Failed to create shipment');
    }
  };

  const handleShipAll = () => {
    const itemsToShip = salesOrder.items.map(item => ({
      soItemId: parseInt(item.id),
      quantity: item.quantity - (selectedItems.find(si => si.original.id === item.id)?.shippedQuantity || 0),
    })).filter(item => item.quantity > 0);
    createShipment(itemsToShip);
  };

  const handlePartialSubmit = () => {
    const selectedCount = selectedItems.filter(si => si.selected && si.quantity > 0).length;
    if (selectedCount === 0) {
      toast.error('Please select at least one item to ship.');
      return;
    }

    const itemsToShip = selectedItems
      .filter(si => si.selected && si.quantity > 0)
      .map(si => ({
        soItemId: parseInt(si.original.id),
        quantity: si.quantity,
      }));

    createShipment(itemsToShip);
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Shipment</DialogTitle>
            <DialogDescription>Loading shipped quantities...</DialogDescription>
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
            <DialogTitle>Create Shipment</DialogTitle>
            <DialogDescription>
              Choose how you want to create the shipment for sales order {salesOrder.orderNumber}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button onClick={handleShipAll}>
              Ship All Remaining Line-Items
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
          <DialogTitle>Create Partial Shipment</DialogTitle>
          <DialogDescription>
            Select items and adjust quantities to ship from sales order {salesOrder.orderNumber}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
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
                type="text"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="tracker">Tracking Number (Optional)</Label>
              <Input
                id="tracker"
                type="text"
                value={tracker}
                onChange={(e) => setTracker(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Items to Ship</Label>
            <div className="mt-2 border rounded-md overflow-hidden">
              <div className="grid grid-cols-10 gap-4 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                <div className="col-span-1"></div>
                <div className="col-span-3">Product</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-3">Quantity (Remaining)</div>
              </div>
              <Separator />
              {selectedItems.map((si, index) => (
                <div key={index} className="grid grid-cols-10 gap-4 p-4 items-center text-sm">
                  <div className="col-span-1 flex items-center">
                    <Checkbox
                      checked={si.selected}
                      onCheckedChange={(checked) => handleItemSelect(index, checked as boolean)}
                      disabled={si.remainingQuantity === 0}
                    />
                  </div>
                  <div className="col-span-3 font-medium">{si.original.productName}</div>
                  <div className="col-span-3 text-muted-foreground">{si.original.description || '-'}</div>
                  <div className="col-span-3">
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
                      (remaining {si.remainingQuantity}, shipped {si.shippedQuantity})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setMode('choice')}>Back to Choice</Button>
          <Button onClick={handlePartialSubmit}>Create Shipment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}