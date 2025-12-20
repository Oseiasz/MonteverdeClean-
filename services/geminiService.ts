import { GoogleGenAI } from "@google/genai";

export const getCleaningTip = async (): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key não configurada");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Gere uma dica de limpeza ou organização para áreas comuns de condomínio (corredores, escadas, garagem ou lixeira). A dica deve ser curta (máximo 25 palavras), motivadora e prática. Linguagem: Português do Brasil. Retorne apenas o texto da dica, sem aspas.",
    });

    return response.text || "Pequenas ações diárias mantêm nosso espaço comum impecável para todos.";
  } catch (error) {
    console.error("Erro ao buscar dica do Gemini:", error);
    return "A colaboração e o respeito ao cronograma garantem um ambiente melhor para todos os moradores.";
  }
};