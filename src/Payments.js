import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Payments() {
  const [sessions, setSessions] = useState([])
  const [sessionId, setSessionId] = useState("")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState("nao_pago")
  const [payments, setPayments] = useState([])

  const loadSessions = async () => {
    const { data } = await supabase
      .from("sessions")
      .select("*, clients(name)")
    setSessions(data)
  }

  const loadPayments = async () => {
    const { data } = await supabase
      .from("payments")
      .select("*, sessions(clients(name))")
    setPayments(data)
  }

  const addPayment = async () => {
    const { error } = await supabase.from("payments").insert([
      {
        session_id: sessionId,
        amount: amount,
        status: status
      }
    ])

    if (error) alert(error.message)
    else {
      alert("Pagamento registado!")
      loadPayments()
    }
  }

  useEffect(() => {
    loadSessions()
    loadPayments()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Pagamentos</h2>

      <select onChange={e => setSessionId(e.target.value)}>
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
        onChange={e => setAmount(e.target.value)}
      />

      <br /><br />

      <select onChange={e => setStatus(e.target.value)}>
        <option value="pago_com_recibo">Pago com recibo</option>
        <option value="pago_sem_recibo">Pago sem recibo</option>
        <option value="nao_pago">Não pago</option>
      </select>

      <br /><br />

      <button onClick={addPayment}>Registar Pagamento</button>

      <h3>Lista de Pagamentos</h3>

      <ul>
        {payments.map(p => (
          <li key={p.id}>
            {p.sessions?.clients?.name} - {p.amount}€ - {p.status}
          </li>
        ))}
      </ul>
    </div>
  )
}