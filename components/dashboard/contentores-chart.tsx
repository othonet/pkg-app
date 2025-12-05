"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"

interface ContentoresChartProps {
  data: Array<{
    cor: string
    recebido: number
    usado: number
    restante: number
  }>
}

const COLOR_MAP: Record<string, string> = {
  "Vermelho": "#ef4444",
  "Azul Marinho": "#1e3a8a",
  "Verde": "#22c55e",
  "Amarelo": "#eab308",
  "Branco": "#e5e7eb",
  "Laranja": "#f97316",
}

// Componente customizado para o Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload
    const corColor = COLOR_MAP[data.cor] || "#10b981"
    
    return (
      <div
        style={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
          borderRadius: "8px",
          padding: "12px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: "hsl(var(--foreground))", margin: "4px 0" }}>
            <span style={{ color: entry.name === "Restantes" ? corColor : "hsl(var(--foreground))" }}>
              {entry.name}
            </span>
            : <span style={{ fontWeight: "bold" }}>{entry.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ContentoresChart({ data }: ContentoresChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Nenhum dado disponível
      </div>
    )
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
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar 
          dataKey="recebido" 
          name="Recebidos"
          fill="#6b7280"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="usado" 
          name="Usados"
          fill="#9ca3af"
          radius={[8, 8, 0, 0]}
        />
        <Bar 
          dataKey="restante" 
          name="Restantes"
          radius={[8, 8, 0, 0]}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-restante-${index}`}
              fill={COLOR_MAP[entry.cor] || "#10b981"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

