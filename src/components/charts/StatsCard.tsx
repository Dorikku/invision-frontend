"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down";
  icon: {
    path: string;
    bgColor?: string;
  };
  color?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
}: StatsCardProps) {
  const getTextColor = () => {
    if (color) return color;
    return trend === "up" ? "text-[#239e1c]" : "text-red-500";
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className={`${getTextColor()} rounded-full p-2`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={icon.path}
            />
          </svg>
        </span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        {change && (
          <div className="flex items-center mt-2">
            <span
              className={`text-sm ${
                trend === "up" ? "text-green-500" : "text-red-500"
              } flex items-center`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    trend === "up"
                      ? "M5 10l7-7m0 0l7 7m-7-7v18"
                      : "M19 14l-7 7m0 0l-7-7m7 7V3"
                  }
                />
              </svg>
              {change}
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
