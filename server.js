import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// Troque o ambiente aqui se quiser testar Sandbox
const ARKAMA_BASE_URL = process.env.ARKAMA_ENV === "sandbox"
  ? "https://sandbox.arkama.com.br/api/v1"
  : "https://app.arkama.com.br/api/v1";

app.post("/api/pagar", async (req, res) => {
  const { nome, email, valor, metodo } = req.body;

  try {
    console.log("🟢 Requisição recebida:", { nome, email, valor, metodo });

    const resposta = await fetch(`${ARKAMA_BASE_URL}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Checkout-Arkama",
        "Authorization": `Bearer ${process.env.ARKAMA_API_KEY}`
      },
      body: JSON.stringify({
        amount: Number(valor),
        method: metodo,
        customer: { name: nome, email }
      })
    });

    const textoBruto = await resposta.text();
    console.log("🔵 Resposta Arkama (bruta):", textoBruto);

    let resultado;
    try {
      resultado = JSON.parse(textoBruto);
    } catch {
      console.error("❌ Retorno não-JSON:", textoBruto);
      return res.status(500).json({
        status: "erro",
        mensagem: "A API Arkama retornou HTML ou formato inválido.",
        detalhe: textoBruto.slice(0, 200)
      });
    }

    if (!resposta.ok) {
      console.error("⚠️ Erro Arkama:", resultado);
      return res.status(400).json({
        status: "erro",
        mensagem: resultado.message || "Erro ao criar pagamento"
      });
    }

    res.json(resultado);
  } catch (erro) {
    console.error("🔴 Erro geral:", erro);
    res.status(500).json({
      status: "erro",
      mensagem: "Falha ao criar pagamento. Verifique logs na Vercel."
    });
  }
});
app.get("/api/teste", async (req, res) => {
  try {
    const resposta = await fetch(`${ARKAMA_BASE_URL}/`, {
      headers: {
        "Authorization": `Bearer ${process.env.ARKAMA_API_KEY}`,
        "User-Agent": "Checkout-Arkama",
      },
    });

    const texto = await resposta.text();
    res.send(texto);
  } catch (err) {
    res.send(err.message);
  }
});

app.listen(3000, () => console.log("🚀 Servidor rodando na porta 3000"));

