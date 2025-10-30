import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Ambiente (mude se quiser testar no sandbox)
const ARKAMA_BASE_URL = process.env.ARKAMA_BASE_URL || "https://app.arkama.com.br/api/v1";

app.post("/api/pagar", async (req, res) => {
  const { nome, email, valor, metodo } = req.body;

  try {
    console.log("📩 Recebido do front:", { nome, email, valor, metodo });

    const url = `${ARKAMA_BASE_URL}/payment`;

    const resposta = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Checkout-Arkama",
        "Authorization": `Bearer ${process.env.ARKAMA_API_KEY}`,
      },
      body: JSON.stringify({
        amount: Number(valor),
        payment_method: metodo.toLowerCase(),
        customer: {
          name: nome,
          email: email,
        },
      }),
    });

    const texto = await resposta.text();
    console.log("🔵 Resposta bruta Arkama:", texto.slice(0, 400));

    let json;
    try {
      json = JSON.parse(texto);
    } catch {
      console.error("❌ Retorno não é JSON válido!");
      return res.status(500).json({
        status: "erro",
        mensagem: "A API Arkama retornou HTML ou formato inválido.",
        detalhe: texto.slice(0, 200),
      });
    }

    if (!resposta.ok) {
      console.error("⚠️ Erro da Arkama:", json);
      return res.status(resposta.status).json({
        status: "erro",
        mensagem: json.message || "Erro ao criar pagamento na Arkama.",
        detalhe: json,
      });
    }

    console.log("✅ Pagamento criado com sucesso!");
    res.json({
      status: "sucesso",
      dados: json,
    });
  } catch (erro) {
    console.error("🔴 Erro geral no backend:", erro);
    res.status(500).json({
      status: "erro",
      mensagem: "Falha ao conectar à Arkama. Verifique os logs na Vercel.",
    });
  }
});

// Rota de teste opcional
app.get("/api/teste", async (req, res) => {
  try {
    const resp = await fetch(`${ARKAMA_BASE_URL}/`, {
      headers: {
        Authorization: `Bearer ${process.env.ARKAMA_API_KEY}`,
        "User-Agent": "Checkout-Arkama",
      },
    });
    const texto = await resp.text();
    res.send(texto);
  } catch (err) {
    res.send(err.message);
  }
});

app.listen(3000, () => console.log("🚀 Servidor local rodando na porta 3000"));
