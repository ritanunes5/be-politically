# Be+Politic Insight

Cria uma aplicação chamada Be+Politic, baseada nos mockups e funcionalidades abaixo.
A app deve ser moderna, imparcial, intuitiva e visualmente apelativa, dirigida a jovens que procuram informação política imparcial.

🎨 Identidade Visual (usar exatamente estas cores)

Paleta principal (cores oficiais):

#1C0533

#2E0E59

#471786

#6424B8

#8034DF

#9B59E9

#B581F0

Estas cores devem ser usadas em gradientes, separadores, títulos, destaques, botões principais e ícones.

🌙 Modo Claro e Modo Escuro (OBRIGATÓRIO)

Cria dois temas independentes:

Modo Claro

Fundo geral: branco ou cinza muito claro

Texto: preto/cinza muito escuro

A paleta roxa deve ser aplicada em:

Botões

Cabeçalhos

Destaques

Icons

Cards

Modo Escuro

Fundo geral: #1C0533

Secções/caixas: tons mais claros da paleta (#2E0E59, #471786)

Texto: branco / cinza claro

Botões e ícones devem usar as cores mais claras da paleta (#8034DF, #9B59E9, #B581F0)

Obrigatório:
→ O modo escuro e claro deve poder ser alternado em Configurações
→ E deve existir também um botão de troca rápida no canto superior direito, sempre visível em todas as páginas (um ícone de lua/sol).

📱 Ecrãs e Estrutura (baseado nos mockups)
1) Landing Page

Logo Be+Politic centrado

Botões: Login / Criar Conta

Layout idêntico aos mockups

2) Criar Conta

Campos: Nome, Email, Password, Confirmar Password

Botão Criar Conta

3) Login

Campos: Email + Password

Botão Login

4) Home

Saudação personalizada: “Olá, [nome]!”

Secção “Notícias do Dia”

Top bar com navegação:

Partidos

Temas

Comparar

Pesquisa

Favoritos

Notificações

Perfil

Botão no canto superior direito para trocar o modo claro/escuro

🔎 Secções Principais
5) Partidos

Lista completa

Cada partido: bandeira + nome + descrição curta

Filtro no topo

6) Página Individual do Partido

Banner com bandeira

Nome do partido

Botão “Adicionar aos Favoritos”

Secções:

História

Ideologia

Valores

Propostas

Histórico de atuação

Atualizações em tempo real

7) Temas

Lista de temas (Habitação, Saúde, Ambiente, etc.)

Layout amplo como nos mockups

Filtro no topo

8) Comparador

Dois modos (como nos mockups):

Modo A — Comparar Partidos

Dois dropdowns para escolher Partido 1 e Partido 2

Informação exibida lado a lado

Botão Comparar

Modo B — Comparar Propostas

Dois dropdowns para escolher Proposta 1 e Proposta 2

Comparação lado a lado

9) Favoritos

Três cartões:

Partidos Guardados

Temas Guardados

Propostas Guardadas

10) Notificações

Lista de atualizações relevantes

Ligadas aos favoritos e temas de interesse

11) Perfil do Utilizador

Dados pessoais

Preferências

Gestão de favoritos

Escolher modo escuro/claro

Logout

🤖 Funcionalidade Futura de IA

Criar uma secção com:

Placeholder para explicar temas sob perspetiva de vários partidos

Botão não funcional de “Explicar com IA”

Indicação de “Disponível numa futura versão”

🗂️ Base de Dados Necessária

Criar tabelas:

Partidos: nome, história, ideologia, valores, propostas, histórico, atualizações

Temas: nome, descrição, posições por partido

Propostas: descrição, partido associado

Favoritos: tipo (partido/tema/proposta), id utilizador, id item

Notificações: id utilizador + conteúdo

Utilizadores: nome, email, password

🧭 Regras para o Lovable

Não criar layout básico; usar cartões, separadores, ícones e paleta oficial

Manter o estilo dos mockups (com barras de topo, caixas centrais e organização por secções)

Implementar dark/light mode obrigatório

Adicionar ícone de troca de modo no canto superior direito em todas as páginas

Garantir navegação fluida e responsiva

FIM DA PROMPT

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://be-politically.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d676b04f-83dd-46f6-bb7f-e1dc38fb74ee).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
