import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Copywriting Generator for WhatsApp, Telegram, TikTok Shop & Shopee
app.post("/api/ai/generate-copy", async (req, res) => {
  try {
    const { productName, price, originalPrice, category, targetChannel, tone } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      const prompt = `Você é o especialista de copywriting de alta conversão do ShopNext, um SaaS para afiliados e lojistas da Shopee, Mercado Livre e TikTok Shop.
Gere 3 versões de copies persuasivas e irresistíveis para divulgação:
1. Versão para Grupos de WhatsApp / Telegram de Achadinhos e Ofertas (com emojis estratégicos, quebra de objeção, chamada urgente, aviso de cupom/frete grátis, e espaço para link de afiliado).
2. Versão para Legenda de TikTok Shop / Reels (gancho forte nos primeiros 3 segundos, benefício, call to action para link na bio/carrinho).
3. Versão para Story / Status (curta, curiosidade extrema, sticker de link).

Dados do produto:
- Nome: ${productName || "Produto Tendência"}
- Preço com desconto: ${price || "R$ 89,90"}
- Preço original: ${originalPrice || "R$ 149,90"}
- Categoria: ${category || "Geral"}
- Canal prioritário: ${targetChannel || "WhatsApp / Telegram"}
- Tom: ${tone || "Urgente e Curioso"}

Responda em JSON com as chaves:
{
  "whatsapp": "string com a copy completa",
  "tiktok": "string com a copy completa",
  "stories": "string com a copy completa",
  "hashtags": ["tag1", "tag2", "tag3"],
  "tip": "Dica rápida de especialista para converter mais nesse produto"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ success: true, ...parsed });
    }

    // High conversion fallback copies if API key is not present
    return res.json({
      success: true,
      whatsapp: `🚨 *ACHADINHO SECRETO DA SHOPEE QUE VOCÊ PRECISA CONHECER!* 😱🔥\n\nOlha o que acabou de entrar em liquidação relâmpago: *${productName}*!\n\n❌ De ~${originalPrice || "R$ 159,90"}~\n✅ *Por apenas ${price || "R$ 89,90"}* no Pix ou Cartão!\n🚚 *Frete Grátis liberado* com o cupom de hoje!\n\n⭐ Nota 4.9/5 com mais de 35.000 avaliações positivas!\n\n👇 *PEGUE O SEU ANTES QUE ACABE O ESTOQUE:* \n🔗 [SEU_LINK_DE_AFILIADO_AQUI]\n\n⚠️ _Dica: Os cupons dessa loja costumam esgotar em menos de 2 horas!_`,
      tiktok: `🚨 ESSE PRODUTO É PROIBIDO EM MAIS DE 10 PAÍSES DE TÃO BOM! 😱\n\nSe você ainda não tem o ${productName}, você tá perdendo tempo e dinheiro!\n\nPeguei na Shopee por só ${price} (era ${originalPrice}). Deixei o link direto no meu perfil e no carrinho laranja! Corre que tá acabando! 🏃💨`,
      stories: `Gente, socorro! 😱 O ${productName} mais viral do TikTok entrou em 50% OFF na Shopee agora!\n\nDe ${originalPrice} por ${price}! Clica no link abaixo antes que zere! 👇🔥`,
      hashtags: ["#achadinhosshopee", "#shopeebrasil", "#comprinhas", "#tiktokmademebuyit", "#promocao"],
      tip: "Dispare essa mensagem nos horários de pico (12h às 13h30 ou 19h às 21h30) para dobrar a taxa de cliques no seu link de afiliado!"
    });
  } catch (error) {
    console.error("AI Copy generation error:", error);
    res.status(500).json({
      error: "Falha ao gerar cópia via IA",
      fallback: "Copie os templates padrões de alta conversão disponíveis no ShopNext."
    });
  }
});

// AI Video Script & Scene Director Generator
app.post("/api/ai/generate-video-script", async (req, res) => {
  try {
    const { 
      productName, 
      price, 
      originalPrice, 
      voice, 
      music, 
      hookStyle, 
      customPrompt,
      influencerConfig,
      recordingFormat 
    } = req.body;
    const ai = getGeminiClient();

    const influencerDesc = influencerConfig 
      ? `Influenciadora/Apresentador: ${influencerConfig.name} (${influencerConfig.gender}), Pele: ${influencerConfig.skinTone}, Cabelo: ${influencerConfig.hairColor} (${influencerConfig.hairStyle}), Idade/Estilo: ${influencerConfig.ageRange}, Vibe: ${influencerConfig.vibe}`
      : "Influenciadora: Mariana (Criadora Brasileira, pele morena clara, cabelo castanho iluminado)";

    const formatDesc = recordingFormat
      ? `Formato de Gravação e Câmera: "${recordingFormat.title} - ${recordingFormat.simplifiedLabel}". Descrição do enquadramento: ${recordingFormat.description}. Prompt de câmera: ${recordingFormat.cameraPrompt}`
      : `Formato de Gravação: Visão em 1ª Pessoa (POV) com mãos mostrando o produto em close-up`;

    if (ai) {
      const prompt = `Você é o diretor criativo de vídeos virais de vendas (TikTok, Reels, Shorts) do ShopNext.
Crie um roteiro cinematográfico de alta conversão de 15 a 20 segundos para o produto "${productName}".
Preço atual: ${price}, original: ${originalPrice}.
Voz selecionada: ${voice || "Júlia (Voz Enérgica)"}
Estilo do gancho: ${hookStyle || "Viral Curiosidade"}
Trilha: ${music || "TikTok Upbeat"}
Configuração da Influencer: ${influencerDesc}
Formato de Gravação: ${formatDesc}
${customPrompt ? `Instruções ou preferências específicas do usuário: "${customPrompt}"` : ""}

IMPORTANTE SOBRE AS CENAS VISUAIS:
- Se o formato for "Visão em 1ª Pessoa (POV)", a descrição visual de cada cena DEVE detalhar as mãos segurando, abrindo, apertando ou demonstrando o produto em primeiro plano (close-up/macro) como visto pelos olhos da pessoa.
- Se o formato for "Influencer Falando pra Câmera", descreva a influenciadora (${influencerConfig?.name || "apresentadora"}, com seu cabelo ${influencerConfig?.hairColor || "castanho"} e tom de pele ${influencerConfig?.skinTone || "morena"}) segurando o produto, mostrando na altura do rosto/peito e reagindo com entusiasmo.
- Se o formato for "Unboxing na Mesa", descreva as mãos abrindo a caixa numa mesa bem iluminada e revelando os detalhes do produto.
- Se o formato for "Em Ação no Dia a Dia", descreva o uso real resolvendo uma situação prática.
- Se o formato for "Vitrine 360°", descreva a rotação em câmera lenta e luzes de estúdio.

Retorne em formato JSON com o seguinte esquema:
{
  "title": "Título do Vídeo Viral",
  "hook": "Frase de impacto inicial dos primeiros 3 segundos",
  "scenes": [
    {
      "time": "0s - 3s",
      "visual": "Descrição visual exata alinhada ao formato de gravação e influencer",
      "narration": "Texto exato da fala do narrador",
      "textOverlay": "Texto gigante com destaque visual na tela",
      "audioEffect": "Efeito sonoro (ex: Whoosh / Vine boom)"
    },
    {
      "time": "4s - 8s",
      "visual": "Demonstração prática do benefício e detalhes",
      "narration": "Texto da fala",
      "textOverlay": "Benefício chave",
      "audioEffect": "Pop sound"
    },
    {
      "time": "9s - 13s",
      "visual": "Comparação de preço e revelação da super promoção da Shopee",
      "narration": "Texto da fala",
      "textOverlay": "De R$ X por R$ Y",
      "audioEffect": "Cash register kaching"
    },
    {
      "time": "14s - 18s",
      "visual": "Call To Action com setas apontando para o carrinho e link de afiliado",
      "narration": "Texto final de urgência",
      "textOverlay": "LINK NA BIO / COMPRE AQUI ⬇️",
      "audioEffect": "Click chime"
    }
  ],
  "caption": "Legenda recomendada com hashtags para bombar o algoritmo",
  "conversionScore": 98
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({ 
        success: true, 
        influencer: influencerConfig,
        recordingFormat: recordingFormat,
        ...parsed 
      });
    }

    // Default intelligent fallback scenes adapting to format and influencer
    const isPov = !recordingFormat || recordingFormat.id === "pov_maos";
    const isInfluencerFace = recordingFormat?.id === "influencer_rosto";
    const infName = influencerConfig?.name?.split(" ")[0] || "Criadora";
    const hairDetail = influencerConfig?.hairColor ? `cabelo ${influencerConfig.hairColor.toLowerCase()}` : "cabelo castanho";

    const scene1Visual = isPov
      ? `Câmera em 1ª Pessoa (POV): Mãos em close-up segurando o ${productName} na altura dos olhos com iluminação perfeita.`
      : isInfluencerFace
      ? `Influenciadora ${infName} (${hairDetail}) segurando o ${productName} ao lado do rosto com sorriso surpreso e expressão de choque.`
      : `Plano detalhe cinematográfico do ${productName} com iluminação de estúdio e câmera lenta.`;

    const scene2Visual = isPov
      ? `Mãos abrindo a embalagem e demonstrando a textura e qualidade do ${productName} bem de perto.`
      : isInfluencerFace
      ? `Influenciadora demonstrando o uso do ${productName}, apontando para os detalhes com carisma.`
      : `Demonstração do produto em ação prática mostrando os benefícios e acabamento.`;

    return res.json({
      success: true,
      title: `Achadinho Viral: ${productName}`,
      hook: "Pare tudo o que você está fazendo se você quer economizar de verdade!",
      influencer: influencerConfig,
      recordingFormat: recordingFormat,
      scenes: [
        {
          time: "0s - 3s",
          visual: scene1Visual,
          narration: `Eu garanto que você nunca viu nada parecido com isso na Shopee!`,
          textOverlay: "NUNCA MAIS COMPRE CARO! 😱",
          audioEffect: "Whoosh + Impacto de Grave"
        },
        {
          time: "4s - 8s",
          visual: scene2Visual,
          narration: `Esse é o ${productName}. Ele resolve exatamente o que todo mundo reclama e dura muito mais!`,
          textOverlay: "QUALIDADE PREMIUM ⭐⭐⭐⭐⭐",
          audioEffect: "Pop sound sutil"
        },
        {
          time: "9s - 13s",
          visual: "Tag de desconto animada com efeito de explosão de preço De/Por com economia gigante.",
          narration: `Nas lojas normais ele custa ${originalPrice || "R$ 199,90"}, mas encontrei o fornecedor secreto por apenas ${price}!`,
          textOverlay: `DE ${originalPrice || "R$ 199,90"} POR APENAS ${price} 🔥`,
          audioEffect: "Caixa registradora (Ka-ching)"
        },
        {
          time: "14s - 18s",
          visual: "Seta animada pulsando apontando para o link de compra com aviso de frete grátis liberado.",
          narration: `O link direto com cupom de frete grátis tá na minha bio e no carrinho da Shopee. Corre antes que acabe!`,
          textOverlay: "CLICA NO LINK ABAIXO! ⬇️🛒",
          audioEffect: "Sino de sucesso"
        }
      ],
      caption: `Gente, esse é o melhor achadinho da Shopee até agora! 😱 Link direto com desconto nos comentários e na bio! #shopee #achadinhos #unboxing #desconto #tiktokshop`,
      conversionScore: 97
    });
  } catch (error) {
    console.error("AI Video script generation error:", error);
    res.status(500).json({ error: "Erro ao gerar roteiro de vídeo com IA" });
  }
});

// Dedicated AI Flow Video Prompt Generator with Complete Script adhering strictly to user configuration
app.post("/api/ai/generate-flow-prompt", async (req, res) => {
  try {
    const { 
      productName, 
      category, 
      price, 
      originalPrice, 
      customPrompt, 
      hookStyle, 
      voice,
      music,
      scenes, 
      caption, 
      hook,
      influencerConfig,
      recordingFormat
    } = req.body;
    const ai = getGeminiClient();

    const formattedScenesForPrompt = Array.isArray(scenes) && scenes.length > 0
      ? scenes.map((s: any, idx: number) => `Cena ${idx + 1} (${s.time}):\n  - Visual: ${s.visual}\n  - Locução: "${s.narration}"\n  - Texto na Tela: "${s.textOverlay}"\n  - Efeito Sonoro: ${s.audioEffect}`).join("\n\n")
      : `Cena 1 (0s-3s): Close-up dramático do produto com o gancho principal.\nCena 2 (4s-8s): Demonstração prática detalhada.\nCena 3 (9s-13s): Comparação de preço e revelação da oferta.\nCena 4 (14s-18s): Chamada de ação final com indicação do link.`;

    const isNoFace = influencerConfig?.id === "sem_rosto" || influencerConfig?.name?.toLowerCase().includes("sem rosto");

    const influencerInstructions = isNoFace
      ? `Personagem/Influencer: Modo Sem Rosto (POV/Produto). A câmera foca exclusivamente nas mãos em close-up e no produto, sem mostrar rostos, criando foco total no produto.`
      : influencerConfig
      ? `Personagem/Influencer: ${influencerConfig.name} (${influencerConfig.gender}). Tom de pele: ${influencerConfig.skinTone}. Cor do cabelo: ${influencerConfig.hairColor}. Penteado/estilo do cabelo: ${influencerConfig.hairStyle}. Faixa etária: ${influencerConfig.ageRange}. Vibe/Estilo: ${influencerConfig.vibe}. Vestimenta: ${influencerConfig.outfit}.`
      : `Personagem/Influencer: Mariana (Feminino), pele morena clara/parda, cabelo castanho iluminado longo ondulado, 20-24 anos, casual chic brasileira.`;

    const formatInstructions = recordingFormat
      ? `Formato de Gravação Selecionado: ${recordingFormat.title} ("${recordingFormat.simplifiedLabel}").\nInstrução Técnica de Câmera e Enquadramento: ${recordingFormat.cameraPrompt}\nPropósito: ${recordingFormat.description}`
      : `Formato de Gravação: Mostrando com as Mãos (Estilo POV) - First-person POV camera angle looking down at hands actively holding and showing the product.`;

    const audioInstructions = `Voz e Locução: ${voice || "Larissa (Jovem & Animada)"}\nTrilha Sonora: ${music || "Upbeat TikTok Viral"}\nEstilo do Gancho: ${hookStyle || "Curiosidade Viral"}`;

    if (ai) {
      const prompt = `Você é um diretor de fotografia e especialista em IA generativa de vídeo de alta fidelidade para ferramentas como Google Flow, Kling, Runway Gen-3 e Sora.
Sua missão é gerar um PROMPT COMPLETO E 100% EM PORTUGUÊS (BRASIL) PARA O GOOGLE FLOW QUE SIGA RIGOROSA E LITERALMENTE TODAS AS CONFIGURAÇÕES SELECIONADAS PELO USUÁRIO.

IMPORTANTE: O prompt final deve refletir EXATAMENTE as opções escolhidas:
1. SE A INFLUENCER TIVER CABELO "${influencerConfig?.hairColor}", PELE "${influencerConfig?.skinTone}" E PENTEADO "${influencerConfig?.hairStyle}", O PROMPT E CADA CENA DEVEM DESCREVÊ-LA COM ESSAS CARACTERÍSTICAS EXATAS. (Se for "Sem Rosto", nunca mostre rosto, apenas mãos!).
2. O FORMATO DE GRAVAÇÃO "${recordingFormat?.title} - ${recordingFormat?.simplifiedLabel}" DEVE DITAR O ÂNGULO E A MOVIMENTAÇÃO DE CÂMERA DE TODO O VÍDEO (${recordingFormat?.cameraPrompt}).
3. A voz "${voice}" e a trilha "${music}" devem ser especificadas com precisão.
4. Se o usuário digitou instruções personalizadas: "${customPrompt || "Nenhuma"}", incorpore-as de forma evidente.

DADOS DA CONFIGURAÇÃO DO USUÁRIO:
- Produto: ${productName} (${category || "Tendências Shopee"})
- Preço com Desconto: ${price} (Preço Original: ${originalPrice})
- ${influencerInstructions}
- ${formatInstructions}
- ${audioInstructions}
${customPrompt ? `- Instruções Adicionais do Usuário: "${customPrompt}"` : ""}

ROTEIRO DAS CENAS A INCORPORAR NO PROMPT:
${formattedScenesForPrompt}

Retorne um JSON estrito:
{
  "flowPrompt": "Prompt completo em português contendo seções claras: [CONFIGURAÇÃO DA INFLUENCER], [FORMATO DE GRAVAÇÃO & CÂMERA], [ÁUDIO & VOZ], [ROTEIRO CENA A CENA DETALHADO] e [PARÂMETROS TÉCNICOS FLOW 9:16 4K].",
  "flowPromptPortuguese": "O mesmo prompt completo formatado para copiar e colar diretamente no Google Flow sem precisar editar nada.",
  "cameraMotion": "${recordingFormat?.simplifiedLabel || 'POV - Mãos em Close-up'}",
  "influencerSummary": "${influencerConfig?.name || 'Apresentadora'} • ${influencerConfig?.hairColor || 'Castanho'} • ${influencerConfig?.skinTone || 'Morena'}",
  "aspectRatio": "9:16 (Vertical TikTok / Reels / Shorts)",
  "lighting": "Luz suave de estúdio com luz de recorte âmbar e bokeh cinematográfico",
  "tips": "Prompt gerado 100% de acordo com suas configurações de influencer, cabelo, pele e formato de câmera. Cole no Flow para gerar seu vídeo pronto!"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        success: true,
        flowUrl: "https://labs.google/flow",
        ...parsed
      });
    }

    // High quality specialized fallback prompt for Flow that 100% embeds all user choices
    const sceneLinesPt = Array.isArray(scenes) && scenes.length > 0
      ? scenes.map((s: any, idx: number) => `• CENA ${idx + 1} (${s.time}):\n  - Enquadramento Visual: ${s.visual}\n  - Locução (${voice || "Voz Brasileira"}): "${s.narration}"\n  - Texto Destacado na Tela: "${s.textOverlay}"\n  - Efeito Sonoro: ${s.audioEffect}`).join("\n\n")
      : `• CENA 1 (0s-3s):\n  - Enquadramento Visual: ${recordingFormat?.simplifiedLabel || "Mãos segurando o produto em close-up"}\n  - Locução: "Pare tudo o que você está fazendo se quiser economizar!"\n  - Texto: "ACHADINHO SECRETO SHOPEE! 😱"\n\n• CENA 2 (4s-8s):\n  - Enquadramento Visual: Demonstração real do produto em uso prático\n  - Locução: "Olha a qualidade desse produto, nota máxima na Shopee!"\n  - Texto: "QUALIDADE SURPREENDENTE ⭐⭐⭐⭐⭐"`;

    const userDetailAddonPt = customPrompt ? `\n[INSTRUÇÕES PERSONALIZADAS DO USUÁRIO]\n${customPrompt}\n` : "";

    const priceFormatted = price || "R$ 89,90";
    const originalFormatted = originalPrice || "R$ 159,90";

    const promptText = `[PROMPT COMPLETO GERADO CONFORME SUAS CONFIGURAÇÕES PARA O GOOGLE FLOW]
Vídeo Comercial Cinematográfico 4K Ultra HD, Proporção Vertical 9:16 (TikTok, Instagram Reels, YouTube Shorts).
Produto: ${productName} (${category || "Tendências Shopee"}).

[1. APRESENTADORA / INFLUENCER VIRTUAL]
${influencerInstructions}

[2. FORMATO DE GRAVAÇÃO & DIREÇÃO DE CÂMERA]
Formato Selecionado: ${recordingFormat?.title || "Visão em 1ª Pessoa (POV)"} - "${recordingFormat?.simplifiedLabel || "Mostrando com as Mãos"}"
Ângulo e Instrução de Câmera: ${recordingFormat?.cameraPrompt || "First-person POV camera angle looking down at hands actively holding and showing the product"}
Iluminação: Luz suave difusa de estúdio com luz de recorte âmbar a 3200K e profundidade de campo suave (bokeh natural).

[3. ÁUDIO, LOCUÇÃO & TRILHA SONORA]
Perfil de Voz: ${voice || "Larissa (Jovem & Animada)"}
Trilha de Fundo: ${music || "Upbeat TikTok Viral"}
Gancho de Abertura: ${hookStyle || "Curiosidade Viral"}
${userDetailAddonPt}
[4. ROTEIRO CENA A CENA SINCRONIZADO]
${sceneLinesPt}

[5. PREÇO, OFERTA & CHAMADA PARA AÇÃO]
Preço Promocional: De ${originalFormatted} por apenas ${priceFormatted}!
Legenda Recomendada: ${caption || "Link direto com cupom de desconto nos comentários e na bio!"}

[6. PARÂMETROS TÉCNICOS PARA O FLOW]
Aspect Ratio: 9:16 Vertical | FPS: 60fps | Resolução: 4K UHD | Lente: 35mm f/1.8 | Render Style: Ultra-realistic commercial advertising`;

    return res.json({
      success: true,
      flowPrompt: promptText,
      flowPromptPortuguese: promptText,
      cameraMotion: recordingFormat?.simplifiedLabel || "Visão em 1ª Pessoa (POV - Mãos)",
      influencerSummary: `${influencerConfig?.name || 'Apresentadora'} • ${influencerConfig?.hairColor || 'Cabelo'} • ${influencerConfig?.skinTone || 'Pele'}`,
      aspectRatio: "9:16 (Vertical TikTok/Reels)",
      lighting: "Iluminação de estúdio suave + recorte âmbar",
      tips: "Prompt gerado exatamente com a sua influencer, cabelo, tom de pele e formato de gravação escolhidos!",
      flowUrl: "https://labs.google/flow"
    });
  } catch (error) {
    console.error("AI Flow Prompt generation error:", error);
    res.status(500).json({ error: "Erro ao gerar prompt para o Flow" });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ShopNext server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
