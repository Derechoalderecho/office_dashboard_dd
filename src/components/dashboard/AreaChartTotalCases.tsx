"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchCasesForAreaChart } from "@/services/dasboardService";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChartDataPoint {
  date: string;
  count: number;
  fullDate?: string;
}

const chartConfig = {
  cases: {
    label: "Casos",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export default function AreaChartTotalCases() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("90d");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchCasesForAreaChart();
        console.log("Data fetched:", data);
        setChartData(data);
      } catch (error) {
        console.error("Error loading chart data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = React.useMemo(() => {
    if (!chartData || !chartData.length) {
      console.log("No chart data available");
      return [];
    }

    console.log("Filtering data with timeRange:", timeRange);
    console.log("Original chart data:", chartData);

    // Filter data based on days
    const now = new Date();
    let daysToShow = 90;
    
    if (timeRange === "30d") {
      daysToShow = 30;
    } else if (timeRange === "7d") {
      daysToShow = 7;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToShow);
    
    console.log("Cutoff date:", cutoffDate);

    // Filter data to only include dates after the cutoff
    const filtered = chartData
      .filter(item => {
        if (!item.fullDate) return false;
        
        const itemDate = new Date(item.fullDate);
        const isIncluded = itemDate >= cutoffDate;
        return isIncluded;
      })
      .sort((a, b) => {
        // Sort by date (using the full date)
        if (!a.fullDate || !b.fullDate) return 0;
        return new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime();
      });
    
    console.log("Filtered data:", filtered);
    
    return filtered;
  }, [chartData, timeRange]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Total de Casos</CardTitle>
            <CardDescription>
              Mostrando total de casos en el tiempo
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  console.log("Chart data length:", chartData.length);
  console.log("Filtered data length:", filteredData.length);

  if (!chartData.length || !filteredData.length) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Total de Casos</CardTitle>
            <CardDescription>
              No hay datos disponibles para mostrar
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No hay datos de casos disponibles para el período seleccionado
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Total de Casos</CardTitle>
          <CardDescription>
            {timeRange === "90d" && "Mostrando total de casos en los últimos 90 días"}
            {timeRange === "30d" && "Mostrando total de casos en los últimos 30 días"}
            {timeRange === "7d" && "Mostrando total de casos en los últimos 7 días"}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Seleccionar período"
          >
            <SelectValue placeholder="Últimos 90 días" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 90 días
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Últimos 30 días
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Últimos 7 días
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillCases" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-cases)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-cases)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => `Fecha: ${value}`}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="count"
              type="monotone"
              fill="url(#fillCases)"
              stroke="var(--color-cases)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
