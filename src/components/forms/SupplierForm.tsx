// src/components/forms/SupplierForm.tsx

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import type { SimpleSupplier } from "../../types";
import { toast } from "sonner";

interface SupplierFormProps {
  supplier?: SimpleSupplier | null;
  onSave: (supplier: SimpleSupplier) => void;
  onCancel: () => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function SupplierForm({ supplier, onSave, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    name: supplier?.name || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    address: supplier?.address || "",
    contact_person: supplier?.contact_person || "",
    status: supplier?.status || "New",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSaving(true);
    try {
      const url = supplier
        ? `${API_URL}/suppliers/${supplier.id}`
        : `${API_URL}/suppliers`;

      const method = supplier ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to save supplier");
      }

      const savedSupplier: SimpleSupplier = await response.json();
      toast.success(supplier ? "Supplier updated successfully" : "Supplier created successfully");
      onSave(savedSupplier);
    } catch (err) {
      console.error("Error saving supplier:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save supplier");
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
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange("address", e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact_person">Contact Person</Label>
        <Input
          id="contact_person"
          value={formData.contact_person}
          onChange={(e) => handleChange("contact_person", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => handleChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Preferred">Preferred</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : supplier ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
}
