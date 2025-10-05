import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Combobox } from '../ui/combobox';
import { Plus, Trash2 } from 'lucide-react';
import type { SalesOrder, Customer, Product, LineItem, SalesPerson } from '../../types';

interface EditSalesOrderFormProps {
  salesOrder: SalesOrder; // Required for editing
  onSave: (salesOrder: Partial<SalesOrder>) => void;
  onCancel: () => void;
  saving: boolean;
  setSaving: (saving: boolean) => void;
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

export default function EditSalesOrderForm({ salesOrder, onSave, onCancel, saving, setSaving }: EditSalesOrderFormProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [formData, setFormData] = useState({
    salesPersonId: salesOrder.salesPersonId || '1',
    customerId: salesOrder.customerId || '',
    date: salesOrder.date || new Date().toISOString().split('T')[0],
    invoiceStatus: salesOrder.invoiceStatus || 'not_invoiced' as const,
    paymentStatus: salesOrder.paymentStatus || 'unpaid' as const,
    shipmentStatus: salesOrder.shipmentStatus || 'not_shipped' as const,
    notes: salesOrder.notes || '',
  });
  const [items, setItems] = useState<FormLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (salesOrder.items) {
      const formItems: FormLineItem[] = salesOrder.items.map(item => ({
        tempId: item.id,
        productId: item.productId,
        productName: item.productName,
        description: item.description || '',
        quantity: item.quantity,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice,
        total: item.total,
        taxRate: item.taxRate,
      }));
      setItems(formItems);
    }
  }, [salesOrder]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const customerResponse = await fetch(`${API_URL}/customers`);
        if (!customerResponse.ok) throw new Error('Failed to fetch customers');
        const customerData = await customerResponse.json();
        setCustomers(customerData);

        const productResponse = await fetch(`${API_URL}/products`);
        if (!productResponse.ok) throw new Error('Failed to fetch products');
        const productData = await productResponse.json();
        setProducts(productData);

        const salesPersonResponse = await fetch(`${API_URL}/salespersons`);
        if (!salesPersonResponse.ok) throw new Error('Failed to fetch sales persons');
        const salesPersonData = await salesPersonResponse.json();
        setSalesPersons(salesPersonData);
      } catch (err) {
        setError('Error fetching data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const selectedCustomer = customers.find(c => c.id === formData.customerId);

  const productOptions = products.map(product => ({
    value: product.id,
    label: product.name,
    description: `₱${product.selling_price.toLocaleString()} - ${product.description || ''}`,
  }));

  const addItem = () => {
    const newItem: FormLineItem = {
      tempId: Date.now().toString(),
      productId: '',
      productName: '',
      description: '',
      quantity: 1,
      unitCost: 0,
      unitPrice: 0,
      total: 0,
      taxRate: 0,
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, field: keyof FormLineItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].description = product.description || '';
        updatedItems[index].unitPrice = product.selling_price;
        updatedItems[index].unitCost = product.cost_price;
      }
    }

    if (field === 'quantity' || field === 'unitPrice' || field === 'productId' || field === 'taxRate') {
      const subtotal = updatedItems[index].quantity * updatedItems[index].unitPrice;
      updatedItems[index].total = subtotal;
    }

    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = items.reduce((sum, item) => sum + item.total * item.taxRate, 0);
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId) {
      setError('Please select a customer');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one item');
      return;
    }
    if (items.some(item => !item.productId)) {
      setError('Please select a product for all items');
      return;
    }

    onSave({
      id: salesOrder.id,
      customerId: formData.customerId,
      salesPersonId: formData.salesPersonId,
      date: formData.date,
      invoiceStatus: formData.invoiceStatus,
      paymentStatus: formData.paymentStatus,
      shipmentStatus: formData.shipmentStatus,
      notes: formData.notes,
      items: items.map(item => ({
        id: item.tempId,
        productId: item.productId,
        productName: item.productName,
        description: item.description,
        quantity: item.quantity,
        unitCost: item.unitCost,
        unitPrice: item.unitPrice,
        total: item.total,
        taxRate: item.taxRate,
      })),
      subtotal,
      tax,
      total,
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer">Customer</Label>
          <Select
            value={formData.customerId}
            onValueChange={(value) => setFormData({ ...formData, customerId: value })}
          >
            <SelectTrigger id="customer">
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map(customer => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedCustomer && (
            <div className="text-sm text-muted-foreground">
              <p>{selectedCustomer.email}</p>
              <p>{selectedCustomer.address}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="salesPerson">Sales Person</Label>
          <Select
            value={formData.salesPersonId}
            onValueChange={(value) => setFormData({ ...formData, salesPersonId: value })}
          >
            <SelectTrigger id="salesPerson">
              <SelectValue placeholder="Select sales person" />
            </SelectTrigger>
            <SelectContent>
              {salesPersons.map(salesPerson => (
                <SelectItem key={salesPerson.id} value={salesPerson.id}>
                  {salesPerson.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label htmlFor="invoiceStatus">Invoice Status</Label>
              <Input
                id="invoiceStatus"
                value={formData.invoiceStatus}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="paymentStatus">Payment Status</Label>
              <Input
                id="paymentStatus"
                value={formData.paymentStatus}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="shipmentStatus">Shipment Status</Label>
              <Input
                id="shipmentStatus"
                value={formData.shipmentStatus}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Items</CardTitle>
          <Button type="button" onClick={addItem} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
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
                {items.map((item, index) => (
                  <TableRow key={item.tempId}>
                    <TableCell>
                      <Combobox
                        options={productOptions}
                        value={item.productId}
                        onValueChange={(value) => updateItem(index, 'productId', value)}
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
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-18"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-24"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          ₱{item.unitCost?.toFixed(2) ?? '0.00'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="relative w-22">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.taxRate * 100}
                          onChange={(e) =>
                            updateItem(index, 'taxRate', parseFloat(e.target.value) / 100 || 0)
                          }
                          className="pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          %
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">₱{item.total.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
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

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or delivery instructions..."
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
          {saving ? 'Saving...' : 'Update Sales Order'}
        </Button>
      </div>
    </form>
  );
}