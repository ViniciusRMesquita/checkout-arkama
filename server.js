import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// rota padrão
app.get("/", (req, res) => {
  res.send("API Arkama Checkout rodando ✅");
});

// rota de pagamento
app.post("/api/pagar", async (req, res) => {
  const { nome, email, valor, metodo } = req.body;

  try {
    const resposta = await fetch("https://api.arkama.com.br/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ARKAMA_API_KEY}`,
      },
      body: JSON.stringify({ nome, email, valor, metodo }),
    });

    const resultado = await resposta.json();

    console.log("Resposta Arkama:", resultado);
    res.json(resultado);
  } catch (erro) {
    console.error("Erro ao criar pagamento:", erro);
    res.json({
      status: "erro",
      mensagem: "Falha ao criar pagamento. Verifique logs na Vercel.",
    });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));
