const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export async function explainVerseWithAI(
  verseRef: string, 
  verseText: string, 
  customApiKey?: string
): Promise<string> {
  // 1. Get the best available API key
  const envKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  const apiKey = (customApiKey && customApiKey.trim()) || envKey;

  if (!apiKey || apiKey.includes('seu-token-gratis-do-gemini-aqui')) {
    throw new Error('Chave de API do Gemini não configurada.');
  }

  // 2. Calibrate prompt for premium theological commentary
  const prompt = `
Você é um teólogo renomado, historiador bíblico e pastor experiente. 
Por favor, forneça um comentário bíblico profundo, acessível e prático para a seguinte passagem em português:

Passagem: "${verseRef}"
Texto: "${verseText}"

Estruture sua resposta estritamente nos seguintes blocos formatados com Markdown elegante (com emojis apropriados):

### 📖 Contexto Histórico e Literário
(Explique quem escreveu, para quem, em que época histórica e o que estava acontecendo no livro/capítulo que cerca este versículo).

### 💡 Significado Teológico e Profundo
(Discorra sobre as verdades teológicas profundas reveladas no texto original, palavras-chave em grego/hebraico se aplicável, e o que isso revela sobre o caráter de Deus).

### 🎯 Aplicação Prática e Devocional
(Forneça de 2 a 3 pontos práticos e pastorais de como um cristão hoje pode viver e obedecer a esta palavra no seu cotidiano familiar, profissional ou comunitário).

Por favor, mantenha um tom caloroso, acadêmico mas devocional, e evite introduções longas. Vá direto ao assunto de forma concisa e inspiradora.
  `.trim();

  // 3. Make HTTP request to Google Gemini API
  const url = `${BASE_URL}?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1500
      }
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || `Erro da API (${response.status})`;
    throw new Error(`Falha na consulta do Gemini AI: ${errMsg}`);
  }

  const result = await response.json();
  const generatedText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!generatedText) {
    throw new Error('A inteligência artificial retornou uma resposta vazia.');
  }

  return generatedText;
}
