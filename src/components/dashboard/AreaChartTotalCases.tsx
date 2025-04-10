"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchCasesForAreaChart } from "@/services/dasboardService"

const chartConfig = {
  count: {
    label: "Casos",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function AreaChartTotalCases() {
  const [timeRange, setTimeRange] = React.useState("90d")
  const [chartData, setChartData] = React.useState<Array<{ date: string; count: number; fullDate?: string }>>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const data = await fetchCasesForAreaChart()
        setChartData(data)
      } catch (error) {
        console.error("Error loading chart data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return []
    
    // Ordenar para encontrar la fecha más reciente como referencia
    const sortedData = [...chartData].sort((a, b) => {
      const dateA = new Date(a.fullDate || a.date)
      const dateB = new Date(b.fullDate || b.date)
      return dateB.getTime() - dateA.getTime()
    })
    
    // Usar la fecha más reciente como referencia (o la fecha actual si no hay datos)
    const referenceDate = sortedData.length > 0 
      ? new Date(sortedData[0].fullDate || sortedData[0].date)
      : new Date()
    
    return chartData.filter((item) => {
      const date = new Date(item.fullDate || item.date)
      let daysToSubtract = 90
      
      if (timeRange === "30d") {
        daysToSubtract = 30
      } else if (timeRange === "7d") {
        daysToSubtract = 7
      }
      
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - daysToSubtract)
      
      return date >= startDate
    })
  }, [chartData, timeRange])

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Total de Casos</CardTitle>
          <CardDescription>
            {timeRange === "90d" && "Mostrando casos de los últimos 3 meses"}
            {timeRange === "30d" && "Mostrando casos de los últimos 30 días"}
            {timeRange === "7d" && "Mostrando casos de los últimos 7 días"}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Últimos 3 meses" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Últimos 3 meses
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
        {loading ? (
          <div className="flex h-[250px] items-center justify-center">
            Cargando datos...
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center">
            No hay datos para mostrar en este rango de tiempo
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillCases" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-count)"
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
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => value}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="count"
                type="monotone"
                fill="url(#fillCases)"
                stroke="var(--color-count)"
                name="count"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
