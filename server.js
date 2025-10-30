import fetch from "node-fetch";

export default async function handler(req, res) {
  // Permite apenas POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  // Pega os dados do body
  const { nome, email, valor, formaPagamento } = req.body;

  // Confirma variáveis de ambiente
  const baseUrl = process.env.ARKAMA_BASE_URL;
  const apiKey = process.env.ARKAMA_API_KEY;

  if (!baseUrl || !apiKey) {
    return res.status(500).json({
      error: "Faltam variáveis de ambiente",
      details: "Defina ARKAMA_BASE_URL e ARKAMA_API_KEY na Vercel."
    });
  }

  try {
    // Monta a requisição para a Arkama
    const response = await fetch(`${baseUrl}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "User-Agent": "checkout-arkama"
      },
      body: JSON.stringify({
        name: nome,
        email: email,
        amount: valor,
        payment_method: formaPagamento
      })
    });

    const contentType = response.headers.get("content-type");
    let data;

    // Tenta interpretar a resposta
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("Resposta inesperada da Arkama (HTML ou outro formato):", text);
      return res.status(500).json({
        error: "A API Arkama retornou HTML ou formato inválido",
        details: text.slice(0, 200) // mostra só o começo pra debug
      });
    }

    // Se deu erro na Arkama
    if (!response.ok) {
      console.error("Erro Arkama:", data);
      return res.status(response.status).json({
        error: "Erro ao criar pagamento",
        details: data
      });
    }

    // Sucesso 🎉
    return res.status(200).json({
      message: "Pagamento criado com sucesso!",
      data
    });

  } catch (error) {
    console.error("Erro ao criar pagamento:", error);
    return res.status(500).json({
      error: "Erro interno ao criar pagamento",
      details: error.message
    });
  }
}
