import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Edit, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";

import type { ActiveOrder, OrderHistoryItem } from "@/types";
import SalesPersonForm from "@/components/forms/SalesPersonForm";

// ---------------- API Calls ----------------
const API_URL = import.meta.env.VITE_API_URL;

interface SalesPerson {
  id: number;
  sales_person_code: string;
  name: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  avatar: string;
}

const fetchSalesPersons = async (): Promise<SalesPerson[]> => {
  const res = await fetch(`${API_URL}/salespersons`);
  if (!res.ok) throw new Error("Failed to fetch salespersons");
  return res.json();
};

const fetchActiveOrders = async (id: number): Promise<ActiveOrder[]> => {
  const res = await fetch(`${API_URL}/salespersons/${id}/active-orders`);
  if (!res.ok) throw new Error("Failed to fetch active orders");
  return res.json();
};

const fetchOrderHistory = async (id: number): Promise<OrderHistoryItem[]> => {
  const res = await fetch(`${API_URL}/salespersons/${id}/order-history`);
  if (!res.ok) throw new Error("Failed to fetch order history");
  return res.json();
};

const deleteSalesPerson = async (id: number) => {
  const res = await fetch(`${API_URL}/salespersons/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete salesperson");
  }
};

// ---------------- Helpers ----------------
const deriveOrderStatus = (order: ActiveOrder): string => {
  if (order.invoice_status === "partial") return "Partially Invoiced";
  if (order.payment_status === "partial") return "Partially Paid";
  if (order.shipment_status === "partial") return "Partially Shipped";

  if (
    order.invoice_status === "invoiced" &&
    order.payment_status === "paid" &&
    order.shipment_status === "shipped"
  ) {
    return "Completed";
  }

  if (order.invoice_status === "invoiced" && order.payment_status !== "paid")
    return "Invoiced";

  if (order.payment_status === "unpaid") return "Unpaid";
  if (order.shipment_status === "not_shipped") return "Not Shipped";

  if (order.shipment_status === "shipped") return "Shipped";

  return "Active";
};

const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "partially invoiced":
    case "partially paid":
    case "partially shipped":
      return "secondary";
    case "invoiced":
      return "default";
    case "unpaid":
      return "destructive";
    case "shipped":
      return "outline";
    case "completed":
      return "default";
    default:
      return "secondary";
  }
};

// ---------------- Component ----------------
const SalesPersonPage = () => {
  const [salesPersons, setSalesPersons] = useState<SalesPerson[]>([]);
  const [selectedSalesPerson, setSelectedSalesPerson] = useState<SalesPerson | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSalesPerson, setEditingSalesPerson] = useState<SalesPerson | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSalesPersons();
        setSalesPersons(data);
        if (data.length > 0) setSelectedSalesPerson(data[0]);
      } catch (err) {
        console.error("Error loading salespersons:", err);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedSalesPerson) return;
    const loadOrders = async () => {
      try {
        const [active, history] = await Promise.all([
          fetchActiveOrders(selectedSalesPerson.id),
          fetchOrderHistory(selectedSalesPerson.id),
        ]);
        setActiveOrders(active);
        setOrderHistory(history);
      } catch (err) {
        console.error("Error loading orders:", err);
      }
    };
    loadOrders();
  }, [selectedSalesPerson]);

  const filtered = salesPersons.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.sales_person_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    setEditingSalesPerson(null);
    setIsFormOpen(true);
  };

  const handleEdit = (sp: SalesPerson) => {
    setEditingSalesPerson(sp);
    setIsFormOpen(true);
  };

  const handleSave = async (saved: SalesPerson) => {
    try {
      const data = await fetchSalesPersons();
      setSalesPersons(data);
      setSelectedSalesPerson(saved);
      setIsFormOpen(false);
      setEditingSalesPerson(null);
    } catch {
      toast.error("Failed to refresh salespersons");
    }
  };

  const handleDelete = async () => {
    if (!selectedSalesPerson) return;
    try {
      await deleteSalesPerson(selectedSalesPerson.id);
      toast.success("Salesperson deleted successfully");
      const data = await fetchSalesPersons();
      setSalesPersons(data);
      setSelectedSalesPerson(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete salesperson");
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  return (
    <ScrollArea>
      <div className="flex h-screen">
        {/* Left Panel */}
        <ScrollArea className="w-1/3 bg-white border-r border-gray-200 flex flex-col rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold text-gray-800">Sales Agents</h1>
              <Button size="sm" variant="outline" className="gap-1" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sales agents"
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="ghost" size="sm" className="ml-2 text-gray-400">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* SalesPerson List */}
          <div className="flex-1 overflow-y-auto">
            {filtered.map((sp) => (
              <div
                key={sp.id}
                onClick={() => setSelectedSalesPerson(sp)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedSalesPerson?.id === sp.id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center">
                  <img src={sp.avatar} alt={sp.name} className="w-10 h-10 rounded-full mr-3" />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{sp.name}</h3>
                    <p className="text-sm text-gray-600">{sp.sales_person_code}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Right Panel */}
        <ScrollArea className="flex-1 overflow-y-auto">
          {selectedSalesPerson && (
            <div className="p-6">
              {/* Header */}
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <img
                        src={selectedSalesPerson.avatar}
                        alt={selectedSalesPerson.name}
                        className="w-16 h-16 rounded-full mr-4"
                      />
                      <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                          {selectedSalesPerson.name}
                        </h1>
                        <p className="text-md text-gray-600">{selectedSalesPerson.sales_person_code}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(selectedSalesPerson)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                        <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Total Orders</p>
                      <p className="text-xl font-semibold text-gray-900">
                        {selectedSalesPerson.total_orders}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Sales</p>
                      <p className="text-xl font-semibold text-gray-900">
                        ₱{selectedSalesPerson.total_spent.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Average Sales Value</p>
                      <p className="text-xl font-semibold text-gray-900">
                        ₱{selectedSalesPerson.average_order_value.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Orders */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Active Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            PO#
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Total Sales
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {activeOrders.map((order) => {
                          const status = deriveOrderStatus(order);
                          return (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <Badge variant={getStatusVariant(status)}>{status}</Badge>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">{order.order_number}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">{order.date}</td>
                              <td className="px-4 py-3 text-sm text-gray-900">₱{Number(order.total).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                        {activeOrders.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              No active orders
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Item</th>
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Quantity</th>
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Unit Price</th>
                          <th className="px-2 py-2 text-left text-sm font-medium text-gray-500">Total Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderHistory.map((order) => (
                          <React.Fragment key={order.id}>
                            <tr className="bg-gray-50">
                              <td colSpan={4} className="px-2 py-2 text-sm font-medium text-gray-700">
                                {order.order_number} - {order.date}
                              </td>
                            </tr>
                            {order.items.map((item, idx) => (
                              <tr key={`${order.id}-${idx}`} className="border-b border-gray-100">
                                <td className="px-2 py-2 text-sm text-gray-900">{item.productName}</td>
                                <td className="px-2 py-2 text-sm text-gray-900">{item.quantity}</td>
                                <td className="px-2 py-2 text-sm text-gray-900">
                                  ₱{item.unitPrice.toLocaleString()}
                                </td>
                                <td className="px-2 py-2 text-sm text-gray-900">
                                  ₱{item.total.toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                        {orderHistory.length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              No past orders
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSalesPerson ? "Edit Salesperson" : "Create New Salesperson"}</DialogTitle>
            <DialogDescription>
              {editingSalesPerson
                ? "Update the salesperson details below."
                : "Fill in the details to create a new salesperson."}
            </DialogDescription>
          </DialogHeader>
          <SalesPersonForm
            salesPerson={editingSalesPerson}
            onSave={handleSave}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Salesperson</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selectedSalesPerson?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
};

export default SalesPersonPage;
