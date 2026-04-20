import { useState } from "react"
import { supabase } from "./supabaseClient"
import Dashboard from "./Dashboard"
import Clients from "./Clients"
import Sessions from "./Sessions"
import Payments from "./Payments"
import Login from "./Login"

function App() {
  const [page, setPage] = useState("dashboard")
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />
  }

  return (
    <div>
      <div style={{ padding: 20, background: "#eee" }}>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("clients")}>Clientes</button>
        <button onClick={() => setPage("sessions")}>Sessões</button>
        <button onClick={() => setPage("payments")}>Pagamentos</button>

        <button
          style={{ float: "right" }}
          onClick={async () => {
            await supabase.auth.signOut()
            setIsLoggedIn(false)
          }}
        >
          Logout
        </button>
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