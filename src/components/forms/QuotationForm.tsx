import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Combobox } from '../ui/combobox';
import { Plus, Trash2 } from 'lucide-react';
import type { Quotation, Customer, Product, SalesPerson, SimpleCustomer } from '../../types';

interface QuotationFormProps {
  quotation?: Quotation | null;
  onSave: (quotation: Partial<Quotation>) => void;
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

/**
 * Local type: Product with stock info returned by /products-with-stock
 */
type ProductWithStock = Product & {
  id: string;
  selling_price: number;
  cost_price: number;
  stock_info: {
    on_hand: number;
    reserved: number;
    available: number;
  };
};

export default function QuotationForm({ quotation, onSave, onCancel }: QuotationFormProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [customers, setCustomers] = useState<SimpleCustomer[]>([]);
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [formData, setFormData] = useState({
    salesPersonId: quotation?.salesPersonId || '1', // Default to sales person ID 1
    customerId: quotation?.customerId || '',
    date: quotation?.date ? new Date(quotation.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    validUntil: quotation?.validUntil ? new Date(quotation.validUntil).toISOString().split('T')[0] : '',
    notes: quotation?.notes || '',
  });
  const [items, setItems] = useState<FormLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Convert existing quotation items to form format and populate costs
  useEffect(() => {
    if (quotation?.items && products.length > 0) {
      const formItems: FormLineItem[] = quotation.items.map(item => {
        const productIdStr = String(item.productId);
        const product = products.find(p => String(p.id) === productIdStr);
        
        return {
          tempId: item.id || Date.now().toString(),
          productId: productIdStr,
          productName: item.productName || (product?.name || ''),
          description: item.description || (product?.description || ''),
          quantity: item.quantity,
          unitCost: product?.cost_price || 0,
          unitPrice: item.unitPrice,
          total: item.total,
          taxRate: item.taxRate,
        };
      });
      setItems(formItems);
    }
  }, [quotation, products]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch customers
        const customerResponse = await fetch(`${API_URL}/customers/simple`);
        if (!customerResponse.ok) {
          throw new Error('Failed to fetch customers');
        }
        const customerData = await customerResponse.json();
        setCustomers(customerData);

        // Fetch products with stock info
        const productResponse = await fetch(`${API_URL}/products-with-stock`);
        if (!productResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productData = await productResponse.json();
        setProducts(productData as ProductWithStock[]);

        // Fetch SalesPersons
        const salesPersonResponse = await fetch(`${API_URL}/salespersons`);
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
    value: String(product.id), // Ensure this is a string
    label: product.name,
    description: `₱${product.selling_price.toFixed(2)} - On hand: ${product.stock_info.on_hand}, Available: ${product.stock_info.available}`,
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
      const product = products.find(p => String(p.id) === String(value));
      if (product) {
        updatedItems[index].productName = product.name;
        updatedItems[index].description = product.description || '';
        updatedItems[index].unitPrice = product.selling_price;
        updatedItems[index].unitCost = product.cost_price;
      }
    }

    if (field === "quantity" || field === "unitPrice" || field === "taxRate" || field === "productId") {
      const q = Number(updatedItems[index].quantity || 0);
      const p = Number(updatedItems[index].unitPrice || 0);
      updatedItems[index].total = q * p;
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

  const hasInvalidQuantities = () => {
    return items.some((item) => {
      const selectedProduct = products.find((p) => String(p.id) === String(item.productId));
      if (!selectedProduct) return false;
      if (item.quantity > selectedProduct.stock_info.on_hand) return true;
      if (item.quantity > selectedProduct.stock_info.available) return true;
      return false;
    });
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
        valid_until: formData.validUntil || null,
        notes: formData.notes,
        items: items.map(item => ({
          product_id: parseInt(item.productId),
          quantity: item.quantity,
          price: item.unitPrice, // API expects 'price', not 'unitPrice'
          tax_rate: item.taxRate, // API expects 'tax_rate', not 'taxRate'
        }))
      };

      let response;
      if (quotation) {
        // Update existing quotation
        response = await fetch(`${API_URL}/quotations/${quotation.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
      } else {
        // Create new quotation
        response = await fetch(`${API_URL}/quotations`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save quotation');
      }

      const savedQuotation = await response.json();
      
      // Call the parent's onSave callback with the saved data
      onSave(savedQuotation);
      
    } catch (err) {
      console.error('Error saving quotation:', err);
      alert(`Error saving quotation: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
          <Label htmlFor="date">Quotation Date *</Label>
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
        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until</Label>
          <Input
            id="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
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
                      <div className="flex flex-col h-[60px] justify-between">
                        <Combobox
                          options={productOptions}
                          value={item.productId}
                          onValueChange={(value) => updateItem(index, "productId", value)}
                          placeholder="Select product"
                          searchPlaceholder="Search products..."
                          emptyText="No products found."
                          className="w-full"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.productId
                            ? (() => {
                                const p = products.find((p) => String(p.id) === String(item.productId));
                                if (!p) return "";
                                return `On hand: ${p.stock_info.on_hand} | Available: ${p.stock_info.available}`;
                              })()
                            : "\u00A0" /* keep blank space if no product */}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          value={item.quantity === 0 ? "" : item.quantity}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateItem(index, "quantity", val === "" ? "" : Number(val));
                          }}
                          className={`w-18 ${
                            (() => {
                              const selectedProduct = products.find((p) => String(p.id) === String(item.productId));
                              if (!selectedProduct) return "";
                              if (item.quantity > selectedProduct.stock_info.on_hand) return "border-red-500";
                              if (item.quantity > selectedProduct.stock_info.available) return "border-orange-500";
                              return "";
                            })()
                          }`}
                        />


                        {item.productId
                          ? (() => {
                              const selectedProduct = products.find((p) => String(p.id) === String(item.productId));
                              if (!selectedProduct) return "\u00A0"; // keep blank space

                              if (item.quantity > selectedProduct.stock_info.on_hand) {
                                return (
                                  <p className="text-xs text-red-600">
                                    ❌ Only {selectedProduct.stock_info.on_hand} on hand.
                                  </p>
                                );
                              }
                              if (item.quantity > selectedProduct.stock_info.available) {
                                return (
                                  <p className="text-xs text-orange-600">
                                    ⚠️ Only {selectedProduct.stock_info.available} available (reserved:{" "}
                                    {selectedProduct.stock_info.reserved})
                                  </p>
                                );
                              }

                              return "\u00A0"; // keep blank space if no warning
                            })()
                          : "\u00A0" /* keep blank space if no product */}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateItem(index, "unitPrice", val === "" ? "" : Number(val));
                        }}
                        className="w-24"
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        Cost price: ₱{item.unitCost?.toLocaleString() ?? "0.00"}
                      </span>                      
                    </TableCell>
                    <TableCell>
                      <div className="relative w-22">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.taxRate * 100}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateItem(index, "taxRate", val === "" ? "" : Number(val) / 100);
                          }}
                          className="pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                          %
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {"\u00A0"}
                      </span>                      
                    </TableCell>
                    <TableCell>
                      <span className="font-medium relative top-[-11px]">₱{item.total.toLocaleString()}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        className='relative top-[-11px]'
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
            <span className="font-medium">₱ {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span className="font-medium">₱ {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>₱ {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Additional notes or terms and conditions..."
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
          {saving ? 'Saving...' : (quotation ? 'Update' : 'Create')} Quotation
        </Button>
      </div>
    </form>
  );
}