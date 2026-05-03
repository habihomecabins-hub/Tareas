# 🏡 Casas Expansibles · Gestión interna

Aplicación web (PWA instalable en móvil) para gestionar tareas, calendario, pedidos y clientes del equipo.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + Realtime) · Vercel

---

## ✨ Funcionalidades incluidas

- 🔐 **Login con email + contraseña** (gestionado por Supabase Auth)
- ✅ **Tareas** por áreas (Taller / Entrega / Postventa / Oficina) con asignación, prioridad, fecha límite y filtros
- 💬 **Comentarios en tiempo real** dentro de cada tarea (chat ligero entre el equipo)
- 📅 **Calendario mensual** que muestra tareas y citas
- 📦 **Pedidos** con estados (Presupuesto → Confirmado → En producción → Listo → Entregado → Postventa → Cerrado)
- 👥 **Clientes** con teléfono, email, dirección
- 📱 **PWA instalable**: los trabajadores pulsan "Añadir a pantalla de inicio" en el móvil y la app queda con icono propio, a pantalla completa
- 🔄 **Funciona offline** para vistas ya cargadas (service worker)

---

## 🚀 Guía de despliegue paso a paso

> **Tiempo estimado:** 30 minutos la primera vez.
> **Coste inicial:** 0 € (planes gratuitos de Supabase y Vercel son suficientes para <5 trabajadores).

### 1) Crear proyecto en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea cuenta (gratis).
2. Pulsa **New project**:
   - **Name:** `casas-expansibles`
   - **Database password:** genera una y guárdala en sitio seguro
   - **Region:** elige `West EU (Ireland)` o la más cercana
   - **Plan:** Free
3. Espera ~2 min a que se aprovisione.

### 2) Cargar el esquema de base de datos

1. En el menú lateral de Supabase: **SQL Editor** → **New query**.
2. Abre el archivo `supabase/schema.sql` de este proyecto, copia todo el contenido y pégalo en el editor.
3. Pulsa **Run** (Ctrl/Cmd + Enter).
4. Deberías ver "Success. No rows returned". Esto crea las tablas, índices, triggers y políticas de seguridad.

### 3) Configurar autenticación

1. Menú lateral → **Authentication** → **Providers**.
2. Asegúrate de que **Email** está activado.
3. (Recomendado para uso interno) Ve a **Authentication → Settings** y **desactiva "Enable email confirmations"**: así los trabajadores entran sin tener que confirmar mail.
4. Apunta dos valores que vamos a necesitar (menú **Settings → API**):
   - **Project URL** (algo tipo `https://abcdefgh.supabase.co`)
   - **anon public key** (cadena larga que empieza por `eyJ...`)

### 4) Subir el código a GitHub

1. Crea un repositorio nuevo en [github.com](https://github.com) (puede ser privado).
2. En tu ordenador, dentro de la carpeta del proyecto:

   ```bash
   git init
   git add .
   git commit -m "Versión inicial"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
   git push -u origin main
   ```

### 5) Desplegar en Vercel

1. Entra a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub.
2. **Add New → Project** → selecciona el repositorio que acabas de subir.
3. En **Environment Variables** añade estas dos:
   - `NEXT_PUBLIC_SUPABASE_URL` = la **Project URL** de Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = la **anon public key** de Supabase
4. Pulsa **Deploy** y espera ~2 minutos.
5. Vercel te dará una URL tipo `https://casas-expansibles.vercel.app` → ¡esa es tu app!

### 6) Configurar la URL en Supabase

1. En Supabase → **Authentication → URL Configuration**:
   - **Site URL:** la URL de Vercel (`https://casas-expansibles.vercel.app`)
   - **Redirect URLs:** añade `https://casas-expansibles.vercel.app/auth/callback`

### 7) Crear el primer usuario administrador

1. Abre la URL de Vercel en tu navegador.
2. Pulsa "¿Primera vez? Crear cuenta" e introduce tu nombre, email y contraseña.
3. (Opcional pero recomendado) En Supabase → **Table Editor** → tabla `profiles`, busca tu fila y cambia `role` a `admin`.
4. Listo: ya puedes entrar y crear tareas, pedidos y clientes.

### 8) Dar de alta a los trabajadores

Para cada trabajador:

1. Compártele la URL de la app.
2. Que pulse "Crear cuenta" y se registre con su email + contraseña.
3. (Opcional) En Supabase, asígnale el rol que corresponda (`taller`, `logistica`, `postventa`).

### 9) Instalación en el móvil de cada trabajador

**iPhone (Safari):**
1. Abre la URL en Safari (no en Chrome ni otros).
2. Pulsa el botón **Compartir** (cuadrado con flecha).
3. **Añadir a pantalla de inicio** → Añadir.

**Android (Chrome):**
1. Abre la URL en Chrome.
2. Menú **⋮** arriba a la derecha.
3. **Añadir a pantalla de inicio** → Instalar.

A partir de ahí, queda con icono propio, abre a pantalla completa y funciona como una app nativa.

---

## 💻 Desarrollo local

```bash
# 1. Instala dependencias
npm install

# 2. Copia el archivo de entorno y rellena con tus credenciales
cp .env.local.example .env.local
# Edita .env.local y pon NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY

# 3. Arranca el servidor
npm run dev

# Abre http://localhost:3000
```

---

## 🗄️ Estructura del proyecto

```
casas-app/
├── public/                    # Iconos PWA, manifest, service worker
├── supabase/
│   └── schema.sql             # Esquema completo de la base de datos
├── src/
│   ├── app/
│   │   ├── (app)/             # Rutas autenticadas con bottom nav
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── tareas/        # Listado, detalle, nueva, editar
│   │   │   ├── calendario/    # Vista mensual
│   │   │   ├── pedidos/       # Listado, detalle, nuevo
│   │   │   ├── clientes/      # Listado + sheet crear
│   │   │   └── perfil/        # Logout, info
│   │   ├── login/             # Login + signup
│   │   ├── auth/callback/     # Callback de email
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/            # Componentes UI reutilizables
│   ├── lib/
│   │   ├── supabase/          # Clientes (browser/server/middleware)
│   │   ├── actions/           # Server actions (CRUD)
│   │   ├── types.ts           # Tipos + etiquetas en español
│   │   └── utils.ts
│   └── middleware.ts          # Protección de rutas
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

---

## 🎨 Personalización rápida

### Cambiar colores

Edita `src/app/globals.css`. Las variables CSS están al inicio:

```css
:root {
  --bg: 247 245 240;       /* fondo crema */
  --ink: 31 42 36;         /* color principal */
  --taller: 178 116 64;    /* color del área Taller */
  --entrega: 70 100 80;    /* color del área Entrega */
  --postventa: 145 90 95;  /* color del área Postventa */
  ...
}
```

### Cambiar el nombre de la app

Edita:
- `public/manifest.json` → `name` y `short_name`
- `src/app/layout.tsx` → `metadata.title`
- `src/app/login/page.tsx` → texto del título

### Cambiar los iconos

Sustituye los archivos PNG en `public/`:
- `icon-192.png` (192x192)
- `icon-512.png` (512x512)
- `apple-touch-icon.png` (180x180)
- `favicon-32.png` (32x32)

---

## 🔧 Cambios de esquema en Supabase

Si añades o modificas tablas más adelante:

1. Ve a Supabase → **SQL Editor**.
2. Escribe el `ALTER TABLE...` o `CREATE TABLE...` que necesites.
3. Si añades una tabla nueva, recuerda activar RLS:
   ```sql
   alter table public.nueva_tabla enable row level security;
   create policy "auth_all" on public.nueva_tabla
     for all using (auth.role() = 'authenticated')
     with check (auth.role() = 'authenticated');
   ```
4. Actualiza los tipos en `src/lib/types.ts`.

---

## ➕ Próximas mejoras sugeridas

Cuando tengáis la app rodando 1-2 meses, plantead añadir:

- 📷 **Subida de fotos** a tareas (postventa, incidencias) → Supabase Storage
- 🔔 **Notificaciones push** cuando se asigna una tarea o llega un comentario → Web Push API
- 📄 **Exportar partes de entrega en PDF** con firma del cliente
- 📊 **Dashboard con gráficos** de productividad por trabajador / área
- 🏷️ **Etiquetas personalizadas** en tareas
- 📍 **Mapa de pedidos** con direcciones de entrega
- 🌐 **Modo offline avanzado** con sincronización (workbox)

---

## ❓ Problemas frecuentes

**"Auth session missing" al entrar:**
Comprueba que las variables de entorno en Vercel están bien. Después de cambiarlas hay que **redeployar**.

**Los emails de confirmación no llegan:**
En uso interno, lo más cómodo es desactivar la confirmación por email (paso 3 de la guía).

**El calendario no muestra eventos:**
Verifica que las tareas tienen `due_date` y las citas tienen `starts_at` válidos. La consulta filtra por mes natural.

**Los comentarios no se actualizan en tiempo real:**
Asegúrate de haber ejecutado `alter publication supabase_realtime add table public.comments;` (incluido en el `schema.sql`).

---

## 📞 Soporte

Esta es una base sólida pensada para un equipo pequeño. Para añadir funcionalidades nuevas, lo más rápido es pedirle a Claude que extienda el código (o dárselo a tu desarrollador).

¡Buen trabajo y feliz gestión! 🏡
