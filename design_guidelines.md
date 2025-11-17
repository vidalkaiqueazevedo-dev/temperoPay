# Design Guidelines: Sistema de Gestão Financeira para Restaurante

## Design Approach: Material Design System

**Rationale:** This is a data-intensive productivity application requiring efficient information processing, clear hierarchy, and familiar interaction patterns. Material Design provides robust components for tables, forms, cards, and data visualization that are perfect for financial management systems.

**Key Principles:**
- Clarity and efficiency over visual flair
- Scannable data presentation with strong hierarchy
- Consistent, predictable interactions
- Professional aesthetic suitable for business use

---

## Typography

**Font Family:** Roboto (via Google Fonts CDN)
- Primary: Roboto for all UI elements
- Monospace: Roboto Mono for financial values and data tables

**Type Scale:**
- H1: 2rem (32px), font-weight: 500 - Page titles (Dashboard, Vendas, Despesas)
- H2: 1.5rem (24px), font-weight: 500 - Section headers
- H3: 1.25rem (20px), font-weight: 500 - Card titles
- Body: 1rem (16px), font-weight: 400 - General content
- Small: 0.875rem (14px), font-weight: 400 - Secondary info, labels
- Caption: 0.75rem (12px), font-weight: 400 - Timestamps, helper text
- Numbers: 1rem-1.5rem, font-weight: 500, Roboto Mono - All monetary values

---

## Layout System

**Spacing Units:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Tight spacing: p-2, gap-2 (chips, inline elements)
- Standard spacing: p-4, gap-4 (cards, form fields)
- Section spacing: p-6, p-8 (card padding, modals)
- Page margins: p-8, p-12 (main content areas)

**Grid Structure:**
- Dashboard: 12-column grid with responsive breakpoints
- Sidebar: Fixed 240px width on desktop, collapsible on mobile
- Main content: max-w-7xl with responsive padding

---

## Component Library

### Navigation
**Sidebar Navigation:**
- Fixed left sidebar with icon + label menu items
- Active state with subtle emphasis
- Sections: Dashboard, Vendas, Clientes Fiados, Despesas, Fornecedores, Relatórios
- Bottom section for user profile/settings

**Top Bar:**
- Restaurant name/logo on left
- Period selector (Hoje, Esta Semana, Este Mês, Personalizado) in center
- Search icon and notification bell on right

### Dashboard Components

**Metric Cards (4 cards in grid):**
- Large number display with Roboto Mono
- Label below number
- Small trend indicator (arrow + percentage)
- Cards: Total Vendas, Recebido, A Receber, Despesas Totais

**Chart Cards:**
- Bar chart: Receitas vs Despesas (últimos 6 meses)
- Pie chart: Despesas por Categoria
- Line chart: Evolução de Vendas
- Each chart in elevated card with title and period filter

**Quick Lists:**
- "Clientes com Maior Débito" - Avatar, name, valor devido
- "Últimas Transações" - Date, description, valor, status badge

### Forms & Data Entry

**Sale Registration Form:**
- Client autocomplete input with "novo cliente" option
- Item list with add/remove rows
- Total calculation displayed prominently
- Payment status toggle buttons (Pago à Vista / Fiado / Parcial)
- Large "Registrar Venda" button

**Expense Registration Form:**
- Category dropdown (Ingredientes, Fornecedores, Contas, Salários, etc.)
- Supplier autocomplete
- Date picker
- Value input with currency formatting
- Description textarea
- Payment status toggle

### Data Display

**Tables:**
- Zebra striping for rows
- Fixed header on scroll
- Sortable columns
- Action buttons in last column
- Status badges for payment states
- Responsive: stack to cards on mobile

**Status Badges:**
- Pago: Solid badge
- Fiado: Outlined badge with emphasis
- Parcial: Split-fill badge
- Sizes: small (in tables), medium (in cards)

**Customer Debt Cards:**
- Customer name and avatar
- Total debt prominently displayed
- List of pending transactions (collapsible)
- "Registrar Pagamento" button

### Modals & Overlays

**Transaction Detail Modal:**
- Large modal with transaction information
- Itemized list if sale
- Payment history if debt exists
- Action buttons: Editar, Marcar como Pago, Excluir

**Filter Panel:**
- Slide-in from right
- Date range picker
- Category checkboxes
- Payment status filters
- "Aplicar Filtros" and "Limpar" buttons

### Buttons & Actions

**Primary Actions:** Large, high emphasis (Registrar Venda, Adicionar Despesa)
**Secondary Actions:** Medium emphasis, outlined (Cancelar, Ver Detalhes)
**Icon Buttons:** For tables and quick actions
**FAB (Floating Action Button):** Bottom right for quick transaction entry on mobile

---

## Images

**No hero images** - This is a functional application, not a marketing site.

**Avatar Placeholders:** Use Material Design's letter avatars for customers/suppliers (first letter of name in circular badge).

**Empty States:** Simple illustrations for empty tables/lists (e.g., "Nenhuma venda registrada hoje"). Use icon + text, not complex imagery.

---

## Animations

**Minimal animations only for feedback:**
- Button press ripple effect
- Modal fade in/out (200ms)
- Drawer slide in/out (300ms)
- Number count-up on dashboard metrics (500ms)
- NO scroll animations, parallax, or decorative motion