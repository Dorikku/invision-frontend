import { useState, useEffect } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@radix-ui/react-tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Combobox } from "../ui/combobox";
import { Checkbox } from "../ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import type { Invoice, SalesOrder, Product, SimpleCustomer, LineItem } from "../../types";

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSave: (invoice: Partial<Invoice>) => void;
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

export default function InvoiceForm({ invoice, onSave, onCancel }: InvoiceFormProps) {
  const API_URL = import.meta.env.VITE_API_URL;

  const [customers, setCustomers] = useState<SimpleCustomer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [tab, setTab] = useState<"so" | "standalone">("so");
  const [selectedSO, setSelectedSO] = useState<SalesOrder | null>(null);

  const [formData, setFormData] = useState({
    customerId: invoice?.customerId || "",
    salesOrderId: invoice?.salesOrderId || null,
    date: invoice?.date || new Date().toISOString().split("T")[0],
    dueDate:
      invoice?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    notes: invoice?.notes || "",
  });

  const [items, setItems] = useState<FormLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Prefill invoice items on edit
  useEffect(() => {
    if (invoice?.items) {
      setItems(
        invoice.items.map((item) => ({
          tempId: item.id,
          productId: item.productId,
          productName: item.productName,
          description: item.description || "",
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          taxRate: item.taxRate,
        }))
      );
    }
    if (invoice?.salesOrderId) {
      setTab("so");
    } else if (invoice) {
      setTab("standalone");
    }
  }, [invoice]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes, soRes] = await Promise.all([
          fetch(`${API_URL}/customers/simple`),
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/sales-orders`),
        ]);
        setCustomers(await custRes.json());
        setProducts(await prodRes.json());
        setSalesOrders(await soRes.json());
      } catch (err) {
        console.error("Error fetching form data:", err);
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
      const subtotal = updated[index].quantity * updated[index].unitPrice;
      updated[index].total = subtotal;
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
      let payload: any = {
        salesOrderId: formData.salesOrderId,
        customerId: parseInt(formData.customerId),
        date: formData.date,
        dueDate: formData.dueDate,
        notes: formData.notes,
        items: [],
      };

      if (tab === "so" && selectedSO) {
        payload.salesOrderId = selectedSO.id;
        payload.customerId = selectedSO.customerId;
        payload.items = items.map((it) => ({
          soItemId: parseInt(it.tempId),
          quantity: it.quantity,
        }));
      } else {
        payload.items = items.map((it) => ({
          productId: parseInt(it.productId),
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          taxRate: it.taxRate,
        }));
      }

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
      const saved = await res.json();
      onSave(saved);
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
      {/* Tabs */}
      <Tabs value={tab} onValueChange={(val) => setTab(val as "so" | "standalone")}>
        <TabsList>
          <TabsTrigger value="so" disabled={!!invoice && tab !== "so"}>
            From Sales Order
          </TabsTrigger>
          <TabsTrigger value="standalone" disabled={!!invoice && tab !== "standalone"}>
            Standalone Invoice
          </TabsTrigger>
        </TabsList>

        {/* Sales Order Tab */}
        <TabsContent value="so">
          <div className="space-y-4">
            <Label>Sales Order</Label>
            <Combobox
              options={salesOrders.map((so) => ({
                value: so.id,
                label: `${so.orderNumber} - ${so.customerName}`,
              }))}
              value={selectedSO?.id || ""}
              onValueChange={(val) => {
                const so = salesOrders.find((s) => s.id === val);
                if (so) {
                  setSelectedSO(so);
                  setFormData({
                    ...formData,
                    customerId: so.customerId.toString(),
                    salesOrderId: Number(so.id),
                  });
                  setItems(
                    so.items.map((it) => ({
                      tempId: it.id,
                      productId: it.productId,
                      productName: it.productName,
                      description: it.description || "",
                      quantity: it.quantity,
                      unitPrice: it.unitPrice,
                      total: it.unitPrice * it.quantity,
                      taxRate: it.taxRate,
                    }))
                  );
                }
              }}
              placeholder="Select sales order"
            />

            {selectedSO && (
              <Card>
                <CardHeader>
                  <CardTitle>Sales Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Include</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((it, idx) => (
                        <TableRow key={it.tempId}>
                          <TableCell>
                            <Checkbox
                              checked={it.quantity > 0}
                              onCheckedChange={(c) =>
                                updateItem(idx, "quantity", c ? it.quantity || 1 : 0)
                              }
                            />
                          </TableCell>
                          <TableCell>{it.productName}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={it.quantity}
                              onChange={(e) =>
                                updateItem(idx, "quantity", parseInt(e.target.value) || 0)
                              }
                            />
                          </TableCell>
                          <TableCell>₱{it.unitPrice.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Standalone Invoice Tab */}
        <TabsContent value="standalone">
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
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
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
                            updateItem(idx, "unitPrice", parseFloat(e.target.value) || 0)
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
                            updateItem(idx, "taxRate", parseFloat(e.target.value) / 100 || 0)
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
        </TabsContent>
      </Tabs>

      {/* Notes */}
      <div>
        <Label>Notes</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      {/* Totals */}
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
