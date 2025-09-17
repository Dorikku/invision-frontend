import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Combobox } from "../ui/combobox";
import { Plus, Trash2 } from "lucide-react";
import type { Invoice, Product, SimpleCustomer, SalesPerson } from "../../types";

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
  unitCost: number;
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
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [items, setItems] = useState<FormLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerId: invoice?.customerId || "",
    salesPersonId: invoice?.salesPersonId || "",
    date: invoice?.date || new Date().toISOString().split("T")[0],
    dueDate:
      invoice?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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
          unitCost: it.unitCost || 0,
          unitPrice: it.unitPrice,
          taxRate: it.taxRate,
          total: it.unitPrice * it.quantity,
        }))
      );
    }
  }, [invoice]);

  // Fetch customers, products, salespersons
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [custRes, prodRes, salesRes] = await Promise.all([
          fetch(`${API_URL}/customers/simple`),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/salespersons`),
        ]);

        if (!custRes.ok || !prodRes.ok || !salesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        setCustomers(await custRes.json());
        setProducts(await prodRes.json());
        setSalesPersons(await salesRes.json());
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedCustomer = customers.find((c) => c.id === formData.customerId);

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
        unitCost: 0,
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
        updated[index].unitCost = prod.cost_price;
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
        // salesPersonId: formData.salesPersonId ? parseInt(formData.salesPersonId) : null,
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

      await res.json();
      onInvoiceCreated();
    } catch (err) {
      console.error("Error saving invoice:", err);
      alert("Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer, Date, Due Date */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Customer *</Label>
          <Combobox
            options={customers.map((c) => ({
              value: c.id,
              label: c.name,
              description: c.contact_person || "",
            }))}
            value={formData.customerId}
            onValueChange={(val) => setFormData({ ...formData, customerId: val })}
            placeholder="Select customer"
            searchPlaceholder="Search customers..."
            emptyText="No customers found."
          />
        </div>
        <div className="space-y-2">
          <Label>Invoice Date *</Label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        {/* <div className="space-y-2">
          <Label>Sales Person</Label>
          <Combobox
            options={salesPersons.map((sp) => ({
              value: sp.id,
              label: sp.name,
            }))}
            value={formData.salesPersonId}
            onValueChange={(val) => setFormData({ ...formData, salesPersonId: val })}
            placeholder="Select sales person"
            searchPlaceholder="Search sales persons..."
            emptyText="No sales persons found."
          />
        </div>         */}
        <div className="space-y-2">
          <Label>Due Date *</Label>
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>
      </div>


      {/* Customer Info Card */}
      {selectedCustomer && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p><strong>{selectedCustomer.name}</strong></p>
            <p>{selectedCustomer.contact_person}</p>
            <p>{selectedCustomer.phone}</p>
            <p>{selectedCustomer.email}</p>
            <p>{selectedCustomer.address}</p>
          </CardContent>
        </Card>
      )}

      {/* Line Items */}
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
                  <TableHead>Selling Price</TableHead>
                  <TableHead>Tax</TableHead>
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
                        searchPlaceholder="Search products..."
                        emptyText="No products found."
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={it.quantity}
                        onChange={(e) =>
                          updateItem(idx, "quantity", parseFloat(e.target.value) || 0)
                        }
                        className="w-18"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={it.unitPrice}
                          onChange={(e) =>
                            updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)
                          }
                          className="w-24"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          ₱{it.unitCost?.toFixed(2) ?? "0.00"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative w-22">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={it.taxRate * 100}
                          onChange={(e) =>
                            updateItem(idx, "taxRate", parseFloat(e.target.value) / 100 || 0)
                          }
                          className="pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          %
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">₱{it.total.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(idx)}
                      >
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

      {/* Totals */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"></div>
        <div className="space-y-4">
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

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
