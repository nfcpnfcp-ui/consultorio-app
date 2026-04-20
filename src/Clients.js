import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Clients() {
  const [clients, setClients] = useState([])

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    birth_date: "",
    nif: "",
    address: ""
  })

  const loadClients = async () => {
    const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })
    if (error) {
      alert(error.message)
    } else {
      setClients(data || [])
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const addClient = async () => {
    const { error } = await supabase.from("clients").insert([form])

    if (error) {
      alert(error.message)
    } else {
      alert("Cliente criado")
      setForm({
        name: "",
        phone: "",
        email: "",
        birth_date: "",
        nif: "",
        address: ""
      })
      loadClients()
    }
  }

  return (
    <div>
      <h2>Clientes</h2>

      <input
        placeholder="Nome"
        value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <br /><br />

      <input
        placeholder="Telefone"
        value={form.phone}
        onChange={e => setForm({ ...form, phone: e.target.value })}
      />
      <br /><br />

      <input
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <br /><br />

      <input
        type="date"
        value={form.birth_date}
        onChange={e => setForm({ ...form, birth_date: e.target.value })}
      />
      <br /><br />

      <input
        placeholder="NIF"
        value={form.nif}
        onChange={e => setForm({ ...form, nif: e.target.value })}
      />
      <br /><br />

      <input
        placeholder="Morada"
        value={form.address}
        onChange={e => setForm({ ...form, address: e.target.value })}
      />
      <br /><br />

      <button onClick={addClient}>Adicionar Cliente</button>

      <h3>Lista</h3>
      <ul>
        {clients.map(c => (
          <li key={c.id}>
            {c.name} - {c.nif} - {c.address || "Sem morada"}
          </li>
        ))}
      </ul>
    </div>
  )
}