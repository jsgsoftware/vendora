# Vendora — Guia de Instalacion y Despliegue

> Fecha de empaquetado: 2026-04-27
> Version: vendora + InsForge OSS self-hosted

---

## Requisitos del Sistema

| Requisito | Version minima | Notas |
|-----------|----------------|-------|
| Docker Desktop | 4.20+ | Windows / macOS / Linux |
| Docker Engine | 24.0+ | Linux (sin Desktop) |
| Git | 2.30+ | Para clonar InsForge en `./start.ps1` |
| Navegador | Cualquiera | Chrome, Firefox, Edge, Safari |
| RAM libre | 4 GB | 8 GB recomendados para construccion inicial |
| Espacio en disco | 5 GB | Imagenes Docker + volumenes |

---

## Inicio Rapido (One-liner)

### Windows (PowerShell)

```powershell
cd vendora
.\start.ps1
```

### Linux / macOS (Bash)

```bash
cd vendora
chmod +x start.sh
./start.sh
```

### Que hace el script paso a paso:

1. **Clona InsForge OSS** en `./insforge` si no existe aun.
2. **Crea `.env`** desde `.env.docker` con valores por defecto seguros.
3. **Compila y levanta** los 5 contenedores Docker:
   - `postgres` — Base de datos PostgreSQL con extensiones pg_cron, http, pgcrypto
   - `postgrest` — API REST automatica sobre PostgreSQL
   - `insforge` — Backend InsForge (dashboard + API + auth + storage)
   - `deno` — Runtime para funciones serverless (Edge Functions)
   - `vendora` — Next.js app (frontend de la tienda)
4. **Espera** a que InsForge termine sus 21 migraciones internas (~60-90s).
5. **Aplica** las migraciones de Vendora (tablas y datos iniciales).

---

## Acceso a los Servicios

Una vez que el mensaje `Vendora is ready!` aparezca:

| Servicio | URL local | Descripcion |
|----------|-----------|-------------|
| Tienda Vendora | http://localhost:3000 | Frontend Next.js de la tienda |
| InsForge Dashboard | http://localhost:7131 | Panel de administracion de InsForge |
| InsForge API | http://localhost:7130 | API principal (auth, storage, db) |
| PostgREST API | http://localhost:5430 | API REST directa a PostgreSQL |
| PostgreSQL | localhost:5432 | Acceso directo con `psql` o DBeaver |

Credenciales por defecto (usuarios demo):

| Rol | Email | Password |
|-----|-------|----------|
| Admin | `admin@demo.com` | `admin123` |
| Vendor | `vendor@demo.com` | `vendor123` |
| Customer | `user@demo.com` | `user123` |

- **API Key:** `ik_vendora_docker_local_dev_key_1234567890abc`

---

## Variables de Entorno (`.env`)

Antes de vender o desplegar en produccion, edita `.env` y cambia estos valores:

```env
# -- OBLIGATORIOS: Cambiar en produccion --
POSTGRES_PASSWORD=tu_password_seguro_aqui
JWT_SECRET=minimo-32-caracteres-aleatorios-generados-con-openssl
ENCRYPTION_KEY=diferente-del-jwt-minimo-32-caracteres
ACCESS_API_KEY=ik_tu_prefix_32chars_minimo_generado_manualmente

ADMIN_EMAIL=admin@tudominio.com
ADMIN_PASSWORD=tu_password_admin_segura

# -- OPCIONALES: Dejar vacio si no usas --
# OAuth (Google, GitHub, etc.)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Cloud/Despliegues
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
OPENROUTER_API_KEY=
```

> **IMPORTANTE:** Nunca publiques el archivo `.env`. Esta incluido en `.gitignore` por defecto.

---

## Primeros Pasos despues del Arranque

### 1. Crear el bucket de imagenes

Vendora necesita un bucket publico llamado `images` para subir fotos de productos:

```bash
curl -X POST http://localhost:7130/api/storage/buckets \
  -H "Authorization: Bearer $ACCESS_API_KEY" \
  -H "apikey: $ACCESS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"bucketName":"images","public":true}'
```

> Reemplaza `$ACCESS_API_KEY` con el valor de tu `.env`.

O mediante el **InsForge Dashboard** (http://localhost:7131): Storage -> Create Bucket.

### 2. Acceder al panel de administracion de Vendora

Ve a la tienda y navega a `/auth/signin`. El sistema usa autenticacion integrada InsForge, puedes crear usuarios desde el dashboard o directamente desde la app.

### 3. (Opcional) Conectar a la BD directamente

```bash
docker compose exec -it postgres psql -U postgres -d insforge
```

Para resetear los datos:
```bash
docker compose exec postgres psql -U postgres -d insforge -c "TRUNCATE categories, products, users, carts, orders, coupons;"
```

---

## Comandos Utiles

```bash
# Ver logs de todos los servicios
docker compose logs -f

# Ver logs de un servicio especifico
docker compose logs -f insforge   # o postgres, vendora, deno, postgrest

# Parar todo (conserva datos)
docker compose down

# Parar todo y borrar datos (RESET TOTAL)
docker compose down -v

# Reiniciar solo un servicio
docker compose restart vendora

# Reconstruir imagenes despues de cambios
docker compose up -d --build

# Shell dentro de PostgreSQL
docker compose exec postgres psql -U postgres -d insforge

# Ver estado de los contenedores
docker compose ps
```

---

## Arquitectura del Stack

```
Usuario (navegador)
    |
    v
[ Vendora App ]  http://localhost:3000
    |  Next.js 13 (Pages Router)
    |  Proxy /api/insforge/*  ---->  [ InsForge Backend ]
    |                                   http://insforge:7130
    v                                   |
[ PostgREST ]  http://localhost:5430    |  Auth, Storage, Database Records API
    |                                   |  Dashboard (localhost:7131)
    v                                   |
[ PostgreSQL ]  localhost:5432  <-----+
    |
    v
[ Deno Runtime ]  http://localhost:7133  (Edge Functions)
```

**Notas importantes de red:**
- Vendora se comunica con InsForge internamente via Docker network (`vendora-network`) usando `http://insforge:7130`. El usuario nunca necesita saber este URL.
- El navegador del cliente solo habla con `http://localhost:3000`. Todas las peticiones al backend pasan por el proxy `/api/insforge/` de Next.js.

---

## Resolucion de Problemas

### "Port is already allocated"
Alguno de los puertos (3000, 5430, 7130, 7131, 5432) ya esta en uso.
```bash
# En Windows PowerShell
Get-NetTCPConnection -LocalPort 3000,5430,7130,7131,5432
# Mata los procesos que bloquean o cambia los puertos en .env
```

### InsForge no arranca (migraciones fallan)
```bash
# Limpiar volumenes y reintentar
docker compose down -v
docker compose up -d --build
# Espera 90s y revisa logs:
docker compose logs --tail=40 insforge
```

### Deno runtime reiniciandose en bucle
Si ves `error: Failed writing lockfile` en los logs de Deno, ejecuta:
```bash
docker compose restart deno
```
El volumen `functions` ya no esta en modo read-only (corregido en version actual).

### Vendora devuelve "Missing InsForge configuration"
Esto pasa si `vendora-tables.sql` no se aplico todavia. Ejecuta manualmente:
```bash
node scripts/apply-vendora-migrations.js
```

### No se pueden subir imagenes
Asegurate de que el bucket `images` existe via Dashboard o API. Ver seccion "Primeros Pasos" arriba.

---

## Soporte

Para reportar problemas o solicitar features:
- Email: ruholahn2@gmail.com
- GitHub: @no2ehi

---

## Licencia

Este software se entrega bajo los terminos acordados entre vendedor y comprador.
InsForge OSS esta bajo su propia licencia MIT (https://github.com/insforge/insforge).
