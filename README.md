# Empreende Fácil - Frontend

Frontend React para a aplicação de gestão empresarial Empreende Fácil.

## Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **TanStack Query (React Query)** - Gerenciamento de estado e cache
- **Axios** - Cliente HTTP
- **shadcn/ui** - Componentes UI
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos e visualizações
- **date-fns** - Manipulação de datas
- **Sonner** - Notificações toast

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:3000/api
```

### 3. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

### 4. Build para produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`

## Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ui/            # Componentes base (shadcn/ui)
│   ├── CategorySelect.tsx
│   ├── ProductSelect.tsx
│   ├── CustomerSelect.tsx
│   └── ...
├── hooks/              # Custom hooks
│   ├── use-auth.ts
│   ├── use-products.ts
│   ├── use-sales.ts
│   └── ...
├── pages/              # Páginas da aplicação
│   ├── Dashboard.tsx
│   ├── Products.tsx
│   ├── Sales.tsx
│   ├── Customers.tsx
│   ├── Categories.tsx
│   ├── Expenses.tsx
│   └── ProductDetails.tsx
├── lib/                # Utilitários e configurações
│   ├── api.ts          # Cliente Axios configurado
│   └── utils.ts        # Funções utilitárias
├── types/              # Definições de tipos TypeScript
│   ├── products.ts
│   ├── sales.ts
│   ├── categories.ts
│   ├── customers.ts
│   └── pagination.ts
└── App.tsx             # Componente raiz e rotas
```

## Funcionalidades

### Dashboard
- Visão geral de vendas, receitas e despesas
- Gráficos de vendas (barra e linha)
- Top produtos e categorias
- Filtros por data, categoria e produto
- Busca de produtos

### Produtos
- Listagem com paginação
- Criação e edição de produtos
- Ajuste de estoque
- Soft delete (produtos deletados não aparecem)
- Filtros: busca, categoria, estoque baixo, faixa de preços
- Seleção múltipla e exclusão em lote
- Página de detalhes do produto (`/produtos/:id`)
- Cálculo automático de lucro unitário e percentual

### Vendas
- Criação e edição de vendas
- Múltiplos itens por venda
- Validação de estoque em tempo real
- Seleção de cliente e método de pagamento
- Data e hora da venda
- Restauração automática de estoque ao excluir venda
- Filtros: busca, categoria, produto, período
- Seleção múltipla e exclusão em lote
- Navegação para detalhes do produto a partir da venda

### Clientes
- Cadastro completo de clientes
- Informações de contato (email, telefone, endereço)
- Notas adicionais
- Busca e paginação
- Seleção múltipla e exclusão em lote

### Categorias
- Criação e gerenciamento de categorias
- Descrição opcional
- Busca e paginação
- Ao excluir, produtos associados têm categoria removida (não deletados)
- Seleção múltipla e exclusão em lote

### Despesas
- Registro de despesas
- Categorização
- Data da despesa
- Suporte a despesas recorrentes
- Seleção múltipla e exclusão em lote
- Busca por descrição/categoria

## Recursos de UX

### Formulários
- Todos os formulários usam **React Hook Form** com validação **Zod**
- Feedback visual de erros
- Validação em tempo real
- Prevenção de submissão duplicada

### Paginação
- Controles de navegação (anterior/próxima)
- Exibição de página atual e total
- Reset automático ao alterar filtros

### Filtros
- Filtros persistentes durante a sessão
- Multi-select com busca para categorias e produtos
- Filtros de data com calendário
- Botão para limpar todos os filtros

### Seleção Múltipla
- Checkbox individual por item
- Checkbox "selecionar todos" na página atual
- Botão de exclusão em lote com contador
- Modal de confirmação mostrando quantidade
- Botão "X" para cancelar seleção

### Notificações
- Toast notifications para sucesso/erro
- Mensagens de erro amigáveis
- Feedback visual em operações assíncronas

### Responsividade
- Layout adaptativo (mobile-first)
- Modais fullscreen no mobile
- Tabelas com scroll horizontal quando necessário
- Navegação otimizada para touch

## Autenticação

A aplicação usa JWT para autenticação:
- Token armazenado no `localStorage`
- Renovação automática de token
- Redirecionamento para login quando não autenticado
- Interceptor Axios para adicionar token automaticamente

## Integração com API

### Cliente HTTP
O arquivo `src/lib/api.ts` configura o cliente Axios com:
- Base URL configurável via `VITE_API_URL`
- Interceptor para adicionar token JWT
- Interceptor para tratamento de erros
- Transformação automática de respostas

### Hooks de Dados
Cada módulo tem hooks customizados:
- `useProducts()` - Listar produtos
- `useProductsWithFilters()` - Listar com filtros/paginação
- `useProduct(id)` - Obter produto específico
- `useCreateProduct()` - Criar produto
- `useUpdateProduct()` - Atualizar produto
- `useDeleteProduct()` - Excluir produto
- `useBulkDeleteProducts()` - Excluir múltiplos

Padrão similar para: Sales, Categories, Customers, Expenses

## Formatação de Dados

### Moeda
```typescript
new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
}).format(value)
```

### Números
```typescript
value.toLocaleString('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 3
})
```

### Datas
- Formatação local com `date-fns`
- Conversão UTC para evitar problemas de timezone
- Exibição no formato brasileiro (DD/MM/YYYY)

## Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Preview do build
npm run preview

# Lint
npm run lint
```

### Adicionar Novo Componente UI

Os componentes shadcn/ui podem ser adicionados via CLI:

```bash
npx shadcn-ui@latest add [component-name]
```

### Estrutura de Tipos

Todos os tipos estão centralizados em `src/types/`:
- `pagination.ts` - Tipos de paginação
- `products.ts` - Tipos de produtos
- `sales.ts` - Tipos de vendas
- `categories.ts` - Tipos de categorias
- `customers.ts` - Tipos de clientes

## Deploy

### Variáveis de Ambiente

```env
VITE_API_URL=https://api.exemplo.com/api
```

### Build e Deploy

1. Configure `VITE_API_URL` apontando para a API em produção
2. Execute `npm run build`
3. Faça deploy da pasta `dist/` para seu servidor/hosting

### Plataformas Recomendadas

- **Vercel** - Deploy automático via Git
- **Netlify** - Deploy automático via Git
- **GitHub Pages** - Hosting estático gratuito
- **Cloudflare Pages** - CDN global

## Melhores Práticas

### Performance
- React Query cacheia requisições automaticamente
- Paginação reduz carga de dados
- Lazy loading de rotas (quando implementado)

### Acessibilidade
- Componentes shadcn/ui seguem padrões ARIA
- Navegação por teclado
- Feedback visual para ações

### Manutenibilidade
- Tipos TypeScript em todos os lugares
- Componentes reutilizáveis
- Hooks customizados para lógica compartilhada
- Separação clara de responsabilidades

## Troubleshooting

### Erro de CORS
Certifique-se de que a API está configurada para aceitar requisições do frontend:
```typescript
app.enableCors({
  origin: true,
  credentials: true,
});
```

### Token Expirado
O token é renovado automaticamente. Se persistir, limpe o `localStorage` e faça login novamente.

### Dados não Atualizam
React Query pode estar usando cache. Use `invalidateQueries` após mutações:
```typescript
queryClient.invalidateQueries({ queryKey: ["products"] });
```
