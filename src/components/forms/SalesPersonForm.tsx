import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { toast } from "sonner";

interface SalesPerson {
  id: number;
  name: string;
  total_orders: number;
  total_spent: number;
  average_order_value: number;
  avatar: string;
}

interface SalesPersonFormProps {
  salesPerson?: SalesPerson | null;
  onSave: (sp: SalesPerson) => void;
  onCancel: () => void;
}

export default function SalesPersonForm({ salesPerson, onSave, onCancel }: SalesPersonFormProps) {
  const API_URL = import.meta.env.VITE_API_URL;
  const [name, setName] = useState(salesPerson?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const url = salesPerson
        ? `${API_URL}/salespersons/${salesPerson.id}`
        : `${API_URL}/salespersons`;
      const method = salesPerson ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to save salesperson");
      }

      const saved: SalesPerson = await response.json();
      toast.success(salesPerson ? "Salesperson updated successfully" : "Salesperson created successfully");
      onSave(saved);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save salesperson");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : salesPerson ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
