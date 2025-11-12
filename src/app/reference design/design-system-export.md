# Design System Export

Questo documento contiene tutte le informazioni relative allo stile grafico del progetto, inclusi colori, tipografia, spacing, animazioni e componenti principali.

---

## 📋 Indice

1. [Configurazione Tailwind](#configurazione-tailwind)
2. [Tabella Colori](#tabella-colori)
3. [Tipografia](#tipografia)
4. [Spacing e Layout](#spacing-e-layout)
5. [Radius e Ombre](#radius-e-ombre)
6. [Animazioni](#animazioni)
7. [Classi CSS Personalizzate](#classi-css-personalizzate)
8. [Breakpoint](#breakpoint)
9. [Mappa Componenti](#mappa-componenti)

---

## Configurazione Tailwind

Il progetto utilizza **Tailwind CSS v4** con configurazione tramite `@theme` nel file `src/index.css`.

### File di Configurazione

- **PostCSS**: `postcss.config.js`
  ```javascript
  export default {
    plugins: {
      '@tailwindcss/postcss': {},
      autoprefixer: {},
    },
  }
  ```

- **Tailwind v4 Theme** (in `src/index.css`):
  ```css
  @theme {
    --font-sans: "Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
    --color-accent: #6C63FF; /* light */
    --color-accent-dark: #7D5FFF; /* dark */
  }
  ```

- **Dark Mode**: Class-based (` .dark` on `<html>`)
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  ```

---

## Tabella Colori

### Colori Principali

| Nome | Light Mode | Dark Mode | Utilizzo |
|------|------------|-----------|----------|
| **Accent** | `#6C63FF` | `#7D5FFF` | Colore principale, bottoni, link |
| **Accent Gradient End** | `#9b8cff` | `#9b8cff` | Gradiente bottoni accent |
| **Background Light** | `bg-gray-50` | `bg-gray-900` | Sfondo principale |
| **Background Dark** | `bg-gray-100` | `bg-gray-800` | Sfondo secondario |
| **Text Primary** | `text-gray-900` | `text-gray-100` | Testo principale |
| **Text Secondary** | `text-gray-600` | `text-gray-400` | Testo secondario |
| **Text Muted** | `text-gray-500` | `text-gray-500` | Testo disabilitato |

### Colori Status (Utente)

| Status | Colore | Codice | Utilizzo |
|--------|--------|--------|----------|
| **Disponibile** | Emerald | `bg-emerald-500` | Status disponibile |
| **Occupato** | Amber | `bg-amber-400` | Status occupato |
| **Non Disturbare** | Rose | `bg-rose-500` | Status non disturbare |
| **Riunione** | Sky | `bg-sky-500` | Status riunione |

### Colori Priority (Task)

| Priority | Background | Text | Utilizzo |
|----------|------------|------|----------|
| **Low** | `bg-emerald-500/20` | `text-emerald-600 dark:text-emerald-400` | Priorità bassa |
| **Medium** | `bg-amber-500/20` | `text-amber-600 dark:text-amber-400` | Priorità media |
| **High** | `bg-rose-500/20` | `text-rose-600 dark:text-rose-400` | Priorità alta |

### Colori Status (Task)

| Status | Background | Text | Utilizzo |
|--------|------------|------|----------|
| **Todo** | `bg-gray-500/20` | `text-gray-600 dark:text-gray-400` | Task da fare |
| **In Progress** | `bg-blue-500/20` | `text-blue-600 dark:text-blue-400` | Task in corso |
| **Done** | `bg-emerald-500/20` | `text-emerald-600 dark:text-emerald-400` | Task completata |
| **Overdue** | `bg-rose-500/20` | `text-rose-600 dark:text-rose-400` | Task in ritardo |

### Colori Team

| Colore | Codice | Utilizzo |
|--------|--------|----------|
| Violet | `#8b5cf6` | Colore team 1 |
| Pink | `#ec4899` | Colore team 2 |
| Blue | `#3b82f6` | Colore team 3 |
| Emerald | `#10b981` | Colore team 4 |
| Amber | `#f59e0b` | Colore team 5 |
| Red | `#ef4444` | Colore team 6 |
| Cyan | `#06b6d4` | Colore team 7 |
| Lime | `#84cc16` | Colore team 8 |

### Colori Avatar (Gradient)

| Colore From | Colore To | Utilizzo |
|-------------|-----------|----------|
| `from-violet-500` | `to-indigo-400` | Avatar gradient 1 |
| `from-emerald-500` | `to-teal-400` | Avatar gradient 2 |
| `from-rose-500` | `to-pink-400` | Avatar gradient 3 |
| `from-blue-500` | `to-cyan-400` | Avatar gradient 4 |
| `from-amber-500` | `to-orange-400` | Avatar gradient 5 |
| `from-purple-500` | `to-fuchsia-400` | Avatar gradient 6 |
| `from-green-500` | `to-emerald-400` | Avatar gradient 7 |
| `from-red-500` | `to-rose-400` | Avatar gradient 8 |

### Colori Glassmorphism

| Proprietà | Light Mode | Dark Mode | Utilizzo |
|-----------|------------|-----------|----------|
| **Background** | `bg-white/30` | `bg-white/10` | Sfondo glass |
| **Border** | `border-white/20` | `border-white/10` | Bordo glass |
| **Backdrop Blur** | `backdrop-blur-md` | `backdrop-blur-md` | Effetto blur |

### Gradienti

| Nome | Direzione | Colori | Utilizzo |
|------|-----------|--------|----------|
| **Accent Button** | `135deg` | `#6C63FF` → `#9b8cff` | Bottoni accent |
| **AI Assistant Icon** | `to-br` | `from-purple-500` → `to-pink-500` | Icona AI Assistant |
| **Logo Sidebar** | Vertical | `#14b8a6` → `#86efac` | Logo sidebar |

---

## Tipografia

### Font Family

- **Font Principale**: `Inter Variable` (da `@fontsource-variable/inter`)
- **Font Stack**: `"Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"`
- **Font Mono**: Utilizzato per l'orologio nella TopBar

### Dimensioni Font

| Classe | Dimensione | Utilizzo |
|--------|------------|----------|
| `text-xs` | 0.75rem (12px) | Testo piccolo, badge, tag |
| `text-sm` | 0.875rem (14px) | Testo secondario, label |
| `text-base` | 1rem (16px) | Testo normale |
| `text-lg` | 1.125rem (18px) | Titoli sezione |
| `text-xl` | 1.25rem (20px) | Titoli principali |
| `text-2xl` | 1.5rem (24px) | Titoli grandi |

### Font Weight

| Classe | Weight | Utilizzo |
|--------|--------|----------|
| `font-normal` | 400 | Testo normale |
| `font-medium` | 500 | Testo enfatizzato |
| `font-semibold` | 600 | Titoli sezione |
| `font-bold` | 700 | Titoli principali |

### Line Height

- Utilizza le line-height di default di Tailwind
- `line-clamp-2`: Limita a 2 righe con ellipsis

### Text Transform

- `uppercase`: Utilizzato per le sezioni nella sidebar
- `tracking-wide`: Letter-spacing per testi uppercase

---

## Spacing e Layout

### Padding

| Classe | Valore | Utilizzo |
|--------|--------|----------|
| `p-1` | 0.25rem (4px) | Padding minimo |
| `p-2` | 0.5rem (8px) | Padding piccolo |
| `p-3` | 0.75rem (12px) | Padding medio |
| `p-4` | 1rem (16px) | Padding standard |
| `p-6` | 1.5rem (24px) | Padding grande |
| `px-2` | 0.5rem (8px) | Padding orizzontale piccolo |
| `px-3` | 0.75rem (12px) | Padding orizzontale medio |
| `px-4` | 1rem (16px) | Padding orizzontale standard |
| `px-6` | 1.5rem (24px) | Padding orizzontale grande |
| `py-1` | 0.25rem (4px) | Padding verticale piccolo |
| `py-2` | 0.5rem (8px) | Padding verticale medio |
| `py-3` | 0.75rem (12px) | Padding verticale standard |
| `py-4` | 1rem (16px) | Padding verticale grande |

### Margin

| Classe | Valore | Utilizzo |
|--------|--------|----------|
| `m-4` | 1rem (16px) | Margin standard |
| `mt-4` | 1rem (16px) | Margin top |
| `mb-2` | 0.5rem (8px) | Margin bottom piccolo |
| `mb-4` | 1rem (16px) | Margin bottom standard |
| `mx-4` | 1rem (16px) | Margin orizzontale |
| `ml-2` | 0.5rem (8px) | Margin left piccolo |

### Gap

| Classe | Valore | Utilizzo |
|--------|--------|----------|
| `gap-1` | 0.25rem (4px) | Gap minimo |
| `gap-2` | 0.5rem (8px) | Gap piccolo |
| `gap-3` | 0.75rem (12px) | Gap medio |
| `gap-4` | 1rem (16px) | Gap standard |

### Space (Vertical Spacing)

| Classe | Valore | Utilizzo |
|--------|--------|----------|
| `space-y-1` | 0.25rem (4px) | Spazio verticale minimo |
| `space-y-2` | 0.5rem (8px) | Spazio verticale piccolo |
| `space-y-4` | 1rem (16px) | Spazio verticale standard |
| `space-y-6` | 1.5rem (24px) | Spazio verticale grande |

### Dimensioni Componenti

| Componente | Altezza | Larghezza | Note |
|------------|---------|-----------|------|
| **TopBar** | `h-16` (64px) | Full width | Altezza fissa |
| **Sidebar** | `h-screen` | `w-64` (256px) / `w-20` (80px) | Larghezza variabile |
| **Avatar Small** | `h-6 w-6` (24px) | `h-6 w-6` (24px) | Avatar piccolo |
| **Avatar Medium** | `h-8 w-8` (32px) | `h-8 w-8` (32px) | Avatar medio |
| **Avatar Large** | `h-12 w-12` (48px) | `h-12 w-12` (48px) | Avatar grande |
| **Avatar XL** | `h-16 w-16` (64px) | `h-16 w-16` (64px) | Avatar extra large |
| **Icon Small** | `h-4 w-4` (16px) | `h-4 w-4` (16px) | Icona piccolo |
| **Icon Medium** | `h-5 w-5` (20px) | `h-5 w-5` (20px) | Icona medio |

---

## Radius e Ombre

### Border Radius

| Classe | Valore | Utilizzo |
|--------|--------|----------|
| `rounded-lg` | 0.5rem (8px) | Radius piccolo |
| `rounded-xl` | 0.75rem (12px) | Radius medio |
| `rounded-2xl` | 1rem (16px) | Radius grande (card, topbar) |
| `rounded-full` | 9999px | Radius circolare (badge, avatar) |

### Box Shadow

| Classe | Valore | Utilizzo |
|--------|--------|----------|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Ombra leggera (glass, card) |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | Ombra media (hover card) |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1)` | Ombra grande (dropdown) |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | Ombra extra grande (modal) |

### Ring (Focus States)

| Classe | Valore | Utilizzo |
|--------|--------|----------|
| `ring-1` | `0 0 0 1px` | Ring sottile |
| `ring-2` | `0 0 0 2px` | Ring standard |
| `ring-[--color-accent]/50` | Colore accent al 50% | Ring accent |
| `ring-offset-2` | Offset 2px | Ring offset |

---

## Animazioni

### Transizioni CSS

#### Theme Transition

```css
:where(.theme-anim),
:where(.theme-anim) * {
  transition-property: background-color, color, border-color, outline-color, fill, stroke, box-shadow;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}
```

- **Durata**: 300ms
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)`
- **Proprietà**: background-color, color, border-color, outline-color, fill, stroke, box-shadow

#### Component Transitions

| Componente | Proprietà | Durata | Easing | Utilizzo |
|------------|-----------|--------|--------|----------|
| **Card Hover** | `scale`, `shadow` | `300ms` | `ease-in-out` | Hover scale card |
| **Button** | `all` | `300ms` | `ease-in-out` | Transizioni bottoni |
| **Opacity** | `opacity` | `300ms` | `transition-opacity` | Fade in/out |
| **Colors** | `colors` | `transition-colors` | Default | Cambio colore |

### Animazioni Framer Motion

#### Page Transitions

```typescript
<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -8 }}
  transition={{ duration: 0.25, ease: 'easeInOut' }}
>
```

- **Durata**: 0.25s
- **Easing**: `easeInOut`
- **Movimento**: `y: 8 → 0 → -8`
- **Opacità**: `0 → 1 → 0`

#### Modal Transitions

##### Enter Transition
```typescript
enter="ease-out duration-150"
enterFrom="opacity-0 scale-95"
enterTo="opacity-100 scale-100"
```

- **Durata**: 150ms
- **Easing**: `ease-out`
- **Scale**: `0.95 → 1`
- **Opacità**: `0 → 1`

##### Leave Transition
```typescript
leave="ease-in duration-100"
leaveFrom="opacity-100 scale-100"
leaveTo="opacity-0 scale-95"
```

- **Durata**: 100ms
- **Easing**: `ease-in`
- **Scale**: `1 → 0.95`
- **Opacità**: `1 → 0`

#### Task Card Animations

```typescript
<motion.div
  layout
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, scale: 0.95 }}
>
```

- **Layout**: Animazione automatica layout
- **Initial**: `opacity: 0, y: 8`
- **Animate**: `opacity: 1, y: 0`
- **Exit**: `opacity: 0, scale: 0.95`

#### Progress Bar Animations

```typescript
<motion.div
  animate={{ width: `${percentage}%` }}
  transition={{ duration: 1, ease: 'easeOut' }}
>
```

- **Durata**: 1s
- **Easing**: `easeOut`
- **Proprietà**: `width`

#### Dropdown Transitions (Headless UI)

##### Enter
```typescript
enter="transition ease-out duration-100"
enterFrom="transform opacity-0 scale-95 translate-x-2"
enterTo="transform opacity-100 scale-100 translate-x-0"
```

- **Durata**: 100ms
- **Easing**: `ease-out`
- **Scale**: `0.95 → 1`
- **Translate X**: `2 → 0`
- **Opacità**: `0 → 1`

##### Leave
```typescript
leave="transition ease-in duration-75"
leaveFrom="transform opacity-100 scale-100 translate-x-0"
leaveTo="transform opacity-0 scale-95 translate-x-2"
```

- **Durata**: 75ms
- **Easing**: `ease-in`
- **Scale**: `1 → 0.95`
- **Translate X**: `0 → 2`
- **Opacità**: `1 → 0`

#### Bounce Animation (Loading)

```typescript
<span
  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
  style={{ animationDelay: '0ms' }}
/>
<span
  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
  style={{ animationDelay: '150ms' }}
/>
<span
  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
  style={{ animationDelay: '300ms' }}
/>
```

- **Tipo**: `animate-bounce` (Tailwind)
- **Delay**: 0ms, 150ms, 300ms
- **Utilizzo**: Indicatore di caricamento

#### Pulse Animation

```typescript
<span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-pulse" />
```

- **Tipo**: `animate-pulse` (Tailwind)
- **Utilizzo**: Indicatore stato (es. AI Assistant attivo)

#### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  :where(.theme-anim),
  :where(.theme-anim) * {
    transition: none !important;
  }
}
```

- **Supporto**: Rispetta `prefers-reduced-motion`
- **Comportamento**: Disabilita animazioni per accessibilità

---

## Classi CSS Personalizzate

### .glass

```css
.glass {
  @apply bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm;
}
```

**Utilizzo**: Effetto glassmorphism per componenti traslucidi
**Proprietà**:
- Background: `bg-white/30` (light) / `bg-white/10` (dark)
- Backdrop blur: `backdrop-blur-md`
- Border: `border-white/20` (light) / `border-white/10` (dark)
- Shadow: `shadow-sm`

**Esempi**: TopBar, Sidebar, Card, Bottoni

### .card

```css
.card {
  @apply rounded-2xl bg-white/30 dark:bg-white/10 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-sm transition-all ease-in-out duration-300 hover:scale-[1.02];
}
```

**Utilizzo**: Card con effetto glass e hover scale
**Proprietà**:
- Tutte le proprietà di `.glass`
- Border radius: `rounded-2xl`
- Hover: `scale-[1.02]`
- Transition: `transition-all ease-in-out duration-300`

**Esempi**: Card task, Card team, Card documenti

### .accent-button

```css
.accent-button {
  @apply inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm transition-all ease-in-out duration-300;
  background: linear-gradient(135deg, var(--color-accent), #9b8cff);
}
.accent-button:hover {
  filter: brightness(1.05);
}
```

**Utilizzo**: Bottone principale con gradiente accent
**Proprietà**:
- Background: Gradiente `135deg` da `--color-accent` a `#9b8cff`
- Text: `text-white`
- Border radius: `rounded-xl`
- Padding: `px-3 py-2`
- Hover: `brightness(1.05)`
- Transition: `transition-all ease-in-out duration-300`

**Esempi**: Bottone "Nuovo Task", Bottone "Salva"

### .accent-outline

```css
.accent-outline {
  @apply inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border border-white/30 dark:border-white/20 bg-white/20 dark:bg-white/5 text-gray-900 dark:text-gray-100 transition-all ease-in-out duration-300;
}
```

**Utilizzo**: Bottone outline con effetto glass
**Proprietà**:
- Border: `border-white/30` (light) / `border-white/20` (dark)
- Background: `bg-white/20` (light) / `bg-white/5` (dark)
- Text: `text-gray-900` (light) / `text-gray-100` (dark)
- Border radius: `rounded-xl`
- Padding: `px-3 py-2`
- Transition: `transition-all ease-in-out duration-300`

**Esempi**: Bottoni TopBar, Bottoni Sidebar, Bottoni Modal

### .theme-anim

```css
:where(.theme-anim),
:where(.theme-anim) * {
  transition-property: background-color, color, border-color, outline-color, fill, stroke, box-shadow;
  transition-duration: 300ms;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}
```

**Utilizzo**: Transizioni smooth per cambio tema
**Proprietà**:
- Transition properties: background-color, color, border-color, outline-color, fill, stroke, box-shadow
- Durata: 300ms
- Easing: `cubic-bezier(0.22, 1, 0.36, 1)`

**Esempi**: Applicato su `<body>` per transizioni tema

---

## Breakpoint

Il progetto utilizza i breakpoint standard di Tailwind CSS:

| Breakpoint | Min Width | Utilizzo |
|------------|-----------|----------|
| **sm** | 640px | Mobile landscape |
| **md** | 768px | Tablet, Desktop small |
| **lg** | 1024px | Desktop |
| **xl** | 1280px | Desktop large |
| **2xl** | 1536px | Desktop extra large |

### Utilizzo Principale

- **Sidebar**: Nascosta su mobile (`hidden md:block`)
- **TopBar**: Elementi nascosti su mobile (`hidden md:flex`)
- **Grid**: Responsive (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- **Padding**: Responsive (`px-6 py-4 md:px-8 md:py-6`)

---

## Mappa Componenti

### TopBar

**Stile Visivo**:
- Glassmorphism effect (`.glass`)
- Altezza fissa: `h-16` (64px)
- Border radius: `rounded-2xl`
- Margin: `mx-4 mt-4`
- Padding: `px-3`
- Gap: `gap-3`

**Elementi**:
- Workspace selector: `.accent-outline`
- Orologio: `.glass rounded-xl px-3 py-2 text-sm font-mono`
- Bottoni: `.accent-outline`
- AI Assistant: Icona con pulse animation

**Animazioni**:
- Dropdown: Headless UI Transition (100ms ease-out)

### Sidebar

**Stile Visivo**:
- Glassmorphism effect (`.glass`)
- Altezza: `h-screen`
- Larghezza: `w-64` (aperta) / `w-20` (chiusa)
- Transition: `transition-all duration-300 ease-in-out`

**Elementi**:
- Logo: SVG con gradient
- Navigation items: `.itemBase` con hover states
- Avatar: `.SafeAvatar` con status indicator
- Sezioni: Collapsible con transition

**Animazioni**:
- Apertura/Chiusura: `transition-all duration-300 ease-in-out`
- Sezioni: `transition-[grid-template-rows] duration-300 ease-in-out`

### TaskCard

**Stile Visivo**:
- Glassmorphism effect (`.glass`)
- Border radius: `rounded-xl`
- Padding: `p-4`
- Hover: `hover:shadow-md`

**Elementi**:
- Checkbox: Custom con hover states
- Priority badge: Colori semitrasparenti
- Due date: Badge con icona
- Tags: Badge con icona
- Assigned member: Badge con icona

**Animazioni**:
- Framer Motion: `initial={{ opacity: 0, y: 8 }}`, `animate={{ opacity: 1, y: 0 }}`, `exit={{ opacity: 0, scale: 0.95 }}`
- Layout animation: `layout`

### Board (Kanban)

**Stile Visivo**:
- Grid: `grid-cols-1 md:grid-cols-3 gap-4`
- Columns: `.card p-4 min-h-[400px]`
- Drag over: `ring-2 ring-[--color-accent] bg-[--color-accent]/5`

**Elementi**:
- Column header: `text-sm font-semibold`
- Task count: `text-xs text-gray-500`
- Empty state: `text-center py-8 text-sm text-gray-400`

**Animazioni**:
- Layout: Framer Motion `layout`

### Modal

**Stile Visivo**:
- Overlay: `bg-black/30 backdrop-blur-sm`
- Panel: `.card` o `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl`
- Padding: `p-6`
- Max width: `max-w-2xl` o `max-w-md`

**Elementi**:
- Header: `px-4 py-3 border-b border-gray-200 dark:border-gray-700`
- Title: `text-lg font-semibold` o `text-base font-semibold`
- Content: `space-y-4`
- Footer: `flex justify-end mt-3`

**Animazioni**:
- Enter: `ease-out duration-150`, `opacity-0 scale-95` → `opacity-100 scale-100`
- Leave: `ease-in duration-100`, `opacity-100 scale-100` → `opacity-0 scale-95`

### Button

**Stile Visivo**:
- Primary: `.accent-button`
- Outline: `.accent-outline`
- Glass: `.glass px-4 py-2 rounded-xl text-sm font-medium`

**Stati**:
- Hover: `brightness(1.05)` (accent-button), `hover:bg-black/5` (outline)
- Active: Ring accent
- Disabled: `opacity-50 cursor-not-allowed`

**Animazioni**:
- Transition: `transition-all ease-in-out duration-300`

### Badge

**Stile Visivo**:
- Border radius: `rounded-full`
- Padding: `px-2 py-1` o `px-3 py-1`
- Font: `text-xs font-medium`
- Background: Colori semitrasparenti (`/20`)

**Varianti**:
- Priority: `bg-emerald-500/20`, `bg-amber-500/20`, `bg-rose-500/20`
- Status: `bg-gray-500/20`, `bg-blue-500/20`, `bg-emerald-500/20`
- Tag: `bg-gray-500/20`
- Assigned: `bg-blue-500/20`

### Progress Bar

**Stile Visivo**:
- Container: `bg-gray-200 dark:bg-gray-700 rounded-full`
- Bar: `bg-emerald-500 rounded-full`
- Height: `h-2` o `h-3`

**Animazioni**:
- Framer Motion: `animate={{ width: '${percentage}%' }}`, `transition={{ duration: 1, ease: 'easeOut' }}`

### Input

**Stile Visivo**:
- Background: `bg-gray-100 dark:bg-gray-800`
- Border radius: `rounded-lg`
- Padding: `px-3 py-2` o `px-4 py-2`
- Focus: `focus:ring-2 focus:ring-[--color-accent]`

**Varianti**:
- Text: Standard input
- Textarea: `resize-none`
- Select: Standard select

### Avatar

**Stile Visivo**:
- Border radius: `rounded-full`
- Sizes: `h-6 w-6`, `h-8 w-8`, `h-12 w-12`, `h-16 w-16`
- Ring: `ring-2 ring-white/50` (opzionale)
- Status indicator: `absolute -bottom-0 -right-0 h-3 w-3 rounded-full ring-2`

**Varianti**:
- Gradient: 8 gradient combinations
- Image: Con fallback a gradient

### Dropdown

**Stile Visivo**:
- Menu: `.card p-2` o `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-2 z-50`
- Items: `rounded-lg px-3 py-2`
- Hover: `hover:bg-white/40 dark:hover:bg-white/10`
- Active: `ring-1 ring-[--color-accent]/50`

**Animazioni**:
- Headless UI Transition: `ease-out duration-100`, `ease-in duration-75`
- Transform: `scale-95 translate-x-2` → `scale-100 translate-x-0`

### Command Palette

**Stile Visivo**:
- Overlay: `bg-black/30 backdrop-blur-sm`
- Panel: `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-2xl`
- Input: `bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2`
- Results: `hover:bg-gray-100 dark:hover:bg-gray-800`

**Animazioni**:
- Enter: `ease-out duration-150`, `opacity-0 translate-y-2 scale-95` → `opacity-100 translate-y-0 scale-100`
- Leave: `ease-in duration-100`, `opacity-100 translate-y-0 scale-100` → `opacity-0 translate-y-1 scale-95`

### AI Assistant

**Stile Visivo**:
- Panel: `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-2xl max-h-[80vh]`
- Messages: `rounded-xl px-4 py-2`
- User message: `bg-[--color-accent] text-white`
- Assistant message: `bg-gray-100 dark:bg-gray-800`
- Icon: `bg-gradient-to-br from-purple-500 to-pink-500`

**Animazioni**:
- Typing indicator: Bounce animation con delay (0ms, 150ms, 300ms)
- Pulse: `animate-pulse` per icona attiva

---

## Variabili CSS

### Custom Properties

```css
--font-sans: "Inter Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji";
--color-accent: #6C63FF;
--color-accent-dark: #7D5FFF;
```

### Utilizzo

- `var(--color-accent)`: Colore accent principale
- `var(--color-accent-dark)`: Colore accent dark mode
- `var(--font-sans)`: Font family principale
- `[--color-accent]`: Utilizzato in classi Tailwind (es. `ring-[--color-accent]/50`)

---

## Note Finali

### Dark Mode

- Implementato tramite classe `.dark` su `<html>`
- Tutti i colori hanno varianti dark mode
- Transizioni smooth tramite `.theme-anim`

### Accessibilità

- Supporto `prefers-reduced-motion`
- Focus states visibili (`ring-2 ring-[--color-accent]/50`)
- Contrasto colori rispettato

### Performance

- Animazioni ottimizzate con `will-change` (implicito in Framer Motion)
- Backdrop blur utilizzato con moderazione
- Transizioni CSS invece di JavaScript quando possibile

### Consistenza

- Utilizzo coerente delle classi utility
- Pattern ripetibili per componenti simili
- Naming convention chiara

---

## File di Riferimento

- **CSS Globale**: `app/src/index.css`
- **Configurazione Tailwind**: `app/src/index.css` (sezione `@theme`)
- **PostCSS**: `app/postcss.config.js`
- **Componenti**: `app/src/components/`
- **Pagine**: `app/src/pages/`

---

**Ultimo aggiornamento**: Novembre 2024
**Versione Tailwind**: v4.1.16
**Versione Framer Motion**: v12.23.24

