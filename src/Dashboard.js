import { useState, useEffect } from "react"
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
    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("*")

    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*, sessions(date)")

    setSessions(sessionsData || [])
    setPayments(paymentsData || [])
  }

  const getMonthKey = (dateValue) => {
    return new Date(dateValue).toISOString().slice(0, 7)
  }

  const getPreviousMonth = (selectedMonth) => {
    if (!selectedMonth) return null

    const [year, month] = selectedMonth.split("-").map(Number)

    const date = new Date(year, month - 2, 1)

    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")

    return `${y}-${m}`
  }

  const filterByMonth = (dateValue) => {
    if (!month) return true
    return getMonthKey(dateValue) === month
  }

  const previousMonth = getPreviousMonth(month)

  const filteredSessions = sessions.filter((s) =>
    filterByMonth(s.date)
  )

  const filteredPayments = payments.filter((p) => {
    const sessionDate = p.sessions?.date

    if (!sessionDate) return false

    return filterByMonth(sessionDate)
  })

  const previousMonthSessions = sessions.filter(
    (s) => getMonthKey(s.date) === previousMonth
  )

  const previousMonthPayments = payments.filter((p) => {
    const sessionDate = p.sessions?.date

    if (!sessionDate) return false

    return getMonthKey(sessionDate) === previousMonth
  })

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

  const totalRevenue =
    totalPaidWithReceipt + totalPaidWithoutReceipt

  const averagePerPaidSession =
    paidWithReceipt.length + paidWithoutReceipt.length > 0
      ? totalRevenue /
        (paidWithReceipt.length + paidWithoutReceipt.length)
      : 0

  const previousPaidRevenue = previousMonthPayments
    .filter(
      (p) =>
        p.status === "pago_com_recibo" ||
        p.status === "pago_sem_recibo"
    )
    .reduce(
      (sum, p) => sum + Number(p.amount || 0),
      0
    )

  const previousSessionsCount =
    previousMonthSessions.length

  const calculateTrend = (current, previous) => {
    if (!previous && current > 0) {
      return {
        text: "↑ novo crescimento",
        positive: true
      }
    }

    if (!previous && current === 0) {
      return {
        text: "→ sem alteração",
        positive: false
      }
    }

    const diff = current - previous

    const percent =
      previous !== 0
        ? (diff / previous) * 100
        : 0

    if (diff > 0) {
      return {
        text: `↑ +${percent.toFixed(1)}%`,
        positive: true
      }
    }

    if (diff < 0) {
      return {
        text: `↓ ${percent.toFixed(1)}%`,
        positive: false
      }
    }

    return {
      text: "→ 0.0%",
      positive: false
    }
  }

  const sessionsTrend = calculateTrend(
    totalSessions,
    previousSessionsCount
  )

  const revenueTrend = calculateTrend(
    totalRevenue,
    previousPaidRevenue
  )

  const summaryData = [
    {
      name: "Com recibo",
      value: totalPaidWithReceipt
    },
    {
      name: "Sem recibo",
      value: totalPaidWithoutReceipt
    },
    {
      name: "Não pago",
      value: totalUnpaid
    }
  ]

  const receiptPieData = [
    {
      name: "Com recibo",
      value: paidWithReceipt.length
    },
    {
      name: "Sem recibo",
      value: paidWithoutReceipt.length
    }
  ]

  const monthlyRevenueMap = {}

  payments.forEach((p) => {
    const sessionDate = p.sessions?.date

    if (!sessionDate) return

    const key = getMonthKey(sessionDate)

    if (!monthlyRevenueMap[key]) {
      monthlyRevenueMap[key] = {
        month: key,
        totalPago: 0
      }
    }

    const amount = Number(p.amount || 0)

    if (
      p.status === "pago_com_recibo" ||
      p.status === "pago_sem_recibo"
    ) {
      monthlyRevenueMap[key].totalPago += amount
    }
  })

  const monthlyRevenueData =
    Object.values(monthlyRevenueMap).sort((a, b) =>
      a.month.localeCompare(b.month)
    )

  const cardStyle = {
    background: "white",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)"
  }

  const chartCardStyle = {
    background: "white",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
    minHeight: "360px"
  }

  const statCard = (
    title,
    value,
    subtitle,
    accent,
    trend = null
  ) => (
    <div
      style={{
        ...cardStyle,
        borderTop: `5px solid ${accent}`
      }}
    >
      <div
        style={{
          fontSize: "14px",
          color: "#6b7280",
          marginBottom: "10px"
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "30px",
          fontWeight: "700",
          color: "#111827"
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "8px",
          fontSize: "13px",
          color: "#6b7280"
        }}
      >
        {subtitle}
      </div>

      {trend && (
        <div
          style={{
            marginTop: "10px",
            fontSize: "13px",
            fontWeight: "600",
            color: trend.positive
              ? "#059669"
              : "#dc2626"
          }}
        >
          {trend.text}
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: "12px"
          }}
        >
          Painel
        </h2>

        <label
          style={{
            fontWeight: "600",
            display: "block",
            marginBottom: "8px"
          }}
        >
          Filtrar por mês
        </label>

        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "10px",
            border: "1px solid #d1d5db"
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        {statCard(
          "Sessões",
          totalSessions,
          "Total de consultas no período",
          "#3b82f6",
          sessionsTrend
        )}

        {statCard(
          "Pagamento total",
          `${totalRevenue.toFixed(2)} €`,
          "Receitas",
          "#10b981",
          revenueTrend
        )}

        {statCard(
          "Pago com recibo",
          `${totalPaidWithReceipt.toFixed(2)} €`,
          "Recebido com",
          "#2563eb"
        )}

        {statCard(
          "Pago sem recibo",
          `${totalPaidWithoutReceipt.toFixed(2)} €`,
          "Recebido sem",
          "#f59e0b"
        )}

        {statCard(
          "Em dívida",
          `${totalUnpaid.toFixed(2)} €`,
          "Pagamentos por regularizar",
          "#ef4444"
        )}

        {statCard(
          "Média",
          `${averagePerPaidSession.toFixed(2)} €`,
          "Média dos pagamentos recebidos",
          "#8b5cf6"
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "16px",
          marginBottom: "24px"
        }}
      >
        <div style={chartCardStyle}>
          <h3>Total por categoria</h3>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />

              <Bar
                dataKey="value"
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={chartCardStyle}>
          <h3>Pagamentos com e sem recibo</h3>

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <PieChart>
              <Pie
                data={receiptPieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                <Cell fill="#2563eb" />
                <Cell fill="#f59e0b" />
              </Pie>

              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={chartCardStyle}>
        <h3>Evolução mensal da receita</h3>

        <ResponsiveContainer
          width="100%"
          height={280}
        >
          <LineChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />

            <Line
              type="monotone"
              dataKey="totalPago"
              stroke="#10b981"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}