

# VibrantTravel — Agência de Viagens Completa

## 1. Design System & Layout Base
- Paleta vibrante: Laranja (#F97316) como primária e Azul Petróleo (#0F766E) como secundária
- Bordas arredondadas (rounded-xl), sombras suaves, tipografia moderna
- Layout mobile-first com **Bottom Tab Bar** (Home, Buscar, Carrinho, Perfil) em telas pequenas e sidebar/navbar em desktop
- Animações com Framer Motion (transições de página, hover em cards, modais)

## 2. Backend & Banco de Dados (Supabase + Lovable Cloud)
- **Tabelas**: `profiles`, `packages` (título, preço, descrição, fotos, categoria), `orders`, `order_items`, `user_roles`
- **RLS** com função `has_role()` para controle de acesso admin
- **Seed data**: 8-10 pacotes pré-populados com imagens reais (Natureza e Cidade)
- **Auth**: Email/senha + Google OAuth

## 3. Home / Vitrine de Pacotes
- Layout **Bento Grid** responsivo com cards animados dos pacotes
- Filtros: slider de preço, seletor de categoria (Natureza/Cidade)
- Toggle Grid ↔ Lista para alternar a visualização
- Filtros em gaveta lateral no mobile

## 4. Detalhes do Pacote
- Página dedicada com galeria de fotos, descrição completa, preço
- Botão "Adicionar ao Carrinho" com feedback visual animado

## 5. Carrinho & Checkout
- Sidebar deslizante pela direita com itens do carrinho
- Formulário de checkout com validação real via Zod + React Hook Form:
  - CPF (validação de dígitos verificadores)
  - Cartão de crédito (algoritmo de Luhn)
  - Data de validade
- Simulação de processamento (loading + tela de sucesso) — sem pagamento real

## 6. Área do Usuário
- Login/Registro com Supabase Auth (email + Google)
- Página **"Meus Pedidos"**: histórico de compras com detalhes
- Botão **"Exportar Dados"**: gera e baixa arquivo JSON/CSV com o histórico completo

## 7. Painel Admin (/admin)
- Acesso restrito por role (`admin`) via `user_roles` table
- Formulário para inserir novos pacotes: título, preço, URL da foto, categoria
- Lista de pacotes existentes com opção de editar/remover

## 8. AI Chatbot (Widget Flutuante)
- Widget no canto inferior direito com animação de abertura
- Persona: "Guia de viagens aventureiro"
- Integração RAG via Lovable AI: o bot lê os pacotes disponíveis do banco como contexto e recomenda viagens baseadas em preço e estilo do usuário
- Streaming de respostas token a token

