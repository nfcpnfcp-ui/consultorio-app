import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Payments() {
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])

  const [form, setForm] = useState({
    session_id: "",
    amount: "",
    status: "nao_pago",
    payment_method: "Numerário"
  })

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from("sessions")
      .select("*, clients(name)")
      .order("date", { ascending: false })

    if (error) {
      alert(error.message)
    } else {
      setSessions(data || [])
    }
  }

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*, sessions(date, clients(name))")
      .order("id", { ascending: false })

    if (error) {
      alert(error.message)
    } else {
      setPayments(data || [])
    }
  }

  useEffect(() => {
    loadSessions()
    loadPayments()
  }, [])

  const addPayment = async () => {
    const { error } = await supabase.from("payments").insert([form])

    if (error) {
      alert(error.message)
    } else {
      alert("Pagamento registado")
      setForm({
        session_id: "",
        amount: "",
        status: "nao_pago",
        payment_method: "Numerário"
      })
      loadPayments()
    }
  }

  return (
    <div>
      <h2>Pagamentos</h2>

      <select
        value={form.session_id}
        onChange={e => setForm({ ...form, session_id: e.target.value })}
      >
        <option value="">Selecionar sessão</option>
        {sessions.map(s => (
          <option key={s.id} value={s.id}>
            {s.clients?.name} - {new Date(s.date).toLocaleString()}
          </option>
        ))}
      </select>

      <br /><br />

      <input
        type="number"
        placeholder="Valor"
        value={form.amount}
        onChange={e => setForm({ ...form, amount: e.target.value })}
      />

      <br /><br />

      <select
        value={form.status}
        onChange={e => setForm({ ...form, status: e.target.value })}
      >
        <option value="pago_com_recibo">Pago com recibo</option>
        <option value="pago_sem_recibo">Pago sem recibo</option>
        <option value="nao_pago">Não pago</option>
      </select>

      <br /><br />

      <select
        value={form.payment_method}
        onChange={e => setForm({ ...form, payment_method: e.target.value })}
      >
        <option value="Numerário">Numerário</option>
        <option value="MBWAY">MBWAY</option>
        <option value="Transferência">Transferência</option>
      </select>

      <br /><br />

      <button onClick={addPayment}>Registar Pagamento</button>

      <h3>Lista</h3>
      <ul>
        {payments.map(p => (
          <li key={p.id}>
            {p.sessions?.clients?.name} - {p.amount}€ - {p.status} - {p.payment_method || "Sem método"}
          </li>
        ))}
      </ul>
    </div>
  )
}