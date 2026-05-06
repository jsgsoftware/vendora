# 🛒 Vendora

> **Vendora** es una plataforma de e-commerce / marketplace multi-vendor, 100% open-source, diseñada para ser auto-alojada, extensible y lista para producción.

Inspirada en la experiencia de compra de grandes marketplaces, Vendora te permite lanzar tu propia tienda online con soporte para múltiples vendedores, administración de contenido, pasarelas de pago y un sistema de roles completo.

---

## ✨ Características Principales

- **🏬 Marketplace Multi-Vendor**: Vendedores pueden registrarse, gestionar su perfil, productos, reviews y ventas desde un dashboard propio.
- **🎨 Gestión de Secciones de Inicio (Home Sections)**: Administra dinámicamente carruseles de héroe, carruseles de vendedores destacados y grids de tarjetas desde el panel administrativo.
- **📦 Catálogo de Productos**: Soporte para productos con variantes, colores, sub-productos, imágenes múltiples, categorías y sub-categorías.
- **🛍️ Carrito de Compras & Checkout**: Flujo completo de compra con cupones, wishlist, direcciones de envío, historial de órdenes y reviews.
- **🔐 Autenticación y Roles**: Sistema de auth con NextAuth.js. Roles: `Admin`, `Vendor` y `Customer`.
- **📊 Dashboard Administrativo**: Panel completo para admins: usuarios, vendedores, solicitudes de tienda, categorías, productos y configuración de la landing page.
- **🧩 Backend Extensible con InsForge**: Backend auto-alojado basado en PostgreSQL + PostgREST + InsForge, con migraciones automáticas y Edge Functions con Deno.
- **📤 Storage de Imágenes**: Integración con buckets de almacenamiento vía InsForge (compatible con S3/CloudFront).

---

## 🏗️ Stack Técnico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 13 (Pages Router), React 18, Tailwind CSS, Redux Toolkit |
| **Backend** | InsForge (self-hosted), PostgreSQL 15, PostgREST v12 |
| **Edge Runtime** | Deno 2.x |
| **Auth** | NextAuth.js (Credentials + OAuth) |
| **ORM/DB Client** | Cliente REST custom sobre PostgREST |
| **Pagos** | Integración lista para Stripe/PayPal vía API |
| **Deployment** | Docker Compose (local / self-hosted) |

---

## 🚀 Arquitectura

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Vendora    │──────│  InsForge    │──────│  PostgreSQL │
│  (Next.js)  │      │  (API + Auth)│      │  (v15.13.2) │
│  :3000      │      │  :7130-7131  │      │  :5432      │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                     ┌──────┴──────┐
                     │  PostgREST  │
                     │   :5430     │
                     └─────────────┘
                            │
                     ┌──────┴──────┐
                     │  Deno Edge  │
                     │   :7133     │
                     └─────────────┘
```

---

## 🛠️ Cómo Empezar (Local)

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (Windows / macOS / Linux)
- Git
- Node.js 18+ (solo si quieres desarrollar sin Docker)

### 1. Clonar

```bash
git clone https://github.com/<tu-usuario>/vendora.git
cd vendora
```

### 2. Configurar Variables de Entorno

```bash
cp .env.docker .env
```

> Revisa `.env` y ajusta al menos: `JWT_SECRET`, `ENCRYPTION_KEY`, `ACCESS_API_KEY` y `ADMIN_PASSWORD`.

### 3. Levantar todo con Docker

```bash
# Windows (PowerShell / Git Bash)
./start.sh

# Linux / macOS
bash ./start.sh
```

Esto clona automáticamente [InsForge](https://github.com/insforge/insforge), construye las imágenes, aplica migraciones, espera a que el backend esté listo y siembra datos de demo.

### 4. Acceder

| Servicio | URL |
|----------|-----|
| **Vendora App** | http://localhost:3000 |
| **InsForge Dashboard** | http://localhost:7131 |
| **InsForge API** | http://localhost:7130 |
| **PostgREST API** | http://localhost:5430 |
| **PostgreSQL** | `localhost:5432` |

### Cuentas de Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@demo.com` | `admin123` |
| Vendor | `vendor@demo.com` | `vendor123` |
| Customer | `user@demo.com` | `user123` |

---

## 🐳 Comandos Útiles de Docker

```bash
# Ver logs
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f insforge

# Parar todo
docker compose down

# Reset completo (borra volúmenes de DB)
docker compose down -v

# Reconstruir sin caché
docker compose up -d --build --no-cache
```

---

## 📁 Estructura del Proyecto

```
vendora/
├── components/           # Componentes React (Home, Cart, Admin, Vendor, Product...)
├── pages/                # Rutas de Next.js (API + UI)
│   ├── api/              # Endpoints de Next.js
│   ├── admin/            # Panel de administración
│   ├── vendor/           # Panel de vendedores
│   └── ...
├── utils/                # Cliente InsForge, helpers, auth
├── models/               # Modelos de Mongoose / lógica de negocio
├── styles/               # CSS global
├── docker-init/          # Scripts SQL de inicialización de PostgreSQL
├── scripts/              # Scripts de seeding y migraciones de Vendora
├── docker-compose.yml    # Orquestación de toda la stack
├── Dockerfile            # Build de Vendora (Next.js)
└── .env.docker           # Plantilla de variables de entorno
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! 🎉

1. Haz **fork** del repo.
2. Crea una rama: `git checkout -b feature/tu-feature`.
3. Commitea tus cambios: `git commit -m 'feat: agrega X'`.
4. Push a tu fork: `git push origin feature/tu-feature`.
5. Abre un **Pull Request**.

Por favor, revisa nuestro [`AGENTS.md`](./AGENTS.md) para convenciones de código y estilo.

---

## 📄 Licencia

[MIT](./LICENSE) © Vendora Contributors

---

<p align="center">
  <sub>Hecho con ❤️ para la comunidad open-source.</sub>
</p>
