"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts";
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

// Custom tooltip with typing
const CustomTooltip: React.FC<TooltipProps<ValueType, NameType>> = ({
  active,
  payload,
  label,
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-700">{label}</p>
        {payload.map((entry, index) => (
          <p
            key={`item-${index}`}
            className={`text-sm ${
              entry.name === "Sales"
                ? "text-blue-600"
                : entry.name === "Orders"
                ? "text-purple-600"
                : "text-green-600"
            }`}
          >
            {entry.name}:{" "}
            {entry.name === "Orders"
              ? entry.value
              : formatCurrency(entry.value as number)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

type WeeklySalesChartProps = {
  data: { day: string; sales: number; profit: number; orders: number }[];
};

export default function WeeklySalesChart({ data }: WeeklySalesChartProps) {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis
            yAxisId="left"
            tickFormatter={(tick: number) => {
              if (tick >= 1000) {
                return `₱${tick / 1000}k`;
              }
              return `₱${tick}`;
            }}
          />
          <YAxis yAxisId="right" orientation="right" domain={[0, "dataMax + 5"]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="sales"
            name="Sales"
            stroke="#2B92F3"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="profit"
            name="Profit"
            stroke="#239e1c"
            strokeWidth={2}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="orders"
            name="Orders"
            stroke="#8b5cf6"
            strokeDasharray="5 5"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
