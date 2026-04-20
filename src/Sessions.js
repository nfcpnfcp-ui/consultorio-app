import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Sessions() {
  const [clients, setClients] = useState([])
  const [clientId, setClientId] = useState("")
  const [date, setDate] = useState("")
  const [sessions, setSessions] = useState([])

  const loadClients = async () => {
    const { data } = await supabase.from("clients").select("*")
    setClients(data)
  }

  const loadSessions = async () => {
    const { data } = await supabase
      .from("sessions")
      .select("*, clients(name)")
    setSessions(data)
  }

  const addSession = async () => {
    const { error } = await supabase.from("sessions").insert([
      {
        client_id: clientId,
        date: date
      }
    ])

    if (error) alert(error.message)
    else {
      alert("Sessão criada!")
      loadSessions()
    }
  }

  useEffect(() => {
    loadClients()
    loadSessions()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Sessões</h2>

      <select onChange={e => setClientId(e.target.value)}>
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
        onChange={e => setDate(e.target.value)}
      />

      <br /><br />

      <button onClick={addSession}>Adicionar Sessão</button>

      <h3>Lista de Sessões</h3>

      <ul>
        {sessions.map(s => (
          <li key={s.id}>
            {s.clients?.name} - {new Date(s.date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  )
}