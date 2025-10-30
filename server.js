import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/pagar", async (req, res) => {
  const { nome, email, valor, formaPagamento } = req.body;

  try {
    const response = await fetch(`${process.env.ARKAMA_BASE_URL}criar-compra`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ARKAMA_API_KEY}`
      },
      body: JSON.stringify({
        token: process.env.ARKAMA_API_KEY,
        nome,
        email,
        valor,
        metodo: formaPagamento
      })
    });

    // Tenta converter para JSON; se falhar, captura o HTML retornado
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`A API Arkama retornou HTML ou formato inválido: ${text.slice(0, 200)}...`);
    }

    if (!response.ok) {
      console.error("Erro Arkama:", data);
      return res.status(response.status).json({
        erro: "Falha ao criar pagamento",
        detalhes: data
      });
    }

    res.json({ sucesso: true, dados: data });
  } catch (error) {
    console.error("Erro geral:", error);
    res.status(500).json({
      erro: "Erro ao criar pagamento",
      detalhes: error.message
    });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
