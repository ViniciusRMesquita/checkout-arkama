import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/pagar", async (req, res) => {
  const { nome, email, valor, metodo } = req.body;

  try {
    const resposta = await fetch("https://api.arkama.com.br/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer SUA_API_KEY_AQUI"
      },
      body: JSON.stringify({
        nome,
        email,
        valor,
        metodo
      }),
    });

    const json = await resposta.json();
    res.json(json);
  } catch (erro) {
    res.json({ status: "erro", mensagem: "Erro ao criar pagamento." });
  }
});

app.listen(3000, () => console.log("✅ Servidor rodando na porta 3000"));
