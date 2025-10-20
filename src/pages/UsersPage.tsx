"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Shield, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/users`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      toast.error("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeactivateUser = async (user) => {
    if (confirm(`Deactivate ${user.name}?`)) {
      // implement API call to deactivate
      toast.success(`${user.name} has been deactivated`);
    }
  };

  const handleResetPassword = async (user) => {
    if (confirm(`Send password reset email to ${user.email}?`)) {
      // implement API call to send reset
      toast.success(`Password reset email sent to ${user.email}`);
    }
  };

  const columns = [
    { key: "name", label: "Full Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role_name",
      label: "Role",
      render: (value) => (
        <Badge variant="outline" className="capitalize">{value}</Badge>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (value) =>
        value ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
  ];

  const getActionItems = (user) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">•••</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEditUser(user)}>
          <Edit className="w-4 h-4 mr-2" /> Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleResetPassword(user)}>
          <Lock className="w-4 h-4 mr-2" /> Reset Password
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDeactivateUser(user)}>
          <Trash2 className="w-4 h-4 mr-2 text-red-500" /> Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-lg">
        Loading users...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system accounts and roles</p>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-[250px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search Users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <DataTable
            data={users}
            columns={columns}
            searchTerm={searchTerm}
            actions={getActionItems}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Edit User" : "Add New User"}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? "Update user details or role."
                : "Create a new account for your staff."}
            </DialogDescription>
          </DialogHeader>
          {/* Replace below with your UserForm component */}
          <div className="flex flex-col gap-3">
            <Input placeholder="Full Name" />
            <Input placeholder="Email" />
            <Input placeholder="Role" />
            <Input placeholder="Temporary Password" type="password" />
            <Button className="mt-2">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
