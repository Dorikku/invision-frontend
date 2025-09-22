import { useState, useEffect } from "react";
import { Plus, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import SalesPersonForm from "@/components/forms/SalesPersonForm";

interface SalesPerson {
  id: number;
  name: string;
  total_orders: number;
  total_sales: number;
  average_order_value: number;
  avatar: string;
}

interface ActiveOrder {
  id: string;
  order_number: string;
  po_number: string;
  date: string;
  status: string;
  invoice_status: string;
  payment_status: string;
  shipment_status: string;
  total: number;
}

interface OrderHistory {
  id: string;
  order_number: string;
  date: string;
  total: number;
  status: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    description?: string;
    quantity: number;
    unitCost: number;
    unitPrice: number;
    total: number;
    taxRate: number;
  }[];
}

export default function SalesPersonsPage() {
  const [salespersons, setSalespersons] = useState<SalesPerson[]>([]);
  const [selected, setSelected] = useState<SalesPerson | null>(null);
  const [editing, setEditing] = useState<SalesPerson | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const BASE_URL = import.meta.env.VITE_API_URL

  const loadSalesPersons = async () => {
    const res = await fetch(`${BASE_URL}/salespersons`);
    const data = await res.json();
    setSalespersons(data);
    if (selected) {
      const refreshed = data.find((sp: SalesPerson) => sp.id === selected.id);
      if (refreshed) setSelected(refreshed);
    }
  };

  const loadOrders = async (id: number) => {
    const [activeRes, historyRes] = await Promise.all([
      fetch(`${BASE_URL}/salespersons/${id}/active-orders`),
      fetch(`${BASE_URL}/salespersons/${id}/order-history`),
    ]);
    setActiveOrders(await activeRes.json());
    setOrderHistory(await historyRes.json());
  };

  useEffect(() => {
    loadSalesPersons();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this sales person?")) return;
    try {
      const res = await fetch(`/api/salespersons/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to delete");
      }
      toast.success("Deleted");
      setSelected(null);
      loadSalesPersons();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {/* Left panel */}
      <Card className="col-span-1">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Sales Persons</CardTitle>
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {salespersons.map((sp) => (
              <li
                key={sp.id}
                className={`p-2 rounded cursor-pointer ${selected?.id === sp.id ? "bg-blue-100" : "hover:bg-gray-100"}`}
                onClick={() => { setSelected(sp); loadOrders(sp.id); }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <img src={sp.avatar} alt={sp.name} className="w-8 h-8 rounded-full" />
                    <span>{sp.name}</span>
                  </div>
                  <div className="space-x-1">
                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setEditing(sp); setShowForm(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(sp.id); }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Right panel */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>{selected ? selected.name : "Select a sales person"}</CardTitle>
        </CardHeader>
        <CardContent>
          {selected && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-bold">{selected.total_orders}</p>
                    <p className="text-sm text-muted">Orders</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-bold">${selected.total_sales.toFixed(2)}</p>
                    <p className="text-sm text-muted">Total Sales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-bold">${selected.average_order_value.toFixed(2)}</p>
                    <p className="text-sm text-muted">Avg Order</p>
                  </CardContent>
                </Card>
              </div>

              {/* Active Orders */}
              <h3 className="font-semibold mb-2">Active Orders</h3>
              <ul className="space-y-2 mb-6">
                {activeOrders.map((o) => (
                  <li key={o.id} className="border p-2 rounded flex justify-between">
                    <div>
                      <p className="font-medium">{o.order_number}</p>
                      <p className="text-sm text-muted">PO: {o.po_number}</p>
                    </div>
                    <Badge>{o.status}</Badge>
                  </li>
                ))}
                {activeOrders.length === 0 && <p className="text-sm text-muted">No active orders</p>}
              </ul>

              {/* Order History */}
              <h3 className="font-semibold mb-2">Order History</h3>
              <ul className="space-y-2">
                {orderHistory.map((o) => (
                  <li key={o.id} className="border p-2 rounded">
                    <p className="font-medium">{o.order_number}</p>
                    <p className="text-sm text-muted">{new Date(o.date).toLocaleDateString()}</p>
                    <p className="text-sm">Total: ${o.total.toFixed(2)}</p>
                  </li>
                ))}
                {orderHistory.length === 0 && <p className="text-sm text-muted">No completed orders</p>}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow-lg w-96">
            <SalesPersonForm
              salesperson={editing || undefined}
              onSave={() => { setShowForm(false); loadSalesPersons(); }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
