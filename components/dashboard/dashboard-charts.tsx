"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface DashboardChartsProps {
  containersByColor: Array<{ cor: string; quantidade: number }>
  containersYesterdayByColor: Array<{ cor: string; quantidade: number }>
}

export default function DashboardCharts({
  containersByColor,
  containersYesterdayByColor,
}: DashboardChartsProps) {
  const data = containersByColor.length > 0 
    ? containersByColor 
    : [
        { cor: "Vermelho", quantidade: 0 },
        { cor: "Azul Marinho", quantidade: 0 },
        { cor: "Verde", quantidade: 0 },
        { cor: "Amarelo", quantidade: 0 },
        { cor: "Branco", quantidade: 0 },
        { cor: "Laranja", quantidade: 0 },
      ]

  const colorMap: Record<string, string> = {
    "Vermelho": "#ef4444",
    "Azul Marinho": "#1e3a8a",
    "Verde": "#22c55e",
    "Amarelo": "#eab308",
    "Branco": "#e5e7eb",
    "Laranja": "#f97316",
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey="cor" 
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <YAxis 
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={{ stroke: "hsl(var(--border))" }}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
          labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
        />
        <Bar 
          dataKey="quantidade" 
          radius={[8, 8, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`}
              fill={colorMap[entry.cor] || "hsl(var(--primary))"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

