# UI Kit — Layout, Espaçamento e Responsividade

Starter portátil com o sistema visual usado no RedeGestor: **Tailwind CSS v4 + shadcn/ui (new-york) + tokens OKLCH + Inter/JetBrains Mono**.

Foco: **formatação, espaçamento, tipografia e responsividade**. Sem features de produto.

---

## 1. Instalação

```bash
# 1. Tailwind v4 + utilitários
bun add tailwindcss @tailwindcss/vite tw-animate-css clsx tailwind-merge lucide-react

# 2. Fontes (opcional, pode usar Google Fonts via <link>)
bun add @fontsource/inter @fontsource/jetbrains-mono

# 3. shadcn/ui (gera components.json)
bunx shadcn@latest init
# style: new-york | base color: slate | css variables: yes
```

No `vite.config.ts`:
```ts
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [tailwindcss()] });
```

No entry (`main.tsx`):
```ts
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "./styles.css";
```

---

## 2. Arquivos do kit

| Arquivo | Onde colocar | O que faz |
|---|---|---|
| `src/styles.css` | `src/styles.css` | Tokens de cor (OKLCH), raio, sombras, dark mode, base typography, utilitários (`shadow-card`, `tabular`, `grid-bg`) |
| `src/lib/utils.ts` | `src/lib/utils.ts` | Helper `cn()` (clsx + tailwind-merge) |
| `src/hooks/use-mobile.tsx` | `src/hooks/use-mobile.tsx` | Hook `useIsMobile()` — breakpoint 768px |

> Personalize sua marca trocando apenas `--primary` e `--accent` no `:root` do `styles.css`. O resto do sistema se adapta sozinho.

---

## 3. Escala de espaçamento (use sempre múltiplos de 4)

| Contexto | Classes |
|---|---|
| Padding de página | `px-4 md:px-6 lg:px-8 py-6` |
| Gap entre seções | `space-y-6` ou `space-y-8` |
| Gap dentro de card | `space-y-4` |
| Gap em grid/form | `gap-4` (denso) · `gap-6` (arejado) |
| Padding de card | `p-6` |
| Botão sm/md | `px-4 py-2` · `px-6 py-2.5` |
| Altura de input | `h-10` |
| Border radius | `rounded-lg` (= `--radius`) |

**Evite** `5, 7, 9, 11` — quebram o ritmo visual.

---

## 4. Tipografia (o segredo do "respiro")

Já vem aplicado no `styles.css`:
- `body`: Inter, `line-height: 1.55`, antialiased, font features técnicas
- `h1–h4`: `letter-spacing: -0.018em`, `line-height: 1.2`
- `.tabular`: `font-variant-numeric: tabular-nums` (números alinhados em tabelas)
- `.font-mono`: JetBrains Mono

Escala recomendada:
```tsx
<h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
<h2 className="text-2xl font-semibold">
<h3 className="text-lg font-medium">
<p  className="text-sm text-muted-foreground">
```

---

## 5. Responsividade

Breakpoints Tailwind: `sm 640` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`.

Padrões prontos:

```tsx
// Grid responsivo
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Sidebar + conteúdo
<div className="flex">
  <aside className="hidden lg:block w-64 shrink-0" />
  <main className="flex-1 px-4 md:px-6 lg:px-8 py-6" />
</div>

// Container central
<div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">

// Lógica em JS
const isMobile = useIsMobile();
```

---

## 6. Receitas prontas

### Page shell
```tsx
<div className="min-h-screen bg-background text-foreground">
  <main className="mx-auto max-w-7xl px-4 md:px-6 lg:px-8 py-8 space-y-8">
    <header className="space-y-1">
      <h1 className="text-3xl font-semibold tracking-tight">Título</h1>
      <p className="text-sm text-muted-foreground">Subtítulo descritivo.</p>
    </header>
    {/* seções */}
  </main>
</div>
```

### Card padrão
```tsx
<div className="rounded-lg border bg-card text-card-foreground shadow-card p-6 space-y-4">
  <h3 className="text-lg font-medium">Título</h3>
  <p className="text-sm text-muted-foreground">Conteúdo do card.</p>
</div>
```

### Form
```tsx
<form className="space-y-6">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <label className="text-sm font-medium">Nome</label>
      <input className="h-10 w-full rounded-md border bg-background px-3 text-sm" />
    </div>
  </div>
</form>
```

### KPI / número grande
```tsx
<div className="rounded-lg border bg-card p-6">
  <p className="text-sm text-muted-foreground">Receita</p>
  <p className="mt-2 text-3xl font-semibold tabular">R$ 1.284.392</p>
</div>
```

---

## 7. Dark mode

Já configurado. Basta adicionar/remover a classe `dark` no `<html>`:
```ts
document.documentElement.classList.toggle("dark");
```

---

## 8. Personalizar a marca

Em `src/styles.css`, troque apenas:
```css
--primary: oklch(0.30 0.06 250);   /* cor institucional */
--accent:  oklch(0.50 0.14 245);   /* CTAs e links */
```
Use o picker: https://oklch.com/

---

Pronto. Copie os 3 arquivos, siga a escala de espaçamento e você tem o mesmo layout em qualquer projeto React/Vite/Next.
