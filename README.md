# Elecciones Seccionales

Sistema de escrutinio electoral.

| Parte    | Carpeta                        | Tecnología                     |
|----------|--------------------------------|--------------------------------|
| Backend  | `backend/org-elecciones-ws`    | Node.js + Express + PostgreSQL |
| Frontend | `frontend/org-elecciones-web`  | Angular 14 (servido con nginx) |

## Arquitectura con Docker

```
                 ┌──────────────── servidor ────────────────┐
navegador ──► :80│ frontend (nginx)                         │
                 │   ├── /        → Angular (archivos)      │
                 │   └── /api/*   → backend:3001 (Express)  │──► PostgreSQL
                 └──────────────────────────────────────────┘
```

- El frontend y el backend se publican en **un solo puerto** (`FRONT_PORT`, 80 por defecto). nginx reenvía `/api/*` al backend, así que no hay problemas de CORS ni URLs hardcodeadas.
- El backend **no** se expone directamente al exterior.
- PostgreSQL puede estar fuera de Docker (en el mismo servidor o en otro) o en un contenedor (perfil `db`).

### Archivos

| Archivo | Uso |
|---|---|
| `docker-compose.yml` | Producción |
| `docker-compose.dev.yml` | Desarrollo con recarga en caliente |
| `backend/org-elecciones-ws/Dockerfile` | Imagen de producción del backend |
| `backend/org-elecciones-ws/Dockerfile.dev` | Imagen de desarrollo del backend (nodemon) |
| `frontend/org-elecciones-web/Dockerfile` | Build de Angular + nginx |
| `frontend/org-elecciones-web/Dockerfile.dev` | Imagen de desarrollo del frontend (`ng serve`) |
| `frontend/org-elecciones-web/nginx.conf` | Configuración de nginx (SPA + proxy `/api`) |
| `.env.example` | Plantilla de variables de entorno |
| `.github/workflows/deploy.yml` | Despliegue automático por GitHub Actions (self-hosted runner) |

---

## 1. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` (en la raíz del proyecto). Lo más importante es `DB_HOST`:

| Dónde está PostgreSQL | `DB_HOST` |
|---|---|
| Instalado en la misma máquina, fuera de Docker | `host.docker.internal` |
| En contenedor (`--profile db`) | `postgres` |
| En otro servidor | IP o hostname de ese servidor |

> Si Postgres está en la misma máquina Linux fuera de Docker, debe escuchar en la interfaz de Docker
> (`listen_addresses = '*'` en `postgresql.conf`) y permitir la red de Docker (p. ej. `172.16.0.0/12`) en `pg_hba.conf`.

> Usa `KEY=valor` **sin espacios** alrededor del `=`: Docker no los acepta como lo hace `dotenv`.

---

## 2. Desarrollo con Docker

Requisitos: Docker Desktop (o Docker Engine + Compose v2).

```bash
docker compose -f docker-compose.dev.yml up --build
```

- Frontend: http://localhost:4200 (live reload)
- Backend: http://localhost:3001 (nodemon)

El código se monta como volumen, así que los cambios se reflejan al guardar. Los `node_modules` viven en volúmenes de Docker, separados de los de tu máquina.

Con PostgreSQL en contenedor (pon `DB_HOST=postgres` en `.env`):

```bash
docker compose -f docker-compose.dev.yml --profile db up --build
```

Postgres queda en `localhost:5432`. Restaura un backup y aplica los scripts de `backend/org-elecciones-ws/db` (migrations y seeds, en orden numérico), por ejemplo:

```bash
docker compose -f docker-compose.dev.yml exec -T postgres psql -U postgres -d elecciones < backend/org-elecciones-ws/db/migrations/001_normalizar_recinto_electoral.sql
```

Si cambias `package.json`, reconstruye y recrea los volúmenes de dependencias:

```bash
docker compose -f docker-compose.dev.yml down -v
```

```bash
docker compose -f docker-compose.dev.yml up --build
```

### Desarrollo sin Docker

```bash
cd backend/org-elecciones-ws && npm install && npm run dev
```

```bash
cd frontend/org-elecciones-web && npm install && npm start
```

---

## 3. Producción manual (en el servidor)

```bash
cp .env.example .env
```

```bash
docker compose up -d --build
```

Con PostgreSQL en contenedor:

```bash
docker compose --profile db up -d --build
```

Comandos útiles:

```bash
docker compose ps
```

```bash
docker compose logs -f backend
```

```bash
docker compose restart backend
```

```bash
docker compose down
```

---

## 4. Despliegue automático (GitHub Actions + self-hosted runner)

El servidor está detrás de una VPN Check Point, así que los runners de GitHub no pueden llegar a él.
En su lugar se instala un **self-hosted runner** en el propio servidor: es un agente que abre una conexión
**saliente** HTTPS hacia GitHub y ejecuta ahí los despliegues. No hace falta VPN, SSH ni abrir puertos.

Cada push a `main` (o ejecución manual desde **Actions → Deploy → Run workflow**):

1. El runner del servidor descarga el código del commit.
2. Lo copia con `rsync` a `DEPLOY_PATH` (sin `node_modules`, `.git` ni `.env`).
3. Escribe el `.env` desde el secreto `ENV_FILE` (si no existe el secreto, usa el `.env` que ya está en el servidor).
4. Ejecuta `docker compose build && docker compose up -d --wait`. Si un contenedor no queda *healthy*, el job falla y muestra los logs.

> ⚠️ Usa self-hosted runners **solo en repositorios privados**. En un repo público, cualquiera podría ejecutar código en tu servidor mediante un pull request.

### 4.1 Requisitos del servidor

- Linux x64 con salida a internet por HTTPS (443) hacia `github.com`, `*.github.com`, `*.githubusercontent.com` y `*.actions.githubusercontent.com`. Si sale por un proxy, ver 4.3.
- Docker Engine con Compose v2, `git` y `rsync`.

```bash
curl -fsSL https://get.docker.com | sh
```

```bash
sudo apt-get install -y git rsync
```

### 4.2 Instalar el runner

1. Crea un usuario para el runner, dale acceso a Docker y a la carpeta de despliegue:

```bash
sudo adduser --disabled-password --gecos "" github-runner
```

```bash
sudo usermod -aG docker github-runner
```

```bash
sudo mkdir -p /opt/elecciones && sudo chown github-runner:github-runner /opt/elecciones
```

> Estar en el grupo `docker` equivale a tener acceso root al servidor. Usa un usuario dedicado solo para esto.

2. En GitHub: **Settings → Actions → Runners → New self-hosted runner → Linux / x64**. GitHub muestra los comandos de descarga y un **token** de registro (válido 1 hora). Ejecútalos como el usuario del runner:

```bash
sudo -iu github-runner
```

```bash
mkdir actions-runner && cd actions-runner
```

Luego pega los comandos `curl -o actions-runner-linux-x64-…tar.gz …` y `tar xzf …` que muestra GitHub (cambian con cada versión).

3. Registra el runner con la etiqueta `elecciones` (el workflow la usa para elegir este servidor). Reemplaza la URL del repo y el token por los que te muestra GitHub:

```bash
./config.sh --url https://github.com/ORG/REPO --token TOKEN_DE_GITHUB --name servidor-elecciones --labels elecciones --unattended
```

4. Instálalo como servicio para que arranque solo con el servidor. Sal del usuario del runner (`exit`) y, desde la carpeta del runner:

```bash
cd /home/github-runner/actions-runner
```

```bash
sudo ./svc.sh install github-runner
```

```bash
sudo ./svc.sh start
```

```bash
sudo ./svc.sh status
```

En **Settings → Actions → Runners** debe aparecer `servidor-elecciones` como **Idle** (verde).

### 4.3 Si el servidor sale a internet por proxy

Antes de iniciar el servicio, crea `/home/github-runner/actions-runner/.env` con:

```
https_proxy=http://proxy.empresa:8080
http_proxy=http://proxy.empresa:8080
no_proxy=localhost,127.0.0.1
```

Docker también necesita el proxy para bajar imágenes: configura `/etc/systemd/system/docker.service.d/http-proxy.conf` según la [documentación de Docker](https://docs.docker.com/engine/daemon/proxy/). Después reinicia el servicio del runner con `sudo ./svc.sh stop` y `sudo ./svc.sh start`.

### 4.4 Configurar GitHub

En el repositorio: **Settings → Environments → New environment** → `production`. Dentro del environment agrega:

**Secrets**

| Secreto | Obligatorio | Descripción |
|---|---|---|
| `ENV_FILE` | Recomendado | Contenido completo del `.env` de producción (ver `.env.example`). Si no lo defines, crea `/opt/elecciones/.env` a mano en el servidor |

**Variables**

| Variable | Por defecto | Descripción |
|---|---|---|
| `DEPLOY_PATH` | `/opt/elecciones` | Carpeta del proyecto en el servidor |
| `COMPOSE_PROFILES` | *(vacío)* | `db` para levantar PostgreSQL en contenedor |

> Opcional: en el environment `production` puedes activar *Required reviewers* para aprobar manualmente cada despliegue.

### 4.5 Verificar

- Pestaña **Actions** → último run de **Deploy**.
- En el servidor: `cd /opt/elecciones && docker compose ps`.
- Navegador (conectado a la VPN): `http://IP_DEL_SERVIDOR:FRONT_PORT`.
- Logs del runner: `sudo journalctl -u 'actions.runner.*' -f`.

### Actualizar o quitar el runner

GitHub actualiza el runner automáticamente. Para quitarlo, desde la carpeta del runner:

```bash
sudo ./svc.sh stop
```

```bash
sudo ./svc.sh uninstall
```

Después, como `github-runner`, ejecuta `./config.sh remove --token TOKEN`. El token sale en **Settings → Actions → Runners → (runner) → Remove**.

---

## 5. Problemas comunes

| Síntoma | Causa probable |
|---|---|
| El job queda en "Waiting for a runner" | El servicio del runner está detenido o sin salida a internet: `sudo ./svc.sh status` y revisar proxy/firewall |
| `rsync: command not found` | Instalar `rsync` en el servidor |
| `Error al obtener ...` en las APIs | El backend no conecta a la BD: revisar `DB_HOST` y `pg_hba.conf` |
| `permission denied ... docker.sock` | El usuario `github-runner` no está en el grupo `docker` (reiniciar el servicio después de agregarlo) |
| La pantalla recarga en 404 | Revisar que se use la imagen con `nginx.conf` (fallback a `index.html`) |
| Cambios en `package.json` no se ven en dev | `docker compose -f docker-compose.dev.yml down -v` y volver a levantar |
