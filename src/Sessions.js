import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Sessions() {
  const emptyForm = {
    client_id: "",
    date: "",
    type: "presencial",
    status: "realizada"
  }

  const [clients, setClients] = useState([])
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState("")

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

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const saveSession = async () => {
    if (!form.client_id || !form.date) {
      alert("Cliente e data são obrigatórios")
      return
    }

    if (editingId) {
      const { error } = await supabase
        .from("sessions")
        .update({
          client_id: form.client_id,
          date: form.date,
          type: form.type,
          status: form.status
        })
        .eq("id", editingId)

      if (error) {
        alert(error.message)
      } else {
        alert("Sessão atualizada")
        resetForm()
        loadSessions()
      }
    } else {
      const { error } = await supabase.from("sessions").insert([{
        client_id: form.client_id,
        date: form.date,
        type: form.type,
        status: form.status
      }])

      if (error) {
        alert(error.message)
      } else {
        alert("Sessão criada")
        resetForm()
        loadSessions()
      }
    }
  }

  const editSession = (session) => {
    setEditingId(session.id)
    setForm({
      client_id: session.client_id || "",
      date: session.date ? session.date.slice(0, 16) : "",
      type: session.type || "presencial",
      status: session.status || "realizada"
    })
  }

  const deleteSession = async (id) => {
    const confirmDelete = window.confirm("Tens a certeza que queres eliminar esta sessão?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
    } else {
      alert("Sessão eliminada")
      loadSessions()
    }
  }

  const filteredSessions = sessions.filter((s) => {
    const text = search.toLowerCase()
    const clientName = s.clients?.name?.toLowerCase() || ""
    const type = s.type?.toLowerCase() || ""
    const status = s.status?.toLowerCase() || ""
    const dateText = s.date ? new Date(s.date).toLocaleString().toLowerCase() : ""

    return (
      clientName.includes(text) ||
      type.includes(text) ||
      status.includes(text) ||
      dateText.includes(text)
    )
  })

  const inputStyle = {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    borderRadius: "10px",
    border: "1px solid #ccc",
    boxSizing: "border-box"
  }

  const buttonStyle = {
    padding: "8px 12px",
    border: "none",
    borderRadius: "8px",
    color: "white",
    cursor: "pointer"
  }

  return (
    <div>
      <h2>Sessões</h2>

      <select
        value={form.client_id}
        onChange={(e) => setForm({ ...form, client_id: e.target.value })}
        style={inputStyle}
      >
        <option value="">Selecionar cliente</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="datetime-local"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        style={inputStyle}
      />

      <select
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        style={inputStyle}
      >
        <option value="presencial">Presencial</option>
        <option value="online">Online</option>
      </select>

      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        style={inputStyle}
      >
        <option value="realizada">Realizada</option>
        <option value="cancelada">Cancelada</option>
        <option value="faltou">Faltou</option>
      </select>

      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button
          onClick={saveSession}
          style={{
            padding: "12px 16px",
            border: "none",
            borderRadius: "10px",
            background: "#2563eb",
            color: "white",
            cursor: "pointer"
          }}
        >
          {editingId ? "Guardar Alterações" : "Adicionar Sessão"}
        </button>

        {editingId && (
          <button
            onClick={resetForm}
            style={{
              padding: "12px 16px",
              border: "none",
              borderRadius: "10px",
              background: "#6b7280",
              color: "white",
              cursor: "pointer"
            }}
          >
            Cancelar
          </button>
        )}
      </div>

      <h3>Pesquisar</h3>
      <input
        placeholder="Pesquisar por cliente, data, tipo ou estado..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={inputStyle}
      />

      <h3>Lista</h3>
      <ul style={{ paddingLeft: "18px" }}>
        {filteredSessions.map((s) => (
          <li key={s.id} style={{ marginBottom: "18px" }}>
            <strong>{s.clients?.name}</strong>
            <br />
            Data: {new Date(s.date).toLocaleString()}
            <br />
            Tipo: {s.type || "-"}
            <br />
            Estado: {s.status || "-"}
            <br />
            <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => editSession(s)}
                style={{ ...buttonStyle, background: "#f59e0b" }}
              >
                Editar
              </button>

              <button
                onClick={() => deleteSession(s.id)}
                style={{ ...buttonStyle, background: "#dc2626" }}
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}