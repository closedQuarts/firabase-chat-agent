require("dotenv").config();
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const axios = require("axios");

initializeApp();

const openaiKey = process.env.OPENAI_API_KEY;
const gatewayUrl = process.env.GATEWAY_URL;
const jwtToken = process.env.JWT_TOKEN; // ✅ Eksik olan satır

// 🔍 Intent tespiti
async function detectIntent(text) {
  const prompt = `Kullanıcının mesajına göre intent (querybill, querybilldetailed, makepayment) belirle ve gerekli parametrelerle tek bir JSON döndür:

Input: "Show me my April bill"
Output:
{
  "intent": "querybilldetailed",
  "subscriberId": 12345,
  "month": 4,
  "year": 2025
}

Input: "Pay my April bill of 75 TL"
Output:
{
  "intent": "makepayment",
  "subscriberId": 12345,
  "month": 4,
  "year": 2025,
  "amount": 75
}

Şimdi sadece JSON döndür. Mesaj: ${text}`;

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      temperature: 0,
    },
    {
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const content = res.data.choices[0].message.content.trim();
  console.log("🧠 OpenAI Output:", content);
  return JSON.parse(content);
}

exports.processMessage = onDocumentCreated(
  {
    document: "messages/{messageId}",
    region: "europe-west1",
  },
  async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const data = snapshot.data();
    if (!data || data.sender !== "user" || data.response) return;

    const userMessage = data.text;
    if (!userMessage) return;

    try {
      const parsedContent = await detectIntent(userMessage);
      const intent = parsedContent.intent?.toLowerCase();
      let apiRes;

      console.log("🎯 Detected intent:", intent);
      console.log("📦 Parsed content:", parsedContent);

      if (intent === "querybill") {
        const url = `${gatewayUrl}/api/bill/${parsedContent.subscriberId}`;
        console.log("🔗 Calling:", url);
        apiRes = await axios.get(url, {
          headers: { Authorization: jwtToken },
        });
      } else if (intent === "querybilldetailed") {
        const url = `${gatewayUrl}/api/bill/detailed`;
        console.log("🔗 Calling:", url);
        apiRes = await axios.get(url, {
          params: {
            subscriberId: parsedContent.subscriberId,
            month: parsedContent.month,
            year: parsedContent.year,
            page: 1,
            pageSize: 10,
          },
          headers: { Authorization: jwtToken },
        });
      } else if (intent === "makepayment") {
        const url = `${gatewayUrl}/api/bill/pay`;
        console.log("🔗 Calling:", url);
        apiRes = await axios.post(url, {
          subscriberId: parsedContent.subscriberId,
          month: parsedContent.month,
          year: parsedContent.year,
          amount: parsedContent.amount,
        }, {
          headers: {
            Authorization: jwtToken,
            "Content-Type": "application/json",
          },
        });
      } else {
        throw new Error("Geçersiz intent: " + intent);
      }

      console.log("✅ API response:", apiRes.data);

      await snapshot.ref.update({
        response: JSON.stringify(apiRes.data),
        openaiResponse: JSON.stringify(parsedContent),
        sender: "bot"
      }).catch((err) => {
        console.error("❌ Firestore yazma hatası:", err.message);
      });

    } catch (err) {
      console.error("❌ Genel hata:", err.message);
      await snapshot.ref.update({
        response: JSON.stringify({
          error: "Hata oluştu",
          detail: err.message,
        }),
        sender: "bot"
      });
    }
  }
);
