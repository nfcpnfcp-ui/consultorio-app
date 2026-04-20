import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient"

export default function Payments() {
  const emptyForm = {
    session_id: "",
    amount: "",
    status: "nao_pago",
    payment_method: "Numerário"
  }

  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [file, setFile] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState("")

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

  const loadPayments = async () => {
    const { data, error } = await supabase
      .from("payments")
      .select("*, sessions(date, clients(name))")
      .order("id", { ascending: false })

    if (error) {
      alert(error.message)
    } else {
      setPayments(data || [])
    }
  }

  useEffect(() => {
    loadSessions()
    loadPayments()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setFile(null)
    setEditingId(null)
  }

  const uploadReceipt = async () => {
    if (!file) return null

    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `receipts/${fileName}`

    const { error } = await supabase.storage
      .from("receipts")
      .upload(filePath, file)

    if (error) {
      alert("Erro no upload do PDF: " + error.message)
      return null
    }

    return filePath
  }

  const savePayment = async () => {
    if (!form.session_id || !form.amount) {
      alert("Sessão e valor são obrigatórios")
      return
    }

    let receiptFilePath = null

    if (file) {
      receiptFilePath = await uploadReceipt()
      if (!receiptFilePath) return
    }

    if (editingId) {
      const updateData = {
        session_id: form.session_id,
        amount: Number(form.amount),
        status: form.status,
        payment_method: form.payment_method
      }

      if (receiptFilePath) {
        updateData.receipt_file_path = receiptFilePath
      }

      const { error } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", editingId)

      if (error) {
        alert(error.message)
      } else {
        alert("Pagamento atualizado")
        resetForm()
        loadPayments()
      }
    } else {
      const { error } = await supabase.from("payments").insert([{
        session_id: form.session_id,
        amount: Number(form.amount),
        status: form.status,
        payment_method: form.payment_method,
        receipt_file_path: receiptFilePath
      }])

      if (error) {
        alert(error.message)
      } else {
        alert("Pagamento registado")
        resetForm()
        loadPayments()
      }
    }
  }

  const editPayment = (payment) => {
    setEditingId(payment.id)
    setFile(null)
    setForm({
      session_id: payment.session_id || "",
      amount: payment.amount || "",
      status: payment.status || "nao_pago",
      payment_method: payment.payment_method || "Numerário"
    })
  }

  const deletePayment = async (id) => {
    const confirmDelete = window.confirm("Tens a certeza que queres eliminar este pagamento?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", id)

    if (error) {
      alert(error.message)
    } else {
      alert("Pagamento eliminado")
      loadPayments()
    }
  }

  const openReceipt = async (path) => {
    if (!path) return

    const { data, error } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 60)

    if (error) {
      alert("Erro ao abrir PDF: " + error.message)
    } else {
      window.open(data.signedUrl, "_blank")
    }
  }

  const filteredPayments = payments.filter((p) => {
    const text = search.toLowerCase()
    const clientName = p.sessions?.clients?.name?.toLowerCase() || ""
    const status = p.status?.toLowerCase() || ""
    const method = p.payment_method?.toLowerCase() || ""
    const amount = String(p.amount || "").toLowerCase()
    const dateText = p.sessions?.date
      ? new Date(p.sessions.date).toLocaleString().toLowerCase()
      : ""

    return (
      clientName.includes(text) ||
      status.includes(text) ||
      method.includes(text) ||
      amount.includes(text) ||
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
      <h2>Pagamentos</h2>

      <select
        value={form.session_id}
        onChange={(e) => setForm({ ...form, session_id: e.target.value })}
        style={inputStyle}
      >
        <option value="">Selecionar sessão</option>
        {sessions.map((s) => (
          <option key={s.id} value={s.id}>
            {s.clients?.name} - {new Date(s.date).toLocaleString()}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Valor"
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        style={inputStyle}
      />

      <select
        value={form.status}
        onChange={(e) => setForm({ ...form, status: e.target.value })}
        style={inputStyle}
      >
        <option value="pago_com_recibo">Pago com recibo</option>
        <option value="pago_sem_recibo">Pago sem recibo</option>
        <option value="nao_pago">Não pago</option>
      </select>

      <select
        value={form.payment_method}
        onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
        style={inputStyle}
      >
        <option value="Numerário">Numerário</option>
        <option value="MBWAY">MBWAY</option>
        <option value="Transferência">Transferência</option>
      </select>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
        style={inputStyle}
      />

      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <button
          onClick={savePayment}
          style={{
            padding: "12px 16px",
            border: "none",
            borderRadius: "10px",
            background: "#2563eb",
            color: "white",
            cursor: "pointer"
          }}
        >
          {editingId ? "Guardar Alterações" : "Registar Pagamento"}
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
        placeholder="Pesquisar por cliente, valor, data, estado ou método..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={inputStyle}
      />

      <h3>Lista</h3>
      <ul style={{ paddingLeft: "18px" }}>
        {filteredPayments.map((p) => (
          <li key={p.id} style={{ marginBottom: "18px" }}>
            <strong>{p.sessions?.clients?.name}</strong>
            <br />
            Valor: {p.amount} €
            <br />
            Estado: {p.status || "-"}
            <br />
            Método: {p.payment_method || "-"}
            <br />
            {p.sessions?.date && (
              <>
                Data: {new Date(p.sessions.date).toLocaleString()}
                <br />
              </>
            )}
            <div style={{ display: "flex", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => editPayment(p)}
                style={{ ...buttonStyle, background: "#f59e0b" }}
              >
                Editar
              </button>

              {p.receipt_file_path && (
                <button
                  onClick={() => openReceipt(p.receipt_file_path)}
                  style={{ ...buttonStyle, background: "#10b981" }}
                >
                  Ver PDF
                </button>
              )}

              <button
                onClick={() => deletePayment(p.id)}
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