import { useEffect, useState } from "react"
import { supabase } from "./supabaseClient"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from "recharts"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalRevenue: 0,
    paid: 0,
    unpaid: 0
  })

  const loadStats = async () => {
    const { data: sessions } = await supabase.from("sessions").select("*")
    const { data: payments } = await supabase.from("payments").select("*")

    const totalSessions = sessions.length

    const totalRevenue = payments
      .filter(p => p.status !== "nao_pago")
      .reduce((sum, p) => sum + Number(p.amount), 0)

    const paid = payments.filter(p => p.status !== "nao_pago").length
    const unpaid = payments.filter(p => p.status === "nao_pago").length

    setStats({
      totalSessions,
      totalRevenue,
      paid,
      unpaid
    })
  }

  useEffect(() => {
    loadStats()
  }, [])

  const barData = [
    { name: "Sessões", valor: stats.totalSessions },
    { name: "Receita (€)", valor: stats.totalRevenue }
  ]

  const pieData = [
    { name: "Pagos", value: stats.paid },
    { name: "Não pagos", value: stats.unpaid }
  ]

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>

      <h3>Total de Sessões: {stats.totalSessions}</h3>
      <h3>Receita Total: {stats.totalRevenue} €</h3>

      <h3>Resumo</h3>
      <BarChart width={300} height={200} data={barData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="valor" />
      </BarChart>

      <h3>Pagamentos</h3>
      <PieChart width={300} height={200}>
        <Pie data={pieData} dataKey="value" label>
          <Cell fill="#00C49F" />
          <Cell fill="#FF8042" />
        </Pie>
      </PieChart>
    </div>
  )
}