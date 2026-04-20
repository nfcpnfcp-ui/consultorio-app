import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"
import { BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [month, setMonth] = useState("")

  const loadData = async () => {
    const { data: sessionsData } = await supabase.from("sessions").select("*")
    const { data: paymentsData } = await supabase.from("payments").select("*")

    setSessions(sessionsData || [])
    setPayments(paymentsData || [])
  }

  useEffect(() => {
    loadData()
  }, [])

  const filterByMonth = (date) => {
    if (!month) return true
    return date.startsWith(month)
  }

  const filteredSessions = sessions.filter(s => filterByMonth(s.date))
  const filteredPayments = payments.filter(p => {
    const session = sessions.find(s => s.id === p.session_id)
    return session && filterByMonth(session.date)
  })

  const totalSessions = filteredSessions.length
  const totalRevenue = filteredPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0)

  const chartData = [
    { name: "Sessões", value: totalSessions },
    { name: "Receita (€)", value: totalRevenue }
  ]

  return (
    <div>
      <h2>Dashboard</h2>

      <label>Filtrar por mês:</label>
      <br />
      <input type="month" value={month} onChange={e => setMonth(e.target.value)} />

      <h3>Total de Sessões: {totalSessions}</h3>
      <h3>Receita Total: {totalRevenue} €</h3>

      <h3>Resumo</h3>

      <BarChart width={400} height={300} data={chartData}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value" />
      </BarChart>
    </div>
  )
}