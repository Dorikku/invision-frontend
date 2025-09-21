"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/charts/StatsCard";
import MonthlySalesChart from "@/components/charts/MonthlySalesChart";
import WeeklySalesChart from "@/components/charts/WeeklySalesChart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [statsData] = useState([
    {
      id: 1,
      title: "Total Sales",
      value: "₱24,678",
      change: "12.5%",
      trend: "up" as const,
      icon: {
        path: "M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941",
        bgColor: "bg-blue-500",
      },
    },
    {
      id: 2,
      title: "Profit",
      value: "₱8,427",
      change: "8.2%",
      trend: "up" as const,
      icon: {
        path: "M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z",
        bgColor: "bg-green-500",
      },
    },
    {
      id: 3,
      title: "Low Stock Items",
      value: "12",
      change: "4",
      trend: "down" as const,
      icon: {
        path: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
        bgColor: "bg-red-500",
      },
    },
    {
      id: 4,
      title: "Pending Orders",
      value: "28",
      change: "12%",
      trend: "up" as const,
      icon: {
        path: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
        bgColor: "bg-yellow-500",
      },
    },
  ]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-1">
      <div className="max-w-full mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-3">
            <Button variant="outline">
              Generate Sales Report
            </Button>
            <Button
              onClick={() => navigate("/sales-orders", { state: { openForm: true } })} // ⬅️ update
            >
              + Add New Order
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {statsData.map((stat) => (
            <div key={stat.id} className="min-w-0">
              <StatsCard
                title={stat.title}
                value={stat.value}
                change={stat.change}
                trend={stat.trend}
                icon={stat.icon}
              />
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          <Card className="min-w-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Monthly Sales</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="w-full overflow-hidden">
                <MonthlySalesChart />
              </div>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg sm:text-xl">Weekly Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="w-full overflow-hidden">
                <WeeklySalesChart />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}