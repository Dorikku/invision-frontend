"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ Schema Validation
const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  role_id: z.string().min(1, "Select a role"),
  temp_password: z.string().optional(),
});

export type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: any; // existing user for edit
  onSuccess: (createdUser?: any) => void; // ✅ Pass back API response
  onCancel: () => void;
}

export default function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const [roles, setRoles] = useState<{ id: number; role_name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role_id: user?.role_id?.toString() || "",
      temp_password: "",
    },
  });

  // Fetch available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch(`${API_URL}/roles`);
        if (!res.ok) throw new Error("Failed to load roles");
        const data = await res.json();
        setRoles(data);
      } catch (err) {
        toast.error("Failed to fetch roles");
      }
    };
    fetchRoles();
  }, []);

  // Submit handler
  const onSubmit = async (values: UserFormValues) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          role_id: parseInt(values.role_id),
          temp_password: values.temp_password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to create user");

      onSuccess(data); // ✅ Send API response to parent (includes temp password)
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      {/* Full Name */}
      <div>
        <Label>Full Name</Label>
        <Input placeholder="Enter full name" {...register("name")} />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label>Email</Label>
        <Input placeholder="Enter email address" {...register("email")} />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Role */}
      <div>
        <Label>Role</Label>
        <Select onValueChange={(val) => setValue("role_id", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.id.toString()}>
                {r.role_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.role_id && (
          <p className="text-red-500 text-sm mt-1">{errors.role_id.message}</p>
        )}
      </div>

      {/* Temporary Password */}
      <div>
        <Label>Temporary Password (optional)</Label>
        <Input
          placeholder="Auto-generated if empty"
          {...register("temp_password")}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : user ? "Save Changes" : "Create User"}
        </Button>
      </div>
    </form>
  );
}
