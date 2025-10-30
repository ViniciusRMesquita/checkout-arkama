import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// rota principal do checkout
app.post("/api/pagar", async (req, res) => {
  const { nome, email, valor, metodo } = req.body;

  try {
    const resposta = await fetch("https://api.arkama.com.br/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.ARKAMA_API_KEY}`, // ← lê a variável de ambiente
      },
      body: JSON.stringify({
        nome,
        email,
        valor,
        metodo,
      }),
    });

    const resultado = await resposta.json();

    // log para debug (você pode ver isso em Deploy → Logs)
    console.log("Resposta Arkama:", resultado);

    res.json(resultado);
  } catch (erro) {
    console.error("Erro ao criar pagamento:", erro);
    res.json({
      status: "erro",
      mensagem: "Falha ao criar pagamento. Verifique sua API key ou endpoint.",
    });
  }
});

app.listen(3000, () => console.log("Servidor rodando"));
