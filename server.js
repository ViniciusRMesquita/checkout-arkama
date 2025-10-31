import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Cole a sua base e a sua key nas variáveis de ambiente
// ARKAMA_BASE_URL="https://app.arkama.com.br/api/v1"  (exemplo – confirme na doc)
// ARKAMA_API_KEY="SEU_TOKEN_AQUI"

app.post("/api/pagar", async (req, res) => {
  try {
    const { value, total_value, paymentMethod, customer, items } = req.body;

    // Validações mínimas (ajuste conforme sua regra)
    if (!paymentMethod) return res.status(400).json({ paymentMethod: ["O campo payment method é obrigatório."] });
    if (!customer?.name) return res.status(400).json({ "customer.name": ["O campo customer.name é obrigatório."] });
    if (!customer?.email) return res.status(400).json({ "customer.email": ["O campo customer.email é obrigatório."] });
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ items: ["O campo items é obrigatório."] });
    }
    if (!value && !total_value) {
      return res.status(400).json({
        value: ["O campo value é obrigatório quando total value não está presente."],
        total_value: ["O campo total value é obrigatório quando value não está presente."]
      });
    }

    // IP real (Vercel/Proxies)
    const ip =
      (req.headers["x-forwarded-for"] || "")
        .toString()
        .split(",")[0]
        .trim() ||
      req.socket?.remoteAddress ||
      "";

    // Monta payload final (a API pede ip)
    const payload = {
      value,
      total_value,
      paymentMethod,
      customer,
      items,
      ip
    };

    // Chamada à API de pagamento
    const response = await fetch(`${process.env.ARKAMA_BASE_URL}/compra`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ARKAMA_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro da API:", data);
      return res.status(response.status).json(data);
    }

    // Sucesso – devolve ao front
    return res.json({ sucesso: true, dados: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: "Erro interno", detalhes: err.message });
  }
});

app.get("/", (_req, res) => res.send("Checkout API OK"));
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
