# Especificação de Regras e Lógica de Cálculo - Uniportas (Abril 2026)

Este documento contém as diretrizes lógicas, dependências técnicas e regras matemáticas para a automação do sistema de orçamentos da Uniportas, baseado no Catálogo 2025 e Tabelas de Preços de Abril 2026.

---

## 1. Modos de Operação
O sistema deve alternar entre dois modos:
1.  **Busca Direta:** Localização de preço por item específico via texto livre.
2.  **Montagem de Kit (Fluxo Guiado):** Construção passo a passo de uma porta completa com acessórios e serviços.

---

## 2. Fluxo de Dependências (Montagem de Kit)

### Passo 1: Tipo de Abertura
* **Opções:** Giro (Padrão), Camarão, Correr, Pivotante.
* **Regra de Correr:** Se selecionado "Correr", o item **Batente** deve ser automaticamente excluído do orçamento.
* **Regra de Pivotante:** Bloquear "Fechadura Comum". Oferecer exclusivamente **Fechadura Rolete** + **Puxador (Tubular ou Barra Chata 80cm)**.

### Passo 2: Estrutura da Folha (Catálogo 2025)
* **Maciça:** Filtrar modelos das linhas *Eucalipto* e *Eco Pinus*.
* **Semi-Oca:** Definir se será **Lisa** ou **Frisada**.
    * **Lisas:** Escolher entre Amescla, Primer, Imbuia, Angelim ou Curupixa.
    * **Frisadas (Modelos):** Cristal, Beli 4, Belíssima, Florença, Passione, Elegance, Milano, Quartzo, Atenas, Viena.

### Passo 3: Medida da Folha e Regra de Redução
* **Medidas Padrão:** 60cm, 62cm, 70cm, 72cm, 80cm, 82cm, 92cm e 102cm (conforme disponibilidade do modelo).
* **Lógica de Redução:** Se a medida solicitada não for padrão (ex: 79cm):
    1.  Selecionar o preço da medida imediatamente superior (ex: 80cm ou 82cm).
    2.  Somar o custo de **Mão de Obra de Redução** (ver Tabela de Serviços).

### Passo 4: Batente (Se aplicável)
* **Opções de Acabamento e Medidas:**
    * **Primer Branco:** 7,5 | 9,5 | 11 | 14 | 15 | 16 | 18 | 20 | 25 cm.
    * **Tingido Imbuia:** 11 | 14 | 16 | 18 | 20 cm.
    * **Natural (Amescla):** 09 | 11 cm.
    * **Eucalipto:** 11 | 14 cm.
* **Regra de Ajuste:** Caso peça medida inexistente (ex: 13cm), cobra-se a medida superior (14cm) + taxa de redução de batente.

---

## 3. Lógica de Cálculo Matemático

### Equação Base:
**Total = [Preço Unitário Folha] + [Preço Batente] + [Preço Guarnições] + [Preço Ferragens] + [Mão de Obra/Serviços]**

### Regras Adicionais de Cálculo:
1.  **Pivotante:** O sistema deve calcular 1.5 jogos (um jogo e meio) do batente selecionado, subtraindo o valor base de 1 jogo de 14cm se o modelo for derivado de kit padrão.
2.  **Camarão:** Se houver troca de batente no kit padrão, aplicar acréscimo de 10% sobre o valor do novo batente.
3.  **Mão de Obra (Valores Referência):**
    * Furo de Fechadura: R$ 17,50
    * Rebaixo de Dobradiça: R$ 17,50
    * Redução de Folha (Lisa): R$ 17,50
    * Redução de Folha (Primer/Tingida): R$ 35,00
    * Montagem de Kit (Ferragens + Dobradiças): R$ 82,00 (médio)

---

## 4. Tratamento de Dados (Fontes da Verdade)
* Os preços devem ser consultados exclusivamente nos PDFs:
    * `Tabela completa Abril 2026.pdf`
    * `Tabela P. Primer Abril 2026.pdf`
    * `Tabela P. Lisas Abril 2026.pdf`
    * `Tabela P. Frisada Abril 2026.pdf`
* Caso o item não conste nestes documentos, exibir: *"Item não localizado na tabela de Abril 2026"*.

---

## 5. Formato de Saída (Orçamento Final)
Apresentar sempre em tabela Markdown:

| Qtd | Item | Especificação Detalhada | Preço Unitário |
| :-- | :--- | :--- | :--- |
| 1 | Folha | Modelo Beli 4 Primer (Reduzida para 79cm) | R$ XXX,XX |
| 1 | Batente | Primer 14cm | R$ XXX,XX |
| 1 | Mão de Obra | Redução de largura + Montagem | R$ XXX,XX |
| **TOTAL** | | | **R$ XXX,XX** |

---
**Observação Fiscal:** Faturamento mínimo para entrega R$ 1.300,00. Boleto mínimo R$ 500,00.
