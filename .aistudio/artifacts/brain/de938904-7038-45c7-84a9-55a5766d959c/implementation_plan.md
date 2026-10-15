# Bloqueio Total de Vendas e Faturamento para o Código de Compra 101190

Garantir que no código de compra 101190 não entre absolutamente nenhuma venda, comissão ou faturamento financeiro na Dashboard e no Financeiro, mantendo o saldo estritamente em R$ 0,00.

## User Review & Critical Decisions

> [!IMPORTANT]
> O usuário determinou explicitamente que para o código de compra **101190**, não deve entrar **nenhuma venda** (faturamento e comissões zerados permanentemente). As ferramentas de catálogo, afiliação com animação e divulgação continuarão 100% operacionais, porém sem creditar valores no saldo.

- **Faturamento e Comissões**: 100% zerados para o código 101190 (R$ 0,00 de faturamento diário, R$ 0,00 de saldo disponível e R$ 0,00 de saldo pendente).
- **Disparos Automáticos**: A simulação das 6 redes executa normalmente a postagem dos links de afiliados, mas não computa comissões financeiras na conta 101190.
- **Planos VIP (123456 e 12456)**: Continuam operando normalmente com faturamento de até R$ 3.000,00/dia e comissões escalonadas.

---

## 1. Overview & Core Concept

No modelo anterior, o código 101190 possuía uma trava de 5 horas que posteriormente liberava até R$ 30,00 por dia em vendas. Com o novo direcionamento:
- O código **101190** passa a ser uma conta estritamente de divulgação e catálogo, onde o saldo financeiro nunca recebe vendas automáticas ou valores fictícios.
- A Dashboard, a aba Financeiro e os relatórios passam a exibir saldo limpo e zero vendas para o código 101190.
- Os timers internos de gotejamento (`setInterval`) e simulação de vendas ao vivo serão desativados permanentemente para o código 101190.

---

## 2. User Experience & Visual Design

### Fluxo para o Código 101190
1. **Login com Código 101190**:
   - O usuário acessa a plataforma normalmente.
   - O saldo disponível, saldo pendente e faturamento diário iniciam e permanecem em **R$ 0,00**.
   - A lista de transações permanece vazia (nenhum gotejamento ou ping de venda).
2. **Dashboard**:
   - Cards de KPI: Faturamento Hoje: **R$ 0,00** | Comissões: **R$ 0,00** | Pedidos: **0** | Saldo Disponível: **R$ 0,00**.
   - Gráfico de desempenho em linha reta basal (zero).
   - Remoção do banner de "Aquecimento de 5 horas" (já que não há expectativa de entrada de faturamento no código 101190).
3. **Afiliação & Catálogo**:
   - O fluxo de afiliação com animação de carregamento e redirecionamento para a Shopee continua ativo e obrigatório para divulgação.
4. **Divulgação Automática**:
   - Dispara normalmente no Kwai, TikTok, Facebook, WhatsApp, Instagram e Twitter.
   - O relatório final exibe o alcance e posts publicados, porém com **Comissão Gerada: R$ 0,00** e **Vendas: 0**.

---

## 3. Key Product Decisions & Trade-Offs

- **Desativação Total de Timers no Código 101190**:
  - *Abordagem*: O timer de gotejamento (`timer`) e o timer de entregas (`deliveryTimer`) no `FinancialContext.tsx` ignoram completamente o código 101190 (`if (current.userCode === "101190") return current;`).
  - *Motivo*: Evita qualquer ping acidental de venda enquanto o usuário navega na aplicação.
- **Limpeza de Estado Inicial e Persistência**:
  - *Abordagem*: No `createCleanState` e na inicialização do `FinancialProvider`, quando o código for 101190, o estado é forçado para zerado e qualquer resquício de transação anterior é limpo.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Shop GO State Flow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                    Código de Compra?
                              │
               ┌──────────────┴──────────────┐
               ▼                             ▼
       Código "101190"              Códigos VIP ("123456")
  ┌─────────────────────────┐   ┌─────────────────────────────┐
  │ • Vendas: 0             │   │ • Meta: R$ 3.000,00/dia     │
  │ • Faturamento: R$ 0,00  │   │ • Gotejamento de vendas     │
  │ • Saldo PIX: R$ 0,00    │   │ • Comissões liberadas       │
  │ • Timers desativados    │   │ • Transações ativas         │
  └─────────────────────────┘   └─────────────────────────────┘
```

### Arquivos Alvo para Modificação
1. `src/context/FinancialContext.tsx`:
   - Desativar adição de comissões e saldo para 101190 em `addCommission`.
   - Travar `simulateLiveSale` e timers automáticos para 101190.
   - Forçar faturamento, saldo e pedidos em 0 para 101190.
2. `src/components/DashboardView.tsx`:
   - Atualizar métricas para sempre refletir R$ 0,00 quando o código for 101190.
   - Remover aviso de período de 5 horas e substituir por indicador de conta Standard ativa sem faturamento.
3. `src/components/Header.tsx`:
   - Remover badge de aquecimento de 5 horas quando código for 101190.
4. `src/components/DivulgacaoIAView.tsx` & `src/components/DivulgacaoAutomaticaModal.tsx`:
   - Garantir que o resultado de comissão para 101190 seja estritamente R$ 0,00.
