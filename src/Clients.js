import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Clients() {
  const emptyForm = {
    name: "",
    phone: "",
    email: "",
    birth_date: "",
    nif: "",
    address: ""
  }

  const [clients, setClients] = useState([])
  const [search, setSearch] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)

  const loadClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      alert(error.message)
    } else {
      setClients(data || [])
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const saveClient = async () => {
    if (!form.name.trim()) {
      alert("O nome é obrigatório")
      return
    }

    if (editingId) {
      const { error } = await supabase
        .from("clients")
        .update({
          name: form.name,
          phone: form.phone,
          email: form.email,
          birth_date: form.birth_date || null,
          nif: form.nif,
          address: form.address
        })
        .eq("id", editingId)

      if (error) {
        alert(error.message)
      } else {
        alert("Cliente atualizado")
        resetForm()
        loadClients()
      }
    } else {
      const { error } = await supabase.from("clients").insert([{
        name: form.name,
        phone: form.phone,
        email: form.email,
        birth_date: form.birth_date || null,
        nif: form.nif,
        address: form.address
      }])

      if (error) {
        alert(error.message)
      } else {
        alert("Cliente criado")
        resetForm()
        loadClients()
      }
    }
  }

  const editClient = (client) => {
    setEditingId(client.id)
    setForm({
      name: client.name || "",
      phone: client.phone || "",
      email: client.email || "",
      birth_date: client.birth_date || "",
      nif: client.nif || "",
      address: client.address || ""
    })
  }

  const deleteClient = async (id) => {
    const confirmDelete = window.confirm("Tens a certeza que queres eliminar este cliente?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
    } else {
      alert("Cliente eliminado")
      loadClients()
    }
  }

  const filteredClients = clients.filter((c) => {
    const text = search.toLowerCase()

    return (
      c.name?.toLowerCase().includes(text) ||
      c.nif?.toLowerCase().includes(text) ||
      c.phone?.toLowerCase().includes(text) ||
      c.email?.toLowerCase().includes(text)
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
      <h2>Clientes</h2>

      <input
        placeholder="Nome"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        style={inputStyle}
      />

      <input
        placeholder="Telefone"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        style={inputStyle}
      />

      <input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        style={inputStyle}
      />

      <input
        type="date"
        value={form.birth_date}
        onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
        style={inputStyle}
      />

      <input
        placeholder="NIF"
        value={form.nif}
        onChange={(e) => setForm({ ...form, nif: e.target.value })}
        style={inputStyle}
      />

      <input
        placeholder="Morada"
        value={form.address}
        onChange={(e) => setForm({ ...form, address: e.target.value })}
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button
          onClick={saveClient}
          style={{
            padding: "12px 16px",
            border: "none",
            borderRadius: "10px",
            background: "#2563eb",
            color: "white",
            cursor: "pointer"
          }}
        >
          {editingId ? "Guardar Alterações" : "Adicionar Cliente"}
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
        placeholder="Pesquisar cliente..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={inputStyle}
      />

      <h3>Lista</h3>
      <ul style={{ paddingLeft: "18px" }}>
        {filteredClients.map((c) => (
          <li key={c.id} style={{ marginBottom: "18px" }}>
            <strong>{c.name}</strong>
            <br />
            NIF: {c.nif || "-"}
            <br />
            Telefone: {c.phone || "-"}
            <br />
            Email: {c.email || "-"}
            <br />
            Morada: {c.address || "Sem morada"}
            <br />
            <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => editClient(c)}
                style={{ ...buttonStyle, background: "#f59e0b" }}
              >
                Editar
              </button>

              <button
                onClick={() => deleteClient(c.id)}
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