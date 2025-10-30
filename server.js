import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Lista de endpoints da Arkama (ordem de prioridade)
const ENDPOINTS = [
  "https://app.arkama.com.br/api/v1",       // PROD
  "https://beta.arkama.com.br/api/v1",      // BETA
  "https://sandbox.arkama.com.br/api/v1"    // SANDBOX
];

// Função para testar qual ambiente está online
async function getAvailableEndpoint() {
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, { method: "GET", timeout: 4000 });
      if (res.ok) {
        console.log(`✅ Arkama disponível em: ${url}`);
        return url;
      } else {
        console.log(`⚠️ Falha em ${url}: ${res.status}`);
      }
    } catch {
      console.log(`❌ Não foi possível conectar a ${url}`);
    }
  }
  throw new Error("Nenhum servidor Arkama está disponível no momento.");
}

// Endpoint de pagamento
app.post("/api/pagar", async (req, res) => {
  const { nome, email, valor, forma } = req.body;

  try {
    const ARKAMA_API_KEY = process.env.ARKAMA_API_KEY;
    if (!ARKAMA_API_KEY) {
      return res.status(500).json({ erro: "Chave API Arkama ausente" });
    }

    const baseURL = await getAvailableEndpoint();

    const response = await fetch(`${baseURL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ARKAMA_API_KEY}`,
        "User-Agent": "Checkout-Arkama"
      },
      body: JSON.stringify({
        name: nome,
        email: email,
        amount: parseFloat(valor),
        payment_method: forma.toLowerCase()
      })
    });

    const data = await response.text();

    try {
      const json = JSON.parse(data);
      if (response.ok) {
        return res.json(json);
      } else {
        return res.status(response.status).json({ erro: json });
      }
    } catch {
      console.error("❌ A API Arkama retornou HTML ou formato inválido.");
      return res.status(502).json({ erro: "A API Arkama retornou HTML ou formato inválido." });
    }

  } catch (erro) {
    console.error("💥 Erro ao criar pagamento:", erro.message);
    res.status(500).json({ erro: "Erro ao criar pagamento." });
  }
});

// Inicializa o servidor (modo local)
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
