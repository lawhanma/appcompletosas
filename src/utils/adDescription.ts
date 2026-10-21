import {Product} from '../types';

export function generateAdDescription(product:Product):string {
  const money=(value:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(value);
  const category=product.category.toLowerCase();
  const opening=category.includes('cosm')?'Um toque especial para a sua rotina de beleza.':
    category.includes('eletr')?'Tecnologia para acompanhar o seu dia a dia.':
    category.includes('cozinha')?'Sua próxima descoberta para a cozinha.':
    category.includes('casa')?'Novas possibilidades para o seu lar.':
    category.includes('brinqu')?'Uma descoberta para os momentos de diversão.':
    'Um achado que merece entrar na sua lista.';
  const details=product.description.trim().replace(/\s+/g,' ');
  const validPrice=Number.isFinite(product.price)&&product.price>0;
  const price=validPrice?(Number.isFinite(product.originalPrice)&&product.originalPrice>product.price
    ?`De ${money(product.originalPrice)} por ${money(product.price)}.`:`Confira por ${money(product.price)}.`):'';
  return [`✨ ${product.name}`,opening,details,price?'🛍️ '+price:'','Gostou? Acesse o link do anúncio, confira os detalhes e escolha a sua opção favorita.','Preço e disponibilidade sujeitos à confirmação na página do produto.','#Achadinhos #ComprasOnline'].filter(Boolean).join('\n\n');
}
