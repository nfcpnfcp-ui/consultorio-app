import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Sessions() {
  const [clients, setClients] = useState([])
  const [sessions, setSessions] = useState([])

  const [form, setForm] = useState({
    client_id: "",
    date: "",
    duration: "",
    type: "presencial",
    status: "realizada"
  })

  const loadClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name", { ascending: true })

    if (error) {
      alert(error.message)
    } else {
      setClients(data || [])
    }
  }

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

  useEffect(() => {
    loadClients()
    loadSessions()
  }, [])

  const addSession = async () => {
    const { error } = await supabase.from("sessions").insert([{
      client_id: form.client_id,
      date: form.date,
      duration: form.duration ? Number(form.duration) : null,
      type: form.type,
      status: form.status
    }])

    if (error) {
      alert(error.message)
    } else {
      alert("Sessão criada")
      setForm({
        client_id: "",
        date: "",
        duration: "",
        type: "presencial",
        status: "realizada"
      })
      loadSessions()
    }
  }

  return (
    <div>
      <h2>Sessões</h2>

      <select
        value={form.client_id}
        onChange={e => setForm({ ...form, client_id: e.target.value })}
      >
        <option value="">Selecionar cliente</option>
        {clients.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <br /><br />

      <input
        type="datetime-local"
        value={form.date}
        onChange={e => setForm({ ...form, date: e.target.value })}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Duração (minutos)"
        value={form.duration}
        onChange={e => setForm({ ...form, duration: e.target.value })}
      />

      <br /><br />

      <select
        value={form.type}
        onChange={e => setForm({ ...form, type: e.target.value })}
      >
        <option value="presencial">Presencial</option>
        <option value="online">Online</option>
      </select>

      <br /><br />

      <select
        value={form.status}
        onChange={e => setForm({ ...form, status: e.target.value })}
      >
        <option value="realizada">Realizada</option>
        <option value="cancelada">Cancelada</option>
        <option value="faltou">Faltou</option>
      </select>

      <br /><br />

      <button onClick={addSession}>Adicionar Sessão</button>

      <h3>Lista</h3>
      <ul>
        {sessions.map(s => (
          <li key={s.id}>
            {s.clients?.name} - {new Date(s.date).toLocaleString()} - {s.duration || 0} min - {s.type} - {s.status}
          </li>
        ))}
      </ul>
    </div>
  )
}