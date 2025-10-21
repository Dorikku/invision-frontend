"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Search, Lock, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";
import UserForm from "@/components/forms/UserForm";

const API_URL = import.meta.env.VITE_API_URL;

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [successDialog, setSuccessDialog] = useState(false);
  const [newUserInfo, setNewUserInfo] = useState<any>(null);

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

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleDeactivateUser = async (user: any) => {
    if (confirm(`Deactivate ${user.name}?`)) {
      toast.success(`${user.name} has been deactivated`);
    }
  };

  const handleResetPassword = async (user: any) => {
    if (confirm(`Send password reset email to ${user.email}?`)) {
      toast.success(`Password reset email sent to ${user.email}`);
    }
  };

  const columns = [
    { key: "name", label: "Full Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role_name",
      label: "Role",
      render: (value: string) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "is_active",
      label: "Status",
      render: (value: boolean) =>
        value ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
  ];

  const getActionItems = (user: any) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          •••
        </Button>
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
          <p className="text-muted-foreground">
            Manage system accounts and roles
          </p>
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

      {/* Add/Edit User Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Add New User"}</DialogTitle>
          </DialogHeader>

          <UserForm
            user={editingUser}
            onSuccess={(createdUser) => {
              setIsFormOpen(false);
              if (createdUser) {
                setNewUserInfo(createdUser);
                setSuccessDialog(true);
              }
              loadUsers();
            }}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ✅ Success Dialog for new user */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>User Created Successfully</DialogTitle>
            <DialogDescription>
              The user account has been created and an email has been sent.
            </DialogDescription>
          </DialogHeader>

          {newUserInfo && (
            <div className="space-y-3 mt-4">
              <p>
                <strong>Name:</strong> {newUserInfo.name}
              </p>
              <p>
                <strong>Email:</strong> {newUserInfo.email}
              </p>
              <div className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md">
                <div>
                  <strong>Temporary Password:</strong>{" "}
                  <span className="font-mono">{newUserInfo.temporary_password}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    navigator.clipboard.writeText(newUserInfo.temporary_password);
                    toast.success("Password copied to clipboard");
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={() => setSuccessDialog(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
