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

  const menuButtonStyle = (active) => ({
    display: "block",
    width: "100%",
    padding: "12px 16px",
    marginBottom: "10px",
    border: "none",
    borderRadius: "10px",
    background: active ? "#2563eb" : "#f3f4f6",
    color: active ? "white" : "#111827",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500"
  })

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
        background: "#f9fafb"
      }}
    >
      <aside
        style={{
          width: "260px",
          background: "white",
          borderRight: "1px solid #e5e7eb",
          padding: "24px",
          boxSizing: "border-box"
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "30px" }}>
          Consultório
        </h2>

        <button
          style={menuButtonStyle(page === "dashboard")}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          style={menuButtonStyle(page === "clients")}
          onClick={() => setPage("clients")}
        >
          Clientes
        </button>

        <button
          style={menuButtonStyle(page === "sessions")}
          onClick={() => setPage("sessions")}
        >
          Sessões
        </button>

        <button
          style={menuButtonStyle(page === "payments")}
          onClick={() => setPage("payments")}
        >
          Pagamentos
        </button>

        <div style={{ marginTop: "30px" }}>
          <button
            style={{
              width: "100%",
              padding: "12px 16px",
              border: "none",
              borderRadius: "10px",
              background: "#dc2626",
              color: "white",
              cursor: "pointer",
              fontSize: "15px"
            }}
            onClick={async () => {
              await supabase.auth.signOut()
              setIsLoggedIn(false)
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "32px" }}>
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)"
          }}
        >
          {page === "dashboard" && <Dashboard />}
          {page === "clients" && <Clients />}
          {page === "sessions" && <Sessions />}
          {page === "payments" && <Payments />}
        </div>
      </main>
    </div>
  )
}

export default App