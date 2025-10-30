import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/pagar", async (req, res) => {
  const { nome, email, valor, formaPagamento } = req.body;

  try {
    const response = await fetch(`${process.env.ARKAMA_BASE_URL}/compra/criar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ARKAMA_API_KEY}`
      },
      body: JSON.stringify({
        nome,
        email,
        valor,
        metodo: formaPagamento
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Arkama:", data);
      return res.status(response.status).json({
        erro: "Falha ao criar pagamento",
        detalhes: data
      });
    }

    res.json({
      sucesso: true,
      dados: data
    });
  } catch (error) {
    console.error("Erro geral:", error);
    res.status(500).json({
      erro: "Erro ao criar pagamento",
      detalhes: error.message
    });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
