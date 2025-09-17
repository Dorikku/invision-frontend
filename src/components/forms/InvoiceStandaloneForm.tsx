import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Combobox } from "../ui/combobox";
import { Plus, Trash2 } from "lucide-react";
import type { Invoice, Product, SimpleCustomer } from "../../types";

interface InvoiceStandaloneFormProps {
  invoice?: Invoice | null;
  onInvoiceCreated: () => void;
  onCancel: () => void;
}

interface FormLineItem {
  tempId: string;
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  taxRate: number;
}

export default function InvoiceStandaloneForm({
  invoice,
  onInvoiceCreated,
  onCancel,
}: InvoiceStandaloneFormProps) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [customers, setCustomers] = useState<SimpleCustomer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<FormLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customerId: invoice?.customerId || "",
    date: invoice?.date || new Date().toISOString().split("T")[0],
    dueDate:
      invoice?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    notes: invoice?.notes || "",
  });

  // Prefill items
  useEffect(() => {
    if (invoice?.items) {
      setItems(
        invoice.items.map((it) => ({
          tempId: it.id,
          productId: it.productId,
          productName: it.productName,
          description: it.description || "",
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          taxRate: it.taxRate,
          total: it.unitPrice * it.quantity,
        }))
      );
    }
  }, [invoice]);

  // Fetch customers & products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/customers/simple`),
          fetch(`${API_URL}/products`),
        ]);
        setCustomers(await custRes.json());
        setProducts(await prodRes.json());
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
    description: `₱${p.selling_price.toFixed(2)} - ${p.description || ""}`,
  }));

  const addItem = () => {
    setItems([
      ...items,
      {
        tempId: Date.now().toString(),
        productId: "",
        productName: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
        taxRate: 0,
      },
    ]);
  };

  const updateItem = (index: number, field: keyof FormLineItem, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "productId") {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        updated[index].productName = prod.name;
        updated[index].description = prod.description || "";
        updated[index].unitPrice = prod.selling_price;
      }
    }

    if (["quantity", "unitPrice", "taxRate", "productId"].includes(field)) {
      updated[index].total = updated[index].quantity * updated[index].unitPrice;
    }

    setItems(updated);
  };

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const calculateTotals = () => {
    const subtotal = items.reduce((s, i) => s + i.total, 0);
    const tax = items.reduce((s, i) => s + i.total * i.taxRate, 0);
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      alert("Customer is required");
      return;
    }
    if (items.length === 0) {
      alert("Add at least one item");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        customerId: parseInt(formData.customerId),
        date: formData.date,
        dueDate: formData.dueDate,
        notes: formData.notes,
        items: items.map((it) => ({
          productId: parseInt(it.productId),
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          taxRate: it.taxRate,
        })),
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

      if (!res.ok) throw new Error("Failed to save invoice");
      await res.json(); // optional if you don’t need the response object
      onInvoiceCreated();

    } catch (err) {
      console.error("Error saving invoice:", err);
      alert("Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();
  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Customer</Label>
          <Combobox
            options={customers.map((c) => ({ value: c.id, label: c.name }))}
            value={formData.customerId}
            onValueChange={(val) =>
              setFormData({ ...formData, customerId: val })
            }
            placeholder="Select customer"
          />
        </div>
        <div>
          <Label>Invoice Date</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div>
          <Label>Due Date</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Line Items</CardTitle>
          <Button type="button" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Tax %</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((it, idx) => (
                <TableRow key={it.tempId}>
                  <TableCell>
                    <Combobox
                      options={productOptions}
                      value={it.productId}
                      onValueChange={(val) => updateItem(idx, "productId", val)}
                      placeholder="Select product"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={it.quantity}
                      onChange={(e) =>
                        updateItem(idx, "quantity", parseInt(e.target.value) || 0)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={it.unitPrice}
                      onChange={(e) =>
                        updateItem(
                          idx,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={it.taxRate * 100}
                      onChange={(e) =>
                        updateItem(
                          idx,
                          "taxRate",
                          parseFloat(e.target.value) / 100 || 0
                        )
                      }
                    />
                  </TableCell>
                  <TableCell>₱{it.total.toFixed(2)}</TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => removeItem(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-8 text-right">
        <div>
          <div>Subtotal: ₱{subtotal.toFixed(2)}</div>
          <div>Tax: ₱{tax.toFixed(2)}</div>
          <div className="font-bold">Total: ₱{total.toFixed(2)}</div>
        </div>
      </div>

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
