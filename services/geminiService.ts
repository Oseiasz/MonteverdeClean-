import { GoogleGenAI } from "@google/genai";

// Safely retrieve API Key to prevent "process is not defined" crashes in browser
const getApiKey = () => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env.API_KEY || '';
    }
  } catch (e) {
    // Ignore error if process is not available
  }
  return '';
};

const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

export const getCleaningTip = async (): Promise<string> => {
  if (!apiKey) {
    return "Adicione sua API Key do Gemini para receber dicas personalizadas!";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Gere uma dica curta (máximo 30 palavras), útil e motivadora sobre limpeza de áreas comuns de condomínio ou organização. Linguagem: Português do Brasil. Tom: Amigável e cooperativo. Retorne apenas o texto da dica.",
    });

    return response.text || "Mantenha o condomínio limpo para o bem-estar de todos!";
  } catch (error) {
    console.error("Error fetching tip:", error);
    return "A colaboração é a chave para um condomínio organizado.";
  }
};