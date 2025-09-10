import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom"; // ⬅️ import useLocation
import {
  Package,
  Users,
  Truck,
  Box,
  BarChart3,
  Home,
  Settings
} from "lucide-react";
import { cn } from "../../lib/utils";

type MenuItem = {
  name: string;
  href?: string;
  id: string;
  icon: React.ElementType;
  hasSubmenu?: boolean;
  subItems?: { name: string; href: string; id: string }[];
};

const menuItems: MenuItem[] = [
  { name: "Dashboard", id: "dashboard", href: "/", icon: Home },
  { name: "Products", id: "products", href: "/products", icon: Box },
  {
    name: "Orders",
    id: "orders",
    icon: Package,
    hasSubmenu: true,
    subItems: [
      { name: "Sales Orders", id: "orders_sales", href: "/sales-orders" },
      { name: "Purchase Orders", id: "orders_purchase", href: "/purchase-orders" },
      { name: "Quotations", id: "orders_quotations", href: "/quotations" },
      { name: "Invoices", id: "orders_invoices", href: "/invoices" }
    ]
  },
  { name: "Customers", id: "customers", href: "/customers", icon: Users },
  { name: "Suppliers", id: "suppliers", href: "/suppliers", icon: Truck },
  { name: "Reports", id: "reports", href: "/reports", icon: BarChart3 },
  { name: "Settings", id: "settings", href: "/settings", icon: Settings }
];

export default function Sidebar() {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const location = useLocation(); // ⬅️ current URL path

  const toggleSubmenu = (id: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <aside className="bg-white w-64 h-screen shadow-sm border-r fixed lg:static top-0 left-0 z-20 overflow-y-auto">
      {/* Header */}
      <div className="p-6 flex items-center">
        <Box className="h-8 w-8 text-[hsl(var(--primary))]" />
        <h1 className="text-xl font-bold ml-2 text-gray-800">InVision</h1>
      </div>

      {/* Navigation */}
      <nav className="mt-2">
        <ul>
          {menuItems.map((item) => {
            const isSubItemActive =
              item.subItems?.some((sub) => sub.href === location.pathname) || false;

            return (
              <li key={item.id}>
                {item.hasSubmenu ? (
                  <>
                    <button
                      onClick={() => toggleSubmenu(item.id)}
                      className={cn(
                        "w-full text-left flex items-center justify-between py-3 px-6 transition-colors rounded-[var(--radius)]",
                        isSubItemActive
                          ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-r-4 border-[hsl(var(--primary))]"
                          : "text-gray-600 hover:bg-[hsl(var(--muted))]"
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedMenus[item.id] ? "rotate-180" : ""
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {expandedMenus[item.id] && (
                      <ul className="pl-4 py-1 bg-[hsl(var(--muted))]">
                        {item.subItems?.map((sub) => (
                          <li key={sub.id}>
                            <NavLink
                              to={sub.href}
                              className={({ isActive }) =>
                                cn(
                                  "block w-full text-left py-2 px-8 text-sm transition-colors",
                                  isActive
                                    ? "text-[hsl(var(--primary))] font-medium"
                                    : "text-gray-600 hover:text-[hsl(var(--primary))]"
                                )
                              }
                            >
                              {sub.name}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.href || "#"}
                    className={({ isActive }) =>
                      cn(
                        "w-full text-left flex items-center py-3 px-6 transition-colors rounded-[var(--radius)]",
                        isActive
                          ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-r-4 border-[hsl(var(--primary))]"
                          : "text-gray-600 hover:bg-[hsl(var(--muted))]"
                      )
                    }
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </NavLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
