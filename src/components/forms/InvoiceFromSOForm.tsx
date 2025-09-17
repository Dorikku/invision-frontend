import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Separator } from "../ui/separator";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";
import type { Invoice, SalesOrder, LineItem } from "../../types";

interface InvoiceFromSOFormProps {
  invoice?: Invoice | null;
  onInvoiceCreated: () => void;
  onCancel: () => void;
}

interface SelectedItem {
  original: LineItem;
  quantity: number;
  invoicedQuantity: number;
  remainingQuantity: number;
}

export default function InvoiceFromSOForm({
  invoice,
  onInvoiceCreated,
  onCancel,
}: InvoiceFromSOFormProps) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [selectedSO, setSelectedSO] = useState<SalesOrder | null>(null);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0]
  );
  const [notes, setNotes] = useState<string>(invoice?.notes || "");
  const [subtotal, setSubtotal] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Fetch SOs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/sales-orders`);
        if (!res.ok) throw new Error("Failed to fetch sales orders");
        setSalesOrders(await res.json());
      } catch (err) {
        console.error("Error fetching SOs:", err);
        toast.error("Failed to fetch sales orders");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto-select SO + prefill items if editing an invoice
  useEffect(() => {
    if (invoice && invoice.salesOrderId && salesOrders.length > 0) {
      const so = salesOrders.find(
        (s) => String(s.id) === String(invoice.salesOrderId)
      );
      if (so) {
        setSelectedSO(so);
        setNotes(invoice.notes || "");
        setInvoiceDate(invoice.date.split("T")[0]);
        setDueDate(invoice.dueDate.split("T")[0]);

        // merge SO items with invoice items
        const invoiceItemMap = new Map(
          invoice.items.map((it) => [String(it.productId), it])
        );

        const mergedItems = so.items.map((item) => {
          const invItem = invoiceItemMap.get(String(item.productId));
          return {
            original: item,
            quantity: invItem ? invItem.quantity : 0,
            invoicedQuantity: invItem ? invItem.quantity : 0,
            remainingQuantity: item.quantity, // validate against SO later
          };
        });

        setSelectedItems(mergedItems);
      }
    }
  }, [invoice, salesOrders]);

  // When SO is selected in create mode
  useEffect(() => {
    if (!selectedSO || invoice) return;

    const fetchInvoicedQuantities = async () => {
      try {
        const res = await fetch(
          `${API_URL}/sales-orders/${selectedSO.id}/invoiced-quantities`
        );
        if (!res.ok) throw new Error("Failed to fetch invoiced quantities");
        const invoicedQuantities = await res.json();

        const newSelectedItems = selectedSO.items.map((item) => {
          const invoicedQty =
            invoicedQuantities.find(
              (iq: { soItemId: string; quantity: number }) =>
                Number(iq.soItemId) === Number(item.id)
            )?.quantity || 0;
          return {
            original: item,
            quantity: 0,
            invoicedQuantity: invoicedQty,
            remainingQuantity: item.quantity - invoicedQty,
          };
        });

        setSelectedItems(newSelectedItems);
        setInvoiceDate(new Date().toISOString().split("T")[0]);
        setDueDate(
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        );
        setNotes(selectedSO.notes || "");
        setSubtotal(0);
        setTax(0);
        setTotal(0);
      } catch (err) {
        console.error("Error fetching invoiced quantities:", err);
        toast.error("Failed to load invoiced quantities");
      }
    };

    fetchInvoicedQuantities();
  }, [selectedSO, invoice]);

  const calculateTotals = (items: SelectedItem[]) => {
    const newSubtotal = items.reduce(
      (sum, si) =>
        sum + (si.quantity > 0 ? si.quantity * si.original.unitPrice : 0),
      0
    );
    const newTax = items.reduce(
      (sum, si) =>
        sum +
        (si.quantity > 0
          ? si.quantity * si.original.unitPrice * si.original.taxRate
          : 0),
      0
    );
    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newSubtotal + newTax);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newSelectedItems = [...selectedItems];
    const maxQty = newSelectedItems[index].remainingQuantity;
    newSelectedItems[index].quantity = Math.max(0, Math.min(qty, maxQty));
    setSelectedItems(newSelectedItems);
    calculateTotals(newSelectedItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSO) {
      toast.error("Please select a sales order");
      return;
    }

    const itemsToInvoice = selectedItems
      .filter((si) => si.quantity > 0) // drop zero-qty items
      .map((si) => ({
        soItemId: parseInt(si.original.id),
        quantity: si.quantity,
      }));

    if (itemsToInvoice.length === 0) {
      toast.error("Please add at least one item to invoice");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        salesOrderId: selectedSO.id,
        customerId: selectedSO.customerId,
        date: invoiceDate,
        dueDate: dueDate,
        notes: notes,
        items: itemsToInvoice,
      };

      const url = invoice
        ? `${API_URL}/invoices/${invoice.id}`
        : `${API_URL}/invoices`;
      const method = invoice ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to save invoice");
      }

      toast.success(
        invoice ? "Invoice updated successfully" : "Invoice created successfully"
      );
      onInvoiceCreated();
    } catch (err: any) {
      console.error("Error saving invoice:", err);
      toast.error(err.message || "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading sales orders...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sales Order Selector */}
      <div>
        <Label>Sales Order</Label>
        <select
          className="w-full border rounded-md p-2 mt-1"
          value={selectedSO?.id || ""}
          onChange={(e) => {
            if (invoice) return; // prevent changes in edit mode
            const so = salesOrders.find(
              (s) => String(s.id) === String(e.target.value)
            );
            if (so) setSelectedSO(so);
          }}
          disabled={!!invoice} // disable if editing
        >
          <option value="">Select sales order</option>
          {salesOrders.map((so) => (
            <option key={so.id} value={so.id}>
              {so.orderNumber} - {so.customerName}
            </option>
          ))}
        </select>
      </div>

      {selectedSO && (
        <>
          {/* Dates */}
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

          {/* Items */}
          <div>
            <Label>Items to Invoice</Label>
            <div className="mt-2 border rounded-md overflow-hidden">
              <div className="grid grid-cols-11 gap-4 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                <div className="col-span-3">Product</div>
                <div className="col-span-3">Description</div>
                <div className="col-span-2">Quantity (Remaining)</div>
                <div className="col-span-1">Unit Price</div>
                <div className="col-span-2 text-right">Line Total</div>
              </div>
              <Separator />
              {selectedItems.map((si, index) => (
                <div
                  key={index}
                  className="grid grid-cols-11 gap-4 p-4 items-center text-sm"
                >
                  <div className="col-span-3 font-medium">
                    {si.original.productName}
                  </div>
                  <div className="col-span-3 text-muted-foreground">
                    {si.original.description || "-"}
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={0}
                      max={si.remainingQuantity}
                      value={si.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          index,
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full"
                    />
                    <span className="text-xs text-muted-foreground ml-2">
                      (remaining {si.remainingQuantity}, invoiced{" "}
                      {si.invoicedQuantity})
                    </span>
                  </div>
                  <div className="col-span-1">
                    ₱{si.original.unitPrice.toFixed(2)}
                  </div>
                  <div className="col-span-2 text-right">
                    ₱{(si.quantity * si.original.unitPrice).toFixed(2)}
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

          {/* Totals */}
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
        </>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
