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

interface SalesOrderFormProps {
  salesOrder?: SalesOrder | null;
  onSave: (salesOrder: Partial<SalesOrder>) => void;
  onCancel: () => void;
}

interface FormLineItem {
  tempId: string; // Temporary ID for frontend tracking
  productId: string;
  productName: string;
  description: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  total: number;
  taxRate: number;
}

export default function SalesOrderForm({ salesOrder, onSave, onCancel }: SalesOrderFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [formData, setFormData] = useState({
    salesPersonId: salesOrder?.salesPersonId || '1', // Default to sales person ID 1
    customerId: salesOrder?.customerId || '',
    date: salesOrder?.date || new Date().toISOString().split('T')[0],
    invoiceStatus: salesOrder?.invoiceStatus || 'not_invoiced' as const,
    paymentStatus: salesOrder?.paymentStatus || 'unpaid' as const,
    shipmentStatus: salesOrder?.shipmentStatus || 'not_shipped' as const,
    notes: salesOrder?.notes || '',
  });
  const [items, setItems] = useState<FormLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Convert existing sales order items to form format
  useEffect(() => {
    if (salesOrder?.items) {
      const formItems: FormLineItem[] = salesOrder.items.map(item => ({
        tempId: item.id, // Use existing ID as temp ID for editing
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
        // Fetch customers
        const customerResponse = await fetch('http://127.0.0.1:8000/api/v1/customers');
        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customers');
        }
        const customerData = await customerResponse.json();
        setCustomers(customerData);

        // Fetch products
        const productResponse = await fetch('http://127.0.0.1:8000/api/v1/products');
        if (!productResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productData = await productResponse.json();
        setProducts(productData);

        // Fetch SalesPersons
        const salesPersonResponse = await fetch('http://127.0.0.1:8000/api/v1/salespersons');
        if (!salesPersonResponse.ok) {
          throw new Error('Failed to fetch sales persons');
        }
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
    description: `₱${product.selling_price.toFixed(2)} - ${product.description || ''}`
  }));

  const addItem = () => {
    const newItem: FormLineItem = {
      tempId: Date.now().toString(), // Temporary ID for frontend tracking
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

    // Recalculate total when quantity, unitPrice, or taxRate changes
    if (field === 'quantity' || field === 'unitPrice' || field === 'productId' || field === 'taxRate') {
      const subtotal = updatedItems[index].quantity * updatedItems[index].unitPrice;
      updatedItems[index].total = subtotal;
    }

    setItems(updatedItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = items.reduce((sum, item) => sum + (item.total * item.taxRate), 0);
    const total = subtotal + tax;
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || items.length === 0) {
      alert('Please select a customer and add at least one item.');
      return;
    }

    if (!formData.salesPersonId) {
      alert('Please select a sales person.');
      return;
    }

    // Validate that all items have products selected
    const hasEmptyProducts = items.some(item => !item.productId);
    if (hasEmptyProducts) {
      alert('Please select a product for all line items.');
      return;
    }

    setSaving(true);
    try {
      // Prepare request data in the format expected by the API
      const requestData = {
        customer_id: parseInt(formData.customerId),
        sales_person_id: parseInt(formData.salesPersonId),
        date: formData.date,
        invoice_status: formData.invoiceStatus,
        payment_status: formData.paymentStatus,
        shipment_status: formData.shipmentStatus,
        notes: formData.notes,
        items: items.map(item => ({
          product_id: parseInt(item.productId),
          quantity: item.quantity,
          price: item.unitPrice, // API expects 'price', not 'unitPrice'
          tax_rate: item.taxRate, // API expects 'tax_rate', not 'taxRate'
        }))
      };

      let response;
      if (salesOrder) {
        // Update existing sales order (you'll need to implement PUT endpoint)
        response = await fetch(`http://127.0.0.1:8000/api/v1/sales-orders/${salesOrder.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
      } else {
        // Create new sales order
        response = await fetch('http://127.0.0.1:8000/api/v1/sales-orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save sales order');
      }

      const savedSalesOrder = await response.json();
      
      // Call the parent's onSave callback with the saved data
      onSave(savedSalesOrder);
      
    } catch (err) {
      console.error('Error saving sales order:', err);
      alert(`Error saving sales order: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const { subtotal, tax, total } = calculateTotals();

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>{error}</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerId">Customer *</Label>
          <Combobox
            options={customers.map(customer => ({
              value: customer.id,
              label: customer.name,
              description: customer.contact_person || ''
            }))}
            value={formData.customerId}
            onValueChange={(value) => setFormData({ ...formData, customerId: value })}
            placeholder="Select a customer"
            searchPlaceholder="Search customers..."
            emptyText="No customers found."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date">Order Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="salesPersonId">Sales Person *</Label>
          <Combobox
            options={salesPersons.map(salesPerson => ({
              value: salesPerson.id,
              label: salesPerson.name,
            }))}
            value={formData.salesPersonId}
            onValueChange={(value) => setFormData({ ...formData, salesPersonId: value })}
            placeholder="Select a sales person"
            searchPlaceholder="Search sales persons..."
            emptyText="No sales persons found."
          />
        </div>
      </div>

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
                          ₱{item.unitCost?.toFixed(2) ?? "0.00"}
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
          {saving ? 'Saving...' : (salesOrder ? 'Update' : 'Create')} Sales Order
        </Button>
      </div>
    </form>
  );
}