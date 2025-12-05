"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface ContentoresPorHoraChartProps {
  data: Array<{
    intervalo: string
    quantidade: number
  }>
}

export default function ContentoresPorHoraChart({ data }: ContentoresPorHoraChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
        <XAxis 
          dataKey="intervalo" 
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          angle={-45}
          textAnchor="end"
          height={60}
          className="sm:height-[80px]"
        />
        <YAxis 
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          axisLine={{ stroke: "hsl(var(--border))" }}
          width={40}
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
          name="Contentores"
          fill="hsl(var(--primary))"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

