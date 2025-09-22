import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent } from "../ui/card";
import { toast } from "sonner";

interface SalesPersonFormProps {
  salesperson?: { id: number; name: string };
  onSave: () => void;
  onCancel: () => void;
}

export default function SalesPersonForm({ salesperson, onSave, onCancel }: SalesPersonFormProps) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (salesperson) {
      setName(salesperson.name);
    } else {
      setName("");
    }
  }, [salesperson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = salesperson ? "PUT" : "POST";
      const url = salesperson
        ? `/api/salespersons/${salesperson.id}`
        : "/api/salespersons";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to save");
      }

      toast.success("Sales person saved");
      onSave();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">{salesperson ? "Update" : "Create"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
