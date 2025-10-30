import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

console.log("✅ Ambiente Arkama iniciado...");
console.log("🔗 Base URL:", process.env.ARKAMA_BASE_URL);
console.log("🔑 API Key configurada:", process.env.ARKAMA_API_KEY ? "✔️ OK" : "❌ Faltando");

// Rota principal de pagamento
app.post("/api/pagar", async (req, res) => {
  try {
    const { nome, email, valor, formaPagamento } = req.body;

    // Validação simples
    if (!nome || !email || !valor || !formaPagamento) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    console.log("📦 Enviando pagamento para Arkama:", { nome, email, valor, formaPagamento });

    const response = await fetch(`${process.env.ARKAMA_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ARKAMA_API_KEY}`,
        "User-Agent": "checkout-arkama"
      },
      body: JSON.stringify({
        amount: valor,
        payment_method: formaPagamento,
        customer: {
          name: nome,
          email: email
        }
      })
    });

    const text = await response.text();
    console.log("🔍 Resposta da Arkama:", text);

    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        throw new Error(data.message || "Erro retornado pela API Arkama");
      }
      return res.json({ success: true, data });
    } catch (jsonError) {
      // Quando a API retorna HTML (erro comum)
      console.error("❌ Resposta inválida da Arkama (não JSON):", text);
      return res.status(500).json({
        error: "A API Arkama retornou HTML ou formato inválido.",
      });
    }

  } catch (err) {
    console.error("🚨 Erro ao criar pagamento:", err);
    return res.status(500).json({ error: err.message });
  }
});

// Rota teste (para debug rápido)
app.get("/api/teste", (req, res) => {
  res.send(`
    <h1>Finalizar Pedido</h1>
    <form method="POST" action="/api/pagar" style="font-family:sans-serif;">
      <label>Nome completo</label>
      <input name="nome" value="Teste Checkout"><br>
      <label>Email</label>
      <input name="email" value="teste@exemplo.com"><br>
      <label>Valor (R$)</label>
      <input name="valor" value="5.00"><br>
      <label>Forma de pagamento</label>
      <select name="formaPagamento">
        <option value="Pix">Pix</option>
      </select>
      <button type="submit">Pagar Agora</button>
    </form>
  `);
});

// Inicialização local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
