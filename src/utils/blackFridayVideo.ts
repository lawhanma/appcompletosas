import type { GeneratedVideoData } from "../types";

export function createBlackFridayVideo(productName: string): GeneratedVideoData {
  return {
    title: `Seleção Black Friday: ${productName}`,
    hook: "Sua seleção de Black Friday começa aqui!",
    scenes: [
      { time: "0s - 3s", visual: "Produto em fundo preto com luz laranja e aproximação suave. Título Black Friday em destaque.", narration: `Preparando sua lista de Black Friday? Conheça ${productName}.`, textOverlay: "SELEÇÃO BLACK FRIDAY", audioEffect: "Impacto suave" },
      { time: "4s - 8s", visual: "Close nos detalhes reais do produto e demonstração de uso, respeitando o modelo e seus recursos.", narration: "Veja os detalhes e confira se combina com o que você procura.", textOverlay: productName, audioEffect: "Transição leve" },
      { time: "9s - 13s", visual: "Produto centralizado em uma vitrine preta e laranja, com tipografia limpa e sem preços fictícios.", narration: "Confira o preço atualizado e as condições da oferta no link.", textOverlay: "CONFIRA AS CONDIÇÕES NO LINK", audioEffect: "Pop sutil" },
      { time: "14s - 18s", visual: "Encerramento com produto em destaque e seta discreta indicando o link de afiliado.", narration: "Gostou? Acesse meu link de afiliado para saber mais.", textOverlay: "ACESSE O LINK DE AFILIADO", audioEffect: "Finalização suave" },
    ],
    caption: `Na minha seleção de Black Friday: ${productName}. Confira preço e condições no link de afiliado. #BlackFriday #Achadinhos #Shopee`,
    conversionScore: 0,
  };
}
