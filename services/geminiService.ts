import { GoogleGenAI, Type } from "@google/genai";

// Inicialização segura: se a chave não existir, não quebra a importação,
// mas as chamadas falharão graciosamente.
const getAIClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        console.warn("API_KEY do Gemini não encontrada nas variáveis de ambiente.");
        return null;
    }
    return new GoogleGenAI({ apiKey });
};

export const getGeminiRecommendations = async (userQuery: string, currentMovieContext?: string): Promise<string> => {
  try {
    const ai = getAIClient();
    if (!ai) {
        return "O Chat Inteligente não está configurado. Por favor, adicione a API KEY do Google Gemini no painel da Vercel.";
    }

    const model = 'gemini-2.5-flash'; 
    
    let prompt = `Você é o BrBot, um assistente especialista em cinema para o BrFlix.
    Responda SEMPRE em Português do Brasil.
    Seja curto, direto e divertido.
    
    O usuário perguntou: "${userQuery}".`;

    if (currentMovieContext) {
      prompt += ` O usuário está assistindo: "${currentMovieContext}".`;
    }

    prompt += ` Recomende filmes bons. Use aspas nos títulos, ex: "Matrix".`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "Você é o BrBot do BrFlix. Fale português.",
      }
    });

    return response.text || "Não consegui pensar em nada agora. Tente perguntar de outro jeito!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, tive um erro ao processar sua pergunta. Tente novamente mais tarde.";
  }
};

export const extractMovieTitles = async (text: string): Promise<string[]> => {
  try {
    const ai = getAIClient();
    if (!ai) return [];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract movie titles from this text: "${text}". Return only a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    
    const jsonStr = response.text?.trim();
    if (jsonStr) {
      return JSON.parse(jsonStr);
    }
    return [];
  } catch (e) {
    return [];
  }
};