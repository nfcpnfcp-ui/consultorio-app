import { useState, useEffect, useMemo } from "react"
import { supabase } from "./supabaseClient"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Legend
} from "recharts"

export default function Dashboard() {
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [month, setMonth] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: sessionsData, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")

    const { data: paymentsData, error: paymentsError } = await supabase
      .from("payments")
      .select("*, sessions(date, clients(name))")

    if (sessionsError) {
      alert(sessionsError.message)
      return
    }

    if (paymentsError) {
      alert(paymentsError.message)
      return
    }

    setSessions(sessionsData || [])
    setPayments(paymentsData || [])
  }

  const filterByMonth = (dateValue) => {
    if (!month) return true
    const iso = new Date(dateValue).toISOString().slice(0, 7)
    return iso === month
  }

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => filterByMonth(s.date))
  }, [sessions, month])

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const sessionDate = p.sessions?.date
      if (!sessionDate) return false
      return filterByMonth(sessionDate)
    })
  }, [payments, month])

  const totalSessions = filteredSessions.length

  const paidWithReceipt = filteredPayments.filter(
    (p) => p.status === "pago_com_recibo"
  )
  const paidWithoutReceipt = filteredPayments.filter(
    (p) => p.status === "pago_sem_recibo"
  )
  const unpaidPayments = filteredPayments.filter(
    (p) => p.status === "nao_pago"
  )

  const totalPaidWithReceipt = paidWithReceipt.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  )
  const totalPaidWithoutReceipt = paidWithoutReceipt.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  )
  const totalUnpaid = unpaidPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  )

  const totalRevenue = totalPaidWithReceipt + totalPaidWithoutReceipt

  const summaryData = [
    { name: "Pago com recibo", value: totalPaidWithReceipt },
    { name: "Pago sem recibo", value: totalPaidWithoutReceipt },
    { name: "Não pago", value: totalUnpaid }
  ]

  const receiptPieData = [
    { name: "Com recibo", value: paidWithReceipt.length },
    { name: "Sem recibo", value: paidWithoutReceipt.length }
  ]

  const paymentStatusCountData = [
    { name: "Com recibo", value: paidWithReceipt.length },
    { name: "Sem recibo", value: paidWithoutReceipt.length },
    { name: "Não pago", value: unpaidPayments.length }
  ]

  const monthlyRevenueMap = {}

  payments.forEach((p) => {
    const sessionDate = p.sessions?.date
    if (!sessionDate) return

    const key = new Date(sessionDate).toISOString().slice(0, 7)

    if (!monthlyRevenueMap[key]) {
      monthlyRevenueMap[key] = {
        month: key,
        comRecibo: 0,
        semRecibo: 0,
        naoPago: 0,
        totalPago: 0
      }
    }

    const amount = Number(p.amount || 0)

    if (p.status === "pago_com_recibo") {
      monthlyRevenueMap[key].comRecibo += amount
      monthlyRevenueMap[key].totalPago += amount
    } else if (p.status === "pago_sem_recibo") {
      monthlyRevenueMap[key].semRecibo += amount
      monthlyRevenueMap[key].totalPago += amount
    } else if (p.status === "nao_pago") {
      monthlyRevenueMap[key].naoPago += amount
    }
  })

  const monthlyRevenueData = Object.values(monthlyRevenueMap).sort((a, b) =>
    a.month.localeCompare(b.month)
  )

  const cardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
  }

  const chartCardStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    minHeight: "360px"
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ marginTop: 0, marginBottom: "12px" }}>Dashboard</h2>

        <label style={{ fontWeight: "600", display: "block", marginBottom: "8px" }}>
          Filtrar por mês
        </label>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div style={cardStyle}>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
            Sessões
          </div>
          <div style={{ fontSize: "30px", fontWeight: "700" }}>{totalSessions}</div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
            Total pago
          </div>
          <div style={{ fontSize: "30px", fontWeight: "700" }}>
            {totalRevenue.toFixed(2)} €
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
            Pago com recibo
          </div>
          <div style={{ fontSize: "30px", fontWeight: "700" }}>
            {totalPaidWithReceipt.toFixed(2)} €
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
            Pago sem recibo
          </div>
          <div style={{ fontSize: "30px", fontWeight: "700" }}>
            {totalPaidWithoutReceipt.toFixed(2)} €
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "8px" }}>
            Não pago
          </div>
          <div style={{ fontSize: "30px", fontWeight: "700" }}>
            {totalUnpaid.toFixed(2)} €
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div style={chartCardStyle}>
          <h3 style={{ marginTop: 0 }}>Totais por categoria</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Valor (€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCardStyle}>
          <h3 style={{ marginTop: 0 }}>Pagamentos com e sem recibo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={receiptPieData}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                <Cell />
                <Cell />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div style={chartCardStyle}>
          <h3 style={{ marginTop: 0 }}>Quantidade de pagamentos por estado</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={paymentStatusCountData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCardStyle}>
          <h3 style={{ marginTop: 0 }}>Evolução mensal da receita</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="totalPago" name="Total pago" />
              <Line type="monotone" dataKey="comRecibo" name="Com recibo" />
              <Line type="monotone" dataKey="semRecibo" name="Sem recibo" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}