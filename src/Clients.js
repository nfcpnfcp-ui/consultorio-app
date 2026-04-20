import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Clients() {
  const [name, setName] = useState("")
  const [nif, setNif] = useState("")
  const [clients, setClients] = useState([])

  const addClient = async () => {
    const { error } = await supabase.from("clients").insert([
      { name, nif }
    ])

    if (error) alert(error.message)
    else {
      alert("Cliente adicionado!")
      setName("")
      setNif("")
      loadClients()
    }
  }

  const loadClients = async () => {
    const { data } = await supabase.from("clients").select("*")
    setClients(data)
  }

  useEffect(() => {
    loadClients()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Clientes</h2>

      <input
        placeholder="Nome"
        value={name}
        onChange={e => setName(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="NIF"
        value={nif}
        onChange={e => setNif(e.target.value)}
      />

      <br /><br />

      <button onClick={addClient}>Adicionar Cliente</button>

      <h3>Lista de Clientes</h3>

      <ul>
        {clients.map(c => (
          <li key={c.id}>
            {c.name} - {c.nif}
          </li>
        ))}
      </ul>
    </div>
  )
}