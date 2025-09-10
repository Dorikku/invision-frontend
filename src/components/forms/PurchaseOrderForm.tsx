import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Combobox } from "../ui/combobox";
import type { Supplier } from "@/types";

type Product = {
  id: number | string;
  name: string;
  description?: string | null;
  selling_price?: number;
  cost_price?: number;
  purchase_price?: number;
};

type PurchaseOrderItemPayload = {
  product_id: number;
  quantity_ordered: number;
  unit_price: number;
  tax_rate: number; // decimal like 0.12
};

type PurchaseOrderPayload = {
  supplier_id: number;
  creator_id: number;
  date: string; // YYYY-MM-DD
  status: string; // will be 'draft'
  notes?: string | null;
  items: PurchaseOrderItemPayload[];
};

type PurchaseOrder = {
  id: number;
  poNumber?: string;
  supplierId?: number;
  supplierName?: string;
  date?: string;
  status?: string;
  notes?: string;
  items?: {
    id?: string;
    productId: number | string;
    productName?: string;
    description?: string | null;
    quantityOrdered: number;
    quantityReceived?: number;
    unitPrice: number;
    taxRate: number; // decimal 0.12 in API -> frontend will show 12
    lineTotal?: number;
  }[];
};

interface PurchaseOrderFormProps {
  purchaseOrder?: PurchaseOrder | null;
  onSave: (po: Partial<PurchaseOrder>) => void;
  onCancel: () => void;
}

interface FormLineItem {
  tempId: string; // frontend unique id
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRatePercent: number; // e.g., 12 for 12%
  lineTotal: number;
}

export default function PurchaseOrderForm({
  purchaseOrder,
  onSave,
  onCancel,
}: PurchaseOrderFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    supplierId: (purchaseOrder?.supplierId ?? "") as string | number,
    date: purchaseOrder?.date ?? new Date().toISOString().split("T")[0],
    notes: purchaseOrder?.notes ?? "",
  });

  const [items, setItems] = useState<FormLineItem[]>([]);

  // Initialize items from purchaseOrder if provided
  useEffect(() => {
    if (purchaseOrder?.items && purchaseOrder.items.length > 0) {
      const mapped = purchaseOrder.items.map((it) => {
        const taxPercent =
          typeof it.taxRate === "number" ? Number((it.taxRate * 100).toFixed(4)) : 0;
        const qty = Number(it.quantityOrdered ?? 0);
        const up = Number(it.unitPrice ?? 0);
        const subtotal = qty * up;
        const tax = subtotal * (taxPercent / 100);
        const lineTotal = subtotal + tax;
        return {
          tempId: it.id ? String(it.id) : Date.now().toString() + Math.random(),
          productId: String(it.productId),
          productName: it.productName ?? "",
          description: it.description ?? "",
          quantity: Number(qty),
          unitPrice: Number(up),
          taxRatePercent: Number(taxPercent),
          lineTotal: Number(lineTotal),
        } as FormLineItem;
      });
      setItems(mapped);
      setFormData((prev) => ({
        ...prev,
        supplierId: purchaseOrder.supplierId ?? prev.supplierId,
        date: purchaseOrder.date ?? prev.date,
        notes: purchaseOrder.notes ?? prev.notes,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseOrder]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Suppliers - you said API is not yet implemented; try fetching and gracefully fallback
        try {
          const supRes = await fetch("http://127.0.0.1:8000/api/v1/suppliers/simple");
          if (!supRes.ok) throw new Error("No suppliers endpoint yet");
          const supData = await supRes.json();
          setSuppliers(supData);
        } catch (supErr) {
          // fallback to empty array and continue — when you implement the endpoint this will populate
          console.warn("Could not fetch suppliers (API missing). Suppliers will be empty until /suppliers is implemented.", supErr);
          setSuppliers([]);
        }

        // Products - you said this exists
        const prodRes = await fetch("http://127.0.0.1:8000/api/v1/products");
        if (!prodRes.ok) throw new Error("Failed to fetch products");
        const prodData = await prodRes.json();
        setProducts(prodData);
      } catch (err) {
        console.error(err);
        setError("Error fetching suppliers or products");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Helpers for product options for Combobox
  const productOptions = products.map((p) => ({
    value: String(p.id),
    label: p.name,
    description: `${p.description ?? ""}`,
  }));

  const supplierOptions = suppliers.map((s) => ({
    value: String(s.id),
    label: s.name,
    description: s.contact_person ?? "",
  }));

  // Add a new empty item
  const addItem = () => {
    const newItem: FormLineItem = {
      tempId: Date.now().toString() + Math.random(),
      productId: "",
      productName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRatePercent: 0,
      lineTotal: 0,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update item field and recalc line total
  const updateItem = (
    index: number,
    field: keyof FormLineItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      const item = { ...copy[index] };

      (item as any)[field] = value;

      // If productId changed, populate unitPrice / name / description from product (if found)
      if (field === "productId") {
        const prod = products.find((p) => String(p.id) === String(value));
        if (prod) {
          item.productName = prod.name;
          item.description = prod.description ?? "";
          // prefer product.purchase_price or cost_price fallback
          const fallbackPrice =
            typeof prod.purchase_price === "number"
              ? prod.purchase_price
              : typeof prod.cost_price === "number"
              ? prod.cost_price
              : typeof prod.selling_price === "number"
              ? prod.selling_price
              : 0;
          item.unitPrice = Number(fallbackPrice ?? 0);
        } else {
          item.productName = "";
          item.description = "";
        }
      }

      // ensure numeric fields are numbers
      item.quantity = Number(item.quantity ?? 0);
      item.unitPrice = Number(item.unitPrice ?? 0);
      item.taxRatePercent = Number(item.taxRatePercent ?? 0);

      // Recalculate line total: subtotal + tax
      const subtotal = item.quantity * item.unitPrice;
      const tax = subtotal * (item.taxRatePercent / 100);
      item.lineTotal = Number((subtotal + tax) || 0);

      copy[index] = item;
      return copy;
    });
  };

  // Totals
  const calculateTotals = () => {
    const subtotal = items.reduce((s, it) => s + (it.quantity * it.unitPrice), 0);
    const tax = items.reduce((s, it) => s + ((it.quantity * it.unitPrice) * (it.taxRatePercent / 100)), 0);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const { subtotal, tax, total } = calculateTotals();

  const validate = (): string | null => {
    if (!formData.supplierId) return "Supplier is required.";
    if (!items || items.length === 0) return "Add at least one line item.";
    for (let i = 0; i < items.length; i++) {
      if (!items[i].productId) return `Product is required for line ${i + 1}.`;
      if (items[i].quantity <= 0) return `Quantity must be > 0 for line ${i + 1}.`;
      if (items[i].unitPrice < 0) return `Unit price must be >= 0 for line ${i + 1}.`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const vErr = validate();
    if (vErr) {
      alert(vErr);
      return;
    }

    setSaving(true);
    try {
      const payload: PurchaseOrderPayload = {
        supplier_id: Number(formData.supplierId),
        creator_id: 1, // fixed as requested
        date: formData.date,
        status: "draft",
        notes: formData.notes || null,
        items: items.map((it) => ({
          product_id: Number(it.productId),
          quantity_ordered: Number(it.quantity),
          unit_price: Number(it.unitPrice),
          tax_rate: Number((it.taxRatePercent ?? 0) / 100), // convert percent to decimal
        })),
      };

      let res: Response;
      if (purchaseOrder && purchaseOrder.id) {
        res = await fetch(`http://127.0.0.1:8000/api/v1/purchase-orders/${purchaseOrder.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("http://127.0.0.1:8000/api/v1/purchase-orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to save purchase order");
      }

      const saved = await res.json();
      // call parent
      onSave(saved);
    } catch (err) {
      console.error("Error saving purchase order:", err);
      alert(`Error saving purchase order: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier *</Label>
          <Combobox
            options={supplierOptions}
            value={String(formData.supplierId ?? "")}
            onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
            placeholder="Select a supplier"
            searchPlaceholder="Search suppliers..."
            emptyText="No suppliers found."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">PO Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Line Items</CardTitle>
            <Button type="button" onClick={addItem} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No items added. Click "Add Item" to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Tax %</TableHead>
                  <TableHead>Line Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <TableRow key={item.tempId}>
                    <TableCell>
                      <Combobox
                        options={productOptions}
                        value={item.productId}
                        onValueChange={(value) => updateItem(idx, "productId", value)}
                        placeholder="Select product"
                        searchPlaceholder="Search products..."
                        emptyText="No products found."
                        className="w-full"
                      />
                      {/* {item.productName && (
                        <div className="text-xs text-muted-foreground mt-1">{item.productName}</div>
                      )} */}
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, "quantity", Number(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(idx, "unitPrice", Number(e.target.value) || 0)}
                        className="w-32"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="relative w-24">
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.taxRatePercent}
                          onChange={(e) => updateItem(idx, "taxRatePercent", Number(e.target.value) || 0)}
                          className="pr-8"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">%</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="font-medium">₱ {item.lineTotal.toFixed(2)}</span>
                    </TableCell>

                    <TableCell>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <div />
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">₱ {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span className="font-medium">₱ {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>₱ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes for supplier..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : purchaseOrder ? "Update Purchase Order" : "Create Purchase Order"}
        </Button>
      </div>
    </form>
  );
}
