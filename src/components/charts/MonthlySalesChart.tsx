"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
import { monthlySalesData } from "../../data/inventoryData";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";

// Format currency as PHP
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Custom tooltip component with typing
const CustomTooltip: React.FC<
  TooltipProps<ValueType, NameType>
> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-700">{label}</p>
        <p className="text-sm text-blue-600">
          Sales: {formatCurrency(payload[0].value as number)}
        </p>
        <p className="text-sm text-green-600">
          Profit: {formatCurrency(payload[1].value as number)}
        </p>
      </div>
    );
  }
  return null;
};

export default function MonthlySalesChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={monthlySalesData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis
            tickFormatter={(tick: number) => {
              if (tick >= 1000) {
                return `₱${tick / 1000}k`;
              }
              return `₱${tick}`;
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Area
            type="monotone"
            dataKey="sales"
            name="Sales"
            stroke="#2B92F3"
            fill="#e2f0fe"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#239e1c"
            fill="#e0f9e8"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
