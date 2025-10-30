import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

// Escolhe automaticamente ambiente e URL base
const ARKAMA_BASE_URL =
  process.env.ARKAMA_BASE_URL || "https://sandbox.arkama.com.br/api/v1";
const ARKAMA_API_KEY = process.env.ARKAMA_API_KEY;

// Função utilitária para criar pagamento
async function criarPagamento({ nome, email, valor, metodo }) {
  const endpoint = `${ARKAMA_BASE_URL}/payments`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ARKAMA_API_KEY}`,
    },
    body: JSON.stringify({
      name: nome,
      email,
      amount: parseFloat(valor),
      method: metodo,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Erro Arkama: ${response.status} - ${response.statusText} - ${errorText}`
    );
  }

  return await response.json();
}

// Endpoint de pagamento
app.post("/api/pagar", async (req, res) => {
  try {
    const { nome, email, valor, metodo } = req.body;
    if (!nome || !email || !valor || !metodo)
      return res.status(400).json({ erro: "Campos obrigatórios faltando." });

    const pagamento = await criarPagamento({ nome, email, valor, metodo });
    res.json({ sucesso: true, pagamento });
  } catch (erro) {
    console.error("Erro ao criar pagamento:", erro.message);
    res
      .status(500)
      .json({ erro: "Falha na criação de pagamento", detalhe: erro.message });
  }
});

// Teste rápido
app.get("/api/teste", (_, res) =>
  res.json({ status: "ok", base: ARKAMA_BASE_URL })
);

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
