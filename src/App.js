import { useState } from "react"
import Dashboard from "./Dashboard"
import Clients from "./Clients"
import Sessions from "./Sessions"
import Payments from "./Payments"

function App() {
  const [page, setPage] = useState("dashboard")

  return (
    <div>
      <div style={{ padding: 20, background: "#eee" }}>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("clients")}>Clientes</button>
        <button onClick={() => setPage("sessions")}>Sessões</button>
        <button onClick={() => setPage("payments")}>Pagamentos</button>
      </div>

      <div style={{ padding: 20 }}>
        {page === "dashboard" && <Dashboard />}
        {page === "clients" && <Clients />}
        {page === "sessions" && <Sessions />}
        {page === "payments" && <Payments />}
      </div>
    </div>
  )
}

export default App